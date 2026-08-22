# Smart India Hackathon — Grand Finale Presentation Deck

## Project: FraudShield
**Explainable Real-Time Fraud Shield for UPI, Voice Phishing and Social Engineering**

**Tagline:** *Detect. Explain. Warn. Protect.*

---

## Slide 1: Title & Team Information

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                               🛡️ FRAUDSHIELD                                │
│                                                                             │
│         Explainable Real-Time Fraud Shield for Digital Payments,            │
│                 Voice Phishing, and Social Engineering                      │
│                                                                             │
│                    "Detect. Explain. Warn. Protect."                        │
│                                                                             │
│   Smart India Hackathon (SIH) Grand Finale Submission                       │
│   Track: AI / ML & Cybersecurity for Digital Financial Services             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 2: The Modern Fraud Problem

- **13+ Billion Monthly Transactions**: UPI has democratized Indian commerce, but velocity attracts organized cyber-syndicates.
- **The Social Engineering Crisis**: Attackers no longer need to crack encryption; they psychologically coerce victims into authorizing payments themselves.
- **The Multi-Vector Attack Strategy**:
  - Voice Phishing (Vishing) & fake bank/RBI officials.
  - Urgent KYC expiry threats & fake police arrest notices.
  - Demands for OTP, MPIN, or remote-access apps (AnyDesk/TeamViewer).
  - Coordinated mule rings laundering funds across shared burner devices within seconds.

---

## Slide 3: Why Existing Approaches Fall Short

```text
LEGACY BANKING DEFENSES                     THE ATTACK REALITY
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│ • Evaluates only amount & velocity    │   │ • Scammer asks for ₹40,000 (normal)   │
│ • Runs post-transaction batch jobs    │   │ • Stolen money is liquidated in <60s  │
│ • Black-box opaque error codes        │   │ • Frustrated users retry or override  │
│ • Hard-blocks legitimate unusual buys │   │ • High customer churn & support costs │
└───────────────────────────────────────┘   └───────────────────────────────────────┘
```

**The Core Blindspot**: To legacy gateways, an authorized payment by a coerced victim looks 100% syntactically valid!

---

## Slide 4: Our Solution — Pre-Execution Multi-Signal Defense

```text
Transaction ML + Device Intelligence + Behavioral Baselines + Voice Phishing NLP + Fraud Graph
                                           │
                                           ▼
                                  Central Risk Engine
                                           │
                                           ▼
                                 Explainable Risk Score
                                   (0–100 + XAI Reasons)
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                   User Warning                         Bank Live Alert
                 (Warn & Confirm)                     (Investigator Socket)
```

**Tiered Protection Matrix**:
- `LOW (<40)`: Seamless, instant pass.
- `MEDIUM (40–69)`: Contextual recipient verification.
- `HIGH (≥70)`: High-visibility warning screen with explicit risk reasons, cancel option, and live bank alert.

---

## Slide 5: System Architecture

```text
                    USER (React 18 + Vite + MUI)
                                 │
                                 ▼
                     Node.js & Express Gateway
                     (REST + Socket.IO + JWT)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
   Transaction ML          Voice Phishing            Fraud Graph
  (Python Microservice)   (Acoustic / NLP)         (BFS Traversal)
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 ▼
                        Central Risk Engine
                   (Dynamic Normalized Formula)
                                 │
                                 ▼
                       Explainable Risk Score
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
               User Warning              Admin Monitor
             (Warn & Confirm)          (Live WebSockets)
```

---

## Slide 6: The Central Multi-Signal Risk Engine

The engine computes composite risk using dynamic weighted normalization:

$$R_{\text{composite}} = \frac{W_1 \cdot S_{\text{ML}} + W_2 \cdot S_{\text{Behavior}} + W_3 \cdot S_{\text{Device}} + W_4 \cdot S_{\text{Voice}} + W_5 \cdot S_{\text{Graph}}}{W_1 + W_2 + W_3 + W_4 + W_5}$$

- $W_1 = 0.30$ (Transaction ML — Calibrated Probability)
- $W_2 = 0.20$ (Behavioral Baseline — Amount & Time Deviations)
- $W_3 = 0.20$ (Device Intelligence — Hardware Signature Trust)
- $W_4 = 0.15$ (Voice Phishing — Scam Lexicon & Urgency NLP)
- $W_5 = 0.15$ (Fraud Graph — Mule Ring Proximity)

*Dynamic Normalization: If no active call exists, $W_4$ drops to 0 and the remaining weights automatically re-normalize.*

---

## Slide 7: Voice Phishing & Social Engineering Detection

- **Real-Time Acoustic & NLP Ingestion**: Ingests microphone audio or phone call transcripts using Web Speech API in volatile memory.
- **4 Real-Time Threat Scanners**:
  1. *Authority Impersonation*: RBI, Cyber Police, Bank Manager.
  2. *Urgency & Coercion*: "Within 10 minutes", "Account blocked", "Arrest warrant".
  3. *Credential Demands*: Demands for 6-digit OTP, MPIN, CVV.
  4. *Remote Access Traps*: AnyDesk, TeamViewer, QuickSupport.
- **Privacy-by-Design**: Ephemeral in-memory analysis; zero audio files are permanently saved.

---

## Slide 8: Device Intelligence & Behavioral Baseline

### Device Intelligence
- Extracts one-way hardware signature fingerprints (Model, OS, Browser, Screen).
- Computes **Device Trust Score (0–100)**: Decays on unfamiliar hardware; rewards trusted long-term devices.

