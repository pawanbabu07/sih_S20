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

    if not os.path.exists(data_path):
        print("Dataset not found. Generating data first...")
        from train import generate_synthetic_data
        generate_synthetic_data(data_path)

    df = pd.read_csv(data_path)
    feature_cols = [
        'amount', 'transaction_hour', 'is_new_receiver', 'is_new_device',
        'location_change', 'failed_transactions', 'transaction_frequency', 'account_age_days'
    ]

    X = df[feature_cols]
    y = df['is_fraud']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    print("=== MEASURED ML MODEL EVALUATION ===")
    print(f"Test Set Size:     {len(y_test)} samples")
    print(f"Accuracy:          {acc * 100:.2f}%")
    print(f"Precision:         {prec * 100:.2f}%")
    print(f"Recall:            {rec * 100:.2f}%")
    print(f"F1 Score:          {f1 * 100:.2f}%")
    print(f"ROC-AUC Score:     {auc * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(f"True Negatives:  {cm[0][0]}")
    print(f"False Positives: {cm[0][1]}")
    print(f"False Negatives: {cm[1][0]}")
    print(f"True Positives:  {cm[1][1]}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraudulent']))

if __name__ == '__main__':
    evaluate()
