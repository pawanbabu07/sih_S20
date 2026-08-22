# API Specification — Explainable Real-Time Fraud Shield

## Base URL
- Development: `http://localhost:5000`
- Production: Configured via environment `PORT` and `CLIENT_URL`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Create a new user account with hashed password.

- **Request Body**:
```json
{
  "name": "Rituraj Mohanty",
  "email": "user@sih.in",
  "password": "Password123!",
  "phone": "+919876543210"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "Rituraj Mohanty",
    "email": "user@sih.in",
    "role": "user"
  }
}
```

### `POST /api/auth/login`
Authenticate user with email and password.

- **Request Body**:
```json
{
  "email": "user@sih.in",
  "password": "Password123!"
}
```
- **Response (200 OK)**: Returns JWT token and minimal user payload.

---

## 2. Transactions & Payment Simulation

### `POST /api/transactions`
Simulate a UPI transaction.

- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
```json
{
  "amount": 40000,
  "receiverId": "unknown_merchant@upi",
  "receiverName": "Unknown Receiver",
  "transactionType": "UPI",
  "deviceId": "device_unrecognized_b99",
  "location": "Kolkata",
  "transactionHour": 2,
  "isNewReceiver": true,
  "isNewDevice": true
}
```

### `POST /api/transactions/:id/confirm`
Confirm payment after warning review.

- **Headers**: `Authorization: Bearer <JWT>`
- **Response (200 OK)**: Status updated to `COMPLETED`. Emits `TRANSACTION_STATUS_CHANGED`.

### `POST /api/transactions/:id/cancel`
Cancel suspicious transaction.

- **Headers**: `Authorization: Bearer <JWT>`
- **Response (200 OK)**: Status updated to `CANCELLED`. Emits `TRANSACTION_STATUS_CHANGED`.

---

## 3. Real-Time Risk Engine & Fraud Analysis

### `POST /api/fraud/check`
Main evaluation endpoint integrating ML, Behavioral, Device, Voice, and Graph signals.

- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
```json
{
  "amount": 40000,
  "receiverId": "unknown_scammer@upi",
  "receiverName": "Fake Support Hub",
  "transactionType": "UPI",
  "deviceId": "device_sih_demo_b99",
  "deviceInfo": {
    "deviceModel": "OnePlus 9",
    "os": "Android 13",
    "browser": "Chrome Mobile"
  },
  "location": "Kolkata",
  "transactionHour": 2,
  "voiceAnalysisId": "66c74... (optional)"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "transactionId": "66c74...",
  "riskScore": 91,
  "riskLevel": "HIGH",
  "fraudProbability": 0.89,
  "isSuspicious": true,
  "recommendedAction": "BLOCK_TRANSACTION",
  "signals": [
    "AMOUNT_ANOMALY",
    "TIME_ANOMALY",
    "NEW_RECEIVER",
    "NEW_DEVICE",
    "PATTERN_SHARED_DEVICE"
  ],
  "reasons": [
    "Transaction amount (₹40,000) exceeds normal limit (₹5,000)",
    "Transaction occurred at unusual hour (2 AM)",
    "New recipient not in transaction history",
    "Unrecognized hardware device signature",
    "Device signature links 4 distinct accounts (shared syndicate pattern)"
  ],
  "patterns": ["PATTERN_SHARED_DEVICE"],
  "componentScores": {
    "transactionML": 88,
    "behavioral": 92,
    "deviceRisk": 80,
    "voice": null,
    "graph": 85
  }
}
```

---

## 4. Real-Time Event Streaming & History (Phase 9)

### `GET /api/events`
Get real-time risk events history.

- **Auth**: Bearer JWT
- **Normal Users**: Returns strictly their own historical events.
- **Admin**: Returns platform-wide events with optional filters.
- **Query Params**:
  - `eventType`: `HIGH_RISK_TRANSACTION`, `VOICE_RISK_DETECTED`, `DEVICE_CHANGE_DETECTED`, etc.
  - `riskLevel`: `HIGH`, `MEDIUM`, `LOW`
  - `timeRange`: `5m`, `15m`, `1h`, `24h`, `all`
  - `limit`: Default 50
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 12,
  "events": [
    {
      "eventId": "evt_1724308920_a1f9",
      "eventType": "HIGH_RISK_TRANSACTION",
      "riskScore": 91,
      "riskLevel": "HIGH",
      "amount": 40000,
      "receiverId": "unknown@upi",
      "signals": ["NEW_DEVICE", "TIME_ANOMALY"],
      "reasons": ["New device signature", "Unusual late hour"],
      "timestamp": "2026-08-22T06:15:20.000Z"
    }
  ]
}
```

---

## 5. Admin Portal & Telemetry (Admin Role Required)

### `GET /api/admin/system-health`
Returns status of backend, database, ML service, socket engine, and real-time throughput metrics.

- **Auth**: Bearer JWT (`role: 'admin'`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "services": {
    "backend": "online",
    "database": "online",
    "ml": "online",
    "socket": "online"
  },
  "metrics": {
    "connectedUsers": 4,
    "connectedAdmins": 1,
    "eventsLastMinute": 6,
    "fraudEventsLastMinute": 2,
    "averageRiskScore": 58
  }
}
```

### `GET /api/admin/fraud-graph/:type/:id`
Multi-hop relationship graph traversal (1–3 hops).

### `GET /api/admin/fraud-clusters`
Returns list of detected coordinated fraud syndicates.

### `GET /api/admin/model-health`
Returns machine learning health metrics and live drift rates.

### `PATCH /api/admin/fraud-cases/:id/status`
Update case status (`UNDER_REVIEW`, `CONFIRMED_FRAUD`, `RESOLVED`, `FALSE_POSITIVE`). Emits `FRAUD_CASE_UPDATED`.

---

## 6. Socket.IO Streaming Specifications

### Connection Handshake
- **URL**: `ws://localhost:5000` or `http://localhost:5000`
- **Auth**: `{ auth: { token: "<JWT>" } }`

### Socket Rooms
| Room | Access | Purpose |
|---|---|---|
| `user:{userId}` | Private to authenticated user | Receives `FRAUD_RISK_UPDATED`, `DEVICE_CHANGE_DETECTED`, `SECURITY_ALERT` |
| `admin` | Restricted to `role === 'admin'` | Receives `HIGH_RISK_TRANSACTION`, `VOICE_RISK_DETECTED`, `FRAUD_CASE_CREATED` |
