# Smart India Hackathon (SIH) — Live Demonstration Guide

## Scenario Overview

This script demonstrates the complete 5-signal real-time fraud defense capabilities of the **Explainable Real-Time Fraud Shield** in an interactive, side-by-side **Dual-Browser Window Demonstration**.

```
  ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
  │         WINDOW 1: USER          │       │         WINDOW 2: ADMIN         │
  │     http://localhost:5173       │       │    http://localhost:5173/admin  │
  │                                 │       │                                 │
  │  1. Initiates ₹40,000 payment   │       │  1. Opens Live Fraud Monitor    │
  │     from untrusted device       │       │     (/admin/live-monitor)       │
  │  2. Receives Instant Warning    │ ───►  │  2. Sees HIGH-RISK POPUP LIVE   │
  │     without page refresh        │       │     without page refresh!       │
  │  3. Reviews Explainable Signals │       │  3. Inspects in Fraud Graph &   │
  │  4. Clicks "Cancel Payment"     │       │     Syndicate Cluster           │
  └─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 🎬 4-Minute Presentation Flow

### Act 1: The Victim & The Impersonation Call (1 Minute)
1. **User Persona**: An account holder receives an urgent phone call claiming their bank account will be blocked unless KYC is completed.
2. **Action**: Open Voice Shield (`/voice-shield`), paste scam transcript with OTP and authority pressure keywords.
3. **Outcome**: The voice analyzer computes risk score `89/100 (HIGH)`, flags `OTP_REQUEST`, `URGENCY`, and `IMPERSONATION`.
4. **Real-Time Streaming**: Admin immediately sees `🎙️ VOICE PHISHING DETECTED` on the Live Monitor.

---

### Act 2: The High-Risk Payment Interception (1.5 Minutes)
1. **User Action**: Open Make Payment (`/payment`), submit:
   - **Amount**: `₹40,000` (habitual max: ₹5,000)
   - **Recipient UPI**: `rahul_unknown@upi`
   - **Device**: Unrecognized Device (`device_sih_demo_b99`)
   - **Time**: `2:00 AM`
2. **Instant User Screen**:
   - Transferred to **Fraud Warning Screen** (`/fraud-warning`).
   - Risk score: `91/100 (HIGH)`.
   - **Explainable Multi-Signal Factor Breakdown**:
     - Transaction ML: `88%`
     - Behavioral Baseline: `92%` (Amount + Time + New Receiver)
     - Device Trust: `80%` (Unrecognized Device ID)
     - Graph Intelligence: `85%` (Shared Device Syndicate)
3. **Simultaneous Admin Screen (Window 2)**:
   - Without refreshing, the **Live Fraud Monitor** (`/admin/live-monitor`) dings with a popup banner:
     - `⚠️ HIGH-RISK TRANSACTION: ₹40,000`
     - Status: `FLAGGED`
     - Reasons: `New Device • New Receiver • Unusual Amount`
   - Dashboard counter for High-Risk Cases increments from `X` to `X+1` live.

---

### Act 3: Network Syndicate & Graph Investigation (1 Minute)
1. **Admin Action**: Click **"Inspect in Graph Visualizer"** on the live event.
2. **Outcome**:
   - Opens `/admin/fraud-graph`.
   - Visualizes multi-hop network connecting `device_sih_demo_b99` across 4 different victim accounts and 2 recipient hubs.
   - Shows detected pattern: `PATTERN_SHARED_DEVICE` and `PATTERN_SHARED_RECEIVER`.
3. **Fraud Clusters**: Navigate to `/admin/fraud-clusters` showing the identified syndicate ring.

---

### Act 4: Safe Resolution & System Telemetry (30 Seconds)
1. **User Action**: Clicks **"Cancel Payment"** on the warning screen.
2. **Outcome**:
   - Payment status updates to `CANCELLED`.
   - Admin receives live status update event on the monitor.
3. **Admin Telemetry**: Open `/admin/system-monitoring` showing:
   - Backend API: `● ONLINE`
   - Database: `● ONLINE`
   - ML Model Server: `● ONLINE`
   - Socket.IO Real-Time Engine: `● ONLINE`
   - Active user/admin socket counts and live events/min throughput.
