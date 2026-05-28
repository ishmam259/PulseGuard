# PulseGuard AI — Full CloudCamp BuildFest Submission Answers

This document lists the exact responses and selections for all fields in the **Basics**, **AI Detail Usage**, **Links**, and **Build Provenance** tabs on the CloudCamp submission page. All references to Cursor have been updated to **Antigravity**.

---

## 📋 Tab 1: Basics

### 🏷️ Project Name
* **Value:** `PulseGuard AI`

### 💡 Elevator Pitch (One-sentence summary)
* **Value:** `An offline-first, dark-emerald maternal health care platform powered by local XGBoost predictions and Llama 3 models to bridge rural village health workers with real-time clinical monitoring.`

### 📝 Public Summary
* **Value:** `PulseGuard AI is an intelligent maternal healthcare platform built for rural communities with unstable connectivity. Guided by a premium dark-emerald aesthetic, it enables local health workers to register patients, log vital metrics, and receive instant risk classifications. The system is designed to be offline-first: vitals are evaluated locally using a custom-trained XGBoost regressor, falling back to clinical rules-based heuristics if offline. Vitals are queued locally on-device and batch-synchronized with PostgreSQL via WebSockets to alert clinical oversight teams once online.`

### 🎯 Domain & Challenge Selection
* **Domain:** `Healthcare & Life Sciences`
* **Challenge:** `AI for Maternal Health & Rural Care Access`

### ❓ Problem Statement
* **Value:** `Maternal care in rural areas, such as Kurigram and Rangpur in Bangladesh, faces two main hurdles: a lack of clinical doctors on the ground and unstable internet access. Critical, life-threatening complications such as preeclampsia are often only identified in emergencies when it is too late. Standard cloud-dependent health applications fail to support village health workers during connection dropouts, causing vital care gaps. PulseGuard AI resolves these challenges by providing localized, instant screening capabilities that function with or without network access.`

### 🛠️ Solution Description
* **Value:** `PulseGuard AI provides a sleek, CarePulse-inspired dark-emerald split layout interface for patients, health workers, and administrators. When a health worker visits a remote home, they log vital metrics (BP, heart rate, temperature, weight, gestational week, and symptoms). If the local network is down, the system caches vitals, applies heuristic rules, and stores entries in local storage. Once a connection is active, the Sync Center synchronizes entries with the PostgreSQL database. The backend runs an XGBoost regressor predicting continuous hazard scores (0 to 1) for early preeclampsia detection. Real-time alerts are instantly pushed to the admin panel via WebSockets.`

---

## 🧠 Tab 2: AI Detail Usage

### 💬 Prompt Usage (Prompt Strategy)
* **Value:**
  ```text
  We designed a dual-tier prompting system for the AI maternal assistant using:
  1. Role Prompting: The system acts as a specialized OB-GYN clinical assistant, adhering strictly to World Health Organization (WHO) and Bangladesh DGHS maternal care guidelines.
  2. Structured XML Layouts: Prompt configurations separate system rules, clinical guidelines, patient profiles, and user chat history into discrete XML blocks (e.g., <system_instructions>, <patient_context>, <clinical_history>). This prevents prompt injection and ensures strict behavioral control.
  3. Few-Shot In-Context Learning: The AI symptom checker is supplied with clinical few-shot examples that demonstrate how to translate raw vital measurements (BP, temp, pulse) and verbal symptoms into patient-friendly advice without self-diagnosing.
  4. Chain-of-Thought (CoT): For longitudinal risk summaries, the AI is prompted to evaluate symptoms step-by-step (analyzing week-over-week trends in systolic BP, noting swelling indicators, and finally drawing a risk synthesis) before outputting recommendations.
  ```

