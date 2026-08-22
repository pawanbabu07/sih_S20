# System Architecture — Explainable Real-Time Fraud Shield

## 1. High-Level Architecture Overview

```
                        REACT FRONTEND (Vite + Material UI)
       ┌─────────────────────────────────────────────────────────────┐
       │  • Public Landing Page (/home)   • Judge Demo Mode (/demo)  │
       │  • Payment & Warning System      • Security Center          │
       │  • Voice Phishing Shield         • Admin Intelligence Console│
       └──────────────────────────────┬──────────────────────────────┘
                                      │ HTTP / REST & WebSocket
                                      ▼
                      NODE.JS & EXPRESS BACKEND (Port 5000)
       ┌─────────────────────────────────────────────────────────────┐
       │  ├── Auth & RBAC Middleware       ├── Transaction Controller │
       │  ├── Central Risk Engine          ├── Voice Analysis Engine  │
       │  ├── Graph Relationship Service   ├── Model Governance Service│
       │  └── Socket.IO Real-Time Stream   ├── Admin Audit Logger     │
       └──────────────┬───────────────────────────────┬──────────────┘
                      │                               │
                      ▼                               ▼
            MONGODB ATLAS DATABASE             PYTHON ML FLASK SERVICE
       ┌────────────────────────────┐    ┌───────────────────────────┐
       │ • Users & Credentials      │    │ (Port 8000)               │
       │ • Transactions & Status    │    │ • Feature Pipeline        │
       │ • Risk Profiles & History  │    │ • Platt Calibration       │
       │ • Voice Transcripts & Scams│    │ • Calibrated Model        │
       │ • Device Fingerprints      │    │ • Adaptive Thresholds     │
       │ • Fraud Graph Relationships│    │ • Data Drift Metrics      │
       │ • Admin Audit Logs         │    └───────────────────────────┘
       └────────────────────────────┘
```

---

## 2. Multi-Signal Composite Risk Engine

The central risk engine evaluates transactions across 5 normalized risk signals:

$$\text{Final Risk Score} = \left( \text{ML} \times 0.30 \right) + \left( \text{Behavior} \times 0.20 \right) + \left( \text{Device Risk} \times 0.15 \right) + \left( \text{Voice Risk} \times 0.15 \right) + \left( \text{Graph Risk} \times 0.20 \right)$$

### Risk Policy Layers:
- **0 – 29 (`LOW`)**: Action $\to$ `ALLOW` (Status: ● Protected)
- **30 – 69 (`MEDIUM`)**: Action $\to$ `WARN_AND_CONFIRM` (Status: ⚠ Attention Required)
- **70 – 100 (`HIGH`)**: Action $\to$ `STRONG_WARNING` / `DO_NOT_PAY` (Status: 🚨 Immediate Attention)

---

## 3. End-to-End Processing Pipeline

```text
                    PAYMENT
                       │
                       ▼
              ┌─────────────────┐
              │ SIGNAL COLLECTOR│
              └────────┬────────┘
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
  Transaction        Device          Behavior
   Analysis         Analysis         Analysis
       │               │                │
       └───────────────┼────────────────┘
                       │
                 Voice Analysis
                       │
                 Graph Analysis
                       │
                       ▼
              ┌─────────────────┐
              │   RISK FUSION   │
              │     ENGINE      │
              └────────┬────────┘
                       │
                       ▼
                  ML + Rules
                       │
                       ▼
                0–100 RISK SCORE
                       │
                       ▼
               ATTACK CLASSIFIER
                       │
                       ▼
              EXPLANATION ENGINE
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        USER WARNING        ADMIN ALERT
             │                   │
             ▼                   ▼
       USER DECISION        INVESTIGATION
                                 │
                                 ▼
                            FRAUD CASE
                                 │
                                 ▼
                            AUDIT LOG
```
