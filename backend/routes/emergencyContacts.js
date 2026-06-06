const express = require('express')
const pool = require('../db/pool')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// GET /api/emergency-contacts — List user's emergency contacts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at ASC`,
      [req.user.id]
    )
    res.json({ contacts: result.rows })
  } catch (err) {
    console.error('Get emergency contacts error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/emergency-contacts — Add a new emergency contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, relationship } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Limit to 5 emergency contacts per user
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM emergency_contacts WHERE user_id = $1`,
      [req.user.id]
    )
    if (parseInt(countResult.rows[0].count) >= 5) {
      return res.status(400).json({ error: 'Maximum 5 emergency contacts allowed' })
    }

    const result = await pool.query(
      `INSERT INTO emergency_contacts (user_id, name, email, phone, relationship)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, name, email, phone || null, relationship || null]
    )

    res.status(201).json({ contact: result.rows[0] })
  } catch (err) {
    console.error('Create emergency contact error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/emergency-contacts/:id — Update an emergency contact
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, relationship } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const result = await pool.query(
      `UPDATE emergency_contacts
       SET name = $1, email = $2, phone = $3, relationship = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, email, phone || null, relationship || null, req.params.id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    res.json({ contact: result.rows[0] })
  } catch (err) {
    console.error('Update emergency contact error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/emergency-contacts/:id — Remove an emergency contact
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    res.json({ message: 'Contact deleted', contact: result.rows[0] })
  } catch (err) {
    console.error('Delete emergency contact error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
