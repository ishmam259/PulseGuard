# 🏥 PulseGuard AI — Premium Frontend Application

## 🌟 Overview
PulseGuard AI is an offline-first, CarePulse-styled maternal health dashboard designed to bridge the gap between rural health workers, expecting mothers, and clinical administrators in remote villages of Bangladesh (such as Kurigram and Rangpur).

Adopted with a premium **Dark-Emerald CarePulse aesthetic**, this React + Vite SPA provides a responsive, intuitive, and robust user interface that allows local health workers and mothers to monitor clinical pregnancy metrics, query an AI symptom checker, and broadcast real-time emergency SOS alerts — even under highly unstable network conditions.

---

## 🎨 Visual Aesthetics & UI Design System
Our design system is built from the ground up to offer a **premium, clinical, and reassuring experience** that immediately captivates judges and users:
- **CarePulse Dark-Emerald Theme**: Rich `#0d1511` deep emerald-dark background, with vibrant emerald `#00F59B` and teal `#0df5c2` active states.
- **Glassmorphism & Gradients**: Subtle translucent glass cards (`backdrop-filter`) and smooth gradient overlays to separate data dimensions.
- **Premium Input Fields**: High-contrast dark borders, SVG icon prefixes (for heart rate, blood pressure, etc.), and helper indicators.
- **Micro-Animations**: Hover-triggered translations, fading alert pulses, active sync spins, and toast slide-ins.
- **Clean Layout Grids**: Perfectly centered mobile headers with patient initials avatars, visual sync indicators, and status tags.

---

## 🛡️ Role-Based Portals & Key Features

### 🤱 1. Mother / Patient Portal
* **Daily Health Check**: A structured daily form tracking pregnancy vitals (fetal kicks, water intake, sleep hours, symptoms).
* **AI Symptom Checker Chat**: An intelligent, bilingual AI symptom evaluator that responds to Bengali, English, or **Banglish** (e.g. `Amr jor ache. Akhon Ki kora uchit?`) queries with detailed, doctor-level guidance.
* **Nutrition & Care Plan**: Customized food guidelines, hydration trackers, and critical items to avoid during pregnancy.
* **Digital Health History**: Complete access to previous clinical vitals entered by field health workers.
* **Instant SOS Emergency Broadcaster**: One-tap emergency broadcast that uses automated SMS triggers and alerts health workers.

### 👩‍⚕️ 2. Maternal Health Worker Portal
* **Patient Registry & Search**: Fast index list of all assigned pregnant mothers in rural sectors.
* **Vitals Entry Panel**: High-contrast, mobile-friendly input interface to log maternal weight, systolic/diastolic blood pressure, fetal heart rate, temperature, etc.
* **AI Clinical Risk Predictor**: One-click AI hazard summary rendering a continuous hazard rating (XGBoost 0 to 1 score) and alert recommendations.
* **Offline Cache & Sync Center**:
  - Allows health workers to log vitals offline in remote villages.
  - Automatically caches entries in on-device storage.
  - Automatically runs heuristic rules for local safety checks when network access is absent.
  - Features a manual or automatic batch synchronization queue when the device regains connectivity.

### 🔑 3. Clinical Administrator Console
* **Admin Dashboard KPIs**: Overview metrics of active patients, warnings, critical workers, and system synchronization status.
* **Geographical Analytics**: Interactive trends using **Chart.js** displaying BP variations, fetal heart rate patterns, and maternal risk levels.
* **User & Staff Management**: Creation and assignment of Health Worker accounts to specific rural districts.
* **AI Configuration Console**: Real-time management of clinical risk thresholds, model temperatures, system prompts, and endpoint configurations.

---

## ⚙️ Advanced Frontend Architecture

### 🔄 Offline-First Synchronization Loop
The app utilizes a custom background sync pattern inside [AppContext.jsx](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/context/AppContext.jsx):
1. **Connectivity Detection**: Listens to the browser's online/offline events.
2. **Local Queueing**: Caches records in `localStorage` if offline.
3. **Background Auto-Sync**: Automatically triggers batch posts to the PostgreSQL backend once the network is restored.
4. **Interactive Status Indicator**: Displays a spinning sync indicator in the header banner.

### 🌐 Real-Time Websocket Notification Bridge
Supports continuous background WebSocket connections to push instant notifications for:
- 🚨 **SOS Broadcasters**: Real-time emergency flashes containing GPS coordinates.
- ⚠️ **High-Risk Threshold Alerts**: Real-time indicators if a worker uploads critical vitals.

### 🇧🇩 Multi-Language Localization Engine
A complete translations architecture configured via [strings.js](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/config/strings.js), supporting:
- Complete English and Bengali language localization.
- Persistent user language choices saved in `localStorage`.
- Language toggle located in the main header layout.

---

## 📁 Directory Structure
All core pages and modular components are clearly separated:
* [src/App.jsx](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/App.jsx): Unified client-side Router and protected route wraps.
* [src/App.css](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/App.css): CarePulse variables and dark-emerald core UI styles.
* [src/index.css](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/index.css): Design tokens, custom animations, and layout scrollbars.
* [src/context/AppContext.jsx](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/context/AppContext.jsx): Central global state, websocket controller, and offline-sync triggers.
* [src/pages/](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/pages):
  - [admin/](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/pages/admin): KPI Dashboards, Reports, and AI Config panels.
  - [worker/](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/pages/worker): Sync centers, Patient cards, and Vitals entries.
  - [patient/](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/pages/patient): Daily checks, AI symptom chat, and SOS panels.
* [src/services/api.js](file:///D:/VSCODE/HACKATHON/PulseGuard/frontend/src/services/api.js): Service wrapper for all Axios-based backend and worker endpoints.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your environmental variables file `.env` using `.env.example`:
   ```bash
   VITE_API_URL=http://localhost:5000
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
4. Build the production app:
   ```bash
   npm run build
   ```

---

## 🔑 Demo Seed Accounts
Use these seeded accounts to explore the portals (password for all accounts is **`password`**):

| Role | Username / Email | Access & Visual Highlights |
| :--- | :--- | :--- |
| **Patient (Mother)** | `amina@patient.pg` | Daily health check forms, SOS emergency triggers, bilingual AI Chat. |
| **Health Worker** | `karim@worker.pg` | Offline synchronization, patient vitals entries, automated risk analysis. |
| **Administrator** | `admin@pulseguard.ai` | System KPIs, regional Chart.js demographics, AI config manager. |
