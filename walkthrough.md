# PulseGuard AI — Project Walkthrough & Run Guide

This walkthrough provides comprehensive instructions to run, configure, and verify the **PulseGuard AI** application stack, which comprises:
1. **Frontend**: React + Vite SPA (Vanilla CSS, styled with CarePulse dark-emerald aesthetics).
2. **Backend API**: Node.js + Express + PostgreSQL.
3. **AI Worker**: Python + FastAPI hosting XGBoost risk prediction model.
4. **Database**: PostgreSQL (with vector support via `pgvector`).

---

## 🚀 Option 1: Run with Docker Compose (Recommended)

The easiest way to start the entire system (Database, Backend, AI Service, and Frontend) is via Docker Compose:

### 1. Prerequisites
Ensure you have **Docker** and **Docker Compose** installed on your system.

### 2. Start the Stack
Run the following command from the root directory of the project:
```bash
docker compose up --build
```

This will automatically:
- Start the PostgreSQL database and initialize health checks.
- Build the Node.js backend container, run migrations, and seed demo accounts.
- Spin up the FastAPI XGBoost AI service.
- Start the React frontend on `http://localhost:3000`.

---

## 🛠️ Option 2: Local Manual Setup (Step-by-Step)

If you prefer to run the services individually on your local system, follow these steps:

### 1. Database Setup (PostgreSQL)
Ensure you have a PostgreSQL server running locally.
- Default database name: `pulseguard`
- User: `postgres`
- Password: `wirelight` (or configure your own in the `.env` file)

### 2. Backend Service Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Copy the environment template and configure your connection strings:
   ```bash
   copy .env.example .env
   ```
   *(Ensure `DATABASE_URL` matches your local PostgreSQL credentials, e.g., `postgres://postgres:wirelight@localhost:5432/pulseguard`)*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations and populate the database with seed data:
   ```bash
   npm run seed
   ```
5. Start the backend developer API server:
   ```bash
   npm run dev
   ```
   *The backend will boot up on `http://localhost:5000`.*

### 3. AI Worker Setup
1. Navigate to the `ai` folder:
   ```bash
   cd ai
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Retrain the XGBoost risk prediction model:
   ```bash
   python model/train.py
   ```
5. Start the FastAPI worker:
   ```bash
   python main.py
   ```
   *The AI worker runs on `http://localhost:8000`.*

### 4. Frontend Application Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173` (or the next available port).*

---

## 🔐 Seed Accounts & Credentials

To access the different portals and verify the UI changes, use the following seeded demo accounts (password for all accounts is **`password`**):

| Role | Username / Email | Password | Access Portals |
| :--- | :--- | :--- | :--- |
| **Patient (Mother)** | `amina@patient.pg` | `password` | Daily Health Checks, Symptom Checker Chat, Nutrition |
| **Health Worker** | `karim@worker.pg` | `password` | Patient list, vitals entry, conflict syncing |
| **Health Worker** | `tania@worker.pg` | `password` | Patient list, vitals entry, conflict syncing |
| **Administrator** | `admin@pulseguard.ai` | `password` | System stats, region charts, AI model performance monitoring |

---

## 🎨 Verification of CarePulse UI Changes

Once logged in, verify the key visual design updates:
1. **Onboarding / Gateway Screens**: Splash landing and register screens display a split layout with the custom-generated dark-emerald medical illustration.
2. **Input Fields**: Input forms (Login, Register, Daily Check, Vitals Entry) display the premium high-contrast dark border outlines and SVG prefixes.
3. **KPI Stat Cards**: The Admin and Worker Dashboards render stats using CarePulse colored borders and high-contrast background templates.
4. **Header Navigation**: The mobile layouts feature clean status banners, initials avatar indicators, and central page titles centered perfectly on small viewports.
