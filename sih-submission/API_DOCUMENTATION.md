# API Documentation — Explainable Real-Time Fraud Shield

## 1. Overview & Base URLs
- **Local Development API**: `http://localhost:5000`
- **ML Microservice API**: `http://localhost:5001`
- **WebSocket Gateway**: `ws://localhost:5000` (Socket.IO v4)

All authenticated endpoints require an `Authorization` header formatted as:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 2. API Endpoint Matrix

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | User / Admin | Retrieve current authenticated user profile |
| `POST` | `/api/transactions` | User | Simulate/Initiate payment transaction |
| `POST` | `/api/transactions/:id/confirm` | User | Confirm payment post-warning review |
| `POST` | `/api/transactions/:id/cancel` | User | Cancel flagged suspicious payment |
| `GET` | `/api/transactions/history` | User | Fetch authenticated user's transaction history |
| `POST` | `/api/fraud/check` | User | Full multi-signal composite fraud risk evaluation |
| `POST` | `/api/voice/analyze` | User | Analyze voice transcript/audio for phishing |
| `POST` | `/api/voice/feedback` | User | Submit false-positive user feedback on voice alerts |
| `GET` | `/api/events` | User / Admin | Fetch real-time event logs (User: Own, Admin: Global) |
| `GET` | `/api/admin/statistics` | Admin | Get platform-wide fraud summary statistics |
| `GET` | `/api/admin/fraud-cases` | Admin | List open and triaged fraud cases |
| `GET` | `/api/admin/fraud-cases/:id` | Admin | Get deep investigation details for a case |
| `PATCH` | `/api/admin/fraud-cases/:id/status`| Admin | Update case status (CONFIRMED_FRAUD, FALSE_POSITIVE, etc.) |
| `GET` | `/api/admin/fraud-graph/:type/:id` | Admin | Multi-hop relationship graph traversal |
| `GET` | `/api/admin/fraud-clusters` | Admin | Retrieve detected mule syndicates & clusters |
| `GET` | `/api/admin/model-health` | Admin | Retrieve ML performance metrics & drift rates |
| `GET` | `/api/admin/system-health` | Admin | Retrieve service health, throughput, & connected sockets |

---

## 3. Detailed Request & Response Specifications

### 3.1 Authentication

