-- ═══════════════════════════════════════════════════════════
-- PulseGuard AI — Seed Data
-- Matches frontend mock data for consistent demo
-- ═══════════════════════════════════════════════════════════

-- Password for all seed users: "password"
-- bcrypt hash of "password" (standard test vector)

-- Users
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Amina Rahman', 'amina@patient.pg', '+880123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient'),
  ('a0000002-0000-0000-0000-000000000002', 'Dr. Karim Hossain', 'karim@worker.pg', '+880987654321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
  ('a0000003-0000-0000-0000-000000000003', 'Admin Farhan', 'admin@pulseguard.ai', '+880555000111', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('a0000004-0000-0000-0000-000000000004', 'Nurse Tania', 'tania@worker.pg', '+880111222333', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker')
ON CONFLICT (id) DO NOTHING;

-- Patients
INSERT INTO patients (id, user_id, assigned_worker, name, age, village, gestational_week, risk_level, risk_score) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 'Amina Rahman', 28, 'Kurigram Village A', 22, 'high', 0.820),
  ('b0000002-0000-0000-0000-000000000002', NULL, 'a0000004-0000-0000-0000-000000000004', 'Salma Begum', 25, 'Kurigram Village B', 18, 'moderate', 0.450),
  ('b0000003-0000-0000-0000-000000000003', NULL, 'a0000002-0000-0000-0000-000000000002', 'Rahima Khatun', 32, 'Rangpur Village C', 30, 'low', 0.180),
  ('b0000004-0000-0000-0000-000000000004', NULL, 'a0000004-0000-0000-0000-000000000004', 'Fatema Akter', 22, 'Dinajpur Village D', 12, 'low', 0.120),
  ('b0000005-0000-0000-0000-000000000005', NULL, 'a0000002-0000-0000-0000-000000000002', 'Nasreen Jahan', 30, 'Kurigram Village A', 36, 'high', 0.780)
ON CONFLICT (id) DO NOTHING;

-- Amina: week 22 entered 3 weeks ago → current computed week ≈ 25
UPDATE patients SET gestational_week = 22, lmp_date = CURRENT_DATE - 175
  WHERE id = 'b0000001-0000-0000-0000-000000000001';

-- Anchor remaining patients' gestational weeks from today (those without an anchor yet).
UPDATE patients SET lmp_date = CURRENT_DATE - (gestational_week * 7) WHERE lmp_date IS NULL;

-- Vitals history for Amina Rahman
INSERT INTO vitals (patient_id, recorded_by, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse, symptoms, risk_score, risk_level, recorded_at) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 140, 90, 63.2, 37.2, 88, ARRAY['Headache', 'Dizziness'], 0.820, 'high', now() - interval '1 day'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 135, 88, 63.0, 37.0, 84, ARRAY['Headache'], 0.720, 'high', now() - interval '3 days'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 130, 85, 62.8, 36.9, 80, ARRAY['Fatigue'], 0.580, 'moderate', now() - interval '6 days'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 125, 82, 62.5, 36.8, 78, ARRAY[]::TEXT[], 0.420, 'moderate', now() - interval '9 days'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 122, 80, 62.2, 36.7, 76, ARRAY[]::TEXT[], 0.350, 'moderate', now() - interval '12 days'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 120, 78, 62.0, 36.6, 74, ARRAY[]::TEXT[], 0.280, 'low', now() - interval '15 days'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 118, 76, 61.8, 36.5, 73, ARRAY[]::TEXT[], 0.220, 'low', now() - interval '18 days');

-- Vitals for other patients
INSERT INTO vitals (patient_id, recorded_by, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse, symptoms, risk_score, risk_level, recorded_at) VALUES
  ('b0000002-0000-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000004', 130, 85, 58.0, 36.8, 76, ARRAY['Fatigue'], 0.450, 'moderate', now() - interval '2 days'),
  ('b0000003-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000002', 118, 76, 65.0, 36.6, 72, ARRAY[]::TEXT[], 0.180, 'low', now() - interval '4 days'),
  ('b0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000004', 115, 75, 55.0, 36.5, 70, ARRAY['Nausea'], 0.120, 'low', now() - interval '5 days'),
  ('b0000005-0000-0000-0000-000000000005', 'a0000002-0000-0000-0000-000000000002', 145, 95, 72.0, 37.4, 92, ARRAY['Headache', 'Swelling', 'Blurred Vision'], 0.780, 'high', now() - interval '1 day');

-- ── Wellness seed ──────────────────────────────────────────────────────
-- Fixed UUIDs ensure ON CONFLICT (id) DO NOTHING works on re-runs.
-- Without fixed UUIDs, gen_random_uuid() produces new IDs every time
-- and rows accumulate across Docker restarts.

-- Amina (week ~25, high risk): low water + 3 vomits → dehydration_risk
INSERT INTO water_logs (id, patient_id, amount_ml, logged_at) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 250, now() - interval '5 hours'),
  ('c1000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 200, now() - interval '2 hours'),
  ('c1000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 150, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vomit_logs (id, patient_id, severity, kept_food, notes, logged_at) VALUES
  ('c2000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 2, false, 'After breakfast', now() - interval '6 hours'),
  ('c2000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 2, false, null,             now() - interval '3 hours'),
  ('c2000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 1, true,  null,             now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Salma (week 18, moderate risk): decent water, 1 mild vomit
INSERT INTO water_logs (id, patient_id, amount_ml, logged_at) VALUES
  ('c3000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 500, now() - interval '6 hours'),
  ('c3000001-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 500, now() - interval '3 hours'),
  ('c3000001-0000-0000-0000-000000000003', 'b0000002-0000-0000-0000-000000000002', 500, now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vomit_logs (id, patient_id, severity, kept_food, notes, logged_at) VALUES
  ('c4000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 1, true, 'Morning sickness', now() - interval '7 hours')
ON CONFLICT (id) DO NOTHING;

-- Rahima (week 30, low risk): good hydration, no vomiting
INSERT INTO water_logs (id, patient_id, amount_ml, logged_at) VALUES
  ('c5000001-0000-0000-0000-000000000001', 'b0000003-0000-0000-0000-000000000003', 500, now() - interval '7 hours'),
  ('c5000001-0000-0000-0000-000000000002', 'b0000003-0000-0000-0000-000000000003', 500, now() - interval '4 hours'),
  ('c5000001-0000-0000-0000-000000000003', 'b0000003-0000-0000-0000-000000000003', 500, now() - interval '2 hours'),
  ('c5000001-0000-0000-0000-000000000004', 'b0000003-0000-0000-0000-000000000003', 500, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Fatema (week 12, low risk): some nausea, moderate water, 2 vomits (below alert threshold)
INSERT INTO water_logs (id, patient_id, amount_ml, logged_at) VALUES
  ('c6000001-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000004', 250, now() - interval '5 hours'),
  ('c6000001-0000-0000-0000-000000000002', 'b0000004-0000-0000-0000-000000000004', 350, now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vomit_logs (id, patient_id, severity, kept_food, notes, logged_at) VALUES
  ('c7000001-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000004', 1, true,  'First trimester nausea', now() - interval '6 hours'),
  ('c7000001-0000-0000-0000-000000000002', 'b0000004-0000-0000-0000-000000000004', 2, false, null,                     now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Nasreen (week 36, high risk): excessive vomiting (5) + very low water → dehydration_risk + excessive_vomiting
INSERT INTO water_logs (id, patient_id, amount_ml, logged_at) VALUES
  ('c8000001-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000005', 150, now() - interval '4 hours'),
  ('c8000001-0000-0000-0000-000000000002', 'b0000005-0000-0000-0000-000000000005', 150, now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vomit_logs (id, patient_id, severity, kept_food, notes, logged_at) VALUES
  ('c9000001-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000005', 3, false, 'Severe episode',   now() - interval '7 hours'),
  ('c9000001-0000-0000-0000-000000000002', 'b0000005-0000-0000-0000-000000000005', 3, false, null,               now() - interval '5 hours'),
  ('c9000001-0000-0000-0000-000000000003', 'b0000005-0000-0000-0000-000000000005', 2, false, null,               now() - interval '3 hours'),
  ('c9000001-0000-0000-0000-000000000004', 'b0000005-0000-0000-0000-000000000005', 2, false, 'Cannot keep food', now() - interval '2 hours'),
  ('c9000001-0000-0000-0000-000000000005', 'b0000005-0000-0000-0000-000000000005', 3, false, null,               now() - interval '45 minutes')
ON CONFLICT (id) DO NOTHING;

-- Sample sync conflict
INSERT INTO sync_conflicts (patient_id, record_type, local_payload, server_payload) VALUES
  ('b0000005-0000-0000-0000-000000000005', 'vitals',
   '{"bp_systolic": 145, "bp_diastolic": 95, "weight_kg": 72.0}',
   '{"bp_systolic": 142, "bp_diastolic": 92, "weight_kg": 71.8}');
