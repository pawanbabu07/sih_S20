# SIH 5-Minute Live Judge Demonstration Script

## Overview
This script is designed for a seamless, high-impact 5-minute presentation before the evaluation panel.

---

### Step 1 — Introduce the Problem (30 seconds)
> "Traditional fraud detection systems react *after* funds have already left the victim's account. Our platform—**Explainable Real-Time Fraud Shield**—identifies multi-signal fraud indicators *before* transaction settlement, explains the risk in simple language, and gives institutions real-time visibility."

---

### Step 2 — Open Landing Page (`/home`) (30 seconds)
1. Point to the **5 Core Defense Layers**:
   - Real-Time Detection
   - Explainable AI
   - Voice Phishing Detection
   - Behavior & Device Intelligence
   - Institutional Investigation
2. Click **"Try Interactive Demo"** to navigate to `/demo`.

---

### Step 3 — Scenario 1: Safe Everyday Payment (30 seconds)
1. In `/demo`, click **Scenario 1: Safe Everyday Payment** (₹500 to Priya Sharma).
2. Point out:
   - **Score: 18 / 100 (LOW)**
   - Status: **● Protected**
   - Recommended Action: **ALLOW**
   - Explainability: Shows all signals green.

---

### Step 4 — Scenario 2: Suspicious New Receiver (30 seconds)
1. Click **Scenario 2: Suspicious New Receiver** (₹8,500).
2. Point out:
   - **Score: ~52 / 100 (MEDIUM)**
   - Status: **⚠ Attention Required**
   - Action: **WARN AND CONFIRM**
   - Explainability: "Recipient has not been transacted with previously."

---

### Step 5 — Scenario 3: High-Pressure Voice Scam (45 seconds)
1. Click **Scenario 3: Voice Phishing / Urgency Scam** (₹30,000 + Fake Bank Manager call).
2. Point to the live transcript stream:
   > *"I am calling from bank headquarters. Your account is about to be blocked. Give me the OTP right now..."*
3. Show the calculated outcome:
   - **Score: 92 / 100 (HIGH)**
   - Action: **STRONG WARNING / DO NOT PAY**
   - Signal breakdown: **Voice (95%), Device Risk (80%), Amount Anomaly (85%)**.

---

### Step 6 — Dual-Screen Real-Time Alert Demonstration (45 seconds)
1. Open a second browser window with the Admin console on `/admin/live-monitor`.
2. In the Demo window, click **"⚡ Broadcast Live Socket Alert to Admin"**.
3. Point to the second screen showing the high-risk alert appearing instantly with zero latency via WebSockets.

---

### Step 7 — Institutional Investigation & Fraud Graph (45 seconds)
1. In the Admin window, open `/admin/fraud-graph`.
2. Click **"Load Fraud Graph"** and demonstrate:
   - Visual entity network linking Users, Devices, and Mule Receivers.
   - Click a high-risk red node to view connected transactions and syndicates.

---

### Step 8 — Model Governance & Drift Telemetry (30 seconds)
1. In Admin console, navigate to `/admin/model-performance`.
2. Show:
   - Multi-Model validation holdout table (Logistic Regression vs Random Forest vs Gradient Boosting).
   - Platt Probability Calibration curve (Brier score reduction from 0.1803 to 0.1137).
   - Production Data Drift Monitor comparing training baseline with live traffic.

---

### Step 9 — Privacy & Security Architecture (15 seconds)
> "Our architecture guarantees zero-knowledge credential privacy: we never ask for, collect, or store OTPs, UPI PINs, banking passwords, or raw voice recordings."

---

### Step 10 — Wrap-Up & Conclusion (15 seconds)
> "Fraud Shield turns digital payments from a blind transaction into an explainable, protected, and auditable financial experience."
