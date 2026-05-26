"""
PulseGuard AI — Risk Prediction Service
Loads trained XGBoost model and provides inference.
"""

import os
import json
import numpy as np

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_model.json')
META_PATH = os.path.join(MODEL_DIR, 'model_meta.json')

_model = None
_features = None


def load_model():
    """Load the trained XGBoost model."""
    global _model, _features

    if not XGB_AVAILABLE:
        print("⚠ XGBoost not installed, using heuristic fallback")
        return False

    if not os.path.exists(MODEL_PATH):
        print(f"⚠ Model file not found at {MODEL_PATH}")
        print("  Run 'python model/train.py' to train the model first.")
        return False

    _model = xgb.XGBRegressor()
    _model.load_model(MODEL_PATH)

    if os.path.exists(META_PATH):
        with open(META_PATH) as f:
            meta = json.load(f)
            _features = meta.get('features', [])

    print(f"✅ XGBoost model loaded from {MODEL_PATH}")
    return True


# Symptom mapping
SYMPTOM_MAP = {
    'headache': 'has_headache',
    'dizziness': 'has_dizziness',
    'swelling': 'has_swelling',
    'blurred vision': 'has_blurred_vision',
    'nausea': 'has_nausea',
}


def predict_risk(
    bp_systolic: int,
    bp_diastolic: int,
    weight_kg: float = 60.0,
    temperature_c: float = 36.7,
    pulse: int = 78,
    gestational_week: int = 24,
    symptoms: list = None,
    visit_frequency_delta: float = 7.0,
):
    """Predict risk score from vitals input."""
    symptoms = symptoms or []
    symptom_lower = [s.lower() for s in symptoms]

    if _model is not None and _features is not None:
        # Use XGBoost model
        feature_values = {
            'bp_systolic': bp_systolic,
            'bp_diastolic': bp_diastolic,
            'weight_kg': weight_kg,
            'temperature_c': temperature_c,
            'pulse': pulse,
            'gestational_week': gestational_week,
            'symptom_count': len(symptoms),
            'has_headache': 1 if 'headache' in symptom_lower else 0,
            'has_dizziness': 1 if 'dizziness' in symptom_lower else 0,
            'has_swelling': 1 if 'swelling' in symptom_lower else 0,
            'has_blurred_vision': 1 if 'blurred vision' in symptom_lower else 0,
            'has_nausea': 1 if 'nausea' in symptom_lower else 0,
            'visit_frequency_delta': visit_frequency_delta,
        }

        X = np.array([[feature_values.get(f, 0) for f in _features]])
        risk_score = float(np.clip(_model.predict(X)[0], 0, 1))
        model_used = 'xgboost'
    else:
        # Heuristic fallback
        risk_score = 0.15
        if bp_systolic >= 160: risk_score += 0.4
        elif bp_systolic >= 140: risk_score += 0.3
        elif bp_systolic >= 130: risk_score += 0.15
        if bp_diastolic >= 100: risk_score += 0.25
        elif bp_diastolic >= 90: risk_score += 0.15
        if temperature_c >= 38: risk_score += 0.1
        if pulse > 100 or pulse < 50: risk_score += 0.08
        risk_score += len(symptoms) * 0.04
        if 'headache' in symptom_lower: risk_score += 0.05
        if 'swelling' in symptom_lower: risk_score += 0.08
        if 'blurred vision' in symptom_lower: risk_score += 0.12
        if gestational_week > 28: risk_score += 0.05
        risk_score = min(risk_score, 1.0)
        model_used = 'heuristic'

    risk_score = round(risk_score, 3)
    risk_level = 'high' if risk_score > 0.7 else 'moderate' if risk_score > 0.3 else 'low'
    preeclampsia_flag = risk_score > 0.7

    factors = []
    if bp_systolic >= 140: factors.append(f'High systolic BP ({bp_systolic} mmHg)')
    if bp_diastolic >= 90: factors.append(f'High diastolic BP ({bp_diastolic} mmHg)')
    if temperature_c >= 38: factors.append(f'Elevated temperature ({temperature_c}°C)')
    if pulse > 100: factors.append(f'Elevated pulse ({pulse} bpm)')
    if len(symptoms) > 0: factors.append(f'Symptoms: {", ".join(symptoms)}')
    if gestational_week > 28: factors.append(f'Late gestation (week {gestational_week})')

    return {
        'risk_score': risk_score,
        'risk_level': risk_level,
        'preeclampsia_flag': preeclampsia_flag,
        'model': model_used,
        'factors': factors,
    }
