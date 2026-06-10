const express = require('express')
const { authenticate } = require('../middleware/auth')
const { searchMedicine, getMedicineDetails } = require('../scripts/medex-scraper')
const pool = require('../db/pool')

const router = express.Router()
const MEDEX_BASE = 'https://medex.com.bd'

router.use(authenticate)

const toAbsolute = (url) =>
  url.startsWith('http') ? url : `${MEDEX_BASE}${url}`

async function enrichWithImages(results) {
  const details = await Promise.all(
    results.map((r) => getMedicineDetails(r.url).catch(() => null))
  )
  return results.map((r, i) => ({
    ...r,
    imageUrl: details[i]?.packImageUrl || null,
  }))
}

// GET /api/medicine/search?q=
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.status(400).json({ error: 'Query param q is required' })

  try {
    const raw = await searchMedicine(q)
    const top5 = raw.slice(0, 5).map((r) => ({
      name: r.name,
      url: toAbsolute(r.url),
      description: r.description,
    }))
    const results = await enrichWithImages(top5)
    res.json({ results })
  } catch (err) {
    console.error('Medex search error:', err.message)
    res.status(502).json({ error: 'Medex unreachable', results: [] })
  }
})

// POST /api/medicine/check — photo identification → medex search
router.post('/check', async (req, res) => {
  const { imageBase64, role, pregnancyWeek, language } = req.body

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required' })
  }

  try {
    const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000'
    const aiRes = await fetch(`${aiUrl}/ai/medicine-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, role, pregnancyWeek, language }),
    })

    let identified = null
    let aiData = null
    if (aiRes.ok) {
      aiData = await aiRes.json()
      identified = aiData.identified || null
    }

    if (!identified) {
      return res.status(422).json({ error: 'Could not identify medicine from image' })
    }

    const raw = await searchMedicine(identified)
    const top5 = raw.slice(0, 5).map((r) => ({
      name: r.name,
      url: toAbsolute(r.url),
      description: r.description,
    }))
    const results = await enrichWithImages(top5)

    const { SAFETY, REASON, WEEK_NOTE, ALTERNATIVES } = aiData || {}
    res.json({ identified, safety: { SAFETY, REASON, WEEK_NOTE, ALTERNATIVES }, results })
  } catch (err) {
    console.error('Medicine check error:', err.message)
    res.status(502).json({ error: 'Service unavailable' })
  }
})

// POST /api/medicine/safety — text-query pregnancy safety (search tab)
router.post('/safety', async (req, res) => {
  const { name, pregnancyWeek, language } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  try {
    const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000'
    const aiRes = await fetch(`${aiUrl}/ai/medicine-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: name, role: 'patient', pregnancyWeek, language }),
    })
    if (!aiRes.ok) return res.status(502).json({ error: 'AI unavailable' })
    const { SAFETY, REASON, WEEK_NOTE, ALTERNATIVES } = await aiRes.json()
    res.json({ SAFETY, REASON, WEEK_NOTE, ALTERNATIVES })
  } catch (err) {
    console.error('Medicine safety error:', err.message)
    res.status(502).json({ error: 'AI unavailable' })
  }
})

// POST /api/medicine/log — save a medicine the patient checked
router.post('/log', async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patients only' })
  const { medicine_name, safety_status, safety_reason, gestational_week, source,
          description, week_note, alternatives } = req.body
  if (!medicine_name) return res.status(400).json({ error: 'medicine_name is required' })

  try {
    const patResult = await pool.query(
      `SELECT id FROM patients WHERE user_id = $1 LIMIT 1`,
      [req.user.id]
    )
    if (patResult.rows.length === 0) return res.status(404).json({ error: 'Patient profile not found' })
    const patient_id = patResult.rows[0].id

    const result = await pool.query(
      `INSERT INTO medicine_logs
         (patient_id, medicine_name, safety_status, safety_reason, gestational_week, source, description, week_note, alternatives)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [patient_id, medicine_name, safety_status || null, safety_reason || null,
       gestational_week || null, source || 'search',
       description || null, week_note || null, alternatives || null]
    )
    res.status(201).json({ ok: true, log: result.rows[0] })
  } catch (err) {
    console.error('Medicine log error:', err.message)
    res.status(500).json({ error: 'Failed to save medicine log' })
  }
})

// GET /api/medicine/log — fetch patient's recent medicine history
router.get('/log', async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patients only' })

  try {
    const patResult = await pool.query(
      `SELECT id FROM patients WHERE user_id = $1 LIMIT 1`,
      [req.user.id]
    )
    if (patResult.rows.length === 0) return res.status(404).json({ error: 'Patient profile not found' })
    const patient_id = patResult.rows[0].id

    const result = await pool.query(
      `SELECT id, medicine_name, safety_status, safety_reason, gestational_week, source,
              description, week_note, alternatives, logged_at
       FROM medicine_logs WHERE patient_id = $1 ORDER BY logged_at DESC LIMIT 50`,
      [patient_id]
    )
    res.json({ logs: result.rows })
  } catch (err) {
    console.error('Medicine log fetch error:', err.message)
    res.status(500).json({ error: 'Failed to fetch medicine log' })
  }
})

// DELETE /api/medicine/log/:id — remove a medicine log entry (patient's own only)
router.delete('/log/:id', async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patients only' })

  try {
    const patResult = await pool.query(
      `SELECT id FROM patients WHERE user_id = $1 LIMIT 1`,
      [req.user.id]
    )
    if (patResult.rows.length === 0) return res.status(404).json({ error: 'Patient profile not found' })
    const patient_id = patResult.rows[0].id

    const result = await pool.query(
      `DELETE FROM medicine_logs WHERE id = $1 AND patient_id = $2 RETURNING id`,
      [req.params.id, patient_id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Log entry not found' })
    res.json({ ok: true })
  } catch (err) {
    console.error('Medicine log delete error:', err.message)
    res.status(500).json({ error: 'Failed to delete medicine log' })
  }
})

module.exports = router
