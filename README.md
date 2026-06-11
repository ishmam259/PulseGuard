# PulseGuard AI

![PulseGuard](ReadmeImages/Cover.png)

---

## Executive Summary

**PulseGuard** is an enterprise-grade, AI-powered maternal health monitoring ecosystem built for Bangladesh and the Bangladeshi diaspora. It delivers clinical-grade pregnancy risk detection, multilingual AI-guided health support, and real-time community worker coordination — all in a single, offline-capable platform.

Three roles. One system. Every mother covered.

| Role | Who | What they get |
|------|-----|---------------|
| **Patient** | Pregnant mothers | AI chat, daily check-ins, nutrition, medicine safety, emergency SOS |
| **Community Health Worker** | Field nurses & midwives | Patient list, vitals entry, AI risk analysis, alert management |
| **Admin** | District health officers | System dashboard, user management, AI configuration, analytics |

---

## The Problem

Bangladesh faces a maternal health crisis with structural roots:

- **173 maternal deaths** per 100,000 live births (WHO 2022) — 3× higher than global average
- **60% of births** occur in rural areas with no continuous care between clinic visits
- Community health workers manage **25–40 patients each** with no digital decision support
- Symptom deterioration between appointments goes undetected until it becomes an emergency
- No culturally appropriate, Bengali-language health guidance exists at scale

Existing digital health tools are designed for high-resource settings. They fail in low-connectivity environments, require medical literacy, and provide no support for the languages rural Bangladeshi mothers speak.

---

## Our Solution

PulseGuard addresses every layer of this problem with a full-stack AI health platform:

| Capability | How it works |
|-----------|-------------|
| **AI Risk Scoring** | XGBoost model trained on vitals + symptoms predicts high/moderate/low risk in real time |
| **3-Tier LLM Cascade** | Groq Llama 3.3 70B → Gemini 2.5 Flash (4-key rotation) → Offline Q&A fallback |
| **Multilingual Support** | Full English + Bengali (বাংলা) UI with locale-aware AI responses |
| **Offline-First Architecture** | All core features work without internet; sync_conflicts resolved on reconnect |
| **RAG-Powered Guidance** | Quarkus Java service with pgvector embeddings for clinically-grounded answers |
| **Real-Time Alerts** | JWT-authenticated WebSocket broadcasts high-risk events to worker/admin dashboards |
| **MCP Integration** | 4 registered Model Context Protocol tools (login, food search, RDA, nutrition guidelines) |

---

## Target Audience

- **Primary:** Pregnant women aged 18–40 in Bangladesh (urban and rural)
- **Secondary:** Community health workers (chw / field nurses) deployed at district clinics
- **Tertiary:** District health officers and DGHS (Directorate General of Health Services) administrators
- **Diaspora:** 10M+ Bangladeshis abroad seeking culturally familiar pregnancy care tools

---

## Platform Features & Screenshots

### Landing Page & Onboarding

| | |
|:---:|:---:|
| **Hero — AI-Native Pregnancy Care**<br>Animated vitals monitor, risk gauge, ECG waveform. Zero-configuration entry point for all roles.<br><br><img src="ReadmeImages/01-landing-hero.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **Feature Overview**<br>Three-role platform overview with feature highlights. Mobile-first responsive layout.<br><br><img src="ReadmeImages/02-landing-features.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **Tiered Pricing (BDT)**<br>Community Clinic (Free) → District Health (৳499/mo) → National Deployment (৳1,999/mo). Annual billing with confetti toggle.<br><br><img src="ReadmeImages/03-landing-pricing.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **About Page**<br>Mission, impact metrics, and the story behind PulseGuard.<br><br><img src="ReadmeImages/04-about.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |

---

### Patient Portal

The patient portal is a mobile-first progressive web app that works fully offline.

