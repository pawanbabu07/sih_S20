# 🛡️ Explainable Real-Time Fraud Shield for UPI, Voice Phishing and Social Engineering

> **Detect. Explain. Warn. Protect.**  
> *Official Smart India Hackathon (SIH) Grand Finale Submission*  
> 📁 **Submission Package Folder**: [`../sih-submission/`](file:///c:/Users/ritur/OneDrive/Desktop/sih_S20/sih-submission/README.md)  
> 📑 **Full Technical Project Report**: [`sih-submission/PROJECT_REPORT.md`](file:///c:/Users/ritur/OneDrive/Desktop/sih_S20/sih-submission/PROJECT_REPORT.md)  
> 🖥️ **Interactive Presentation Deck**: [`sih-submission/presentation/SIH-Final-Presentation.html`](file:///c:/Users/ritur/OneDrive/Desktop/sih_S20/sih-submission/presentation/SIH-Final-Presentation.html)  

---

An end-to-end, privacy-preserving, and explainable multi-signal fraud intelligence platform engineered for **Smart India Hackathon (SIH)**. The platform protects digital payment users by combining **Calibrated Machine Learning**, **Device Intelligence**, **Behavioral Baseline Profiling**, **Voice Phishing Analysis**, **Entity Relationship Graphs**, and **Live WebSocket Event Streaming** to intercept coordinated fraud before transaction settlement.

---

## 🌟 Key Features & Innovations

- **Pre-Settlement Interception**: Evaluates multi-signal risk before transaction settlement using strict zero-data-leakage temporal contracts.
- **5-Signal Central Risk Engine**: Fuses **Transaction ML (30%)**, **Behavioral Deviations (20%)**, **Device Trust (15%)**, **Voice Phishing Indicators (15%)**, and **Fraud Relationship Graph Risk (20%)** into an explainable score (0–100).
- **Public Landing Page & Narrative (`/home`)**: High-impact introduction highlighting the 5 defense layers and a 20-second visual flow for judges.
- **Interactive Judge Demo Mode (`/demo`)**: One-click live scenario simulations (*Safe Payment*, *Suspicious Receiver*, *Voice Scam*, *Coordinated Mule Ring*) with live signal evaluation animation.
- **Multi-Model Benchmark & Platt Calibration (`/admin/model-performance`)**: Side-by-side validation holdout comparison across **Logistic Regression**, **Random Forest**, and **Gradient Boosting**, with Platt sigmoid probability calibration (37% Brier score reduction) and adaptive threshold curves.
- **Admin Live Fraud Monitor (`/admin/live-monitor`)**: Instant real-time Socket.IO event streaming with audio/visual alerts, time range filters, and zero browser polling.
- **Entity Relationship Graph & Syndicate Clusters (`/admin/fraud-graph` & `/admin/fraud-clusters`)**: Visual multi-hop graph connecting Users, Devices, Receivers, and Transactions to uncover coordinated mule rings.
- **Voice Shield & Anti-Vishing (`/voice-shield`)**: Real-time transcript evaluation detecting 10 social engineering patterns (OTP demands, authority impersonation, AnyDesk remote-access threats).
- **Explainable AI for Users (`<RiskExplanation />`)**: Translates complex model features into plain-English reasons without technical jargon.
- **Model Governance & Auditing (`/admin/audit-logs`)**: Validated candidate promotion workflow with immutable `AdminAuditLog` records.
- **Privacy-by-Design**: SHA-256 IP hashing, zero banking credential collection (no UPI PIN, CVV, OTP, or passwords stored), and PII masking.

---

## 🏗️ Architecture & Technology Stack

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

- **Frontend**: React 18, Vite, Material UI v6, React Router v6, Socket.IO Client, Axios
- **Backend**: Node.js, Express, Socket.IO, MongoDB Atlas, Mongoose, JWT, Bcrypt, Helmet, Express-Rate-Limit
- **Machine Learning & Preprocessing**: Python 3.10+, Scikit-Learn, Pandas, NumPy, Joblib

---

## 🚀 Quick Start & Running Locally

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB Atlas connection string or local MongoDB URI

### 2. Setup ML Service
```bash
cd ml-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
python model_comparison.py # Trains and calibrates models
python app.py              # Starts ML service on port 8000
```

### 3. Setup Backend Server
```bash
cd server
npm install
# Configure .env with MONGO_URI, JWT_SECRET, PORT=5000, ML_SERVICE_URL=http://127.0.0.1:8000
npm run dev               # Starts API and Socket.IO server on port 5000
```

### 4. Setup Frontend Client
```bash
cd client
npm install
npm run dev               # Starts Vite dev server on http://localhost:5173
```

---

## 🧪 Testing & Verification

Run the comprehensive 70-test backend verification suite:
```bash
cd server
npm test
```
*Pass rate: 70 / 70 tests passing (100%) across 15 suites.*

Build the frontend client bundle:
```bash
cd client
npm run build
```

---

## 📚 Documentation Index
- 🏛️ [System Architecture](docs/ARCHITECTURE.md)
- 🎯 [SIH Problem-to-Solution Mapping](docs/SIH_PROBLEM_MAPPING.md)
- ⏱️ [5-Minute Live Judge Demo Script](docs/SIH_JUDGE_DEMO.md)
- 🎤 [60-Second Pitch & Judge Q&A](docs/SIH_PITCH_AND_FAQS.md)
- 🛡️ [Zero Data Leakage Engineering Guide](docs/ML_DATA_LEAKAGE.md)
- 🔒 [Privacy & Compliance Standards](docs/PRIVACY.md)
