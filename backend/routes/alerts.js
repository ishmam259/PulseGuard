const express = require('express')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

// All alert routes require authentication
router.use(authenticate)

// POST /api/alerts — Trigger SOS alert
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body
    let patientId = null
    let patientName = req.user.name

    // Check if there is a patient record for the current user
    const patientResult = await pool.query(
      'SELECT id, name FROM patients WHERE user_id = $1',
      [req.user.id]
    )

    if (patientResult.rows.length > 0) {
      patientId = patientResult.rows[0].id
      patientName = patientResult.rows[0].name
    }

    const result = await pool.query(
      `INSERT INTO alerts (patient_id, patient_name, latitude, longitude, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patientId, patientName, latitude || null, longitude || null, message || 'SOS Emergency Alert']
    )

    const alert = result.rows[0]

    // Broadcast the alert via WebSocket
    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'sos_alert',
        id: alert.id,
        patient_id: alert.patient_id,
        patient_name: alert.patient_name,
        latitude: alert.latitude,
        longitude: alert.longitude,
        message: alert.message,
        created_at: alert.created_at,
        status: alert.status,
      })
    }

    res.status(201).json({ alert })
  } catch (err) {
    console.error('Create alert error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/alerts — Fetch alerts
router.get('/', async (req, res) => {
  try {
    let query, params
    if (req.user.role === 'worker' || req.user.role === 'admin') {
      query = `SELECT a.*, p.village, p.gestational_week, p.risk_level
               FROM alerts a
               LEFT JOIN patients p ON p.id = a.patient_id
               ORDER BY a.created_at DESC`
      params = []
    } else {
      // Find patient record
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [req.user.id]
      )
      const patientId = patientResult.rows[0]?.id
      if (!patientId) {
        return res.json({ alerts: [] })
      }
      query = `SELECT a.* FROM alerts a WHERE a.patient_id = $1 ORDER BY a.created_at DESC`
      params = [patientId]
    }

    const result = await pool.query(query, params)
    res.json({ alerts: result.rows })
  } catch (err) {
    console.error('Get alerts error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/alerts/:id/resolve — Resolve alert
router.put('/:id/resolve', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const { status } = req.body
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const result = await pool.query(
      `UPDATE alerts
       SET status = $1, resolved_at = now(), resolved_by = $2
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' })
    }

    const alert = result.rows[0]

    // Broadcast the update via WebSocket
    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'sos_resolved',
        id: alert.id,
        status: alert.status,
        resolved_at: alert.resolved_at,
      })
    }

    res.json({ alert })
  } catch (err) {
    console.error('Resolve alert error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
