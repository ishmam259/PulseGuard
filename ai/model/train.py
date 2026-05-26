"""
PulseGuard AI — XGBoost Risk Prediction Training
Generates synthetic maternal health data and trains a risk prediction model.
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import json
import os

def generate_synthetic_data(n_samples=5000):
    """Generate synthetic maternal health data for training."""
    np.random.seed(42)

    data = {
        'bp_systolic': np.random.normal(120, 15, n_samples).clip(80, 200).astype(int),
        'bp_diastolic': np.random.normal(78, 10, n_samples).clip(50, 130).astype(int),
        'weight_kg': np.random.normal(60, 10, n_samples).clip(35, 120).round(1),
        'temperature_c': np.random.normal(36.7, 0.5, n_samples).clip(35, 41).round(1),
        'pulse': np.random.normal(78, 12, n_samples).clip(40, 150).astype(int),
        'gestational_week': np.random.randint(4, 42, n_samples),
        'symptom_count': np.random.poisson(1, n_samples).clip(0, 8),
        'has_headache': np.random.binomial(1, 0.25, n_samples),
        'has_dizziness': np.random.binomial(1, 0.15, n_samples),
        'has_swelling': np.random.binomial(1, 0.12, n_samples),
        'has_blurred_vision': np.random.binomial(1, 0.08, n_samples),
        'has_nausea': np.random.binomial(1, 0.3, n_samples),
        'visit_frequency_delta': np.random.exponential(7, n_samples).clip(1, 30).round(1),
    }

    df = pd.DataFrame(data)

    # Generate risk scores based on clinical rules
    risk_score = np.zeros(n_samples)

    # Blood pressure contribution
    risk_score += np.where(df['bp_systolic'] >= 160, 0.4, 0)
    risk_score += np.where((df['bp_systolic'] >= 140) & (df['bp_systolic'] < 160), 0.3, 0)
    risk_score += np.where((df['bp_systolic'] >= 130) & (df['bp_systolic'] < 140), 0.15, 0)
    risk_score += np.where(df['bp_diastolic'] >= 100, 0.25, 0)
    risk_score += np.where((df['bp_diastolic'] >= 90) & (df['bp_diastolic'] < 100), 0.15, 0)

    # Symptom contribution
    risk_score += df['has_headache'] * 0.08
    risk_score += df['has_dizziness'] * 0.06
    risk_score += df['has_swelling'] * 0.1
    risk_score += df['has_blurred_vision'] * 0.15
    risk_score += df['has_nausea'] * 0.03
    risk_score += df['symptom_count'] * 0.02

    # Temperature
    risk_score += np.where(df['temperature_c'] >= 38, 0.1, 0)
    risk_score += np.where(df['temperature_c'] >= 39, 0.15, 0)

    # Pulse
    risk_score += np.where(df['pulse'] > 100, 0.08, 0)
    risk_score += np.where(df['pulse'] < 50, 0.1, 0)

    # Gestational week (higher risk in later weeks)
    risk_score += np.where(df['gestational_week'] > 28, 0.05, 0)
    risk_score += np.where(df['gestational_week'] > 34, 0.05, 0)

    # Add noise
    risk_score += np.random.normal(0, 0.05, n_samples)
    risk_score = np.clip(risk_score, 0, 1)

    df['risk_score'] = risk_score.round(3)

    # Create risk level labels
    df['risk_level'] = pd.cut(
        df['risk_score'],
        bins=[-0.01, 0.3, 0.7, 1.01],
        labels=['low', 'moderate', 'high']
    )

    return df


def train_model():
    """Train XGBoost risk prediction model."""
    print("📊 Generating synthetic training data...")
    df = generate_synthetic_data(5000)

    print(f"   Dataset: {len(df)} samples")
    print(f"   Risk distribution:")
    print(f"   {df['risk_level'].value_counts().to_dict()}")

    features = [
        'bp_systolic', 'bp_diastolic', 'weight_kg', 'temperature_c', 'pulse',
        'gestational_week', 'symptom_count', 'has_headache', 'has_dizziness',
        'has_swelling', 'has_blurred_vision', 'has_nausea', 'visit_frequency_delta'
    ]

    X = df[features]
    y = df['risk_score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("\n🔧 Training XGBoost model...")
    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='reg:squarederror',
    )

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_clipped = np.clip(y_pred, 0, 1)

    # Convert to risk levels for classification report
    def to_level(score):
        if score > 0.7: return 'high'
        if score > 0.3: return 'moderate'
        return 'low'

    y_test_labels = [to_level(s) for s in y_test]
    y_pred_labels = [to_level(s) for s in y_pred_clipped]

    print("\n📈 Model Evaluation:")
    print(f"   Accuracy: {accuracy_score(y_test_labels, y_pred_labels):.3f}")
    print("\n" + classification_report(y_test_labels, y_pred_labels))

    # Save model
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, 'risk_model.json')
    model.save_model(model_path)
    print(f"\n✅ Model saved to {model_path}")

    # Save feature names
    meta = {
        'features': features,
        'n_estimators': 200,
        'max_depth': 6,
        'training_samples': len(df),
        'accuracy': float(accuracy_score(y_test_labels, y_pred_labels)),
    }
    meta_path = os.path.join(model_dir, 'model_meta.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)

    return model


if __name__ == '__main__':
    train_model()
