# Architecture Specification — FraudShield

## 1. System Architecture Diagram

```text
                    USER
                      │
                      ▼
               React Frontend
             (Vite + Material UI)
                      │
                      ▼
              Node.js + Express
             (REST + Socket.IO)
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
   Transaction     Voice          Admin
      API          API             API
        │             │              │
        ▼             ▼              │
   Python ML      Voice Engine       │
 (scikit-learn)   (NLP Scanners)     │
        │             │              │
        └─────────────┼──────────────┘
                      ▼
                Risk Engine
           (Composite Formula)
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Behavior        Device          Graph
      Risk           Risk            Risk
       │              │              │
       └──────────────┼──────────────┘
                      ▼
              Explainable Score
            (0–100 + XAI Factors)
                      │
             ┌────────┴────────┐
             ▼                 ▼
          User Alert       Admin Alert
        (Warn & Confirm)  (Socket.IO Live)
             │                 │
             ▼                 ▼
        User Decision     Investigation
        (Confirm/Cancel)       │
                               ▼
                           Audit Log

                      MongoDB Atlas
```

---

## 2. End-to-End Fraud Shield Processing Pipeline

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

---

## 3. Component Breakdown & Data Flow

### 3.1 Client Layer (React 18 + Vite + MUI)
- **Payment Interface**: Captures transaction intent, collects device fingerprint metadata, and evaluates risk in real-time.
- **Explainable Warning Modal**: Renders tiered risk interventions (`LOW`, `MEDIUM`, `HIGH`) with plain-text explanations, verified recipient tags, and action buttons.
- **Voice Shield Interface**: Real-time microphone audio capture and Web Speech API transcript analysis for live call screening.
- **Admin Command Center**: Real-time live monitor dashboard, fraud case triage, multi-hop relationship graph visualizer (Vis-Network), and ML telemetry monitors.

### 3.2 Backend API & Real-Time Gateway (Node.js + Express + Socket.IO)
- **REST Endpoints**: Handles authentication, transaction staging, risk checks, voice transcript processing, and administrative reviews.
- **Central Risk Engine (`riskEngine.js`)**: Coordinates parallel signal evaluation across ML, Device, Behavioral, Voice, and Graph sub-modules.
- **Socket.IO Real-Time Gateway**:
  - `user:{userId}` room: Private streaming of user-specific security alerts and risk status updates.
  - `admin` room: High-priority streaming of platform-wide fraud events, live risk telemetry, and automated case creation.

### 3.3 Machine Learning Microservice (Python + Flask + scikit-learn)
- **Prediction Microservice (`predict.py`, `app.py`)**: Exposes high-throughput `/predict` endpoint returning calibrated fraud probability and feature importance scores.
- **Zero-Leakage Pipeline**: Incorporates isolated `FeatureEngineeringPipeline` and `StandardScaler` fitted strictly on historical training partitions.
- **Calibration Engine**: Employs Platt Sigmoid Scaling to ensure raw model scores reflect true empirical probabilities.

### 3.4 Data & Persistence Layer (MongoDB Atlas)
- **Users Collection**: User profile, hashed password, role (`user`, `admin`), and security preferences.
- **Transactions Collection**: Comprehensive record of payment details, component risk scores, explanations, and final disposition.
- **Devices Collection**: Device hardware signatures, first/last seen timestamps, trust scores, and account association links.
- **VoiceAnalyses Collection**: Ephemeral transcript text, risk score, detected keyword categories, and false-positive flags.
- **FraudCases Collection**: Administrative investigation tickets, severity levels, assignees, resolution status, and audit history.
- **RiskEvents / AuditLogs**: Immutable audit trail of all security-critical system actions.

---

## 4. Multi-Signal Risk Engine Formulation

When a payment is evaluated, the **Central Risk Engine** computes composite risk $R_{\text{composite}}$ using dynamic normalization:

$$R_{\text{composite}} = \frac{W_1 \cdot S_{\text{ML}} + W_2 \cdot S_{\text{Behavior}} + W_3 \cdot S_{\text{Device}} + W_4 \cdot S_{\text{Voice}} + W_5 \cdot S_{\text{Graph}}}{W_1 + W_2 + W_3 + W_4 + W_5}$$

### Base Weights & Dynamic Adjustment
- $W_1 = 0.30$ (Transaction ML)
- $W_2 = 0.20$ (Behavioral Deviation)
- $W_3 = 0.20$ (Device Trust & Novelty)
- $W_4 = 0.15$ (Voice Phishing / Scam Transcript)
- $W_5 = 0.15$ (Graph Syndicate Risk)

*Note: If no voice call is active during payment, $W_4$ dynamically drops to 0, and the remaining weights automatically re-normalize to 1.0 without distorting the final score.*

---

## 5. Production Scalability & Future Architecture

```text
                          Global DNS / Cloudflare WAF
                                      │
                                      ▼
                        Application Load Balancer
                       (HTTPS / WSS Round-Robin)
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      Node.js API Node #1     Node.js API Node #2     Node.js API Node #3
      (Express + Sockets)     (Express + Sockets)     (Express + Sockets)
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                         Redis Pub/Sub Socket Adapter
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      Python ML Cluster       MongoDB Atlas Replica     Kafka / Event Stream
       (FastAPI + Torch)      (Primary + Read Replicas)  (Audit & Analytics)
```

In a high-throughput banking production deployment:
1. **Stateless API Clustering**: Express API nodes scale horizontally behind a Layer 7 load balancer with sticky sessions for WebSocket connections.
2. **Distributed Real-Time Sync**: Redis Pub/Sub adapter coordinates Socket.IO broadcasts across all cluster instances.
3. **Dedicated Graph Database**: Neo4j / Amazon Neptune cluster replaces in-memory BFS traversal for multi-million node relationship queries.
4. **Streaming Event Pipeline**: Apache Kafka buffers high-velocity transaction telemetry for continuous offline model retraining and drift analysis.
