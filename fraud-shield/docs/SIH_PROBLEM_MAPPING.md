# SIH Problem-to-Solution Technical Mapping

| SIH Problem Requirement | Fraud Shield Technical Implementation | Verification Route / Artifact |
|---|---|---|
| **Pre-Settlement UPI Fraud Detection** | Real-time REST pre-transaction check evaluating behavioral anomalies, amounts, and habitual hours before funds leave the account. | `/payment`, `server/services/riskEngine.js` |
| **Voice Phishing & Social Engineering** | NLP heuristic keyword & coercion detector analyzing transcripts for OTP theft, authority impersonation, bank manager threats, and urgency. | `/voice-shield`, `server/services/voicePhishingService.js` |
| **Device Fingerprinting & Account Takeover** | Device intelligence computing hash signatures, trust scores (0-100), and identifying untrusted or new devices without storing private hardware identifiers. | `/security/devices`, `server/services/deviceService.js` |
| **Behavioral Profiling & Habitual Baselines** | Rolling baseline of transaction averages, maximum usual amounts, daily frequencies, and active locations. | `server/services/behaviorService.js` |
| **Coordinated Mule Syndicates & Ring Attacks** | Graph-based entity relationship modeling (`FraudRelationship`) detecting shared devices, shared recipients, burst transfers, and high-risk network clusters. | `/admin/fraud-graph`, `/admin/fraud-clusters` |
| **Explainable AI for Everyday Users** | Categorized plain-English explanations breaking down Transaction, Device, Behavior, Voice, and Graph signals without confusing ML jargon. | `<RiskExplanation />`, `components/RiskExplanation.jsx` |
| **Minimizing False Positives & Alert Fatigue** | Platt probability calibration, adaptive threshold analysis ($0.40 \dots 0.85$), and user "Warn & Confirm" feedback loops. | `/admin/model-performance`, `ml-service/model_comparison.py` |
| **Institutional Compliance & Auditability** | Real-time WebSocket live feed (`Socket.IO`), formal case review workflows, false-positive resolution tracking, and immutable `AdminAuditLog` records. | `/admin/live-monitor`, `/admin/audit-logs` |
| **Data Privacy & Minimal Storage** | Strict zero-knowledge storage: No OTPs, UPI PINs, bank passwords, card CVVs, or raw audio waveforms are persisted. | `docs/PRIVACY.md`, `docs/ML_DATA_LEAKAGE.md` |