#### `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "user@sih.in",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66c741e9b21a8f9024c7a101",
    "name": "Rituraj Mohanty",
    "email": "user@sih.in",
    "role": "user"
  }
}
```

---

### 3.2 Pre-Execution Fraud Risk Check

#### `POST /api/fraud/check`
Evaluates all 5 signal dimensions (Transaction ML, Behavior, Device, Voice, and Graph) in pre-flight.

- **Request Body**:
```json
{
  "amount": 40000,
  "receiverId": "unknown_scammer@upi",
  "receiverName": "Suspicious Technical Support",
  "transactionType": "UPI",
  "deviceId": "device_unrecognized_99b",
  "deviceInfo": {
    "deviceModel": "OnePlus 9",
    "os": "Android 13",
    "browser": "Chrome Mobile"
  },
  "location": "Kolkata",
  "transactionHour": 2,
  "voiceAnalysisId": "66c741f0b21a8f9024c7a102"
}
```

- **Response (200 OK)**:
```json
{
  "success": true,
  "transactionId": "66c741f5b21a8f9024c7a103",
  "riskScore": 91,
  "riskLevel": "HIGH",
  "fraudProbability": 0.89,
  "isSuspicious": true,
  "recommendedAction": "STRONG_WARNING",
  "signals": [
    "AMOUNT_ANOMALY",
    "TIME_ANOMALY",
    "NEW_RECEIVER",
    "NEW_DEVICE",
    "VOICE_COERCION_DETECTED",
    "PATTERN_SHARED_DEVICE"
  ],
  "reasons": [
    "Transaction amount (₹40,000) exceeds normal limit (₹5,000)",
    "Transaction initiated during unusual night hours (2:00 AM)",
    "Recipient UPI handle not found in historical transaction records",
    "Unrecognized hardware device signature with low trust score",
    "Active phone call detected high-risk urgency and OTP demands",
    "Device signature links 4 distinct accounts (shared syndicate pattern)"
  ],
  "componentScores": {
    "transactionML": 88,
    "behavioral": 92,
    "deviceRisk": 80,
    "voice": 95,
    "graph": 85
  }
}
```

---

### 3.3 Voice Phishing Analysis

#### `POST /api/voice/analyze`
Accepts live audio speech transcripts or audio uploads and analyzes for social engineering threats.

- **Request Body**:
```json
{
  "transcript": "Hello sir, I am calling from RBI head office. Your bank KYC is expired. You must transfer ₹40,000 immediately to the security account or your account will be permanently blocked within 10 minutes. Tell me your OTP now."
}
```

- **Response (200 OK)**:
```json
{
  "success": true,
  "voiceAnalysisId": "66c741f0b21a8f9024c7a102",
  "riskScore": 96,
  "riskLevel": "HIGH",
  "threatType": "URGENT_KYC_IMPERSONATION",
  "detectedScamCategories": [
    "AUTHORITY_IMPERSONATION",
    "URGENCY_COERCION",
    "OTP_CREDENTIAL_DEMAND"
  ],
  "flaggedKeywords": [
    "RBI head office",
    "KYC expired",
    "immediately",
    "permanently blocked",
    "10 minutes",
    "OTP"
  ],
  "recommendation": "DO NOT TRANSFER FUNDS. RBI never requests urgent money transfers or OTP disclosure."
}
```

---

### 3.4 Multi-Hop Fraud Relationship Graph

#### `GET /api/admin/fraud-graph/:type/:id`
Traverses the entity-relationship graph up to 3 hops from a target User, Device, IP, or Receiver UPI.

- **Response (200 OK)**:
```json
{
  "success": true,
  "rootNode": { "id": "device_unrecognized_99b", "type": "device", "label": "Device 99b" },
  "nodes": [
    { "id": "user_101", "label": "User: Rituraj M.", "group": "user" },
    { "id": "device_unrecognized_99b", "label": "Hardware Signature 99b", "group": "device", "isSuspicious": true },
    { "id": "receiver_scammer_upi", "label": "scammer@upi", "group": "receiver", "isSuspicious": true },
    { "id": "user_102", "label": "User: Victim 2", "group": "user" }
  ],
  "edges": [
    { "from": "user_101", "to": "device_unrecognized_99b", "label": "LOGGED_IN_FROM" },
    { "from": "user_102", "to": "device_unrecognized_99b", "label": "LOGGED_IN_FROM" },
    { "from": "user_101", "to": "receiver_scammer_upi", "label": "SENT_PAYMENT" }
  ],
  "syndicateDetected": true,
  "clusterName": "Shared Device Ring Beta"
}
```

---

## 4. Socket.IO Real-Time Event Protocols

### Event Catalog

| Event Name | Direction | Room | Payload Contents |
|---|---|---|---|
| `HIGH_RISK_TRANSACTION` | Server → Client | `admin` | Full transaction payload, risk scores, and XAI reasons |
| `VOICE_RISK_DETECTED` | Server → Client | `admin` | Detected scam categories, urgency level, and user ID |
| `FRAUD_CASE_CREATED` | Server → Client | `admin` | Newly spawned fraud investigation case ID & metadata |
| `FRAUD_CASE_UPDATED` | Server → Client | `admin` | Updated case status (`CONFIRMED_FRAUD`, `FALSE_POSITIVE`) |
| `FRAUD_RISK_UPDATED` | Server → Client | `user:{id}` | Real-time risk update for user's pending transaction |
| `SECURITY_ALERT` | Server → Client | `user:{id}` | Device change or unauthorized login notification |
