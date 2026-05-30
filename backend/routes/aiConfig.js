const express = require('express')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

// Ensure ai_config table and default row exist
async function ensureConfig() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_config (
      id INT PRIMARY KEY DEFAULT 1,
      high_bp_systolic INT DEFAULT 140,
      high_bp_diastolic INT DEFAULT 90,
      moderate_bp_systolic INT DEFAULT 130,
      moderate_bp_diastolic INT DEFAULT 85,
      high_risk_cutoff NUMERIC(3,2) DEFAULT 0.70,
      moderate_risk_cutoff NUMERIC(3,2) DEFAULT 0.40,
      alert_threshold NUMERIC(3,2) DEFAULT 0.70,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`INSERT INTO ai_config DEFAULT VALUES ON CONFLICT DO NOTHING`)
}

// GET /api/ai-config — Retrieve current AI config (admin only)
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    await ensureConfig()
    const result = await pool.query('SELECT * FROM ai_config WHERE id = 1')
    res.json({ config: result.rows[0] })
  } catch (err) {
    console.error('Get AI config error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/ai-config — Update AI config (admin only)
router.put('/', requireRole('admin'), async (req, res) => {
  try {
    await ensureConfig()
    const {
      high_bp_systolic,
      high_bp_diastolic,
      moderate_bp_systolic,
      moderate_bp_diastolic,
      high_risk_cutoff,
      moderate_risk_cutoff,
      alert_threshold,
    } = req.body

    const result = await pool.query(
      `UPDATE ai_config SET
        high_bp_systolic = COALESCE($1, high_bp_systolic),
        high_bp_diastolic = COALESCE($2, high_bp_diastolic),
        moderate_bp_systolic = COALESCE($3, moderate_bp_systolic),
        moderate_bp_diastolic = COALESCE($4, moderate_bp_diastolic),
        high_risk_cutoff = COALESCE($5, high_risk_cutoff),
        moderate_risk_cutoff = COALESCE($6, moderate_risk_cutoff),
        alert_threshold = COALESCE($7, alert_threshold),
        updated_at = now()
      WHERE id = 1
      RETURNING *`,
      [
        high_bp_systolic || null,
        high_bp_diastolic || null,
        moderate_bp_systolic || null,
        moderate_bp_diastolic || null,
        high_risk_cutoff || null,
        moderate_risk_cutoff || null,
        alert_threshold || null,
      ]
    )

    res.json({ config: result.rows[0] })
  } catch (err) {
    console.error('Update AI config error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
module.exports.ensureConfig = ensureConfig