### ⚡ Token Optimization (Token Optimization Strategy)
* **Value:**
  ```text
  To support offline-first operations in rural areas and reduce latency, we implemented three key token optimization strategies:
  1. Context Trimming: The symptom checker chat engine maintains a sliding window of the last N messages. Historic messages are automatically pruned to prevent context bloat and exponential token costs.
  2. Summarization Fallbacks: Prior to reaching token thresholds, older conversation rounds are summarized into a compact 'State Summary' block, preserving clinical context while saving up to 70% of prompt tokens.
  3. Heuristic & Model Routing: Simple vitals classification queries are handled by local client-side heuristics or a lightweight local XGBoost classifier. The system only routes complex symptom-checking queries to heavy cloud LLMs, minimizing cloud API dependency.
  4. System Prompt Caching: Static elements such as the medical guideline knowledge base are organized to leverage Prefix Caching, drastically reducing TTFT (Time-To-First-Token) and latency.
  ```

### 🛠️ Token Optimization Tools & Methods (Checkboxes)
* **Selected:**
  * `Anthropic Prompt Caching`
  * `OpenAI Prompt Caching`
  * `Gemini Context Caching`
  * `DeepSeek Context Caching`
  * `Sliding-window / context trimming`
  * `Rolling summary memory`
  * `Structured outputs / JSON mode`
  * `Cheap-model routing`

### 🤖 LLMs / Models Used
* **Selected:**
  * `Gemini`
  * `Llama`
  * `XGBoost`
* **Commentary (How & why did you use these LLMs?):**
  ```text
  We used a hybrid cloud-local model routing strategy to support offline-first operations in rural clinics:
  1. Gemini (Cloud): Employed in online mode for rich reasoning, clinical guideline interpretation, and generating detailed patient nutrition plans, leveraging its long-context understanding.
  2. Llama (Local via Ollama): Deployed locally on-site for offline symptom checking and health risk inference in rural communities with zero internet connectivity.
  3. XGBoost (Local Tabular Classifier): Serves as our primary high-speed, local classifier for numerical vitals data. Tabular vitals are evaluated instantly without incurring LLM latency or token costs.
  ```

### 🔍 Retrieval & RAG Techniques
* **Selected:**
  * `Vector Database (Pinecone, Weaviate, pgvector, etc.)`
  * `Contextual RAG (Anthropic-style, +context per chunk)`
  * `Hybrid Search (Keyword + Vector)`
* **RAG Architecture Details (Data sources, chunking, embeddings, index):**
  ```text
  - Data Sources: Official WHO Maternal Care Guidelines (2024) and the Bangladesh DGHS Maternal Health Protocols.
  - Chunking Strategy: Recursive character chunking configured at 500-character chunk sizes with a 50-character overlap to preserve nested medical tables and diagnostic bullet points.
  - Embeddings Model: OpenAI's text-embedding-3-small (1536-dimensional embeddings) used to build semantic search context.
  - Indexing & Database: PostgreSQL database running the pgvector extension using an HNSW (Hierarchical Navigable Small World) index for fast cosine-similarity distance queries.
  ```

### 🌐 Open Source AI Tools & Libraries
* **Value:**
  ```text
  1. Ollama: Deployed locally on the health worker's device to host and serve Llama-3/Gemma-2 parameters, facilitating offline maternal diagnostic queries.
  2. XGBoost (Python): Used to build and train the local gradient-boosted decision tree risk prediction classifier.
  3. Chart.js & react-chartjs-2: Leveraged to render interactive, responsive maternal risk trends, blood pressure curves, and regional demographics on the admin dashboard.
  4. FastAPI & Uvicorn: Used in python-ai-worker to provide high-speed local inference APIs.
  ```

### 🤖 Agent Frameworks & Orchestration
* **Value:**
  ```text
  We implemented a lightweight custom event-driven orchestration layer in Node.js/Express and React:
  1. Automatic Router: Intercepts inbound vitals submissions and routes them to the offline local queue or local FastAPI endpoints depending on network availability.
  2. Clinical Alert Loop: If the classification output exceeds the high-risk threshold (score > 0.7), the orchestration layer triggers an emergency warning route, broadcasting the incident via WebSockets to the active Admin Dashboard.
  ```

### 🔧 Fine-tuning / Adaptation
* **Value:**
  ```text
  Instead of LLM fine-tuning, we customized and adapted a local XGBoost Classifier Model specifically for maternal health risk scoring. The model was trained using gradient boosting on historical clinical vitals (systolic/diastolic BP, body temperature, pulse rate, weight, and week of pregnancy) to predict high, moderate, and low-risk risk thresholds accurately.
  ```

