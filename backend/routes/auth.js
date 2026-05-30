const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const pool = require('../db/pool')
const { registerSchema, loginSchema, profileUpdateSchema } = require('../schemas/auth.schema')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    const passwordHash = await bcrypt.hash(data.password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [data.name, data.email || null, data.phone || null, passwordHash, data.role]
    )

    const user = result.rows[0]
    const token = generateAccessToken(user)
    const refreshToken = await createRefreshToken(user.id)

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
      refreshToken,
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'User with this email or phone already exists' })
    }
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)

    let query, param
    if (data.email) {
      query = 'SELECT * FROM users WHERE email = $1'
      param = data.email
    } else {
      query = 'SELECT * FROM users WHERE phone = $1'
      param = data.phone
    }

    const result = await pool.query(query, [param])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(data.password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Enforce role match: users can only log in through their own role portal
    if (data.role && user.role !== data.role) {
      return res.status(403).json({ error: `This account is registered as "${user.role}". Please use the correct login portal.` })
    }

    const token = generateAccessToken(user)
    const refreshToken = await createRefreshToken(user.id)

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
      refreshToken,
    })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }

    const result = await pool.query(
      'SELECT rt.*, u.name, u.email, u.phone, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = $1 AND rt.expires_at > now()',
      [refreshToken]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }

    const row = result.rows[0]

    // Delete old refresh token (rotation)
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])

    const user = { id: row.user_id, name: row.name, email: row.email, phone: row.phone, role: row.role }
    const newToken = generateAccessToken(user)
    const newRefreshToken = await createRefreshToken(user.id)

    res.json({ token: newToken, refreshToken: newRefreshToken })
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/auth/profile — Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const data = profileUpdateSchema.parse(req.body)

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, phone = $3, updated_at = now()
       WHERE id = $4
       RETURNING id, name, email, phone, role`,
      [data.name, data.email || null, data.phone || null, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'User with this email or phone already exists' })
    }
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
}

async function createRefreshToken(userId) {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  )
  return token
}

module.exports = router
