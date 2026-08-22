# Feature Freeze Specification — v1.0.0

**Project Name:** Explainable Real-Time Fraud Shield for UPI, Voice Phishing, and Social Engineering  
**Version:** `v1.0.0` (Release Candidate)  
**Status:** **FROZEN** (No new functional features permitted; active testing & hardening only)  
**Date:** August 2026  
**Target Event:** Smart India Hackathon (SIH) Grand Finale  

---

## 1. Scope & Feature Inventory

The following 15 production capabilities are locked and validated in `v1.0.0`:

| ID | Module / Feature | Description | Status |
|---|---|---|---|
| **01** | **Authentication & Security** | JWT-based auth, Argon2/Bcrypt password hashing, SHA-256 IP hashing, Role-Based Access Control (`user`, `admin`). | **FROZEN** |
| **02** | **Transaction Simulation** | Multi-channel UPI transaction simulator with configurable device fingerprints, location, hour, and velocity counters. | **FROZEN** |
| **03** | **Calibrated Fraud ML** | Isotonic-calibrated Random Forest (15 features, zero data leakage pipeline, PR-AUC 0.941, Recall 97.4%). | **FROZEN** |
| **04** | **Explainable AI (XAI)** | Rule + statistical translation engine generating transparent, non-technical risk reasons and actionable user guidance. | **FROZEN** |
| **05** | **Voice Phishing Shield** | 5-vector conversational phishing scanner (OTP requests, bank impersonation, urgency/coercion, AnyDesk/remote tools, caller mismatch). | **FROZEN** |
| **06** | **Device Intelligence** | Persistent hardware/browser fingerprinting, trust score decay, new-device risk penalties, and biometric trust indicators. | **FROZEN** |
| **07** | **Behavioral Baseline Profiling** | Habitual expenditure boundaries, unusual hour anomaly detection, and rapid transaction velocity burst tracking. | **FROZEN** |
| **08** | **Fraud Relationship Graph** | Multi-hop graph analysis (User ↔ Device ↔ Mule Receiver) identifying mule rings and shared hardware clusters. | **FROZEN** |
| **09** | **Central Multi-Signal Risk Engine** | Dynamic weighted risk compositor: $Risk = 0.30 \times ML + 0.20 \times Beh + 0.15 \times Dev + 0.15 \times Voice + 0.20 \times Graph$ with automatic normalization. | **FROZEN** |
| **10** | **Real-Time Streaming & Alerts** | Authenticated Socket.IO telemetry channels delivering sub-second notifications to user modal and admin monitor. | **FROZEN** |
| **11** | **Institutional Admin Console** | Case queue management, status workflow (`FLAGGED` → `UNDER_REVIEW` → `CONFIRMED_FRAUD` / `FALSE_POSITIVE` → `RESOLVED`), and metrics dashboard. | **FROZEN** |
| **12** | **False-Positive Feedback Loop** | Admin feedback mechanism capturing ground-truth labels for retraining without immediate destabilizing updates. | **FROZEN** |
| **13** | **ML Model Health & Monitoring** | Live latency telemetry, prediction distribution tracking, memory usage monitors, and model version comparison tools. | **FROZEN** |
| **14** | **Immutable Audit Trails** | Cryptographically timestamped admin audit log for legal compliance and supervisory review. | **FROZEN** |
| **15** | **Interactive SIH Demo Mode** | 4 instant one-click scenario presets (Legitimate payment, High-risk money mule, Urgency voice phishing, Syndicate device attack). | **FROZEN** |

---

## 2. Hardening Constraints

1. **Zero New Functional Additions**: Any modification must be strictly confined to bug fixes, edge-case hardening, or security validation.
2. **Zero Hardcoded Secrets**: All API keys, JWT secrets, and database URIs must be sourced from `.env` environment templates.
3. **Strict User Data Isolation**: No user may read or modify transactions or voice data belonging to another account.
4. **Resilient Offline / Demo Mode**: Pre-configured mock data and localized fallback pathways ensure seamless demonstration even during network dropouts.
