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
  risk_level TEXT DEFAULT 'low',
  risk_score NUMERIC(4,3) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
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