| | |
|:---:|:---:|
| **1. Patient Dashboard**<br>Personalized welcome with gestational week tracker, daily tip, AI chat shortcut, and today's nutrition summary.<br><br><img src="ReadmeImages/05-patient-dashboard.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **2. AI Symptom Checker**<br>Multilingual AI chat powered by 3-tier LLM cascade. Personalized RAG mode injects patient profile context into every query.<br><br><img src="ReadmeImages/06-patient-ai-chat.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **3. Daily Health Check**<br>Structured daily check-in for symptoms, mood, and wellness indicators. Triggers automated risk re-scoring on submission.<br><br><img src="ReadmeImages/07-patient-daily-check.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **4. Nutrition Tracking**<br>Full 9-nutrient tracking (calories, protein, carbs, fat, iron, calcium, folic acid, zinc, vitamin D/C) with FCDB food database integration.<br><br><img src="ReadmeImages/08-patient-nutrition.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **5. Emergency SOS**<br>One-tap emergency alert with GPS coordinates broadcast to assigned health worker and admin via WebSocket. Contacts list visible instantly.<br><br><img src="ReadmeImages/09-patient-emergency.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **6. Medicine Safety Checker**<br>AI-powered pregnancy-safe medicine lookup. Returns SAFE / CAUTION / AVOID rating with gestational week context and safe alternatives.<br><br><img src="ReadmeImages/10-patient-medicine.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **7. Pregnancy Calendar**<br>Week-by-week fetal development timeline, milestone tracker, and appointment reminders calculated from LMP date.<br><br><img src="ReadmeImages/11-patient-calendar.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **8. Health Records & Vitals History**<br>Complete vitals history (BP, weight, SpO₂, pulse, temperature) with trend visualization and CSV export.<br><br><img src="ReadmeImages/12-patient-records.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **9. Wellness Tracker**<br>Hydration logging, nausea/vomit tracking, and AI-generated wellness score. Dehydration risk flagged automatically.<br><br><img src="ReadmeImages/13-patient-wellness.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | |

---

### Community Health Worker Portal

Built for field workers with limited connectivity. Prioritizes speed and decision support.

| | |
|:---:|:---:|
| **10. Worker Dashboard**<br>Real-time KPI overview: total patients, high/moderate/low risk breakdown, quick actions. High-risk patients surfaced immediately.<br><br><img src="ReadmeImages/14-worker-dashboard.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **11. Patient List**<br>Full patient roster with risk badges, gestational week, last visit date, and search/filter. Direct link to each patient's profile.<br><br><img src="ReadmeImages/15-worker-patients.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **12. Patient Detail View**<br>Full patient profile with XGBoost risk score, vitals history chart, symptom log, and AI-generated longitudinal summary.<br><br><img src="ReadmeImages/16-worker-patient-detail.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **13. Vitals Entry**<br>Structured form for recording BP, weight, temperature, pulse, and symptoms. Triggers real-time AI risk re-scoring on save.<br><br><img src="ReadmeImages/17-worker-vitals.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **14. Worker AI Analysis**<br>Clinical AI assistant with context-aware answers grounded in patient data. Workers can query symptoms, medications, and protocols.<br><br><img src="ReadmeImages/18-worker-ai-analysis.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | |

---

### Admin Dashboard

Full system control for district health officers and platform administrators.

| | |
|:---:|:---:|
| **15. Admin Overview**<br>System-wide stats, Maternal Risk Trends chart, Patients by Region chart, and recent activity log.<br><br><img src="ReadmeImages/19-admin-dashboard.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **16. Analytics**<br>Risk distribution charts, regional heatmaps, time-series trends, and cohort analysis across all enrolled patients.<br><br><img src="ReadmeImages/20-admin-analytics.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |
| **17. User Management**<br>Full CRUD for patients, workers, and admins. Role assignment, profile management, and account deactivation.<br><br><img src="ReadmeImages/21-admin-users.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> | **18. AI Configuration**<br>Live-adjustable thresholds for BP risk classification, XGBoost risk cutoffs, and alert trigger levels — no redeploy required.<br><br><img src="ReadmeImages/22-admin-ai-config.png" width="100%" style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/> |

---

## Technology Stack

![Tech Stack Overview](ReadmeImages/Tech%20Stack%20Overview.jpeg)

### Service Architecture

PulseGuard runs as 5 Docker services communicating via REST, WebSocket, and SSE:

