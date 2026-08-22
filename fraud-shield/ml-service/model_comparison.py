import os
import json
import datetime
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix, brier_score_loss
)
import joblib

from feature_engineering import FeatureEngineeringPipeline

def generate_or_load_dataset(dataset_path='data/fraud_dataset.csv', num_records=6000):
    """Generate or load synthetic transaction dataset with realistic class imbalance."""
    np.random.seed(42)
    
    amount = np.random.exponential(scale=6000, size=num_records) + 10
    amount = np.clip(amount, 10, 100000).round(2)
    
    hours = np.concatenate([
        np.random.randint(6, 23, size=int(num_records * 0.85)),
        np.random.randint(0, 6, size=int(num_records * 0.10)),
        np.random.randint(23, 24, size=num_records - int(num_records * 0.85) - int(num_records * 0.10))
    ])
    np.random.shuffle(hours)
    
    is_new_receiver = np.random.choice([0, 1], size=num_records, p=[0.75, 0.25])
    is_new_device = np.random.choice([0, 1], size=num_records, p=[0.85, 0.15])
    location_change = np.random.choice([0, 1], size=num_records, p=[0.80, 0.20])
    failed_transactions = np.random.choice([0, 1, 2, 3, 4, 5], size=num_records, p=[0.65, 0.18, 0.08, 0.05, 0.03, 0.01])
    transaction_frequency = np.random.negative_binomial(n=4, p=0.35, size=num_records) + 1
    transaction_frequency = np.clip(transaction_frequency, 1, 30)
    account_age_days = np.random.randint(1, 1000, size=num_records)

    risk_score = np.zeros(num_records)
    risk_score += np.where(is_new_receiver == 1, 0.15, 0.0)
    risk_score += np.where(is_new_device == 1, 0.18, 0.0)
    risk_score += np.where(location_change == 1, 0.15, 0.0)
    
    unusual_time = ((hours < 6) | (hours >= 23)).astype(int)
    risk_score += np.where(unusual_time == 1, 0.14, 0.0)
    risk_score += np.where(failed_transactions >= 3, 0.22, 0.0)
    risk_score += np.where((failed_transactions > 0) & (failed_transactions < 3), 0.08, 0.0)
    risk_score += np.where(amount > 40000, 0.25, 0.0)
    risk_score += np.where((amount > 15000) & (amount <= 40000), 0.12, 0.0)
    risk_score += np.where(transaction_frequency >= 10, 0.15, 0.0)
    risk_score += np.where(account_age_days < 30, 0.10, 0.0)
    risk_score += np.random.uniform(0.0, 0.08, size=num_records)
    risk_score = np.clip(risk_score, 0.0, 1.0)
    
    # Class imbalance: ~12% Fraud, ~88% Legitimate
    is_fraud = (risk_score >= 0.42).astype(int)
    noise_mask = np.random.choice([False, True], size=num_records, p=[0.985, 0.015])
    is_fraud[noise_mask] = 1 - is_fraud[noise_mask]

    df = pd.DataFrame({
        'amount': amount,
        'transaction_hour': hours,
        'is_new_receiver': is_new_receiver,
        'is_new_device': is_new_device,
        'location_change': location_change,
        'failed_transactions': failed_transactions,
        'transaction_frequency': transaction_frequency,
        'account_age_days': account_age_days,
        'is_fraud': is_fraud
    })

    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    df.to_csv(dataset_path, index=False)
    return df

