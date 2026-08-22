# Privacy & Security Architecture — FraudShield

## 1. Core Privacy-by-Design Philosophy

FraudShield is engineered under strict **Data Minimization** and **Privacy-by-Design** principles aligned with India's Digital Personal Data Protection Act (DPDP Act 2023) and RBI Cybersecurity Guidelines.

Fraud prevention must protect citizens from scams **without** invading personal privacy or creating secondary security vulnerabilities.

---

## 2. What FraudShield NEVER Collects or Stores

FraudShield operates strictly on contextual and behavioral metadata. Under no circumstances does the system inspect, transmit, or persist:

- ❌ **UPI PINs / MPINs** (Never requested or processed)
- ❌ **One-Time Passwords (OTPs)** (Never logged or stored)
- ❌ **Debit / Credit Card PINs or CVVs**
- ❌ **Bank NetBanking Passwords**
- ❌ **Raw Audio Recordings of Personal Voice Calls**

---

## 3. Voice Processing Privacy Safeguards

The **Voice Shield** module monitors active calls for social engineering keywords using strict privacy boundaries:

1. **Ephemeral In-Memory Processing**: Voice streams and transcripts are parsed in volatile application memory.
2. **No Persistent Audio Storage**: Raw audio waveforms are never saved to disk or cloud storage by default. Once the NLP scam categorization is evaluated, audio buffers are immediately dereferenced and garbage collected.
3. **Local/Edge-Ready Transcription**: Designed to integrate with on-device Web Speech APIs and edge models, ensuring sensitive conversations never leave the client device in production.
4. **Scam-Specific Token Filtering**: The NLP engine extracts and evaluates only scam intent indicators (e.g., *"urgent KYC"*, *"remote access app"*) while ignoring irrelevant private dialogue.

---

## 4. Cryptographic IP & Geolocation Privacy

- **One-Way Cryptographic IP Hashing**: Client IP addresses are never saved in plain text. Instead, FraudShield converts client IPs into irreversible SHA-256 digests with a secret system salt:
  $$\text{HashedIP} = \text{SHA-256}(\text{RawIP} \parallel \text{SALT})$$
- **Coarse Geolocation**: The system tracks location only at the coarse city level (e.g., *"Mumbai"*, *"Bengaluru"*) to identify geographic anomalies without precise GPS tracking.

---

## 5. Defense-in-Depth Security Controls

```text
                  Incoming User / Admin Request
                               │
                               ▼
               [Helmet HTTP Security Headers]
                               │
                               ▼
               [CORS Origin Policy Filter]
                               │
                               ▼
               [Express-Rate-Limit Defense]
                               │
                               ▼
               [JWT Authentication Gateway]
                               │
                               ▼
               [Role-Based Access Control]
                (User Scope vs Admin Scope)
                               │
                               ▼
               [Input Sanitization & Validation]
                               │
                               ▼
               [Secure MongoDB Atlas Mongoose]
                               │
                               ▼
               [Immutable Audit Trail Logger]
```

### 5.1 Authentication & Role-Based Access Control (RBAC)
- **JSON Web Tokens (JWT)**: Cryptographically signed tokens (HMAC-SHA256) with short expiration periods.
- **Bcrypt Password Hashing**: Passwords stored using `bcryptjs` with 10 salt rounds.
- **Strict Role Separation**:
  - `user`: Restricted strictly to their own transactions, personal devices, and security center.
  - `admin`: Requires verified investigator credentials to access live telemetry, case triage, graph traversal, and model health dashboards.

### 5.2 Application Layer Defenses
- **Helmet Middleware**: Automatically configures secure HTTP response headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Content-Security-Policy`).
- **Strict CORS Filtering**: Whitelists only verified frontend client origins.
- **Rate Limiting**: Throttles brute-force attempts on sensitive endpoints (`/api/auth/login`, `/api/fraud/check`) using `express-rate-limit`.
- **Multer File Validation**: Restricts audio uploads strictly to validated MIME types (`audio/wav`, `audio/webm`, `audio/mpeg`) with strict file size limits (5 MB max).

### 5.3 Audit Logging & Accountability
- Every critical security action (status changes, fraud case triage, false-positive resolution, high-risk overrides) generates an immutable, timestamped record in the `AuditLog` collection.
