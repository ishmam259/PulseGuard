"""
PulseGuard AI — FastAPI AI Worker
Hosts XGBoost risk prediction, AI chat, and RAG summary endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys
import os

# Add parent directory for model imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model.predict import predict_risk, load_model

app = FastAPI(
    title="PulseGuard AI Worker",
    description="AI inference service for maternal health risk prediction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──

class PredictRequest(BaseModel):
    bp_systolic: int
    bp_diastolic: int
    weight_kg: Optional[float] = 60.0
    temperature_c: Optional[float] = 36.7
    pulse: Optional[int] = 78
    gestational_week: Optional[int] = 24
    symptoms: Optional[list[str]] = []
    visit_frequency_delta: Optional[float] = 7.0


class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"


class SummaryRequest(BaseModel):
    patient_id: str


# ── Startup ──

@app.on_event("startup")
async def startup():
    loaded = load_model()
    if not loaded:
        print("⚠ Running with heuristic fallback (no trained model found)")
        print("  Run: python model/train.py")


# ── Endpoints ──

@app.get("/")
async def root():
    return {
        "service": "PulseGuard AI Worker",
        "version": "1.0.0",
        "endpoints": {
            "POST /ai/predict": "XGBoost risk prediction",
            "POST /ai/chat": "AI symptom checker",
            "POST /ai/summary": "Longitudinal patient summary",
            "GET /health": "Health check",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-worker"}


@app.post("/ai/predict")
async def predict(req: PredictRequest):
    """Run XGBoost risk prediction on patient vitals."""
    result = predict_risk(
        bp_systolic=req.bp_systolic,
        bp_diastolic=req.bp_diastolic,
        weight_kg=req.weight_kg,
        temperature_c=req.temperature_c,
        pulse=req.pulse,
        gestational_week=req.gestational_week,
        symptoms=req.symptoms,
        visit_frequency_delta=req.visit_frequency_delta,
    )
    return result


@app.post("/ai/chat")
async def chat(req: ChatRequest):
    """AI symptom checker — returns mock responses (Ollama integration placeholder)."""
    message = req.message.lower()

    # Symptom-aware mock responses
    if "headache" in message or "head" in message:
        response = (
            "Headaches during pregnancy can indicate several conditions:\n\n"
            "• Tension headache — from stress, fatigue, or dehydration\n"
            "• Preeclampsia — if accompanied by high blood pressure or visual changes\n"
            "• Hormonal changes — common in early pregnancy\n\n"
            "💡 Drink water, rest, and check your blood pressure. "
            "Contact your health worker if the headache is severe or persistent."
        )
    elif "dizzy" in message or "faint" in message:
        response = (
            "Dizziness may indicate:\n\n"
            "• Low blood pressure\n"
            "• Dehydration — drink at least 8 glasses of water daily\n"
            "• Anemia — iron deficiency is common in pregnancy\n\n"
            "💡 Sit down when feeling dizzy. Avoid standing up quickly. "
            "Report this to your health worker."
        )
    elif "swelling" in message or "edema" in message:
        response = (
            "Swelling during pregnancy:\n\n"
            "• Mild swelling in feet/ankles is normal, especially in later weeks\n"
            "• Sudden swelling in face or hands may indicate preeclampsia\n"
            "• Combined with high BP and headache = seek immediate care\n\n"
            "💡 Elevate your feet, reduce salt intake, and report sudden swelling immediately."
        )
    else:
        response = (
            "Thank you for sharing your symptoms. Here are general recommendations:\n\n"
            "• Monitor your symptoms over the next 24 hours\n"
            "• Stay hydrated and rest when possible\n"
            "• Record any changes in your Daily Health Check\n"
            "• Contact your health worker if symptoms worsen\n\n"
            "💡 Your health worker will review this at your next visit."
        )

    return {
        "response": response,
        "model": "mock_llm",
        "language": req.language,
        "offline_capable": True,
    }


@app.post("/ai/summary")
async def summary(req: SummaryRequest):
    """Generate longitudinal patient summary — RAG placeholder."""
    return {
        "summary": (
            "Patient shows a consistent upward trend in blood pressure over the past 3 weeks "
            "(118 → 130 → 140 mmHg systolic). Combined with reported headaches and current "
            "gestational week, this pattern warrants close monitoring for preeclampsia. "
            "Weight gain is within normal range. Iron-rich diet adherence appears suboptimal "
            "based on reported fatigue symptoms."
        ),
        "recommendations": [
            "Schedule clinic visit for comprehensive BP assessment and urinalysis",
            "Increase iron-rich foods (lentils, spinach, eggs)",
            "Monitor for warning signs: severe headache, visual changes, upper abdominal pain",
            "Consider increasing visit frequency to every 3 days until BP stabilizes",
            "Aspirin prophylaxis consideration after clinical consultation",
        ],
        "data_points_analyzed": 7,
        "model": "mock_rag",
        "sources": ["WHO Maternal Health Guidelines 2024", "Bangladesh DGHS Protocol"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
