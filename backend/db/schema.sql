-- ═══════════════════════════════════════════════════════════
-- PulseGuard AI — Database Schema
-- PostgreSQL + pgvector
-- ═══════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Commented out for environment compatibility if pgvector is not installed

-- Users (all roles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'worker', 'admin')) NOT NULL,
  address TEXT,
  blood_type TEXT,
  height NUMERIC(5,2),
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Patient profiles
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_worker UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INT,
  village TEXT,
  gestational_week INT,
  lmp_date DATE,
  height NUMERIC(5,2),
  blood_type TEXT,
  profile_picture_url TEXT,
  risk_level TEXT DEFAULT 'low',
  risk_score NUMERIC(4,3) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent migration for existing databases (pre-lmp_date schema):
-- add the anchor column and backfill it from the static gestational_week.
ALTER TABLE patients ADD COLUMN IF NOT EXISTS lmp_date DATE;
UPDATE patients SET lmp_date = CURRENT_DATE - (gestational_week * 7)
  WHERE lmp_date IS NULL AND gestational_week IS NOT NULL;

-- Idempotent migration: profile enhancement fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS height NUMERIC(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

ALTER TABLE patients ADD COLUMN IF NOT EXISTS height NUMERIC(5,2);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Medicine check history
CREATE TABLE IF NOT EXISTS medicine_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  safety TEXT NOT NULL,
  details JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Hospital bag checklist
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  is_packed BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, item_id)
);

-- Vitals entries
CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  bp_systolic INT,
  bp_diastolic INT,
  weight_kg NUMERIC(5,2),
  temperature_c NUMERIC(4,1),
  pulse INT,
  symptoms TEXT[],
  risk_score NUMERIC(4,3),
  risk_level TEXT,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Sync conflict log
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'vitals', 'profile'
  local_payload JSONB,
  server_payload JSONB,
  resolved BOOLEAN DEFAULT false,
  resolution TEXT, -- 'keep_local', 'keep_server', 'auto_merged'
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- pgvector embeddings (RAG) - Commented out for environment compatibility if pgvector is not installed
-- CREATE TABLE IF NOT EXISTS guideline_chunks (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   source TEXT,
--   chunk TEXT,
--   embedding VECTOR(1536),
--   created_at TIMESTAMPTZ DEFAULT now()
-- );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_worker ON patients(assigned_worker);
CREATE INDEX IF NOT EXISTS idx_patients_risk ON patients(risk_level);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_recorded ON vitals(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_unresolved ON sync_conflicts(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Vector index for RAG - Commented out for environment compatibility if pgvector is not installed
-- CREATE INDEX IF NOT EXISTS idx_guideline_embeddings ON guideline_chunks
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- SOS alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_patient ON alerts(patient_id);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);

-- Daily water intake log
CREATE TABLE IF NOT EXISTS water_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount_ml  INT NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 2000),
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vomiting episode log
CREATE TABLE IF NOT EXISTS vomit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  severity   SMALLINT NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 3),
  kept_food  BOOLEAN NOT NULL DEFAULT false,
  notes      TEXT,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_water_logs_patient
  ON water_logs (patient_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_vomit_logs_patient
  ON vomit_logs (patient_id, logged_at DESC);

-- Food items table from FCDB
CREATE TABLE IF NOT EXISTS food_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fcdb_code     TEXT UNIQUE NOT NULL,   -- e.g. '01_0001'
  name_en       TEXT NOT NULL,
  name_bn       TEXT,
  category      TEXT NOT NULL,          -- e.g. 'Cereals', 'Vegetables', 'Fish'

  -- Per 100g nutrient values (9 tracked nutrients)
  energy_kcal   NUMERIC(7,1),
  protein_g     NUMERIC(6,2),
  carb_g        NUMERIC(6,2),
  fat_g         NUMERIC(5,2),
  calcium_mg    NUMERIC(7,2),
  iron_mg       NUMERIC(6,2),
  zinc_mg       NUMERIC(6,2),
  vitamin_d_mcg NUMERIC(6,2),
  folate_mcg    NUMERIC(7,1),
  vitamin_c_mg  NUMERIC(7,2),

  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_items_search ON food_items
  USING gin(to_tsvector('simple', name_en || ' ' || COALESCE(name_bn,'')));
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);

