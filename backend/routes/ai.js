const express = require('express');
const { authenticate } = require('../middleware/auth');
const { scrubPII } = require('../services/piiScrubber');

const router = express.Router();

router.use(authenticate);

// POST /api/ai/chat — AI symptom checker
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try to call AI worker
    try {
      const aiUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      console.log('🔗 Calling AI worker at:', aiUrl);
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
      // AI worker unavailable — return mock response
      console.error('❌ AI worker fetch failed:', err.message);
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

    // Try AI worker first
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
      // Fallback to heuristic
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

    // Try AI worker
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
      } else {
        const errorDetails = await aiResponse.json();
        console.error(
          'FastAPI Validation Error:',
          JSON.stringify(errorDetails, null, 2),
        );
        //return null;
      }
    } catch {
      // Fallback
    }

    // Mock summary
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
