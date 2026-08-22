# Changelog

All notable changes to the **Explainable Real-Time Fraud Shield** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0] - 2026-08-22 — Smart India Hackathon (SIH) Release Candidate

### Core Features Added
- **Real-Time Payment Interception:** Pre-settlement fraud probability calculation for UPI transactions with sub-100ms processing.
- **Calibrated Machine Learning Engine:** Isotonic-calibrated champion classifier utilizing 15 zero-leakage engineered behavioral and transactional features.
- **Explainable AI (XAI) System:** Plain-language risk reason translation translating statistical anomalies into non-technical user explanations.
- **Voice Phishing & Social Engineering Shield:** Real-time conversational phishing scanner targeting 5 common Indian scam vectors (OTP extortion, bank impersonation, urgency/coercion, AnyDesk remote-access, caller mismatch).
- **Device & Behavioral Intelligence:** Cryptographic device fingerprinting, trust score decay, location deviation detection, and velocity burst anomaly filters.
- **Coordinated Syndicate Graph Analysis:** Multi-hop fraud network graph connecting shared hardware, mule accounts, and fraud rings.
- **Central Multi-Signal Risk Engine:** Dynamic weighted normalization engine compositing ML, behavior, device, voice, and graph signals into a calibrated 0–100 risk score.
- **Real-Time Streaming & Alerts:** Sub-second Socket.IO event channels powering live user warning modals and administrative event monitors.
- **Institutional Admin Investigation Console:** Case queue triage with stateful workflow (`FLAGGED` → `UNDER_REVIEW` → `CONFIRMED_FRAUD` / `FALSE_POSITIVE` → `RESOLVED`), metrics dashboards, and immutable audit logs.
- **False-Positive Feedback Loop:** Admin feedback tracking ensuring safe dataset retraining without live model disruption.
- **Interactive SIH Demo Mode:** 4 instant pre-configured fraud simulation presets for live jury evaluation.

### Security & Privacy Enhancements
- Zero raw credential / UPI PIN / OTP persistence policy.
- SHA-256 IP address hashing ensuring strict privacy compliance with Indian DPDP Act guidelines.
- Ephemeral in-memory voice transcript processing with automated memory release.
- Strict cross-user data isolation verified via 100% automated test suites.

### Bug Fixes & Hardening (Phase 13)
- Fixed transaction confirmation ID resolution when navigating from warning modals.
- Fixed React DOM prop warnings on `<Stack>` and `<Grid>` components by moving flex layout props to `sx`.
- Unified JWT token storage keys across `AuthContext`, `api.js`, and `socket.js`.
- Fixed `[object Object]` URL stringification in administrative fraud case links and Live Alert triggers.
- Expanded Material-UI `<Select>` status options in `FraudCaseDetails.jsx` and `FraudCases.jsx` to prevent out-of-range warnings.
- Added global theme defaults for `MuiSelect`, `MuiMenu`, and `MuiModal` (`TransitionProps: { timeout: 0 }`, `disableRestoreFocus: true`) to prevent browser `aria-hidden` focus retention warnings.
- Restored missing React hook imports in `FraudGraph.jsx`.
- Verified and standardized 15-feature transformation in `evaluate.py`.