```
User Browser
    │
    ▼ HTTPS
React 19 SPA (Vite)
    │
    ├─── REST ───────► Node.js / Express API (port 5000)
    │                       │
    │                       ├─── PostgreSQL (pgvector) — Core DB (port 5433)
    │                       ├─── WebSocket /ws ─────► Admin / Worker dashboards
    │                       └─── AI Worker URL ─────► FastAPI AI Worker
    │
    ├─── WS/JSON ────► Quarkus Chat & RAG Service (port 8081)
    │                       ├─── Chat DB (pgvector, port 5435)
    │                       └─── RAG DB  (pgvector, port 5436)
    │
    └─── SSE ────────► FastAPI AI Worker (port 8000)
                            ├─── Groq  (Llama 3.3 70B)
                            ├─── Gemini 2.5 Flash (×4 key rotation)
                            └─── Offline Q&A matcher (no network)
```

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router DOM | v7 | Client-side routing |
| Framer Motion | latest | Animations & transitions |
| Tailwind CSS | v3 | Utility-first styling |
| Radix UI Primitives | latest | Accessible headless components |
| NumberFlow | latest | Animated number transitions |
| Canvas Confetti | latest | Delight moments |
| Lucide React | latest | Icon system |
| Chart.js / Recharts | latest | Data visualization |
| clsx + tailwind-merge | latest | Class name utilities |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js + Express | 5.x | REST API server |
| PostgreSQL + pgvector | pg16 | Primary relational DB + vector search |
| ws | latest | JWT-authenticated WebSocket server |
| JSON Web Token | latest | Auth (access + refresh tokens) |
| bcrypt | latest | Password hashing (10 rounds) |
| Zod | 3.25 | Request validation schemas |
| google-auth-library | latest | Google OAuth 2.0 |
| Cloudinary | latest | Profile picture storage |
| node-fetch / axios | latest | HTTP client |
| Docker + Compose | latest | Container orchestration |

### AI & ML Worker (Python FastAPI)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11/3.12 | Runtime |
| FastAPI | latest | API server |
| XGBoost | latest | On-device maternal risk prediction |
| NumPy + Pandas | latest | Data processing |
| Groq SDK | latest | Llama 3.3 70B (Tier 1 LLM) |
| google-genai | latest | Gemini 2.5 Flash (Tier 2 LLM, ×4 keys) |
| Pydantic v2 | latest | Data modeling |

### Chat & RAG Service (Java Quarkus)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java 21 | LTS | Runtime |
| Quarkus | 3.36.1 | Reactive Java framework |
| Quarkus WebSockets Next | latest | Community chat WebSocket |
| Hibernate ORM + Panache | latest | Data access layer |
| PostgreSQL JDBC | latest | DB connection |
| Gemini API | latest | Embedding generation for RAG |
| Jackson | latest | JSON serialization |

---

## AI & ML Layer

### 3-Tier LLM Cascade

PulseGuard implements a robust, never-failing AI response pipeline:

```
Patient/Worker query
        │
        ▼
  [Tier 1] Groq — Llama 3.3 70B Versatile
        │  (via OpenRouter-compatible endpoint)
        │  Fast, cheap, high-quality
        │
  [on error/timeout] ──► [Tier 2] Gemini 2.5 Flash
        │                    4 API keys in round-robin rotation
        │                    Automatic key cycling on rate limits
        │
  [on all failures] ──► [Tier 3] Offline Q&A Matcher
                            Python keyword matching on FCDB data
                            Works with zero internet connection
```

### XGBoost Risk Prediction Model

- Input features: BP (systolic/diastolic), weight, temperature, pulse, gestational week, symptom array
- Output: `risk_score` (0.0–1.0) and `risk_level` (low / moderate / high)
- Runs entirely on-device in the FastAPI worker — no external API call
- Thresholds configurable by admin in real time without redeploy

### MCP (Model Context Protocol) Integration

4 registered tools available to the AI via SSE transport:

| Tool | Description |
|------|-------------|
| `login` | Authenticate and establish MCP session |
| `search_food` | Search the FCDB food database by name |
| `get_my_rda` | Retrieve personalized daily nutrient targets |
| `get_nutrition_guidelines` | Fetch WHO/DGHS nutrition guidelines |

### Quarkus RAG (Retrieval-Augmented Generation)