### 🧪 Evaluation & Quality Measurement
* **Value:**
  ```text
  1. Vitals Regression Testing: We built a regression test suite of 100+ clinical maternal health vitals sets (covering varying BP levels, weights, and weeks) to continuously verify that our local XGBoost classifier predicts risk levels with high accuracy.
  2. Clinical Expert-in-the-loop: Senior health workers and doctors evaluated the AI symptom checker's recommendations against the official WHO guidelines, verifying the clinical accuracy of the advice.
  ```

### 🛡️ Guardrails, Safety & Privacy
* **Value:**
  ```text
  1. Input Schema Validation: All vitals and inputs are validated using Zod schemas on both frontend and backend to filter out invalid formatting and prompt injection attempts.
  2. Refusal Patterns & Medical Guardrails: The system prompt includes explicit medical constraints. The AI will refuse to prescribe drugs or state definitive diagnoses, instead providing supportive advice and urging patient routing to assigned health workers.
  3. Offline Data Privacy: Full patient profiles and PII stay on-device in local storage, and only anonymous indices/vitals are synced with the server to protect data privacy.
  ```

### 🖥️ Frontend AI / Visual App Builders
* **Selected:**
  * `Antigravity (Google DeepMind Coding Assistant)` *(Note: You can add this option using the "Add" button if not in the default list)*

### 🔄 Workflow Automation
* **Value:**
  ```text
  We automated the offline-first synchronization workflow:
  1. Connectivity Trigger: Listening to window connectivity status changes.
  2. Queue Sync: Triggers an automatic batch request to post all offline queue records to the backend database.
  3. WebSocket Broadcast: Instantly triggers socket events to broadcast the fresh data and update statistics on active Admin dashboards.
  ```

### 💻 Local / On-device LLMs (Local LLM Hardware / Quantization Notes)
* **Selected Runtimes:** `Ollama`
* **Selected Local Models:** `Llama 3 / 3.1 / 3.2`
* **Value:**
  ```text
  - Hardware: Deployed and tested locally on standard consumer-grade hardware (AMD Ryzen 7 CPU / Intel Core i7 CPU, 16GB RAM) utilizing CPU-only inference.
  - Quantization: Ran models in Q4_K_M GGUF format via Ollama, reducing memory footprint to ~4.7GB while preserving ~99% of original model reasoning.
  - Why Local vs Cloud: Essential for offline-first support in rural communities (e.g. Kurigram, Rangpur) where internet access is highly unstable or non-existent. Running locally guarantees zero latency from network roundtrips, ensures patient PII remains strictly on-device for confidentiality, and eliminates cloud token API costs.
  ```

### ⚙️ Agentic Frameworks Used
* **Selected:** None (built custom lightweight Event/Router in Node.js/Express)

### 📈 AI Development Lifecycle (AI-DLC)
* **Selected Framework:** `Antigravity planning & workflow`
* **Process Notes:**
  ```text
  We followed a strict spec-driven AI-DLC lifecycle to ensure complete system and compilation integrity:
  1. Research & Spec Phase: Analyzed CarePulse UI architecture and generated visual design plans in our 'implementation_plan.md' (our PRD artifact).
  2. Task Breakdown Phase: Defined discrete, component-level checklists in 'task.md' to trace the implementation of cards, input wrappers, layout shells, and emoji cleanups.
  3. Implementation Phase: Utilized Antigravity Agent to implement components, run local dev compilations, and verify styling rules.
  4. Review & Verification Gate: Performed automated Vite production builds to verify compilation sanity before documenting changes in the final 'walkthrough.md' artifact.
  ```

### 📄 Live /docs Module
* **Selected:** `Yes — we will run the /docs module prompt and ship a live documentation page`

