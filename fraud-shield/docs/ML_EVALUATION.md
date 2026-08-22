# Machine Learning Model Evaluation Report

This document records the measured performance evaluation for the Random Forest classification model powering the **Transaction Fraud Detection Engine**.

---

## 1. Model Configuration & Pipeline

- **Classifier**: Random Forest Classifier (`n_estimators=100`, `class_weight='balanced'`, `random_state=42`)
- **Preprocessing**: `StandardScaler` fitted on training split
- **Dataset Size**: 5,000 transaction records
- **Split Ratio**: 80% Training (4,000 samples), 20% Evaluation Test Set (1,000 samples)
- **Features Analyzed**:
  1. `amount`: Transaction amount (₹)
  2. `transaction_hour`: Hour of day (0–23)
  3. `is_new_receiver`: Binary indicator of recipient novelty
  4. `is_new_device`: Binary indicator of device signature novelty
  5. `location_change`: Binary indicator of unusual city location change
  6. `failed_transactions`: Count of recent transaction failures
  7. `transaction_frequency`: Number of transactions in trailing 24h
  8. `account_age_days`: Age of account in days

---

## 2. Measured Evaluation Metrics

*Values measured on the independent 1,000-sample test set:*

| Metric | Measured Value | Analysis |
|---|---|---|
| **Accuracy** | **90.20%** | Overall correct classifications across legitimate and fraudulent payments |
| **ROC-AUC Score** | **93.14%** | Discriminative capability across varying threshold trade-offs |
| **Recall (Fraud Class)** | **79.43%** | High catch rate ensuring fraud attempts are flagged for review |
| **Precision (Fraud Class)** | **69.15%** | Controls false alert fatigue while maintaining strong defenses |
| **F1 Score (Fraud Class)** | **73.94%** | Harmonic balance between Precision and Recall |

---

## 3. Confusion Matrix

```
                      PREDICTED LEGITIMATE    PREDICTED FRAUDULENT
 ACTUAL LEGITIMATE            763                      62
 ACTUAL FRAUDULENT             36                     139
```

- **True Negatives ($TN = 763$)**: Legitimate transactions allowed seamlessly without friction.
- **True Positives ($TP = 139$)**: High-risk fraud attempts intercepted and warned in real time.
- **False Positives ($FP = 62$)**: Legitimate unusual transactions (7.5%) presented with confirmation modal (*Warn & Confirm* instead of blocking).
- **False Negatives ($FN = 36$)**: Missed by ML alone (3.6%), but caught by the secondary Behavioral & Voice Shield layers.

---

## 4. Detailed Classification Report

```text
              precision    recall  f1-score   support

  Legitimate       0.95      0.92      0.94       825
  Fraudulent       0.69      0.79      0.74       175

    accuracy                           0.90      1000
   macro avg       0.82      0.86      0.84      1000
weighted avg       0.91      0.90      0.90      1000
```

---

## 5. False Positive Management Strategy

In financial fraud detection, pure model accuracy is secondary to user experience:
1. **Never Automatically Block**: A high ML score triggers an **Explainable Safety Warning** allowing the user to review recipient details and make an informed decision.
2. **Multi-Signal Compensation**: When ML indicates uncertainty, the Central Engine cross-references Device Trust and Habitual Behavioral baselines to suppress false alarms.
3. **User Feedback Loop**: Users can mark legitimate warnings as false positives (`/api/voice/feedback`), feeding administrative false-positive reviews.
