const express = require('express')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate)

// Pregnancy RDA targets
const RDA = {
  calories_kcal:  2200,
  protein_g:      71,
  iron_mg:        27,
  folic_acid_mcg: 600,
  calcium_mg:     1000,
}

const ALLOWED_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

async function resolvePatientId(userId) {
  const r = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId])
  return r.rows[0]?.id ?? null
}

// Check if a nutrient has been below 50% RDA for all of the last 3 full days
async function computeAlerts(patientId) {
  const result = await pool.query(`
    WITH daily AS (
      SELECT
        DATE(logged_at)        AS day,
        SUM(iron_mg)           AS iron_total,
        SUM(folic_acid_mcg)    AS folic_total,
        SUM(calcium_mg)        AS calcium_total
      FROM nutrition_logs
      WHERE patient_id = $1
        AND logged_at >= CURRENT_DATE - INTERVAL '3 days'
        AND logged_at <  CURRENT_DATE
      GROUP BY DATE(logged_at)
    )
    SELECT
      COUNT(*) FILTER (WHERE iron_total    < $2) AS iron_low_days,
      COUNT(*) FILTER (WHERE folic_total   < $3) AS folic_low_days,
      COUNT(*) FILTER (WHERE calcium_total < $4) AS calcium_low_days,
      COUNT(*)                                    AS total_days
    FROM daily
  `, [patientId, RDA.iron_mg * 0.5, RDA.folic_acid_mcg * 0.5, RDA.calcium_mg * 0.5])

  const row = result.rows[0]
  const totalDays = parseInt(row.total_days) || 0
  return {
    low_iron_3d:    totalDays >= 3 && parseInt(row.iron_low_days)    >= 3,
    low_folic_3d:   totalDays >= 3 && parseInt(row.folic_low_days)   >= 3,
    low_calcium_3d: totalDays >= 3 && parseInt(row.calcium_low_days) >= 3,
  }
}

function sumEntries(entries) {
  return {
    calories_kcal:  entries.reduce((s, r) => s + parseFloat(r.calories_kcal),  0),
    protein_g:      entries.reduce((s, r) => s + parseFloat(r.protein_g),      0),
    iron_mg:        entries.reduce((s, r) => s + parseFloat(r.iron_mg),        0),
    folic_acid_mcg: entries.reduce((s, r) => s + parseFloat(r.folic_acid_mcg), 0),
    calcium_mg:     entries.reduce((s, r) => s + parseFloat(r.calcium_mg),     0),
  }
}

// POST /api/nutrition/log — log a food entry
router.post('/log', requireRole('patient'), async (req, res) => {
  try {
    const { food_name, meal_type, calories_kcal, protein_g, iron_mg, folic_acid_mcg, calcium_mg } = req.body

    if (!food_name?.trim()) {
      return res.status(400).json({ error: 'food_name is required' })
    }
    if (!ALLOWED_MEAL_TYPES.includes(meal_type)) {
      return res.status(400).json({ error: 'meal_type must be breakfast, lunch, dinner, or snack' })
    }

    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      `INSERT INTO nutrition_logs
         (patient_id, food_name, meal_type, calories_kcal, protein_g, iron_mg, folic_acid_mcg, calcium_mg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        patientId,
        food_name.trim(),
        meal_type,
        parseFloat(calories_kcal)  || 0,
        parseFloat(protein_g)      || 0,
        parseFloat(iron_mg)        || 0,
        parseFloat(folic_acid_mcg) || 0,
        parseFloat(calcium_mg)     || 0,
      ]
    )
    res.status(201).json({ entry: result.rows[0] })
  } catch (err) {
    console.error('Log nutrition error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/nutrition/log/:id — remove a food entry
router.delete('/log/:id', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      'DELETE FROM nutrition_logs WHERE id = $1 AND patient_id = $2 RETURNING id',
      [req.params.id, patientId]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (err) {
    console.error('Delete nutrition error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/nutrition/daily — today's totals + entries + 3-day alerts (patient)
router.get('/daily', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const [entriesRes, alerts] = await Promise.all([
      pool.query(
        `SELECT id, food_name, meal_type, calories_kcal, protein_g, iron_mg, folic_acid_mcg, calcium_mg, logged_at
         FROM nutrition_logs
         WHERE patient_id = $1 AND logged_at >= CURRENT_DATE
         ORDER BY logged_at ASC`,
        [patientId]
      ),
      computeAlerts(patientId),
    ])

    res.json({ totals: sumEntries(entriesRes.rows), entries: entriesRes.rows, alerts })
  } catch (err) {
    console.error('Daily nutrition error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/nutrition/summary/:patientId — worker/admin view
router.get('/summary/:patientId', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const [entriesRes, alerts] = await Promise.all([
      pool.query(
        `SELECT id, food_name, meal_type, calories_kcal, protein_g, iron_mg, folic_acid_mcg, calcium_mg, logged_at
         FROM nutrition_logs
         WHERE patient_id = $1 AND logged_at >= CURRENT_DATE
         ORDER BY logged_at ASC`,
        [req.params.patientId]
      ),
      computeAlerts(req.params.patientId),
    ])

    res.json({ totals: sumEntries(entriesRes.rows), entries: entriesRes.rows, alerts })
  } catch (err) {
    console.error('Nutrition summary error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
