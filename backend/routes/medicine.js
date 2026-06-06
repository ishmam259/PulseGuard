const express = require('express')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

router.use(authenticate)

router.post('/check', async (req, res) => {
  const { query, imageBase64, role, pregnancyWeek, language } = req.body
  try {
    const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000'
    const aiRes = await fetch(`${aiUrl}/ai/medicine-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, imageBase64, role, pregnancyWeek, language }),
    })
    if (aiRes.ok) return res.json(await aiRes.json())
    const errBody = await aiRes.json().catch(() => ({}))
    return res.status(aiRes.status).json(errBody)
  } catch (err) {
    console.error('Medicine AI error:', err.message)
  }
  res.status(502).json({ error: 'AI worker unavailable', offline: true })
})

module.exports = router