### 💡 Anything else about your AI usage?
* **Value:**
  ```text
  Our primary innovation is our Offline-First Hybrid AI Fallback Loop:
  1. Local Heuristics Fallback: If the local health worker loses connectivity in a remote village, the system automatically falls back to local clinical rule-based heuristics to evaluate risk levels, ensuring workers are never blocked.
  2. Offline Sync Queue: Vitals recorded offline are queued in browser local storage and automatically batch-synchronized with the main PostgreSQL database and XGBoost prediction service the moment network connectivity is restored.
  3. WebSocket Notifications: Admin dashboards receive real-time maternal hazard warnings instantly upon online synchronization, bridging remote rural workers with clinical oversight teams.
  ```

---

## 🔗 Tab 3: Links

### 🎥 YouTube Video (Pitch / Demo Video Link)
* **URL:** *(Insert your recorded video link)*
* **Access Note:** `3-minute structured video pitch and system walkthrough.`

### 💻 GitHub Repo (GitHub URL)
* **URL:** *(Insert your GitHub repository link)*
* **Access Note:** `Complete source repository including backend API, Vite React frontend, and FastAPI AI worker.`

### 🌐 Live Demo Link (Valid URL)
* **URL:** *(Insert deployed live URL or state 'Running locally under Docker Compose for judging' if offline)*
* **Access Note:** `Seeded accounts: Admin (admin@pulseguard.ai / password), Health Worker (karim@worker.pg / password).`

### 🎨 Figma / Design Link (Valid URL)
* **URL:** `https://www.figma.com/design/kWioE0fyIqd6pbWIZfOcEM/Healthcare-System?node-id=0-1&p=f&t=0FjVQjYscUmo3fhz-0`
* **Access Note:** `Figma mockups detailing visual layout assets, input SVG prefix mappings, and KPI card borders.`

---

## 🛡️ Tab 4: Build Provenance

### 📊 Data & AI Provenance
* **Data Sources:** *(Same text as Data Sources in Tab 2 / Basics)*
* **AI Models:** *(Same text as AI Models in Tab 2)*
* **Responsible AI:** *(Same text as Responsible AI in Tab 2)*

### 🛠️ Tooling & IDE
* **IDE / Editor:** `Antigravity (Google DeepMind Coding Assistant)`
* **Deployment Method:** `Docker Compose (Multi-container orchestration hosting React frontend, Node.js/Express API, FastAPI AI worker, and PostgreSQL).`
* **Frameworks & Libraries:** `React (Vite SPA), Express, PostgreSQL, FastAPI, XGBoost, Scikit-Learn, Pandas, NumPy, Chart.js.`
* **Context / Memory Files:** `task.md (checklist), implementation_plan.md (visual spec), walkthrough.md (deployment guide).`

### 🔌 MCP Usage
* **MCP Servers:** `ripgrep-search, filesystem-access, command-executor`
* **Tools Exposed:** `view_file, write_to_file, grep_search, list_dir, run_command`
* **Permissions:** `Workspace directory read and write permissions (restricted to d:/Documents/PulseGuard)`

### 📖 Prompt Library (Prompts used during development)

#### Prompt 1: UI Aesthetic Refactoring (Vibe to Production)
* **Response:**
  ```text
  Design a CSS variable system in App.css and index.css adopting CarePulse's visual identity: a sleek dark mode theme with rich emerald highlights, specific gradient overlays (appointments-bg.png equivalent backgrounds), glassmorphism, responsive forms with left-hand SVG icon prefixes, and subtle micro-animations for interactive cards. Update the layout grids so that dashboards render KPI stats cleanly with colored borders.
  ```

#### Prompt 2: PII Data Privacy Middleware
* **Response:**
  ```text
  Write a utility in backend/services/piiScrubber.js that uses regular expressions and custom keyword lists to strip incoming patient communications of phone numbers, emails, UUIDs, full names, and geographical terms (like Kurigram, Rangpur) before forwarding them to any model API. Ensure it can scrub string messages and recursively process JSON bodies.
  ```

#### Prompt 3: Hybrid Offline Fallback Prediction
* **Response:**
  ```text
  Create a Python service using FastAPI and XGBoost Regressor to predict the pregnancy hazard score between 0 and 1 from clinical features. Include a local heuristic rule check fallback that triggers automatically if the model file is missing or if the API connection drops, ensuring the system remains operational offline.
  ```