### Dynamic Behavioral Baseline
- Learns personalized user profiles:
  - Typical spending window (e.g., 8:00 AM – 10:30 PM).
  - Habitual daily average (e.g., ₹4,850).
  - Coarse geographic center (e.g., Bhubaneswar).
  - Flags velocity spikes and night-hour anomalies.

---

## Slide 9: Fraud Relationship Graph Syndicate Traversal

```text
   [User: Victim 1] ───┐
                       ├──> [Hardware ID: #99b] <─── [User: Victim 2]
   [User: Victim 3] ───┘           │
                                   ▼
                       [Recipient: scammer@upi]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
           [Mule Account Alpha]          [Mule Account Beta]
```

- Traverses relationships up to **3 hops** using Breadth-First Search (BFS).
- Identifies **Shared Hardware Mule Rings**: Single burner phone logging into multiple victim accounts.
- Identifies **Mule Fan-Out Networks**: Clustered recipients absorbing high-velocity incoming transfers.

---

## Slide 10: Explainable AI Risk Warning (XAI)

Instead of cryptic black-box errors, FraudShield generates clear, natural language factors:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ HIGH FRAUD RISK DETECTED (Score: 91/100)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Transaction amount (₹40,000) is 8.0x higher than your daily average.       │
│ • Active phone call detected: 'Urgent KYC Verification' and 'OTP Demand'.    │
│ • Recipient UPI handle is not in your 90-day transaction history.           │
│ • Hardware signature is linked to 4 other flagged suspicious accounts.      │
├─────────────────────────────────────────────────────────────────────────────┤
│       [ ❌ Cancel Transaction ]        [ I Understand Risk & Proceed ]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 11: Real-Time Institutional Admin Dashboard

- **Sub-Second WebSocket Streaming**: Alerts pushed instantly via Socket.IO without page reloads.
- **Priority Investigation Queue**: Automated triage tickets with risk severity classifications.
- **Interactive Graph Visualizer**: Physics-based graph canvas exploring node clusters and mule paths.
- **False-Positive Management**: Investigators review user-reported false alarms to fine-tune decision thresholds.

---

## Slide 12: Machine Learning Evaluation & Metrics

*Evaluated on independent 900-sample test partition (Dataset: 6,000 records, 82.7% Legit / 17.3% Fraud):*

| Metric | Logistic Regression (Deployed) | Random Forest Classifier | Gradient Boosting Classifier |
|---|---|---|---|
| **Accuracy** | 74.67% | 80.44% | **84.33%** |
| **Precision (Fraud)** | 38.08% | 45.24% | **58.24%** |
| **Recall (Fraud)** | **73.72%** | 60.90% | 33.97% |
| **F1-Score (Fraud)** | **50.22%** | 51.91% | 42.91% |
| **ROC-AUC** | **82.81%** | **82.82%** | 82.48% |
| **Brier Score** | **0.1137** (Calibrated) | 0.1350 | 0.1128 |

### Why Recall Matters
Gradient Boosting missed **66% of all frauds** ($FN = 103$). Deployed Calibrated Logistic Regression caught **73.72% of all attacks ($TP = 115$)**, reducing missed fraud by over 60%.

---

## Slide 13: Privacy & Security by Design

- **Zero Sensitive Credentials**: No MPINs, Card PINs, CVVs, Passwords, or OTPs are ever requested or stored.
- **Ephemeral Audio**: Voice processed in volatile memory; zero raw audio files stored.
- **DPDP Act Compliance**: Client IPs converted into one-way SHA-256 cryptographic hashes (`sha256(ip + salt)`).
- **Defense in Depth**: Helmet headers, strict CORS, express-rate-limit brute force defense, and immutable audit logs.

---

## Slide 14: Live Dual-Browser Demonstration

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│           BROWSER 1 (Left)            │           BROWSER 2 (Right)           │
│        End-User Payment Flow          │       Bank Live Monitor (Admin)       │
│                                       │                                       │
│ 1. ₹500 Grocery -> GREEN PASS (12/100)│ (No Page Refresh Required)            │
│ 2. KYC Scam Call -> Voice Shield 96%  │                                       │
│ 3. ₹40,000 Transfer -> 91% HIGH RISK  │ ⚡ Instant Socket Push: HIGH_RISK_TX  │
│ 4. User views XAI reasons & CANCELS   │ ⚡ Case #FC-9021 auto-spawned in feed │
│                                       │ ⚡ Investigator opens 3-Hop Graph Ring│
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## Slide 15: Impact & Future Roadmap

### Immediate Social & Financial Impact
- **Breaks Social Engineering Psychological Loops**: Timely explainable warnings stop coerced transfers before money leaves the bank.
- **Cuts Mule Syndicate Velocity**: Real-time graph clustering flags and freezes shared device rings.

### Realistic Future Roadmap
- On-device edge NLP voice models for multilingual Indian dialects (Hindi, Tamil, Telugu, Bengali).
- Production integration as an API gateway middleware for NPCI UPI switches.
- Distributed Neo4j graph cluster scaling to 100M+ entities.

---

## Slide 16: Summary & Closing

```text
01. Multi-Signal Fusion (ML + Behavior + Device + Voice + Graph)
02. Real-Time Pre-Execution Interception (<50ms latency)
03. Explainable AI with Plain-Language User Warnings
04. Zero-Credential Ingestion & DPDP Act Privacy Safeguards
05. Instant WebSocket Broadcasting to Institutional Investigators
```

### Final Closing

> **"We don't just detect fraud. We explain the risk before the money moves."**
