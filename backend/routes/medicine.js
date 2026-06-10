const express = require('express')
const { authenticate } = require('../middleware/auth')
const { searchMedicine, getMedicineDetails } = require('../scripts/medex-scraper')
const pool = require('../db/pool')

const router = express.Router()
const MEDEX_BASE = 'https://medex.com.bd'

router.use(authenticate)

// Helper to resolve patient_id
async function resolvePatientId(userId) {
  const r = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId])
  return r.rows[0]?.id ?? null
}

// GET /api/medicine/history — Fetch patient's medicine check history
router.get('/history', async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    const result = await pool.query(
      'SELECT * FROM medicine_history WHERE patient_id = $1 ORDER BY checked_at DESC LIMIT 10',
      [patientId]
    )
    res.json({ history: result.rows })
  } catch (err) {
    console.error('Get medicine history error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/medicine/history — Add a record to history
router.post('/history', async (req, res) => {
  try {
    const { name, safety, details } = req.body
    if (!name || !safety) return res.status(400).json({ error: 'name and safety are required' })

    const patientId = await resolvePatientId(req.user.id)
    if (!patientId) return res.status(404).json({ error: 'Patient profile not found' })

    // Upsert or simple insert? Let's do simple insert for now, or delete old matches to simulate the frontend "filtered" behavior
    await pool.query('DELETE FROM medicine_history WHERE patient_id = $1 AND name ILIKE $2', [patientId, name])

    const result = await pool.query(
      `INSERT INTO medicine_history (patient_id, name, safety, details)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patientId, name, safety, details || {}]
    )

    res.status(201).json({ entry: result.rows[0] })
  } catch (err) {
    console.error('Add medicine history error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

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

module.exports = router
