import os
import json
import joblib
import numpy as np

from feature_engineering import FeatureEngineeringPipeline

# Resolve paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'fraud_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
PIPELINE_PATH = os.path.join(BASE_DIR, 'models', 'feature_pipeline.pkl')
METADATA_PATH = os.path.join(BASE_DIR, 'models', 'model_metadata.json')

model = None
scaler = None
feature_pipeline = None
metadata = {}

def load_artifacts():
    global model, scaler, feature_pipeline, metadata
    if model is None or scaler is None or feature_pipeline is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH) or not os.path.exists(PIPELINE_PATH):
            raise FileNotFoundError("Machine Learning model or pipeline artifacts are missing. Run model_comparison.py first.")
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        feature_pipeline = joblib.load(PIPELINE_PATH)
        
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)

def predict_risk(data):
    """
    Predict calibrated fraud risk probability using the Phase 10 feature pipeline
    and evaluated champion model.
    """
    load_artifacts()
    
    # 1. Standardized feature extraction via reusable pipeline (zero train-serving skew)
    engineered_features = feature_pipeline.transform(data)
    
    # 2. Scale features using parameters fit on training split
    features_scaled = scaler.transform(engineered_features)
    
    # 3. Predict calibrated probability
    probs = model.predict_proba(features_scaled)
    fraud_prob = float(probs[0][1])
    
    # 4. Read metadata
    model_version = metadata.get('modelVersion', 'fraud-model-v2.0')
    model_type = metadata.get('modelType', 'CalibratedClassifier')
    optimal_th = float(metadata.get('optimalThreshold', 0.40))
    
    # 5. Extract top feature contributions for explainability
    feature_contributions = []
    top_importances = metadata.get('featureImportances', [])
    feature_names = feature_pipeline.get_feature_names()
    
    # Find active risky signals in this transaction
    for item in top_importances[:5]:
        f_name = item.get('feature')
        imp = item.get('importance', 0.0)
        
        if f_name == 'amount' and float(data.get('amount', 0)) > 20000:
            feature_contributions.append({'signal': 'High Transaction Amount', 'importance': imp})
        elif f_name == 'amount_to_normal_ratio' and float(data.get('amount', 0)) > 10000:
            feature_contributions.append({'signal': 'Amount Exceeds Normal Habitual Ratio', 'importance': imp})
        elif f_name == 'is_new_device' and (data.get('is_new_device') in [1, True, 'true']):
            feature_contributions.append({'signal': 'Unrecognized Device Signature', 'importance': imp})
        elif f_name == 'is_new_receiver' and (data.get('is_new_receiver') in [1, True, 'true']):
            feature_contributions.append({'signal': 'First-Time Receiver Interaction', 'importance': imp})
        elif f_name == 'is_unusual_hour' and (int(data.get('transaction_hour', 12)) < 6 or int(data.get('transaction_hour', 12)) >= 23):
            feature_contributions.append({'signal': 'Late-Night Activity Window', 'importance': imp})
        elif f_name == 'failed_transactions' and int(data.get('failed_transactions', 0)) >= 2:
            feature_contributions.append({'signal': 'Repeated Prior Failed Attempts', 'importance': imp})

    return {
        'success': True,
        'modelVersion': model_version,
        'modelType': model_type,
        'fraud_probability': float(round(fraud_prob, 4)),
        'risk_score': int(round(fraud_prob * 100)),
        'calibrated': True,
        'optimal_threshold': optimal_th,
        'is_above_threshold': bool(fraud_prob >= optimal_th),
        'feature_contributions': feature_contributions
    }

def get_model_metadata():
    """Retrieve currently active model metadata."""
    load_artifacts()
    return metadata
