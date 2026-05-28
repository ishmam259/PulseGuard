const express = require('express')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')
const { patientSchema, vitalsSchema } = require('../schemas/patient.schema')

const router = express.Router()

// All patient routes require authentication
router.use(authenticate)

// GET /api/patients — List patients
router.get('/', async (req, res) => {
  try {
    let query, params

    if (req.user.role === 'admin') {
      query = `SELECT p.*, u.name as worker_name FROM patients p
               LEFT JOIN users u ON u.id = p.assigned_worker
               ORDER BY p.risk_score DESC, p.last_updated DESC`
      params = []
    } else if (req.user.role === 'worker') {
      query = `SELECT p.*, u.name as worker_name FROM patients p
               LEFT JOIN users u ON u.id = p.assigned_worker
               WHERE p.assigned_worker = $1
               ORDER BY p.risk_score DESC, p.last_updated DESC`
      params = [req.user.id]
    } else {
      query = `SELECT p.*, u.name as worker_name FROM patients p
               LEFT JOIN users u ON u.id = p.assigned_worker
               WHERE p.user_id = $1`
      params = [req.user.id]
    }

    const result = await pool.query(query, params)
    res.json({ patients: result.rows })
  } catch (err) {
    console.error('List patients error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/patients — Create patient
router.post('/', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const data = patientSchema.parse(req.body)
    const result = await pool.query(
      `INSERT INTO patients (name, age, village, gestational_week, assigned_worker, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.age, data.village, data.gestational_week, data.assigned_worker || req.user.id, data.user_id || null]
    )
    res.status(201).json({ patient: result.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Create patient error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/patients/:id — Get single patient with latest vitals
router.get('/:id', async (req, res) => {
  try {
    const patientResult = await pool.query(
      `SELECT p.*, u.name as worker_name FROM patients p
       LEFT JOIN users u ON u.id = p.assigned_worker
       WHERE p.id = $1`,
      [req.params.id]
    )

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' })
    }

    const patient = patientResult.rows[0]
    if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const vitalsResult = await pool.query(
      `SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
      [req.params.id]
    )

    res.json({
      patient,
      latestVitals: vitalsResult.rows[0] || null,
    })
  } catch (err) {
    console.error('Get patient error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/patients/:id — Update patient profile
router.put('/:id', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const data = patientSchema.partial().parse(req.body)
    const fields = []
    const values = []
    let idx = 1

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`)
      values.push(value)
      idx++
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    fields.push(`last_updated = now()`)
    values.push(req.params.id)

    const result = await pool.query(
      `UPDATE patients SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' })
    }

    res.json({ patient: result.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Update patient error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/patients/:id/vitals — Add vitals entry
router.post('/:id/vitals', async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      const patientCheck = await pool.query('SELECT user_id FROM patients WHERE id = $1', [req.params.id])
      if (patientCheck.rows.length === 0 || patientCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    } else if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const data = vitalsSchema.parse(req.body)

    // Fetch patient's gestational week for AI prediction
    const patientData = await pool.query('SELECT gestational_week FROM patients WHERE id = $1', [req.params.id])
    const gestationalWeek = patientData.rows[0]?.gestational_week || 24

    // Call AI worker for risk prediction
    let riskScore = 0
    let riskLevel = 'low'
    try {
      const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000'
      const aiResponse = await fetch(`${aiUrl}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bp_systolic: data.bp_systolic,
          bp_diastolic: data.bp_diastolic,
          weight_kg: data.weight_kg,
          temperature_c: data.temperature_c,
          pulse: data.pulse,
          symptoms: data.symptoms,
          gestational_week: gestationalWeek,
        }),
      })
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json()
        riskScore = aiResult.risk_score
        riskLevel = aiResult.risk_level
      }
    } catch {
      // AI worker unavailable — use simple heuristic
      if (data.bp_systolic >= 140 || data.bp_diastolic >= 90) {
        riskScore = 0.8
        riskLevel = 'high'
      } else if (data.bp_systolic >= 130 || data.bp_diastolic >= 85) {
        riskScore = 0.5
        riskLevel = 'moderate'
      } else {
        riskScore = 0.2
        riskLevel = 'low'
      }
    }

    const result = await pool.query(
      `INSERT INTO vitals (patient_id, recorded_by, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse, symptoms, risk_score, risk_level, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.params.id, req.user.id, data.bp_systolic, data.bp_diastolic, data.weight_kg, data.temperature_c, data.pulse, data.symptoms, riskScore, riskLevel, data.notes]
    )

    // Update patient risk level
    await pool.query(
      `UPDATE patients SET risk_level = $1, risk_score = $2, last_updated = now() WHERE id = $3`,
      [riskLevel, riskScore, req.params.id]
    )

    // Broadcast WebSocket alert if high risk
    if (riskScore > 0.7 && req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'risk_alert',
        patient_id: req.params.id,
        risk_score: riskScore,
        risk_level: riskLevel,
        message: `High risk detected — Risk score: ${riskScore}`,
      })
    }

    res.status(201).json({ vitals: result.rows[0], riskScore, riskLevel })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Add vitals error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/patients/:id/history — Full vitals history
router.get('/:id/history', async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      const patientCheck = await pool.query('SELECT user_id FROM patients WHERE id = $1', [req.params.id])
      if (patientCheck.rows.length === 0 || patientCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    } else if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const result = await pool.query(
      `SELECT v.*, u.name as recorded_by_name FROM vitals v
       LEFT JOIN users u ON u.id = v.recorded_by
       WHERE v.patient_id = $1
       ORDER BY v.recorded_at DESC`,
      [req.params.id]
    )
    res.json({ history: result.rows })
  } catch (err) {
    console.error('History error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/patients/:id/export — CSV export
router.get('/:id/export', async (req, res) => {
  try {
    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id])
    if (patient.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' })
    }
    const p = patient.rows[0]

    if (req.user.role === 'patient' && p.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const vitals = await pool.query('SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC', [req.params.id])
    let csv = 'Date,BP Systolic,BP Diastolic,Weight (kg),Temperature (C),Pulse,Symptoms,Risk Score,Risk Level\n'

    for (const v of vitals.rows) {
      csv += `${v.recorded_at},${v.bp_systolic},${v.bp_diastolic},${v.weight_kg},${v.temperature_c},${v.pulse},"${(v.symptoms || []).join('; ')}",${v.risk_score},${v.risk_level}\n`
    }

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${p.name.replace(/\s/g, '_')}_vitals.csv"`)
    res.send(csv)
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
