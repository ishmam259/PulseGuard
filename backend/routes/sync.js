const express = require('express')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')
const { syncBatchSchema, vitalsSchema } = require('../schemas/patient.schema')

const router = express.Router()

router.use(authenticate)

// POST /api/sync — Batch upload offline queue
router.post('/', requireRole('worker', 'admin', 'patient'), async (req, res) => {
  try {
    const data = syncBatchSchema.parse(req.body)
    const results = { synced: [], conflicts: [], errors: [] }

    let verifiedPatientId = null
    if (req.user.role === 'patient') {
      const patientCheck = await pool.query('SELECT id FROM patients WHERE user_id = $1', [req.user.id])
      if (patientCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Patient profile not found. Cannot sync records.' })
      }
      verifiedPatientId = patientCheck.rows[0].id
    }

    for (const item of data.items) {
      try {
        if (req.user.role === 'patient' && item.patient_id !== verifiedPatientId) {
          results.errors.push({
            patient_id: item.patient_id,
            type: item.type,
            error: 'Forbidden: You can only synchronize your own medical records.',
          })
          continue
        }

        if (item.type === 'vitals') {
          const synced = await syncVitals(item, req.user, req.app.locals.broadcast)
          if (synced.conflict) {
            results.conflicts.push(synced)
          } else {
            results.synced.push(synced)
          }
        } else if (item.type === 'profile') {
          const synced = await syncProfile(item, req.user)
          if (synced.conflict) {
            results.conflicts.push(synced)
          } else {
            results.synced.push(synced)
          }
        }
      } catch (err) {
        results.errors.push({
          patient_id: item.patient_id,
          type: item.type,
          error: err.message,
        })
      }
    }

    res.json({
      message: `Sync complete: ${results.synced.length} synced, ${results.conflicts.length} conflicts, ${results.errors.length} errors`,
      ...results,
    })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    console.error('Sync error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/sync/conflicts — List unresolved conflicts
router.get('/conflicts', requireRole('worker', 'admin'), async (req, res) => {
  try {
    let query, params

    if (req.user.role === 'admin') {
      query = `SELECT sc.*, p.name as patient_name FROM sync_conflicts sc
               JOIN patients p ON p.id = sc.patient_id
               WHERE sc.resolved = false ORDER BY sc.created_at DESC`
      params = []
    } else {
      query = `SELECT sc.*, p.name as patient_name FROM sync_conflicts sc
               JOIN patients p ON p.id = sc.patient_id
               WHERE sc.resolved = false AND p.assigned_worker = $1
               ORDER BY sc.created_at DESC`
      params = [req.user.id]
    }

    const result = await pool.query(query, params)
    res.json({ conflicts: result.rows })
  } catch (err) {
    console.error('Get conflicts error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/sync/conflicts/:id/resolve — Resolve a conflict
router.post('/conflicts/:id/resolve', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const { resolution } = req.body // 'keep_local' | 'keep_server'
    if (!['keep_local', 'keep_server'].includes(resolution)) {
      return res.status(400).json({ error: 'Resolution must be keep_local or keep_server' })
    }

    const conflict = await pool.query(
      'SELECT * FROM sync_conflicts WHERE id = $1 AND resolved = false',
      [req.params.id]
    )

    if (conflict.rows.length === 0) {
      return res.status(404).json({ error: 'Conflict not found or already resolved' })
    }

    const c = conflict.rows[0]

    // Apply the chosen resolution
    if (resolution === 'keep_local') {
      if (c.record_type === 'vitals') {
        const data = c.local_payload
        await pool.query(
          `UPDATE vitals SET bp_systolic = $1, bp_diastolic = $2, weight_kg = $3,
           temperature_c = $4, pulse = $5, last_updated = now()
           WHERE id = (SELECT id FROM vitals WHERE patient_id = $6 ORDER BY recorded_at DESC LIMIT 1)`,
          [data.bp_systolic, data.bp_diastolic, data.weight_kg, data.temperature_c, data.pulse, c.patient_id]
        )
      } else if (c.record_type === 'profile') {
        const data = c.local_payload
        const allowedFields = ['name', 'age', 'village', 'gestational_week']
        const fields = []
        const values = []
        let idx = 1
        for (const [key, value] of Object.entries(data)) {
          if (allowedFields.includes(key)) {
            fields.push(`${key} = $${idx}`)
            values.push(value)
            idx++
          }
        }
        if (fields.length > 0) {
          values.push(c.patient_id)
          await pool.query(
            `UPDATE patients SET ${fields.join(', ')}, last_updated = now() WHERE id = $${idx}`,
            values
          )
        }
      }
    }
    // 'keep_server' requires no data changes — just mark resolved below

    // Mark as resolved
    await pool.query(
      `UPDATE sync_conflicts SET resolved = true, resolution = $1, resolved_by = $2, resolved_at = now()
       WHERE id = $3`,
      [resolution, req.user.id, req.params.id]
    )

    res.json({ message: `Conflict resolved: ${resolution}` })
  } catch (err) {
    console.error('Resolve conflict error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

async function syncVitals(item, user, broadcast) {
  const validated = vitalsSchema.parse(item.data)

  // Check for conflicts — compare with latest server record
  const latest = await pool.query(
    'SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 1',
    [item.patient_id]
  )

  if (latest.rows.length > 0 && item.local_timestamp) {
    const serverTime = new Date(latest.rows[0].last_updated)
    const localTime = new Date(item.local_timestamp)

    // If server was updated after client went offline, flag conflict
    if (serverTime > localTime) {
      const conflictResult = await pool.query(
        `INSERT INTO sync_conflicts (patient_id, record_type, local_payload, server_payload)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [item.patient_id, 'vitals', JSON.stringify(item.data), JSON.stringify(latest.rows[0])]
      )
      return { conflict: true, conflict_id: conflictResult.rows[0].id, patient_id: item.patient_id }
    }
  }

  // No conflict — write directly
  // Try to get risk prediction from AI worker
  let riskScore = 0.2, riskLevel = 'low'
  try {
    const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000'
    const aiResp = await fetch(`${aiUrl}/ai/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    })
    if (aiResp.ok) {
      const ai = await aiResp.json()
      riskScore = ai.risk_score
      riskLevel = ai.risk_level
    }
  } catch {
    // Fallback heuristic
    if (validated.bp_systolic >= 140 || validated.bp_diastolic >= 90) { riskScore = 0.8; riskLevel = 'high' }
    else if (validated.bp_systolic >= 130) { riskScore = 0.5; riskLevel = 'moderate' }
  }

  const result = await pool.query(
    `INSERT INTO vitals (patient_id, recorded_by, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse, symptoms, risk_score, risk_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [item.patient_id, user.id, validated.bp_systolic, validated.bp_diastolic, validated.weight_kg, validated.temperature_c, validated.pulse, validated.symptoms, riskScore, riskLevel]
  )

  // Update patient risk
  await pool.query(
    'UPDATE patients SET risk_level = $1, risk_score = $2, last_updated = now() WHERE id = $3',
    [riskLevel, riskScore, item.patient_id]
  )

  // Broadcast alert if high risk
  if (riskScore > 0.7 && broadcast) {
    broadcast({ type: 'risk_alert', patient_id: item.patient_id, risk_score: riskScore, risk_level: riskLevel })
  }

  return { conflict: false, vitals_id: result.rows[0].id, patient_id: item.patient_id, risk_score: riskScore }
}

async function syncProfile(item, user) {
  const latest = await pool.query('SELECT * FROM patients WHERE id = $1', [item.patient_id])

  if (latest.rows.length > 0 && item.local_timestamp) {
    const serverTime = new Date(latest.rows[0].last_updated)
    const localTime = new Date(item.local_timestamp)

    if (serverTime > localTime) {
      // Check if fields overlap — auto-merge if non-overlapping
      const serverData = latest.rows[0]
      const localData = item.data
      const overlapping = Object.keys(localData).some(k => serverData[k] !== undefined && serverData[k] !== localData[k])

      if (!overlapping) {
        // Auto-merge
        const fields = Object.entries(localData).map(([k], i) => `${k} = $${i + 1}`).join(', ')
        const values = Object.values(localData)
        values.push(item.patient_id)
        await pool.query(`UPDATE patients SET ${fields}, last_updated = now() WHERE id = $${values.length}`, values)
        return { conflict: false, patient_id: item.patient_id, auto_merged: true }
      }

      const conflictResult = await pool.query(
        `INSERT INTO sync_conflicts (patient_id, record_type, local_payload, server_payload)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [item.patient_id, 'profile', JSON.stringify(localData), JSON.stringify(serverData)]
      )
      return { conflict: true, conflict_id: conflictResult.rows[0].id, patient_id: item.patient_id }
    }
  }

  // Direct write
  const data = item.data
  const fields = Object.entries(data).map(([k], i) => `${k} = $${i + 1}`).join(', ')
  const values = Object.values(data)
  values.push(item.patient_id)
  await pool.query(`UPDATE patients SET ${fields}, last_updated = now() WHERE id = $${values.length}`, values)

  return { conflict: false, patient_id: item.patient_id }
}

module.exports = router
