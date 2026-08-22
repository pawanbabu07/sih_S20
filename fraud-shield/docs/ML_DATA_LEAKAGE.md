# Preventing Data Leakage in Real-Time Fraud Detection Systems

## Executive Summary
In financial fraud detection, **data leakage** occurs when information from outside the training dataset or information that would **not be available at the exact millisecond of transaction authorization** is inadvertently included during model training or inference. Data leakage artificially inflates offline validation scores (e.g. 99.9% precision/recall in tests) while causing catastrophic performance failure in production.

This document establishes the architectural standards and zero-leakage contracts enforced throughout the Fraud Shield ML pipeline.

---

## 1. The Core Temporal Rule: Inference-Time Equivalence
> **Golden Rule**: A machine learning feature is only valid if and only if its value can be derived **before** the transaction is executed or committed.

```
       PRE-TRANSACTION INFERENCE WINDOW
  ┌────────────────────────────────────────┐
  │  1. Incoming Transaction Request       │
  │  2. Device Fingerprint Signature       │ ──► ALLOWED AS FEATURES
  │  3. Historical User Baseline (t < T0)  │
  │  4. Active Voice Transcript Stream     │
  └────────────────────────────────────────┘
                       │
             [ ML Risk Prediction ]
                       │
  ═══════════════════════════════════════════ TEMPORAL BOUNDARY (T0)
                       │
       POST-TRANSACTION OUTCOMES
  ┌────────────────────────────────────────┐
  │  • Transaction Completion Status       │
  │  • User Warn & Confirm Feedback        │ ──► FORBIDDEN AS FEATURES
  │  • Admin Investigation Case Labels     │     (Ground truth targets only)
  │  • Chargebacks & Banking Disputes      │
  └────────────────────────────────────────┘
```

---

## 2. Forbidden Features & Antipatterns

| Forbidden Signal | Why it Causes Data Leakage | Safe Alternative |
|---|---|---|
| `transaction_status` (`COMPLETED`, `CANCELLED`, `FAILED`) | The final settlement status of the current transaction is unknown when the ML safety check is performed. | Use `failed_transactions_last_24h` (historical aggregate strictly before current transaction). |
| `admin_confirmed_fraud` | Compliance investigation decisions happen hours or days after the payment. | Stored strictly as ground-truth evaluation labels for periodic batch retraining; never fed back into real-time inference. |
| `user_warning_confirmed` | The user's response to the fraud warning occurs *after* the initial model risk score is displayed. | Kept in audit logs and false-positive monitoring metrics. |
| `global_future_aggregates` | Calculating global averages across the entire dataset (e.g. full-month mean amount). | Calculate rolling historical baselines fit strictly on past events. |
| `target_encoding_with_full_dataset` | Computing target fraud rates using test/validation data. | Use strictly stratified training folds with out-of-fold statistics. |

---

## 3. Strict Preprocessing & Split Contract

### A. 70 / 15 / 15 Stratified Split
The dataset is split **before** any feature transformation, scaling, or calibration occurs:
```python
# 1. Stratified split into Train (70%), Validation (15%), Test (15%)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)
```

### B. Fit on Train Only, Transform on Validation/Test/Production
```python
# 2. Scaler and feature encoders are fit exclusively on X_train
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# Validation, test, and live inference use transform() only
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)
```

---

## 4. Reusable Feature Engineering Architecture

To ensure **zero train-serving skew**, the exact same code transforms inputs during offline training and real-time production:
- Module: `ml-service/feature_engineering.py`
- Pipeline Artifact: `ml-service/models/feature_pipeline.pkl`
- Validated Inputs:
  1. `amount`
  2. `transaction_hour`
  3. `is_new_receiver`
  4. `is_new_device`
  5. `location_change`
  6. `failed_transactions`
  7. `transaction_frequency`
  8. `account_age_days`

---

## 5. Model Governance & Retraining Policy
- **No Automatic Single-Case Swaps**: Single admin resolutions never trigger automated model retraining or hot-swapping in production.
- **Candidate Validation Gate**: Retrained candidate models must pass objective validation gates (`PR-AUC >= 0.70`, `Recall >= 0.75`) on an independent holdout set.
- **Audited Activation**: New models can only be deployed via explicit admin review and approval, writing an immutable record to `AdminAuditLog`.
