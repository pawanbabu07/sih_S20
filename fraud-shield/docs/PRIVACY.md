# Privacy & Data Protection Architecture

The **Explainable Real-Time Fraud Shield** is built upon strict **Privacy-by-Design** principles. Financial fraud prevention must protect user security without invading digital privacy, retaining personal communications, or storing sensitive banking credentials.

---

## 1. Zero Permanent Credential Storage

The platform strictly avoids collecting or storing sensitive payment credentials:

| Sensitive Asset | Storage Policy | Implementation Mechanism |
|---|---|---|
| **UPI PIN** | **Never Collected / Stored** | Simulated client-side authentication only; never passed to DB |
| **Bank Account Passwords** | **Never Collected / Stored** | No bank password inputs exist in the application |
| **Card CVV / ATM PIN** | **Never Collected / Stored** | Zero payment instrument credential capture |
| **One-Time Passwords (OTP)**| **Never Stored** | Ephemeral evaluation in memory; never persisted |
| **Raw Voice Audio** | **Zero Retention** | Deleted immediately after speech-to-text transcript conversion |

---

## 2. Cryptographic IP Address Hashing

To detect distributed account takeover attempts without tracking exact user IP addresses:
- Every client IP address is hashed using **SHA-256** before database ingestion:
  $$\text{ipAddressHash} = \text{SHA256}(\text{incoming\_ip})$$
- Raw IP addresses are **never written** to persistent MongoDB collections or log files.
- The 64-character hexadecimal digest allows identity matching across sessions without storing raw network coordinates.

---

## 3. Coarse Location Intelligence

- Location tracking utilizes **coarse city-level indicators** (e.g. *"Bhubaneswar"*, *"Delhi"*, *"Bangalore"*).
- Exact GPS coordinates, latitude/longitude, and WiFi BSSID signatures are explicitly **not collected**.
- Distance and relocation checks operate strictly on city transitions to prevent continuous physical tracking.

---

## 4. Ephemeral Audio Processing Pipeline

1. **Temporary Ingestion**: When audio recordings or microphone clips are uploaded to `/api/voice/analyze`, files are written to a restricted, non-public scratch directory (`temp_uploads/`).
2. **Immediate Processing**: The audio is processed by the local speech-to-text engine.
3. **Guaranteed Cleanup**: The temporary audio file is **immediately deleted** (`fs.unlinkSync`) within the `finally` execution block, even in cases of network or parsing exceptions.
4. **Audit Storage**: Only the normalized text transcript and calculated risk indicators are saved for user verification.

---

## 5. Administrative Privacy Masking

Administrative dashboards and fraud investigation logs sanitize all personal identifiable information (PII):

- **Phone Numbers**: Masked to show only the last 4 digits:
  ```text
  9876543210  ->  ******3210
  ```
- **Email Addresses**: Masked to hide full username:
  ```text
  victim_user@gmail.com  ->  v*********r@gmail.com
  ```
- Full plain-text user lists are never exposed in bulk export APIs.

---

## 6. Regulatory & Security Compliance

- **Role-Based Access Control (RBAC)**: Only authorized bank compliance officers with valid administrative JWTs can view fraud audit cases.
- **Cross-User Data Isolation**: Transactions, voice history, security alerts, and device lists enforce strict user ID ownership matching.
- **Explainability Over Blocking**: The system warns and requests explicit user confirmation rather than silently terminating or blocking legitimate payments.
