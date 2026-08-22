# SIH 60-Second Pitch & Judge Q&A Guide

## 1. 60-Second Elevator Pitch
> “Our project is an **Explainable Real-Time Fraud Shield** for digital payments. Instead of looking at only transaction amount, we combine transaction behavior, device changes, user habits, receiver history, voice-phishing indicators, and suspicious entity relationships. The risk engine converts these 5 signals into an understandable score and explains exactly why a payment looks suspicious in plain English. Before the payment is settled, the user receives an explainable warning and makes the final decision. Concurrently, banking compliance teams can monitor high-risk incidents in real time via WebSockets, investigate coordinated mule syndicates on a relationship graph, review false positives, and maintain an immutable audit trail. The system is built with strict zero-knowledge privacy and data minimization.”

---

## 2. Judge Questions & Prepared Answers

### Q1: Why not simply use an ML classifier on the transaction amount?
**Answer**:
A standalone ML classifier trained only on transaction amounts is blind to context. A legitimate ₹50,000 hospital payment looks identical to a ₹50,000 coercion scam. By fusing calibrated ML with device fingerprinting, behavioral spend history, voice urgency analysis, and graph mule syndicates, we eliminate blind spots while reducing false alarms.

---

### Q2: Why is explainability critical?
**Answer**:
When users are told "Transaction Denied" without reason, they become frustrated or attempt unsafe workarounds. Plain-English explanations (e.g. *"Recipient is new and call transcript detected urgency"*) educate users in the moment. Furthermore, compliance officers require auditable evidence to justify legal or banking investigations.

---

### Q3: Why not automatically block every suspicious payment?
**Answer**:
Automated hard blocks on anomalies cause severe false-positive friction. We implement a multi-tiered policy:
- `LOW` $\to$ **ALLOW**
- `MEDIUM` $\to$ **WARN & CONFIRM** (user verifies receiver)
- `HIGH` $\to$ **STRONG WARNING / DO NOT PAY**
This preserves user autonomy for genuine emergency payments while effectively stopping coercion scams.

---

### Q4: How do you prevent false positives and alert fatigue?
**Answer**:
1. **Platt Probability Calibration**: Eliminates uncalibrated tree margin extremes, reducing test Brier score by 37%.
2. **Adaptive Thresholding**: Empirically selecting operating points ($0.40 \dots 0.85$) optimizing F1 and Recall.
3. **Admin False-Positive Feedback Loop**: Labeled feedback tracks precision drift without blindly triggering unstable single-case retraining.

---

### Q5: How is user data privacy handled?
**Answer**:
We enforce strict data minimization:
- Never collect or store UPI PINs, OTPs, banking passwords, or card CVVs.
- Device IPs are hashed using SHA-256 for privacy compliance.
- Voice transcripts are processed on-the-fly without permanent raw waveform storage by default.

---

### Q6: Is this connected to real UPI banking networks?
**Answer**:
This SIH prototype uses an institutional simulation test harness matching NPCI/UPI payload schemas. Production deployment would integrate via authorized bank API gateways.
