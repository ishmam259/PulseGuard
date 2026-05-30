# PulseGuard AI — 3-Minute AI-Focused Video Pitch & Walkthrough Script

This script is structured for a 3-minute video presentation, highlighting the AI and machine learning features of the PulseGuard AI maternal healthcare platform. It emphasizes the custom XGBoost classifier, clinical LLM prompt strategies, prompt optimizations, and patient data privacy.

---

## ⏱️ Video Outline
- **0:00 - 0:35** | **The Hook & AI Mission** (Bridging rural OB-GYN shortages with clinical AI)
- **0:35 - 1:15** | **Custom XGBoost Risk Prediction** (FastAPI tabular regressor, 93.7% accuracy)
- **1:15 - 2:00** | **LLM Assistant & Prompt Strategy** (XML structures, sliding windows, and caching)
- **2:00 - 2:45** | **Privacy & Real-Time AI Alerting** (PII Scrubbing, WebSockets, and clinical alerts)
- **2:45 - 3:00** | **Conclusion** (Intelligent maternal health systems of tomorrow)

---

## 🎤 Narration Script

### 🎬 Part 1: The Hook & AI Mission (0:00 - 0:35)
**[Visual: Dynamic split-screen showing PulseGuard's dashboard on the left, and a clinical data flow diagram on the right.]**

* **Speaker (Voiceover):**
  "Maternal care in rural communities faces a critical hurdle: the lack of clinical doctors on the ground to detect early pregnancy complications like preeclampsia. Standard health systems fail to assist workers in identifying warning signs before emergency crises. 
  Introducing **PulseGuard AI**—an intelligent maternal healthcare platform driven by a hybrid AI architecture. By combining high-speed tabular machine learning with advanced large language models, PulseGuard acts as a digital OB-GYN assistant, bringing clinical intelligence directly to the frontlines of maternal care."

---

### 🧠 Part 2: Custom XGBoost Risk Prediction (0:35 - 1:15)
**[Visual: Health worker entering vitals. Code screen transitions to the python FastAPI code (`predict.py`) and training charts showing feature importances.]**

* **Speaker (Voiceover):**
  "At the heart of PulseGuard is our custom-trained **XGBoost regressor**, running as a FastAPI microservice. Trained on a clinical dataset of vital parameters—including systolic and diastolic blood pressure, gestational week, temperature, pulse, and symptoms—the model identifies early preeclampsia risk with a high **93.7% validation accuracy**. 
  Instead of generic clinical categories, the ML model generates a continuous hazard score between 0 and 1, highlighting specific risk factors to guide health workers with instant, evidence-based alerts."

---

### 💬 Part 3: LLM Assistant & Prompt Strategy (1:15 - 2:00)
**[Visual: A patient chatting with the AI Symptom Checker. On-screen text overlays show the XML tags: `<system_instructions>`, `<patient_context>`, and `<clinical_history>`.]**

* **Speaker (Voiceover):**
  "For verbal symptoms, the system integrates a powerful LLM assistant. We designed a dual-tier clinical prompt strategy:
  * **Structured XML Layouts** segment rules, guidelines, and chat histories to ensure strict safety boundaries.
  * **Few-shot clinical training** guides the model to advise patients without self-diagnosing.
  To reduce latency, the system utilizes **context trimming** with a sliding-window memory, alongside **system prompt caching**, saving up to 70% of prompt tokens while maintaining complete clinical context."

---

### 🛡️ Part 4: Privacy & Real-Time AI Alerting (2:00 - 2:45)
**[Visual: Demonstrating a high-risk vitals entry. Transitioning to the Admin dashboard, showing a real-time floating SOS/risk alert pop up via WebSockets. Highlight a visual of the PII Scrubber in action.]**

* **Speaker (Voiceover):**
  "Data privacy is critical. Before any messaging payload reaches our external model APIs, our custom **PII Scrubber middleware** recursively cleans names, phone numbers, and village names. 
  When the XGBoost model outputs a critical risk score exceeding 0.7, PulseGuard automatically triggers an emergency warning loop. Over WebSockets, the active Admin and Health Worker dashboards receive instant notifications with geolocated coordinates, mapping the patient directly to clinical oversight teams."

---

### 🏁 Part 5: Conclusion (2:45 - 3:00)
**[Visual: Showing the AI Model analytics dashboard with precision/recall metrics, closing on the clean PulseGuard logo.]**

* **Speaker (Voiceover):**
  "PulseGuard AI demonstrates how hybrid AI—combining local gradient-boosted decision trees with optimized clinical LLMs—can safeguard maternal health. We are turning clinical-grade monitoring into an accessible, intelligent reality. Thank you."
