const express = require('express')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
const pool = require('../db/pool')
const { authenticate, requireRole } = require('../middleware/auth')
const { SMTPEmailSender } = require('../external/adapters/SMTPEmailSender')
const { enrichPatient } = require('../services/gestation')

const router = express.Router()

// Load the SOS alert HTML template at module load time.
// Template is rendered here (the call site), not inside IEmailSender/SMTPEmailSender.
const SOS_ALERT_TEMPLATE_PATH = path.join(
    __dirname,
    '..',
    'external',
    'templates',
    'sosAlert.html'
)
const sosAlertTemplate = fs.readFileSync(SOS_ALERT_TEMPLATE_PATH, 'utf-8')

/**
 * Renders the SOS alert HTML email body using the external EJS template.
 * Returns the rendered HTML string to be passed into SMTPEmailSender.sendEmail.
 */
/**
 * Resolves the latitude and longitude to a place name.
 * Falls back to the patient's village from database if offline or API error.
 */
const getPlaceName = async (latitude, longitude, defaultVillage, clientLocationName) => {
  if (clientLocationName) {
    return clientLocationName
  }
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return defaultVillage || 'Not provided'
  }

  const latNum = parseFloat(latitude)
  const lngNum = parseFloat(longitude)

  // 1. Try Nominatim (primary)
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 2000)

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&zoom=18&addressdetails=1`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PulseGuard-AI/1.0 (noreplypulseguard.ai@gmail.com)'
      }
    })
    clearTimeout(id)

    if (res.ok) {
      const data = await res.json()
      if (data && data.display_name) {
        return data.display_name
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding fetch failed or timed out, trying Groq fallback:', err.message)
  }

  // 2. Try resolving using Groq LLM (fallback)
  if (process.env.GROQ_API_KEY) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a precise geocoder. Given a latitude and longitude in Bangladesh, return ONLY a concise place/area name, city, and country. Do not explain. Do not include markdown formatting or extra text. Example: Sector 10, Uttara, Dhaka, Bangladesh'
            },
            {
              role: 'user',
              content: `Latitude: ${latNum}, Longitude: ${lngNum}`
            }
          ],
          temperature: 0.1,
          max_tokens: 60
        })
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const place = data?.choices?.[0]?.message?.content?.trim()
        if (place) {
          return place.replace(/^["']|["']$/g, '').replace(/\.$/, '')
        }
      }
    } catch (err) {
      console.warn('Groq geocoding failed or timed out:', err.message)
    }
  }

  return defaultVillage || `${latNum.toFixed(5)}, ${lngNum.toFixed(5)}`
}

/**
 * Renders the SOS alert HTML email body using the external EJS template.
 * Returns the rendered HTML string to be passed into SMTPEmailSender.sendEmail.
 */
const renderSosAlertEmail = ({ workerName, patientName, patientId, latitude, longitude, locationPlace, message, intro, messageLabel }) => {
    const hasCoords =
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined

    const mapsUrl = hasCoords
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : null

    const triggeredAt = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    return ejs.render(sosAlertTemplate, {
        workerName,
        patientName,
        patientId,
        latitude,
        longitude,
        locationPlace,
        message,
        mapsUrl,
        hasCoords,
        triggeredAt,
        intro,
        messageLabel,
    })
}

// All alert routes require authentication
router.use(authenticate)

// POST /api/alerts — Trigger SOS alert
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, locationName, message } = req.body
    let patientId = null
    let patientName = req.user.name
    let village = null

    // Check if there is a patient record for the current user
    const patientResult = await pool.query(
      'SELECT id, name, village FROM patients WHERE user_id = $1',
      [req.user.id]
    )

    if (patientResult.rows.length > 0) {
      patientId = patientResult.rows[0].id
      patientName = patientResult.rows[0].name
      village = patientResult.rows[0].village
    }

    const result = await pool.query(
      `INSERT INTO alerts (patient_id, patient_name, latitude, longitude, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patientId, patientName, latitude || null, longitude || null, message || 'SOS Emergency Alert']
    )

    // Notify all workers by email using the HTML template rendered at the call site.
    try {
      const workersResult = await pool.query(
        `SELECT name, email FROM users WHERE role = 'worker'`
      )
      const locationPlace = await getPlaceName(latitude || null, longitude || null, village, locationName)
      const mailSender = new SMTPEmailSender()
      for (const worker of workersResult.rows) {
        const htmlBody = renderSosAlertEmail({
          workerName: worker.name,
          patientName,
          patientId,
          latitude: latitude || null,
          longitude: longitude || null,
          locationPlace,
          message: message || 'SOS Emergency Alert',
          intro: `An SOS alert has just been triggered by a patient under your care.
                    Please review the details below and respond as quickly as possible &mdash;
                    every second counts.`,
          messageLabel: 'Patient Message',
        })
        await mailSender.sendEmail(
          process.env.SMTP_USER,
          worker.email,
          'SOS Alert',
          htmlBody
        )
      }

      // Also notify emergency contacts for this user
      try {
        const contactsResult = await pool.query(
          `SELECT name, email FROM emergency_contacts WHERE user_id = $1`,
          [req.user.id]
        )
        for (const contact of contactsResult.rows) {
          const htmlBody = renderSosAlertEmail({
            workerName: contact.name,
            patientName,
            patientId,
            latitude: latitude || null,
            longitude: longitude || null,
            locationPlace,
            message: 'I need urgent help',
            intro: `An SOS alert has just been triggered by ${patientName}.
                    Please review the details below and respond as quickly as possible &mdash;
                    every second counts.`,
            messageLabel: 'Message',
          })
          await mailSender.sendEmail(
            process.env.SMTP_USER,
            contact.email,
            'SOS Emergency Alert — PulseGuard',
            htmlBody
          )
        }
      } catch (contactErr) {
        console.error('Failed to send SOS alert to emergency contacts:', contactErr)
      }
    } catch (emailErr) {
      console.error('Failed to send SOS alert emails:', emailErr)
    }

    const alert = result.rows[0]

    // Broadcast the alert via WebSocket
    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'sos_alert',
        id: alert.id,
        patient_id: alert.patient_id,
        patient_name: alert.patient_name,
        latitude: alert.latitude,
        longitude: alert.longitude,
        message: alert.message,
        created_at: alert.created_at,
        status: alert.status,
      })
    }

    res.status(201).json({ alert })
  } catch (err) {
    console.error('Create alert error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/alerts — Fetch alerts
router.get('/', async (req, res) => {
  try {
    let query, params
    if (req.user.role === 'worker' || req.user.role === 'admin') {
      query = `SELECT a.*, p.village, p.gestational_week, p.lmp_date, p.risk_level
               FROM alerts a
               LEFT JOIN patients p ON p.id = a.patient_id
               ORDER BY a.created_at DESC`
      params = []
    } else {
      // Find patient record
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [req.user.id]
      )
      const patientId = patientResult.rows[0]?.id
      if (!patientId) {
        return res.json({ alerts: [] })
      }
      query = `SELECT a.* FROM alerts a WHERE a.patient_id = $1 ORDER BY a.created_at DESC`
      params = [patientId]
    }

    const result = await pool.query(query, params)
    const alerts = result.rows.map(a =>
      a.lmp_date !== undefined ? enrichPatient(a) : a
    )
    res.json({ alerts })
  } catch (err) {
    console.error('Get alerts error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/alerts/:id/resolve — Resolve alert
router.put('/:id/resolve', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const { status } = req.body
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const result = await pool.query(
      `UPDATE alerts
       SET status = $1, resolved_at = now(), resolved_by = $2
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' })
    }

    const alert = result.rows[0]

    // Broadcast the update via WebSocket
    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'sos_resolved',
        id: alert.id,
        status: alert.status,
        resolved_at: alert.resolved_at,
      })
    }

    res.json({ alert })
  } catch (err) {
    console.error('Resolve alert error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
