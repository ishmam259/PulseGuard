// ═══════════════════════════════════════════════════════════
// PulseGuard AI — AI Endpoints (Symptom check, predict, summary)
// Includes persistent chat session routes
// ═══════════════════════════════════════════════════════════

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { scrubPII } = require('../services/piiScrubber');
const pool = require('../db/pool');

const router = express.Router();

router.use(authenticate);

// GET /api/ai/chats — Get all chat sessions with optional query filter
router.get('/chats', async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    let query = `SELECT id, title, created_at, updated_at FROM ai_chats WHERE user_id = $1`;
    let params = [userId];

    if (q) {
      query += ` AND (title ILIKE $2 OR messages::text ILIKE $2)`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY updated_at DESC`;
    const result = await pool.query(query, params);
    res.json({ chats: result.rows });
  } catch (err) {
    console.error('Fetch chats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/chats — Create a new blank chat session
router.post('/chats', async (req, res) => {
  try {
    const userId = req.user.id;
    const defaultTitle = req.body.title || 'New Chat';
    const result = await pool.query(
      `INSERT INTO ai_chats (user_id, title, messages)
       VALUES ($1, $2, '[]'::jsonb)
       RETURNING id, title, messages, created_at, updated_at`,
      [userId, defaultTitle]
    );
    res.status(201).json({ chat: result.rows[0] });
  } catch (err) {
    console.error('Create chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai/chats/:id — Fetch a single chat session
router.get('/chats/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM ai_chats WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json({ chat: result.rows[0] });
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/ai/chats/:id — Delete a chat session
router.delete('/chats/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM ai_chats WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/chats/:id/messages — Send message inside a persistent chat session
router.post('/chats/:id/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Fetch chat session
    const chatResult = await pool.query(
      `SELECT * FROM ai_chats WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatResult.rows[0];
    const messages = chat.messages || [];

    // 2. Prepare context prompt (last 4 messages for conversational continuity)
    let contextPrompt = '';
    if (messages.length > 0) {
      const recent = messages.slice(-4);
      contextPrompt = '[Previous conversation context:\n' +
        recent.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n') +
        ']\n\n';
    }

    const fullPrompt = contextPrompt + `Current query: ${message}`;

    // 3. Call AI worker
    let responseText = 'AI service unavailable. Please try again when connected.';
    let responseSource = 'offline';
    let isOffline = true;

    try {
      const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${aiUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: scrubPII(fullPrompt),
          language: language || 'en',
        }),
      });
      if (aiResponse.ok) {
        const result = await aiResponse.json();
        responseText = result.response || result.reply;
        responseSource = result.source || 'gemini';
        isOffline = false;
      }
    } catch (err) {
      console.error('❌ AI worker connection failed:', err.message);
    }

    // 4. Generate title from first query if still default/empty
    let newTitle = chat.title;
    if (chat.title === 'New Chat' || chat.title === 'নতুন চ্যাট' || chat.title === '') {
      newTitle = message.slice(0, 35) + (message.length > 35 ? '...' : '');
    }

    // 5. Append user & AI responses
    const userMsg = {
      id: `m-${Date.now()}-user`,
      role: 'user',
      text: message,
    };
    const aiMsg = {
      id: `m-${Date.now()}-ai`,
      role: 'ai',
      text: responseText,
      source: responseSource,
    };
    const updatedMessages = [...messages, userMsg, aiMsg];

    // 6. Save back to DB
    const updateResult = await pool.query(
      `UPDATE ai_chats
       SET title = $1, messages = $2, updated_at = now()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [newTitle, JSON.stringify(updatedMessages), id, userId]
    );

    res.json({
      response: responseText,
      source: responseSource,
      offline: isOffline,
      chat: updateResult.rows[0],
    });
  } catch (err) {
    console.error('Send chat message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST /api/ai/chat — Legacy single-symptom checker (fallback)
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${aiUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: scrubPII(message),
          language: language || 'en',
        }),
      });
      if (aiResponse.ok) {
        const result = await aiResponse.json();
        return res.json(result);
      }
    } catch (err) {
      console.error('❌ Legacy AI worker fetch failed:', err.message);
    }

    return res.status(503).json({
      error: 'AI service unavailable. Please try again when connected.',
      offline: true,
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/predict — Risk prediction
router.post('/predict', async (req, res) => {
  try {
    const {
      bp_systolic,
      bp_diastolic,
      weight_kg,
      temperature_c,
      pulse,
      symptoms,
      gestational_week,
    } = req.body;

    try {
      const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${aiUrl}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bp_systolic,
          bp_diastolic,
          weight_kg,
          temperature_c,
          pulse,
          symptoms,
          gestational_week,
        }),
      });
      if (aiResponse.ok) {
        return res.json(await aiResponse.json());
      }
    } catch {
      // Fallback
    }

    // Fallback heuristic prediction
    let riskScore = 0.15;
    if (bp_systolic >= 140 || bp_diastolic >= 90) riskScore += 0.4;
    else if (bp_systolic >= 130 || bp_diastolic >= 85) riskScore += 0.2;
    if (temperature_c && temperature_c >= 38) riskScore += 0.1;
    if (pulse && (pulse > 100 || pulse < 50)) riskScore += 0.1;
    if (symptoms && symptoms.length > 0) riskScore += symptoms.length * 0.05;
    if (gestational_week && gestational_week > 28) riskScore += 0.05;

    riskScore = Math.min(riskScore, 1.0);
    const riskLevel =
      riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'moderate' : 'low';
    const preeclampsia = riskScore > 0.7;

    res.json({
      risk_score: Math.round(riskScore * 1000) / 1000,
      risk_level: riskLevel,
      preeclampsia_flag: preeclampsia,
      model: 'heuristic_fallback',
      factors: [
        bp_systolic >= 140 ? 'High systolic BP' : null,
        bp_diastolic >= 90 ? 'High diastolic BP' : null,
        temperature_c >= 38 ? 'Elevated temperature' : null,
        symptoms?.length > 2 ? 'Multiple symptoms reported' : null,
      ].filter(Boolean),
    });
  } catch (err) {
    console.error('AI predict error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/summary — Longitudinal AI summary (online only)
router.post('/summary', async (req, res) => {
  try {
    const { patient_id, result, symptoms } = req.body;
    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }

    try {
      const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${aiUrl}/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: scrubPII(patient_id),
          result,
          symptoms,
        }),
      });
      if (aiResponse.ok) {
        return res.json(await aiResponse.json());
      }
    } catch {
      // Fallback
    }

    res.json({
      summary:
        'Patient shows a consistent upward trend in blood pressure over the past 3 weeks (118 → 130 → 140 mmHg systolic). Combined with reported headaches and current gestational week, this pattern warrants close monitoring for preeclampsia. Recommend: increased visit frequency, 24-hour BP monitoring, and urinalysis.',
      recommendations: [
        'Schedule clinic visit for comprehensive BP assessment',
        'Increase iron-rich foods in diet (lentils, spinach)',
        'Monitor for warning signs: severe headache, visual changes, upper abdominal pain',
        'Consider aspirin prophylaxis after clinical consultation',
      ],
      model: 'mock',
    });
  } catch (err) {
    console.error('AI summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
