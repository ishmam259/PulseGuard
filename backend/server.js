require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { setupWebSocket } = require('./services/websocket')

const app = express()
const server = http.createServer(app)

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// ── Request logging ──
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m'
    console.log(`${color}${req.method}\x1b[0m ${req.path} → ${status} (${duration}ms)`)
  })
  next()
})

// ── WebSocket ──
const { broadcast, sendToUser } = setupWebSocket(server)
app.locals.broadcast = broadcast
app.locals.sendToUser = sendToUser

// ── Routes ──
app.use('/api/auth', require('./routes/auth'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/sync', require('./routes/sync'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/alerts', require('./routes/alerts'))
app.use('/api/users', require('./routes/users'))
app.use('/api/ai-config', require('./routes/aiConfig'))


// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PulseGuard API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ── API info ──
app.get('/api', (req, res) => {
  res.json({
    name: 'PulseGuard AI API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login and receive JWT',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user',
      },
      patients: {
        'GET /api/patients': 'List patients (role-filtered)',
        'POST /api/patients': 'Create patient profile',
        'GET /api/patients/:id': 'Get patient with latest vitals',
        'PUT /api/patients/:id': 'Update patient profile',
        'POST /api/patients/:id/vitals': 'Add vitals entry',
        'GET /api/patients/:id/history': 'Get vitals history',
        'GET /api/patients/:id/export': 'Export patient CSV',
      },
      sync: {
        'POST /api/sync': 'Batch sync offline data',
        'GET /api/sync/conflicts': 'List unresolved conflicts',
        'POST /api/sync/conflicts/:id/resolve': 'Resolve a conflict',
      },
      ai: {
        'POST /api/ai/chat': 'AI symptom checker',
        'POST /api/ai/predict': 'Risk prediction',
        'POST /api/ai/summary': 'Longitudinal AI summary',
      },
      websocket: 'ws://localhost:5000/ws?token=<JWT>',
    },
  })
})

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path })
})

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ──
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log('')
  console.log('  ╔═══════════════════════════════════════════╗')
  console.log('  ║   🏥 PulseGuard AI — API Server           ║')
  console.log(`  ║   🌐 http://localhost:${PORT}               ║`)
  console.log(`  ║   🔌 ws://localhost:${PORT}/ws              ║`)
  console.log('  ║   📋 GET /api for endpoint docs           ║')
  console.log('  ╚═══════════════════════════════════════════╝')
  console.log('')
})