-- Food serving sizes mapping table
CREATE TABLE IF NOT EXISTS food_serving_sizes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id     UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  unit_name        TEXT NOT NULL,        -- 'piece', 'bowl', 'cup', etc.
  grams_equivalent NUMERIC(7,2) NOT NULL,
  display_label    TEXT NOT NULL         -- '1 Bowl (200g)'
);

-- Drop and recreate nutrition_logs with 9 nutrients and food reference
DROP TABLE IF EXISTS nutrition_logs CASCADE;

CREATE TABLE nutrition_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- How was this logged?
  entry_method    TEXT NOT NULL DEFAULT 'direct'
                    CHECK (entry_method IN ('direct', 'food_based')),

  -- Food reference (food_based only)
  food_item_id    UUID REFERENCES food_items(id) ON DELETE SET NULL,
  quantity        NUMERIC(7,3),       -- e.g. 1.5
  serving_unit    TEXT,               -- e.g. 'bowl'
  food_name       TEXT NOT NULL,      -- display name (auto-filled from food_items or user-provided)
  meal_type       TEXT NOT NULL
                    CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),

  -- Macronutrients
  calories_kcal   NUMERIC(7,1) NOT NULL DEFAULT 0,
  protein_g       NUMERIC(6,2) NOT NULL DEFAULT 0,
  carb_g          NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_g           NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Micronutrients (9 tracked total: calories, protein, carb, fat, iron, calcium, folic_acid, zinc, vitamin_d, vitamin_c)
  iron_mg         NUMERIC(6,2) NOT NULL DEFAULT 0,
  calcium_mg      NUMERIC(6,1) NOT NULL DEFAULT 0,
  folic_acid_mcg  NUMERIC(7,1) NOT NULL DEFAULT 0,
  zinc_mg         NUMERIC(5,2) NOT NULL DEFAULT 0,
  vitamin_d_mcg   NUMERIC(6,2) NOT NULL DEFAULT 0,
  vitamin_c_mg    NUMERIC(6,2) NOT NULL DEFAULT 0,

  logged_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_patient_day
  ON nutrition_logs (patient_id, logged_at DESC);

-- Patient profile additions for nutrition tracking
ALTER TABLE patients ADD COLUMN IF NOT EXISTS activity_level     TEXT DEFAULT 'sedentary'
  CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active'));
ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_twin_pregnancy  BOOLEAN DEFAULT false;


-- ═══════════════════════════════════════════════════════════
-- Conduit (matrix) credentials for community chat
-- ═══════════════════════════════════════════════════════════
-- Conduit v0.10 does not support JWT login; we provision each
-- PulseGuard patient with a server-generated strong password,
-- store its bcrypt hash here, and use the plaintext (read on
-- demand from the server process) to call m.login.password.
-- The plaintext is never returned to the browser.
CREATE TABLE IF NOT EXISTS conduit_credentials (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  conduit_user_id TEXT NOT NULL UNIQUE,
  password_ciphertext TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Chat history
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chats_user ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_updated ON ai_chats(updated_at DESC);

-- Idempotent migration: Google OAuth support
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Medicine log: persists every medicine the patient saves after a safety check
CREATE TABLE IF NOT EXISTS medicine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  safety_status TEXT CHECK (safety_status IN ('SAFE', 'CAUTION', 'AVOID')),
  safety_reason TEXT,
  gestational_week INT,
  source TEXT DEFAULT 'search',
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medicine_logs_patient ON medicine_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_logged ON medicine_logs(logged_at DESC);

ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS week_note TEXT;
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS alternatives TEXT;

-- Medicine reminder schedules: one row per prescribed course
CREATE TABLE IF NOT EXISTS medicine_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  notes TEXT,
  description TEXT,
  times_per_day INT NOT NULL DEFAULT 1,
  dose_times JSONB NOT NULL DEFAULT '[]',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_med_schedules_patient ON medicine_schedules(patient_id);

-- Tracks each individual dose taken against a schedule
CREATE TABLE IF NOT EXISTS medicine_dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES medicine_schedules(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL,
  dose_date DATE NOT NULL DEFAULT CURRENT_DATE,
  taken_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dose_unique
  ON medicine_dose_logs (schedule_id, patient_id, scheduled_time, dose_date);

