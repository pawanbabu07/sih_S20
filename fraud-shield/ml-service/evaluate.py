import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score, classification_report

def evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, 'data', 'fraud_dataset.csv')
    model_path = os.path.join(base_dir, 'models', 'fraud_model.pkl')
    scaler_path = os.path.join(base_dir, 'models', 'scaler.pkl')

    pipeline_path = os.path.join(base_dir, 'models', 'feature_pipeline.pkl')
    metadata_path = os.path.join(base_dir, 'models', 'model_metadata.json')

    if not os.path.exists(data_path):
        print("Dataset not found. Generating data first...")
        from train import generate_synthetic_data
        generate_synthetic_data(data_path)

    df = pd.read_csv(data_path)

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_pipeline = joblib.load(pipeline_path)

    y = df['is_fraud']
    X_raw = df.drop(columns=['is_fraud', 'transaction_id', 'user_id', 'timestamp'], errors='ignore')

    from sklearn.model_selection import train_test_split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.2, random_state=42, stratify=y
    )

    X_test_eng = feature_pipeline.transform(X_test_raw)
    X_test_scaled = scaler.transform(X_test_eng)

    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    optimal_th = 0.40
    if os.path.exists(metadata_path):
        import json
        with open(metadata_path, 'r') as f:
            meta = json.load(f)
            optimal_th = float(meta.get('optimalThreshold', 0.40))

    y_pred = (y_prob >= optimal_th).astype(int)

    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score, average_precision_score, classification_report
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    pr_auc = average_precision_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    print("=== MEASURED ML MODEL EVALUATION ===")
    print(f"Test Set Size:     {len(y_test)} samples")
    print(f"Accuracy:          {acc * 100:.2f}%")
    print(f"Precision:         {prec * 100:.2f}%")
    print(f"Recall:            {rec * 100:.2f}%")
    print(f"F1 Score:          {f1 * 100:.2f}%")
    print(f"ROC-AUC Score:     {auc * 100:.2f}%")
    print(f"PR-AUC Score:      {pr_auc * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(f"True Negatives:  {cm[0][0]}")
    print(f"False Positives: {cm[0][1]}")
    print(f"False Negatives: {cm[1][0]}")
    print(f"True Positives:  {cm[1][1]}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraudulent']))

if __name__ == '__main__':
    evaluate()
