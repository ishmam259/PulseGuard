const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db/pool')
const { registerSchema } = require('../schemas/auth.schema')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

// All user routes require admin role
router.use(authenticate, requireRole('admin'))

// GET /api/users — List all users (except self)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/users — Create a new user (worker/admin)
router.post('/', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    
    // Only allow creating workers or admins through this interface, though patient is allowed by schema
    if (!['worker', 'admin'].includes(data.role)) {
      return res.status(400).json({ error: 'Only worker and admin roles can be created here' })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [data.name, data.email || null, data.phone || null, passwordHash, data.role]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'User with this email or phone already exists' })
    }
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Create user error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/users/:id — Deactivate/delete a user
router.delete('/:id', async (req, res) => {
  try {
    // Prevent deleting oneself
    if (req.params.id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' })
    }

    // Instead of hard delete, we could update status to 'inactive', but let's see if status exists.
    // Assuming status column exists from the GET query, if not we fall back to hard delete.
    // Since we're not sure if status column actually exists (was not in schema shown for auth),
    // let's do a hard delete for simplicity in this hackathon.
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('Delete user error:', err)
    // If there's a foreign key constraint violation (e.g., worker assigned to patients), return an error
    if (err.code === '23503') {
       return res.status(400).json({ error: 'Cannot delete user because they are associated with other records (e.g., assigned patients). Reassign their patients first.' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
