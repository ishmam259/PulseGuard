const express = require('express')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')
const { enrichPatient } = require('../services/gestation')

const router = express.Router()
router.use(authenticate)

// Water goal based on trimester (ml/day)
function dailyWaterGoalMl(gestationalWeek) {
  if (gestationalWeek == null) return 2000
  if (gestationalWeek <= 12) return 2000
  if (gestationalWeek <= 27) return 2200
  return 2400
}

// Compute dehydration / excessive-vomiting flags
function wellnessAlerts(waterTotalMl, vomitCount, goal) {
  return {
    dehydration_risk: vomitCount >= 3 && waterTotalMl < goal * 0.5,
    excessive_vomiting: vomitCount >= 5,
    hydration_pct: Math.min(100, Math.round((waterTotalMl / goal) * 100)),
  }
}

// Resolve patient_id from the authenticated user (patient role)
async function resolvePatientId(userId) {
  const r = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId])
  return r.rows[0]?.id ?? null
}

// POST /api/wellness/water — log a water entry
router.post('/water', requireRole('patient'), async (req, res) => {
  try {
    const amount_ml = parseInt(req.body.amount_ml)
    if (!amount_ml || amount_ml <= 0 || amount_ml > 2000) {
      return res.status(400).json({ error: 'amount_ml must be between 1 and 2000' })
    }

    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      'INSERT INTO water_logs (patient_id, amount_ml) VALUES ($1, $2) RETURNING *',
      [patientId, amount_ml]
    )
    res.status(201).json({ entry: result.rows[0] })
  } catch (err) {
    console.error('Log water error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/wellness/water/:id — undo a water entry
router.delete('/water/:id', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      'DELETE FROM water_logs WHERE id = $1 AND patient_id = $2 RETURNING id',
      [req.params.id, patientId]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (err) {
    console.error('Delete water error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/wellness/vomit — log a vomiting episode
router.post('/vomit', requireRole('patient'), async (req, res) => {
  try {
    const severity = parseInt(req.body.severity) || 1
    if (severity < 1 || severity > 3) {
      return res.status(400).json({ error: 'severity must be 1 (mild), 2 (moderate), or 3 (severe)' })
    }
    const kept_food = Boolean(req.body.kept_food)
    const notes = req.body.notes?.trim() || null

    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      'INSERT INTO vomit_logs (patient_id, severity, kept_food, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [patientId, severity, kept_food, notes]
    )
    res.status(201).json({ entry: result.rows[0] })
  } catch (err) {
    console.error('Log vomit error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/wellness/vomit/:id — undo a vomit entry
router.delete('/vomit/:id', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      'DELETE FROM vomit_logs WHERE id = $1 AND patient_id = $2 RETURNING id',
      [req.params.id, patientId]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (err) {
    console.error('Delete vomit error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/wellness/daily — combined today summary (patient)
router.get('/daily', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const [patientRes, waterRes, vomitRes] = await Promise.all([
      pool.query('SELECT * FROM patients WHERE id = $1', [patientId]),
      pool.query(
        `SELECT id, amount_ml, logged_at FROM water_logs
         WHERE patient_id = $1 AND logged_at >= CURRENT_DATE
         ORDER BY logged_at ASC`,
        [patientId]
      ),
      pool.query(
        `SELECT id, severity, kept_food, notes, logged_at FROM vomit_logs
         WHERE patient_id = $1 AND logged_at >= CURRENT_DATE
         ORDER BY logged_at ASC`,
        [patientId]
      ),
    ])

    const patient = enrichPatient(patientRes.rows[0])
    const goal = dailyWaterGoalMl(patient.gestational_week)
    const waterTotalMl = waterRes.rows.reduce((s, r) => s + r.amount_ml, 0)
    const alerts = wellnessAlerts(waterTotalMl, vomitRes.rows.length, goal)

    res.json({
      water: {
        total_ml: waterTotalMl,
        goal_ml: goal,
        entries: waterRes.rows,
        ...alerts,
      },
      vomit: {
        count: vomitRes.rows.length,
        entries: vomitRes.rows,
        excessive_vomiting: alerts.excessive_vomiting,
      },
    })
  } catch (err) {
    console.error('Daily wellness error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/wellness/water/week — 7-day water totals for trend bars (patient)
router.get('/water/week', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const patientRes = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId])
    const patient = enrichPatient(patientRes.rows[0])
    const goal = dailyWaterGoalMl(patient.gestational_week)

    const result = await pool.query(
      `SELECT DATE(logged_at) AS date, SUM(amount_ml)::INT AS total_ml
       FROM water_logs
       WHERE patient_id = $1 AND logged_at >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY DATE(logged_at)
       ORDER BY date ASC`,
      [patientId]
    )

    // Fill in missing days with 0
    const byDate = Object.fromEntries(result.rows.map(r => [r.date, r.total_ml]))
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      trend.push({ date: key, total_ml: byDate[key] ?? 0, goal_ml: goal })
    }

    res.json({ trend })
  } catch (err) {
    console.error('Water week trend error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/wellness/summary/:patientId — worker/admin view
router.get('/summary/:patientId', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const [patientRes, waterRes, vomitRes] = await Promise.all([
      pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]),
      pool.query(
        `SELECT SUM(amount_ml)::INT AS total_ml FROM water_logs
         WHERE patient_id = $1 AND logged_at >= CURRENT_DATE`,
        [req.params.patientId]
      ),
      pool.query(
        `SELECT COUNT(*)::INT AS count FROM vomit_logs
         WHERE patient_id = $1 AND logged_at >= CURRENT_DATE`,
        [req.params.patientId]
      ),
    ])

    if (patientRes.rows.length === 0) return res.status(404).json({ error: 'Patient not found' })

    const patient = enrichPatient(patientRes.rows[0])
    const goal = dailyWaterGoalMl(patient.gestational_week)
    const waterTotalMl = waterRes.rows[0]?.total_ml ?? 0
    const vomitCount = vomitRes.rows[0]?.count ?? 0
    const alerts = wellnessAlerts(waterTotalMl, vomitCount, goal)

    res.json({
      water_total_ml: waterTotalMl,
      vomit_count: vomitCount,
      goal_ml: goal,
      ...alerts,
    })
  } catch (err) {
    console.error('Wellness summary error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