- Embedding model: Gemini API (text embeddings)
- Vector store: PostgreSQL + pgvector (separate `ragdb` instance)
- Semantic search over clinical guidelines and maternal health documents
- Results injected into LLM context for grounded, citation-backed responses

---

## Data Layer

### Core Database Tables (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `users` | All roles — patients, workers, admins. Google OAuth support. |
| `patients` | Gestational week, LMP date, risk score, assigned worker |
| `vitals` | BP, weight, temperature, pulse, symptoms per visit |
| `ai_chats` | Conversation history (JSONB messages array) |
| `nutrition_logs` | 9-nutrient meal logs with FCDB food references |
| `medicine_logs` | Safety check history per patient |
| `medicine_schedules` | Reminder schedules with dose times |
| `alerts` | SOS emergencies with GPS coordinates |
| `sync_conflicts` | Offline conflict resolution queue |
| `water_logs` / `vomit_logs` | Wellness tracking |
| `food_items` | FCDB Bangladeshi Food Composition Database |
| `ai_config` | Live-adjustable AI thresholds (no redeploy) |

### Food Composition Database (FCDB)

- Source: Bangladesh Food Composition Tables (BIRDEM / BNNC)
- 9 nutrients tracked per item: energy, protein, carbs, fat, calcium, iron, zinc, vitamin D, folate, vitamin C
- Full text search via PostgreSQL GIN index on Bengali + English names
- Serving size mapping table with cultural units (bowl, piece, katori)

### Offline-First Architecture

```
Browser (IndexedDB / localStorage)
        │
        │ [online]  ──► Immediate sync to PostgreSQL via REST
        │ [offline] ──► Queue in sync_conflicts table
        ▼
sync_conflicts: { patient_id, record_type, local_payload, server_payload }
        │
        ▼
Conflict resolution: worker reviews divergent vitals on reconnect
```

---

## API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Role-bound registration (Zod validated) |
| `/api/auth/login` | POST | Password login → JWT + refresh token |
| `/api/auth/refresh` | POST | Rotate access token using refresh token |
| `/api/auth/me` | GET | Get current authenticated user |
| `/api/auth/google` | POST | Google OAuth sign-in |

### Patients & Vitals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients` | GET | List patients (role-filtered: worker sees assigned, admin sees all) |
| `/api/patients` | POST | Create patient profile |
| `/api/patients/:id` | GET | Get patient with latest vitals + risk score |
| `/api/patients/:id/vitals` | POST | Add vitals entry (triggers risk re-scoring) |
| `/api/patients/:id/history` | GET | Full vitals history |
| `/api/patients/:id/export` | GET | Export patient data as CSV |

### AI Services

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | AI symptom checker (3-tier LLM cascade) |
| `/api/ai/predict` | POST | XGBoost risk prediction |
| `/api/ai/summary` | POST | Longitudinal AI summary for patient history |

### Clinical Modules

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nutrition` | GET/POST | Nutrition logs with FCDB lookup |
| `/api/medicine` | POST | Medicine pregnancy safety check |
| `/api/alerts` | GET/POST | Emergency SOS management |
| `/api/wellness` | GET/POST | Water and vomit logs |
| `/api/mcp` | GET/POST | Model Context Protocol tools (SSE transport) |

### WebSocket

```
ws://[host]/ws?token=<JWT>
```
- Authenticated via JWT query parameter
- Events: `risk_alert` (broadcasts to worker + admin when patient risk elevates)
- Per-user client pool: each user maintains a `Set<WebSocket>` connection map

---

## Security Model

### Authentication & Authorization

- **JWT access tokens** (15-minute expiry) + **refresh token rotation** (UUID stored in DB)
- **bcrypt** password hashing — 10 salt rounds
- **RBAC** enforced at both route middleware and frontend `ProtectedRoute` component
- **Google OAuth 2.0** as optional sign-in path (google-auth-library, PKCE flow)

### Role-Based Access Control

| Role | Access |
|------|--------|
| `patient` | Own records only. Cannot access worker or admin routes. |
| `worker` | Assigned patients only. Read access to patient data, write access to vitals. |
| `admin` | Full system access. AI config, user management, all analytics. |

### Data Protection

- All API calls require `Authorization: Bearer <token>` header
- WebSocket connections validated via JWT before upgrade handshake
- CORS restricted to known frontend origins
- Profile pictures stored in Cloudinary (not on application server)
- No plaintext passwords stored — community chat passwords encrypted at rest

---

## Performance & Scalability

| Metric | Design Decision |
|--------|----------------|
| **Offline capability** | Core features function with zero connectivity |
| **LLM resilience** | 3-tier cascade ensures AI never fails to respond |
| **Rate limit handling** | Gemini 4-key rotation prevents single-key exhaustion |
| **DB connection pooling** | PostgreSQL pool via `pg.Pool` in Express layer |
| **Separation of concerns** | ML worker isolated in Python (FastAPI) — can scale independently |
| **Real-time** | WebSocket pub/sub decoupled from REST API via `app.locals` |

---

## Quick Start

### Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 20+ (for local frontend dev)
- A `.env` file in the project root (see below)



### Run with Docker

```bash
# Clone and configure
git clone https://github.com/ishmam259/PulseGuard.git
cd PulseGuard
cp .env.example .env   # fill in your keys

