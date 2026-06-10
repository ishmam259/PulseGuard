const express = require('express');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const mcpManager = require('../services/mcpManager');

const router = express.Router();

const transports = new Map();

// GET /api/mcp — Establish SSE connection
router.get('/', async (req, res) => {
  try {
    console.log('🔌 MCP: New SSE connection request');
    
    // Using the same path for messages (POST) as for the SSE stream (GET)
    const transport = new SSEServerTransport('/api/mcp', res);
    const sessionId = transport.sessionId;
    
    transports.set(sessionId, transport);
    console.log(`🔌 MCP: SSE session established: ${sessionId}`);

    await mcpManager.server.connect(transport);

    transport.onclose = () => {
      console.log(`🔌 MCP: SSE session closed: ${sessionId}`);
      transports.delete(sessionId);
    };
  } catch (error) {
    console.error('❌ MCP SSE Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/mcp — Receive messages for the established connection
router.post('/', async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    console.log(`✉️  MCP: Received message for session: ${sessionId}`);

    if (!sessionId) {
      console.warn('⚠️  MCP: Missing sessionId in POST request');
      return res.status(400).json({ error: 'Missing sessionId parameter' });
    }

    const transport = transports.get(sessionId);
    if (transport) {
      // We MUST pass req.body here because express.json() middleware 
      // in server.js has already consumed the request stream.
      await transport.handlePostMessage(req, res, req.body);
      console.log(`✅ MCP: Message handled for session: ${sessionId}`);
    } else {
      console.warn(`⚠️  MCP: Session not found: ${sessionId}`);
      res.status(404).json({ error: 'Session not found or expired' });
    }
  } catch (error) {
    console.error('❌ MCP Message Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;
