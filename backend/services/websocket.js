const WebSocket = require('ws')
const jwt = require('jsonwebtoken')

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' })
  const clients = new Map() // userId -> Set<ws>

  wss.on('connection', (ws, req) => {
    // Authenticate via query param
    const url = new URL(req.url, 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4001, 'Authentication required')
      return
    }

    let user
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      ws.close(4002, 'Invalid token')
      return
    }

    // Track connection
    if (!clients.has(user.id)) {
      clients.set(user.id, new Set())
    }
    clients.get(user.id).add(ws)

    console.log(`🔌 WebSocket connected: ${user.name} (${user.role})`)

    ws.on('close', () => {
      const userClients = clients.get(user.id)
      if (userClients) {
        userClients.delete(ws)
        if (userClients.size === 0) {
          clients.delete(user.id)
        }
      }
      console.log(`🔌 WebSocket disconnected: ${user.name}`)
    })

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message)
    })

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: `Welcome, ${user.name}. Real-time alerts are active.`,
    }))
  })

  // Broadcast to all connected clients
  function broadcast(data) {
    const message = JSON.stringify(data)
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  // Send to a specific user
  function sendToUser(userId, data) {
    const userClients = clients.get(userId)
    if (userClients) {
      const message = JSON.stringify(data)
      userClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message)
        }
      })
    }
  }

  // Send to all users with a specific role
  function sendToRole(role, data) {
    // We'd need to track roles — for now broadcast to all
    broadcast(data)
  }

  return { wss, broadcast, sendToUser, sendToRole }
}

module.exports = { setupWebSocket }
