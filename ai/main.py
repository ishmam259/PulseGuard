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
import json

from external.adapters.openrouter_model import OpenRouterModel
from external.adapters.modal_model import ModalDirectModel

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

class XGBoostResult(BaseModel):
    risk_score: float                
    risk_level: str                   
    preeclampsia_flag: bool           
    model: str                         
    factors: list[str]

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
    symptoms: PredictRequest
    result: XGBoostResult


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

    model = ModalDirectModel()
    response = model.ask(message)

    return {
        "response": response,
        "model": "openrouter_llem",
        "language": req.language,
        "offline_capable": True,
    }


@app.post("/ai/summary")
async def summary(req: SummaryRequest):
    """Generate longitudinal patient summary — RAG placeholder."""

    model = ModalDirectModel()
    prompt = f"""
    PATIENTS INFORMATION THAT WAS PROVIDED TO XGBOOST MODEL:
    BP SYSTOLIC: {req.symptoms.bp_systolic}
    BP_DIASTOLIC: {req.symptoms.bp_diastolic}
    WEIGHT_KG: {req.symptoms.weight_kg}
    TEMPERATURE_CELCIUS: {req.symptoms.temperature_c}
    PULSE: {req.symptoms.pulse}
    GESTATIONAL WEEK: {req.symptoms.gestational_week}
    SYMPTOMS: {", ".join(req.symptoms.symptoms)}
    VISIT FREQUENCY_DELTA: {req.symptoms.visit_frequency_delta}

    RESULT PREDICTED BY XGBOOST: {req.result}

    You must provide output in the following format
    """ + """
    {
        "summary": "<your summary goes here>",
        "recommendations": [
            "<your recommendation 1>",
            "<your recommendation 2>",
            ...
        ],
        "data_points_analyzed": <number>,
        "sources": [
            "WHO Maternal Health Guidelines 2024",
            "Bangladesh DGHS Protocol"
            <.. The above sources should be based on your response if you use any source. otherwise empty array ..>
        ]
    }

    you should say 'you' instead of 'the patient' in your response, because it will be read by the patient
    you must provide single JSON with no leading or following text. not even ``` before and after. plain parsable JSON
    """

    response = model.ask(prompt)

    print(f"\n\n\nResponse: {response}\n\n\n")

    response_json = json.loads(response)

    return {
        "summary": response_json["summary"],
        "recommendations": response_json["recommendations"],
        "data_points_analyzed": response_json["data_points_analyzed"],
        "model": "openrouter_llm",
        "sources": response_json["sources"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
