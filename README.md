<div align="center">
  <br/>
  <img src="frontend/public/favicon.svg" alt="PulseGuard AI" width="80"/>
  <h1>PulseGuard AI</h1>
  <p>An offline-first maternal healthcare platform powered by local XGBoost predictions and Llama 3 models<br/>to bridge rural village health workers with real-time clinical monitoring.</p>

  <p>
    <a href="http://129.80.78.215:3000/"><img src="https://img.shields.io/badge/Live%20Demo-00F59B?style=flat-square&logo=react&logoColor=white" alt="Live Demo"/></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-6366F1?style=flat-square" alt="MIT"/></a>
    <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/Groq%20AI-F55036?style=flat-square&logoColor=white" alt="Groq AI"/>
    <img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  </p>

  <p><sub>Official submission · <strong>CloudCamp BuildFest 2026</strong></sub></p>
  <br/>
</div>

---

## The Problem

Maternal care in rural communities (such as Kurigram and Rangpur in Bangladesh) faces two severe bottlenecks:
1. **Lack of Clinical Doctors**: Pregnant women in remote villages have limited or no access to local obstetricians or medical centers, leaving complications (like preeclampsia) undetected until they become life-threatening.
2. **Unstable Connectivity**: Standard cloud-dependent healthcare applications become unusable when network coverage drops, preventing village health workers from logging patient diagnostics and getting instant hazard evaluations on the ground.

---

## Solution

**PulseGuard AI** bridges these gaps by combining a **premium CarePulse-styled dark-emerald user interface** with an **offline-first local database queue and hybrid AI routing engine**:
- **Offline Vitals Logging**: Field health workers log pregnancy vitals (blood pressure, heart rate, fetal movement, weight, temperature) offline in remote homes. The app automatically caches inputs, runs a local rules-based clinical heuristic safety check, and queues records in browser local storage.
- **Auto-Sync Engine**: The moment connection is restored, the client automatically synchronizes queued records with the main PostgreSQL database.
- **XGBoost Risk Classifier**: The backend applies a custom-trained XGBoost Regressor model to evaluate vitals data, generating a maternal hazard score between `0` and `1`.
- **WebSocket Warning Loop**: High-risk predictions or emergency SOS alerts immediately trigger WebSocket broadcasts, rendering real-time notifications on clinical admin dashboards.
- **Bilingual AI Symptom Checker**: Expecting mothers can interact with an OB-GYN simulated assistant that supports English, Bengali, and **Banglish** queries (e.g. `Amr jor ache. Akhon Ki kora uchit?`), producing detailed, structured guidance powered by Llama 3.3 (70B parameters) on Groq.

