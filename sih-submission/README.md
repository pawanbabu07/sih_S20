# FraudShield: Explainable Real-Time Fraud Shield for UPI, Voice Phishing and Social Engineering

> **Detect. Explain. Warn. Protect.**  
> *Smart India Hackathon (SIH) Final Submission Package*

---

## 📌 Executive Summary

**FraudShield** is an AI-powered, explainable, real-time fraud prevention and defense ecosystem specifically engineered to protect digital payment users from modern multi-vector financial cybercrimes. 

Unlike traditional transaction-monitoring systems that only look at static threshold amounts after funds have already departed, **FraudShield intercepts transactions in pre-execution flight**. It unifies **5 distinct contextual signal vectors** (Transaction ML, Device Intelligence, Behavioral Baselines, Voice Phishing Audio/NLP, and Graph Syndicate Traversal) to produce an **Explainable Risk Score (0–100)** with clear, human-understandable reasoning before money moves.

```
       Payment Initiated
               │
   ┌───────────┼───────────┐
   ▼           ▼           ▼
Transaction  Device    Behavioral
    ML     Signature    Baseline
   │           │           │
   └───────────┼───────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
 Voice Phishing      Fraud Syndicate
   NLP Engine             Graph
   │                       │
   └───────────┬───────────┘
               ▼
     Central Risk Engine
   (Multi-Signal Weighted)
               │
               ▼
    Explainable Risk Score
       (0–100 + Reasons)
        ┌──────┴──────┐
        ▼             ▼
   User Warning  Admin Live Alert
 (Warn & Confirm) (Investigation)
```

---

## 🏆 SIH Problem Statement Mapping

| Dimension | Real-World Problem | FraudShield Solution |
|---|---|---|
| **Social Engineering** | Victims are coerced via urgency and impersonation to make legitimate-looking UPI transfers. | **Voice Phishing Shield** analyzes real-time call audio and transcripts for OTP demands, urgency, and remote-access keywords. |
| **New Attack Vectors** | Scammers use freshly registered SIMs and unfamiliar devices from remote locations. | **Device & Behavioral Intelligence** flags unfamiliar hardware hashes, abrupt IP/location jumps, and velocity anomalies. |
| **Organized Syndicates** | Mule accounts and burner devices are reused across multiple fraud incidents. | **Fraud Relationship Graph** maps multi-hop clusters linking shared devices, IP subnets, and recipient UPI handles. |
| **Black-Box AI** | Users and investigators reject opaque risk scores without reasoning. | **Explainable AI (XAI)** outputs human-readable risk factors (*"Unusual 2 AM transaction + recipient linked to 4 reported accounts"*). |
| **False-Positive Fatigue** | Hard blocking annoys legitimate users making unusual purchases. | **Human-in-the-Loop Tiered Enforcement**: `LOW` (Allow), `MEDIUM` (Warn & Confirm), `HIGH` (Strong Warning with override option). |

---

## 🌟 Key Innovations

1. **Multi-Signal Composite Detection**: Synthesizes 5 independent defensive layers rather than relying solely on payment amounts.
2. **Explainable AI Engine**: Breaks down risk into weighted component scores and plain-language alert bullet points.
3. **Voice Phishing & Social Engineering Shield**: Real-time acoustic/NLP keyword, sentiment, and scam pattern recognition (impersonation, AnyDesk/TeamViewer, OTP demands).
4. **Graph Syndicate Traversal**: Real-time breadth-first graph algorithms detect multi-account mule networks and shared hardware rings.
5. **Human-in-the-Loop Architecture**: Balances security and user autonomy through tiered safety interventions and false-positive feedback loops.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Material UI (MUI v5), Emotion, Chart.js, Vis-Network (Graph), Lucide Icons |
| **Backend API** | Node.js, Express, Socket.IO (Real-Time WebSockets), Helmet, Express-Rate-Limit, Multer |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Machine Learning** | Python 3.10+, scikit-learn, Logistic Regression, Random Forest, Gradient Boosting, Platt Scaling, Joblib |
| **Voice Processing** | Web Speech API / Audio Chunk Ingestion, Rule-Based Scam Lexicon + NLP Heuristics |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs (Salt rounds: 10), SHA-256 IP Hashing, Role-Based Access Control (RBAC) |
| **Deployment** | Vercel (Frontend), Render / Cloud VM (Backend & ML Microservice), MongoDB Atlas Cloud |

---

## 📂 Submission Package Structure

```text
sih-submission/
├── README.md                 # Project Overview & Quick Start (This file)
├── PROJECT_REPORT.md         # Comprehensive Engineering & Technical Report
├── ARCHITECTURE.md           # High-Level & Detailed Architecture Specifications
├── API_DOCUMENTATION.md      # Full REST & WebSocket API Reference
├── ML_REPORT.md              # Zero-Leakage ML Pipeline, Model Comparison & Metrics
├── PRIVACY_SECURITY.md       # Privacy-by-Design, Zero-Credential & Threat Model
├── DEMO_SCRIPT.md            # Step-by-Step Live SIH Demo Walkthrough
├── JUDGE_QA.md               # 8 Core Judge Technical Questions & Defenses
│
├── diagrams/                 # High-Resolution Architectural & Flow Diagrams
│   ├── system-architecture.svg
│   ├── fraud-flow.svg
│   ├── voice-flow.svg
│   ├── risk-engine.svg
│   └── admin-flow.svg
│
├── screenshots/              # UI Interface Screenshots (15 Core Views)
│   ├── landing-page.svg
│   ├── dashboard.svg
│   ├── payment.svg
│   ├── fraud-warning.svg
│   ├── voice-shield.svg
│   ├── security-center.svg
│   ├── admin-dashboard.svg
│   ├── live-monitor.svg
│   └── fraud-graph.svg
│
└── presentation/             # Final SIH Presentation Deck & Interactive Viewer
    ├── SIH-Final-Presentation.md
    └── SIH-Final-Presentation.html
```

---

## ⚡ Quick Start & Live Demonstration Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+ and pip
- MongoDB Atlas connection string (or local MongoDB)

### 1. Clone & Setup Backend
```bash
cd fraud-shield/server
npm install
cp .env.example .env
npm run dev
# Backend running at http://localhost:5000 (Socket.IO active)
```

### 2. Setup Machine Learning Microservice
```bash
cd fraud-shield/ml-service
pip install -r requirements.txt
python app.py
# ML Microservice running at http://localhost:5001
```

### 3. Setup React Frontend
```bash
cd fraud-shield/client
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 👥 Demo Credentials

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Demo User** | `user@sih.in` | `Password123!` | Payment simulation, Voice Shield, Security Center, Transaction History |
| **Demo Admin / Investigator** | `admin@sih.in` | `AdminPassword123!` | Real-time live monitor, Fraud case investigation, Syndicate graph, Model telemetry |

---

## 🎯 Final 30-Second Elevator Pitch

> *"FraudShield is an explainable real-time fraud prevention system for digital payments. It combines transaction behavior, device changes, user behavior, voice-phishing indicators and suspicious relationships to calculate risk before a payment is completed. Instead of simply blocking a transaction, it explains the risk to the user and lets them make an informed decision. At the same time, institutions receive real-time alerts and can investigate fraud cases, review false positives and track suspicious networks."*

---

## 🔒 10-Second Closing

> **"We don't just detect fraud. We explain the risk before the money moves."**
