# Live Demonstration Script & Walkthrough — FraudShield

## 1. Demo Setup & Requirements

### 1.1 Dual-Browser Setup (The Power of Real-Time WebSockets)
To showcase the real-time interception capability to hackathon judges without page refreshes, split your screen into two side-by-side browser windows:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│           BROWSER 1 (Left)            │           BROWSER 2 (Right)           │
│        End-User Payment Flow          │      Bank Investigator / Admin        │
│          `http://localhost:5173`      │    `http://localhost:5173/admin`      │
│                                       │                                       │
│  User: user@sih.in                    │  Admin: admin@sih.in                  │
│  Simulates UPI payments & Voice Shield│  Monitors Live Risk Feed in Real-Time │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

> **Judge Tip**: Notice that Browser 2 (Admin Live Monitor) is **NEVER refreshed**. Every risk calculation, alert, and case creation broadcasts instantly over WebSockets via Socket.IO.

---

## 2. Pre-Configured Synthetic Demo Data

| Entity | Identifier / Name | Description / Role |
|---|---|---|
| **Demo User** | `user@sih.in` / Rituraj M. | Standard retail UPI account holder |
| **Demo Admin** | `admin@sih.in` / Chief Risk Officer | Institutional compliance & fraud investigator |
| **Legitimate Merchant**| `groceries@upi` / FreshMart Supermarket | Known habitual recipient (Low Risk) |
| **Suspicious Recipient**| `urgent_kyc_support@upi` | Unrecognized recipient linked to mule syndicates |
| **Fake Amounts** | ₹500 (Safe) vs. ₹40,000 (Anomalous) | Synthetic amounts avoiding real bank connections |

---

## 3. Step-by-Step Live Demonstration Protocol (3–5 Minutes)

```text
Time        Segment                          Key Actions & Presentation Focus
────────────────────────────────────────────────────────────────────────────────
00:00-00:20 Problem & Approach               Introduce the multi-vector fraud crisis & multi-signal defense.
00:20-00:40 Scenario 1: Normal Payment       Execute ₹500 grocery payment -> Instant green approval (LOW Risk).
00:40-01:20 Scenario 2: Suspicious Payment   Execute ₹40,000 to new recipient at 2 AM -> High Risk Warning.
01:20-01:50 Scenario 3: Voice Phishing       Activate Voice Shield with KYC scam call -> 96% Risk & Scam tags.
01:50-02:30 Multi-Signal Fusion              Execute payment during scam call -> Composite 91/100 XAI Score.
02:30-03:10 Browser 2: Real-Time Admin       Show instantaneous socket alert on Admin Live Monitor (no refresh).
03:10-03:40 Graph Syndicate Traversal        Click "Fraud Graph" -> Explore 3-hop mule ring and shared device cluster.
03:40-04:10 False Positive & Case Action     Investigator marks case status & reviews false-positive logs.
04:10-04:30 Conclusion & Closing Line        "We don't just detect fraud. We explain the risk before the money moves."
```

---

## 4. Detailed Script Walkthrough

### Act 1: Frictionless Legitimate Payment
1. In **Browser 1**, log in as `user@sih.in`.
2. Navigate to **Payment Simulator**.
3. Select **"FreshMart Supermarket"** (`groceries@upi`), enter **₹500**.
4. Click **"Send Payment"**.
5. **Result**: System evaluates risk score: **12/100 (LOW Risk)**. Payment processes seamlessly with green confirmation badge.

---

### Act 2: Social Engineering & Voice Phishing Detection
1. In **Browser 1**, open the **Voice Shield** tab.
2. Click **"Start Live Listening"** (or load the preset *Bank KYC Impersonation* sample).
3. Speak or trigger:
   > *"Hello sir, calling from RBI KYC department. Your UPI will be suspended in 10 minutes unless you transfer ₹40,000 to verify your account. Tell me the OTP immediately."*
4. **Result**: Real-time acoustic/NLP analysis displays:
   - **Voice Risk Score: 96/100 (HIGH)**
   - Detected Tags: `AUTHORITY_IMPERSONATION`, `URGENCY_COERCION`, `OTP_CREDENTIAL_DEMAND`
   - Plain-English Warning: *"RBI never requests urgent fund transfers or OTP disclosure."*

---

### Act 3: Multi-Signal Composite Risk & Explainable AI Warning
1. Return to the **Payment Simulator** while the voice threat is active.
2. Attempt to transfer **₹40,000** to `urgent_kyc_support@upi`.
3. Click **"Evaluate & Send"**.
4. **Result**: The Central Risk Engine computes composite risk: **91/100 (HIGH Risk)**.
5. **The Explainable Warning Screen Appears**:
   - Explicit Factor 1: *Transaction amount (₹40,000) is 8.0x above your daily average.*
   - Explicit Factor 2: *New recipient handle not in 90-day transaction history.*
   - Explicit Factor 3: *Active voice call detected coercion & OTP harvesting.*
   - Explicit Factor 4: *Device signature associated with 3 previously flagged accounts.*
6. The user clicks **"Cancel Transaction"**, successfully averting the scam!

---

### Act 4: Real-Time Admin Command Center (Browser 2)
1. Direct the judges' attention to **Browser 2 (Admin Live Monitor)**.
2. Point out that the high-risk transaction appeared **instantly** on the live stream without touching the keyboard or refreshing.
3. Click **"Inspect Case"** on the newly spawned alert ticket.
4. Click **"View Relationship Graph"**:
   - The interactive graph visualizer renders the victim, the unrecognized device hardware hash, and the suspicious recipient UPI handle.
   - Point out the 3 other connected victim nodes linked to the same device hardware ID (*Shared Device Mule Ring*).
5. The investigator updates case status to **"CONFIRMED_FRAUD"** and freezes the recipient handle.

---

## 5. Judge Demo Checklist

- [x] Backend running on `localhost:5000` (Socket.IO active)
- [x] ML microservice running on `localhost:5001`
- [x] React client running on `localhost:5173`
- [x] Browser 1 logged in as `user@sih.in`
- [x] Browser 2 logged in as `admin@sih.in` on Live Monitor
- [x] Synthetic test accounts and mock data loaded
- [x] Verified WebSockets dispatch across both browsers