> **Local Launch:** `docker compose up --build` &nbsp;·&nbsp; **Figma Design:** [Figma Board](https://www.figma.com/design/kWioE0fyIqd6pbWIZfOcEM/Healthcare-System?node-id=0-1&p=f&t=0FjVQjYscUmo3fhz-0)

---

## Features

| | Feature | Description |
|---|---|---|
| ✦ | **Bilingual AI Symptom Checker** | Fast, compassionate clinical symptom advice in English, Bengali, and Banglish script. |
| ✦ | **XGBoost Maternal Risk Scoring** | Immediate evaluation of clinical vitals (BP, temperature, kicks) with continuous risk index metrics. |
| ✦ | **Offline-First Synchronization** | Caching queue for health worker entries with automated background upload when online. |
| ✦ | **Real-Time WebSocket Alerts** | Instant visual warning indicators and in-app toasts for critical patient states or SOS triggers. |
| ✦ | **Admin AI Configuration** | Dynamic console to modify model endpoints, risk parameters, and OB-GYN system instructions. |
| ✦ | **Interactive Analytics & Reporting** | Visual region statistics, demographic chart graphs, and vital metric curves using Chart.js. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Vite React SPA                        │
│      (CarePulse Aesthetics · Chart.js · Offline-Queue)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ WebSockets / HTTP
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend API                   │
│             (Auth · WS Alerts · Sync Coordinator)           │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│      PostgreSQL Database     │ │        FastAPI Worker       │
│        (with pgvector)       │ │   (XGBoost Risk Predictor)  │
└──────────────────────────────┘ └──────────────┬──────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   Groq AI   │
                                         │ (Llama 70B) │
                                         └─────────────┘
```

### Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React (v19.2), React Router Dom (v7.1) | Clean dynamic SPA routing client. |
| **Styling** | Vanilla CSS (CarePulse Dark Emerald) | Theme system variables, dark backgrounds, high-contrast borders. |
| **Backend API** | Node.js (v18+), Express | Modular REST routes, websocket hubs, and sync handlers. |
| **AI FastAPI Worker** | Python (3.10+), FastAPI, Uvicorn | Lightweight microservice for model inference. |
| **Risk Scoring Model** | XGBoost Regressor, Scikit-Learn | Tabular classifier trained on maternal vital histories. |
| **Language Assistant** | Llama 3.3 (70B) via Groq API | Conversational helper matching WHO guidelines. |
| **Database** | PostgreSQL 16 (pgvector extension) | Secure backend store with clinical data support. |
| **Charts** | Chart.js, react-chartjs-2 | Admin dashboard visualization metrics. |
| **Containers** | Docker, Docker Compose | Multi-container stack orchestration. |

---

## Getting Started

### Option 1: Start with Docker Compose (Recommended)

Make sure you have **Docker** and **Docker Compose** installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pulseguard.git
cd pulseguard

# 2. Setup your root environmental file
copy .env.example .env
```

Open `.env` and configure your API key to enable LLM features (otherwise falls back to mock responses):
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

```bash
# 3. Spin up the entire multi-container service stack
docker compose up --build
```
Once initialized, visit:
- **React Frontend**: `http://localhost:3000`
- **Express Backend API**: `http://localhost:5000`
- **FastAPI AI Worker**: `http://localhost:8000`

---

### Option 2: Local Manual Development Installation

If you wish to run the parts of the stack manually on your local system:

#### 1. Database Setup
Start a local PostgreSQL server instance:
- Create database named `pulseguard`
- DB URL: `postgres://postgres:wirelight@localhost:5432/pulseguard`

#### 2. Express Backend Setup
```bash
cd backend
copy .env.example .env
npm install
npm run seed  # Populates database with patients, workers, & admins
npm run dev   # Starts API on http://localhost:5000
```

#### 3. AI FastAPI Service Setup
```bash
cd ai
# Create a virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1   # (Windows)
source .venv/bin/activate    # (Linux/Mac)

pip install -r requirements.txt
python main.py               # Starts worker on http://localhost:8000
```

#### 4. React Frontend Setup
```bash
cd frontend
npm install
npm run dev                  # Starts Vite server on http://localhost:5173
```

---

## Project Structure

All modules are cleanly structured inside their respective workspaces:

```
PulseGuard/
├── ai/                  # FastAPI AI Worker & XGBoost Model
│   ├── external/        # LLM adapters (Groq API integrations)
│   │   └── adapters/    # Model adapters like [openrouter_model.py](file:///D:/VSCODE/HACKATHON/PulseGuard/ai/external/adapters/openrouter_model.py)
│   ├── model/           # XGBoost classifier training scripts & artifacts
│   │   └── [train.py](file:///D:/VSCODE/HACKATHON/PulseGuard/ai/model/train.py) # Model retraining controller
│   ├── [main.py](file:///D:/VSCODE/HACKATHON/PulseGuard/ai/main.py)          # FastAPI application server and endpoints
│   └── requirements.txt # Python dependency file
├── backend/             # Express.js REST API & WebSocket server
│   ├── config/          # Database ORM connection parameters
│   ├── models/          # Database schemas (Patient, User, Vitals)
│   ├── routes/          # API route adapters
│   └── [server.js](file:///D:/VSCODE/HACKATHON/PulseGuard/backend/server.js)        # Entry file and Socket.io setups
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # Layout elements & custom forms
│   │   ├── config/      # System configurations like [strings.js](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/config/strings.js)
│   │   ├── context/     # Global state context [AppContext.jsx](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/context/AppContext.jsx)
│   │   ├── [App.jsx](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/App.jsx)   # Router wraps
│   │   └── pages/       # Dashboard screens (Admin, Worker, Patient)
│   └── package.json     # Node dependencies and project scripts
├── docker-compose.yml   # Multi-container orchestration definition
└── README.md            # Root system documentation
```

---

## Why PulseGuard AI

| The Rural Health Gap | Our Solution Approach |
|---|---|
| **High maternal mortality** | Local early hazard alerts prevent critical escalations before they worsen. |
| **No rural network coverage** | Offline vitals cache & heuristic safety fallbacks prevent worker bottlenecks. |
| **Bilingual communication barriers** | Context-aware AI chatbot understanding Bangla, English, and phonetic Banglish script. |
| **Lack of clinical tracking** | Structured digital records & real-time dashboard notifications for remote supervision. |

---

## Seed Accounts & Verification Credentials

Use these seeded accounts to log in and preview the application portals (password: **`password`**):

| Role | Username / Email | Key Features & Dashboards |
| :--- | :--- | :--- |
| **Patient (Mother)** | `amina@patient.pg` | Daily metrics check log, bilingual AI assistant chat, emergency SOS button. |
| **Health Worker** | `karim@worker.pg` | Assigned patient directories, vitals logger, sync center queue. |
| **Administrator** | `admin@pulseguard.ai` | Global clinical statistics, dynamic regional Chart.js maps, AI parameters editor. |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>
    PulseGuard AI &nbsp;·&nbsp; CloudCamp BuildFest 2026 &nbsp;·&nbsp;
    <a href="https://github.com/your-username/pulseguard">GitHub Project</a> &nbsp;·&nbsp;
    <a href="http://129.80.78.215:3000/">Live Demo Portal</a>
  </sub>
</div>