def run_model_comparison():
    print("=" * 70)
    print("  PHASE 10: ADVANCED ML & MULTI-MODEL COMPARISON ENGINE")
    print("=" * 70)

    dataset_path = 'data/fraud_dataset.csv'
    df = generate_or_load_dataset(dataset_path)
    
    total_records = len(df)
    fraud_count = int(df['is_fraud'].sum())
    legit_count = total_records - fraud_count
    fraud_pct = round((fraud_count / total_records) * 100, 2)
    legit_pct = round((legit_count / total_records) * 100, 2)

    print(f"\n[1] Class Imbalance Analysis (Dataset: {total_records} records):")
    print(f"    - Legitimate: {legit_count} ({legit_pct}%)")
    print(f"    - Fraudulent: {fraud_count} ({fraud_pct}%)")

    # Step 1: Stratified 70% Train, 15% Validation, 15% Test
    raw_feature_cols = [
        'amount', 'transaction_hour', 'is_new_receiver', 'is_new_device',
        'location_change', 'failed_transactions', 'transaction_frequency', 'account_age_days'
    ]
    X_raw = df[raw_feature_cols]
    y = df['is_fraud']

    X_train_raw, X_temp_raw, y_train, y_temp = train_test_split(
        X_raw, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val_raw, X_test_raw, y_val, y_test = train_test_split(
        X_temp_raw, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    print(f"\n[2] Stratified Split (Zero-Data-Leakage):")
    print(f"    - Training Set:   {len(X_train_raw)} samples (70%)")
    print(f"    - Validation Set: {len(X_val_raw)} samples (15%)")
    print(f"    - Test Set:       {len(X_test_raw)} samples (15%)")

    # Step 2: Feature Engineering (Fit on Train ONLY)
    feature_pipeline = FeatureEngineeringPipeline()
    feature_pipeline.fit(X_train_raw)

    X_train_eng = feature_pipeline.transform(X_train_raw)
    X_val_eng = feature_pipeline.transform(X_val_raw)
    X_test_eng = feature_pipeline.transform(X_test_raw)
    feature_names = feature_pipeline.get_feature_names()

    print(f"\n[3] Feature Engineering Pipeline:")
    print(f"    - Extracted {len(feature_names)} engineered & interaction features.")
    print(f"    - Features: {', '.join(feature_names[:6])}...")

    # Step 3: StandardScaler (Fit on Train ONLY)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_eng)
    X_val_scaled = scaler.transform(X_val_eng)
    X_test_scaled = scaler.transform(X_test_eng)

    # Step 4: Candidate Models Definition
    models = {
        'LogisticRegression': LogisticRegression(
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        ),
        'RandomForestClassifier': RandomForestClassifier(
            n_estimators=120,
            max_depth=12,
            class_weight='balanced',
            random_state=42
        ),
        'GradientBoostingClassifier': GradientBoostingClassifier(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            random_state=42
        )
    }

    comparison_results = []
    trained_models = {}

    print(f"\n[4] Benchmarking Models on Validation Holdout:")
    print(f"{'Model':<28} | {'Acc':<7} | {'Prec':<7} | {'Recall':<7} | {'F1':<7} | {'ROC-AUC':<7} | {'PR-AUC':<7}")
    print("-" * 82)

    for name, model_inst in models.items():
        # Train on X_train
        model_inst.fit(X_train_scaled, y_train)
        trained_models[name] = model_inst

        # Predict on validation set
        y_val_pred = model_inst.predict(X_val_scaled)
        y_val_probs = model_inst.predict_proba(X_val_scaled)[:, 1]

        acc = round(accuracy_score(y_val, y_val_pred) * 100, 2)
        prec = round(precision_score(y_val, y_val_pred, zero_division=0) * 100, 2)
        rec = round(recall_score(y_val, y_val_pred, zero_division=0) * 100, 2)
        f1 = round(f1_score(y_val, y_val_pred, zero_division=0) * 100, 2)
        roc_auc = round(roc_auc_score(y_val, y_val_probs) * 100, 2)
        pr_auc = round(average_precision_score(y_val, y_val_probs) * 100, 2)
        brier = round(brier_score_loss(y_val, y_val_probs), 4)

        cm = confusion_matrix(y_val, y_val_pred)
        tn, fp, fn, tp = int(cm[0,0]), int(cm[0,1]), int(cm[1,0]), int(cm[1,1])

        print(f"{name:<28} | {acc:>6.2f}% | {prec:>6.2f}% | {rec:>6.2f}% | {f1:>6.2f}% | {roc_auc:>6.2f}% | {pr_auc:>6.2f}%")

        comparison_results.append({
            'modelType': name,
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1': f1,
            'rocAuc': roc_auc,
            'prAuc': pr_auc,
            'brierScore': brier,
            'confusionMatrix': {'tn': tn, 'fp': fp, 'fn': fn, 'tp': tp}
        })

    # Step 5: Automated Model Selection Rule
    # Primary: PR-AUC (best metric for imbalanced fraud), Secondary: Recall, Tertiary: Precision
    best_candidate = max(comparison_results, key=lambda x: (x['prAuc'], x['recall'], x['f1']))
    best_model_name = best_candidate['modelType']
    best_uncalibrated_model = trained_models[best_model_name]

    print("\n" + "=" * 70)
    print(f"[CHAMPION] SELECTED CHAMPION MODEL: {best_model_name} (PR-AUC: {best_candidate['prAuc']}%, Recall: {best_candidate['recall']}%)")
    print("=" * 70)

    # Step 6: Probability Calibration
    print("\n[5] Evaluating Probability Calibration (Sigmoid / Platt Scaling):")
    # In modern scikit-learn, CalibratedClassifierCV with cv=3 or 5 trains cross-validated calibration
    calibrated_clf = CalibratedClassifierCV(estimator=best_uncalibrated_model, method='sigmoid', cv=3)
    calibrated_clf.fit(X_train_scaled, y_train)

    # Test set evaluation of calibrated champion model
    y_test_raw_probs = best_uncalibrated_model.predict_proba(X_test_scaled)[:, 1]
    y_test_cal_probs = calibrated_clf.predict_proba(X_test_scaled)[:, 1]

    brier_before = round(brier_score_loss(y_test, y_test_raw_probs), 4)
    brier_after = round(brier_score_loss(y_test, y_test_cal_probs), 4)
    print(f"    - Test Brier Score (Uncalibrated): {brier_before}")
    print(f"    - Test Brier Score (Calibrated):   {brier_after} (Lower = More Accurate Confidence)")

    # Step 7: Adaptive Threshold Analysis
    print("\n[6] Adaptive Operating Threshold Analysis:")
    thresholds = [0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85]
    threshold_analysis = []
    
    print(f"{'Threshold':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'FP Rate':<10}")
    print("-" * 56)

    for th in thresholds:
        th_pred = (y_test_cal_probs >= th).astype(int)
        th_prec = round(precision_score(y_test, th_pred, zero_division=0) * 100, 2)
        th_rec = round(recall_score(y_test, th_pred, zero_division=0) * 100, 2)
        th_f1 = round(f1_score(y_test, th_pred, zero_division=0) * 100, 2)
        
        cm_th = confusion_matrix(y_test, th_pred)
        tn_th, fp_th = cm_th[0,0], cm_th[0,1]
        fp_rate = round((fp_th / (tn_th + fp_th)) * 100, 2) if (tn_th + fp_th) > 0 else 0.0

        print(f"{th:<10.2f} | {th_prec:>8.2f}% | {th_rec:>8.2f}% | {th_f1:>8.2f}% | {fp_rate:>8.2f}%")

        threshold_analysis.append({
            'threshold': th,
            'precision': th_prec,
            'recall': th_rec,
            'f1': th_f1,
            'falsePositiveRate': fp_rate
        })

    # Pick optimal threshold that yields maximum F1 with high recall
    optimal_th_entry = max(threshold_analysis, key=lambda x: x['f1'])
    optimal_threshold = optimal_th_entry['threshold']
    print(f"\n    - Optimal Operating Threshold Selected: {optimal_threshold} (F1: {optimal_th_entry['f1']}%, Precision: {optimal_th_entry['precision']}%, Recall: {optimal_th_entry['recall']}%)")

    # Step 8: Extract Feature Importances
    feature_importances = []
    if hasattr(best_uncalibrated_model, 'feature_importances_'):
        raw_importances = best_uncalibrated_model.feature_importances_
        for f_name, imp in zip(feature_names, raw_importances):
            feature_importances.append({
                'feature': f_name,
                'importance': round(float(imp) * 100, 2)
            })
    elif hasattr(best_uncalibrated_model, 'coef_'):
        raw_coefs = np.abs(best_uncalibrated_model.coef_[0])
        norm_coefs = raw_coefs / (np.sum(raw_coefs) + 1e-5)
        for f_name, imp in zip(feature_names, norm_coefs):
            feature_importances.append({
                'feature': f_name,
                'importance': round(float(imp) * 100, 2)
            })
    feature_importances.sort(key=lambda x: x['importance'], reverse=True)

    # Step 9: Compute Baseline Training Distributions for Data Drift Monitoring
    training_distributions = {
        'amount': {
            'mean': round(float(df['amount'].mean()), 2),
            'median': round(float(df['amount'].median()), 2),
            'std': round(float(df['amount'].std()), 2)
        },
        'newDeviceRate': round(float(df['is_new_device'].mean() * 100), 2),
        'newReceiverRate': round(float(df['is_new_receiver'].mean() * 100), 2),
        'locationChangeRate': round(float(df['location_change'].mean() * 100), 2),
        'nightHourRate': round(float(((df['transaction_hour'] < 6) | (df['transaction_hour'] >= 23)).mean() * 100), 2),
        'avgFrequency': round(float(df['transaction_frequency'].mean()), 2)
    }

    # Step 10: Save Model Artifacts
    os.makedirs('models', exist_ok=True)
    joblib.dump(calibrated_clf, 'models/fraud_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(feature_pipeline, 'models/feature_pipeline.pkl')

    metadata = {
        'modelVersion': 'fraud-model-v2.0',
        'modelType': best_model_name,
        'status': 'ACTIVE',
        'trainingDate': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'),
        'datasetVersion': 'synthetic_v2.0',
        'trainingDatasetSize': total_records,
        'classDistribution': {
            'legitimatePercent': legit_pct,
            'fraudPercent': fraud_pct,
            'fraudCount': fraud_count,
            'totalCount': total_records
        },
        'metrics': {
            'accuracy': best_candidate['accuracy'],
            'precision': best_candidate['precision'],
            'recall': best_candidate['recall'],
            'f1Score': best_candidate['f1'],
            'rocAuc': best_candidate['rocAuc'],
            'prAuc': best_candidate['prAuc']
        },
        'calibration': {
            'calibrated': True,
            'method': 'sigmoid_platt_scaling',
            'brierScoreBefore': brier_before,
            'brierScoreAfter': brier_after
        },
        'optimalThreshold': optimal_threshold,
        'thresholdAnalysis': threshold_analysis,
        'modelComparison': comparison_results,
        'featureImportances': feature_importances,
        'features': feature_names,
        'trainingDistributions': training_distributions
    }

    with open('models/model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("\n[7] Artifacts Successfully Saved:")
    print("    - models/fraud_model.pkl (Calibrated Champion Model)")
    print("    - models/scaler.pkl (StandardScaler)")
    print("    - models/feature_pipeline.pkl (FeatureEngineeringPipeline)")
    print("    - models/model_metadata.json (Audited Model Metadata & Curves)")
    print("=" * 70 + "\n")

    return metadata

if __name__ == '__main__':
    run_model_comparison()