# Start all services
docker compose up --build

# Seed demo data (first run only)
docker compose exec api node db/migrate.js --seed
```

### Services after startup

| Service | URL |
|---------|-----|
| Frontend (React SPA) | http://localhost:3000 |
| Express API | http://localhost:5000 |
| FastAPI AI Worker | http://localhost:8000 |
| Quarkus Chat & RAG | http://localhost:8081 |
| PostgreSQL Core DB | localhost:5433 |

### Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Patient | amina@patient.pg | password |
| Health Worker | karim@worker.pg | password |
| Admin | admin@pulseguard.ai | password |

### Local Frontend Development

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

---

## Team

| Name | Role |
|------|------|
| **Ishmaam Tahmid** | Full Stack Developer |
| **Md. Ashraful Islam** | AI / ML Engineer |
| **Farhan Tahsin Khan** | Backend Engineer |
| **Zannatul Ferdous Maliha** | Frontend Engineer |
| **Mahmudul Hasan Sakib** | DevOps / Infrastructure |

---

## Roadmap

### Short-Term (Q3 2026)
- [ ] Hospital EHR integration (HL7 FHIR export)
- [ ] SMS/WhatsApp alert fallback for areas with no smartphone
- [ ] Push notifications for medicine reminders
- [ ] Expanded FCDB (500+ → 2,000+ food items)

### Mid-Term (Q4 2026)
- [ ] Wearable device integration (BP cuff, pulse oximeter via Bluetooth)
- [ ] Telemedicine video consultation module
- [ ] Peer support groups within community chat
- [ ] Multi-clinic / multi-district admin hierarchy

### Long-Term (2027+)
- [ ] Official DGHS (Directorate General of Health Services) API integration
- [ ] Postpartum monitoring module (6-week follow-up)
- [ ] Predictive model retraining pipeline on anonymized local data
- [ ] Bangladesh Health Data Exchange (BHDE) compliance

---

## Changelog

### v1.0.0 — Hackathon Release (June 2026)
- ✅ Full patient portal (9 modules: dashboard, AI chat, daily check, nutrition, emergency, medicine, calendar, records, wellness)
- ✅ Community health worker portal (dashboard, patient list, vitals entry, AI analysis, alert management)
- ✅ Admin dashboard (overview, analytics, user management, AI config)
- ✅ 3-tier LLM cascade (Groq → Gemini 4-key → offline fallback)
- ✅ XGBoost maternal risk prediction model
- ✅ JWT authentication with refresh token rotation + Google OAuth
- ✅ WebSocket real-time risk alerts
- ✅ MCP integration (4 registered tools)
- ✅ Quarkus RAG & community chat service
- ✅ Offline-first architecture with sync conflict resolution
- ✅ FCDB Bangladeshi Food Composition Database integration
- ✅ Bengali + English multilingual UI
- ✅ Docker Compose full-stack deployment
- ✅ Medicine safety checker (SAFE / CAUTION / AVOID with gestational context)
- ✅ Emergency SOS with GPS broadcast via WebSocket
- ✅ Tiered BDT pricing (৳499 / ৳1,999 per month)

---

*Built with ❤️ for the mothers of Bangladesh.*
