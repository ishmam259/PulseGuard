const express = require('express')
const { authenticate } = require('../middleware/auth')
const { searchMedicine, getMedicineDetails } = require('../scripts/medex-scraper')

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

module.exports = router
