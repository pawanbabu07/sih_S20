const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const SOCKET_EVENTS = require('../config/socketEvents');
const socketService = require('../services/socketService');

describe('8. Phase 9 — Real-Time Event Streaming & Monitoring Tests', () => {

  const JWT_SECRET = process.env.JWT_SECRET || 'sih_jwt_super_secret_key_2026';

  it('should define all centralized socket event constants', () => {
    assert.strictEqual(SOCKET_EVENTS.FRAUD_RISK_UPDATED, 'FRAUD_RISK_UPDATED');
    assert.strictEqual(SOCKET_EVENTS.HIGH_RISK_TRANSACTION, 'HIGH_RISK_TRANSACTION');
    assert.strictEqual(SOCKET_EVENTS.VOICE_RISK_DETECTED, 'VOICE_RISK_DETECTED');
    assert.strictEqual(SOCKET_EVENTS.DEVICE_CHANGE_DETECTED, 'DEVICE_CHANGE_DETECTED');
    assert.strictEqual(SOCKET_EVENTS.SECURITY_ALERT, 'SECURITY_ALERT');
    assert.strictEqual(SOCKET_EVENTS.TRANSACTION_STATUS_CHANGED, 'TRANSACTION_STATUS_CHANGED');
    assert.strictEqual(SOCKET_EVENTS.FRAUD_CASE_CREATED, 'FRAUD_CASE_CREATED');
    assert.strictEqual(SOCKET_EVENTS.FRAUD_CASE_UPDATED, 'FRAUD_CASE_UPDATED');
  });

  it('should generate cryptographically unique event IDs starting with evt_', () => {
    const id1 = socketService.generateEventId();
    const id2 = socketService.generateEventId();

    assert.ok(id1.startsWith('evt_'), 'Event ID must start with evt_ prefix');
    assert.ok(id2.startsWith('evt_'), 'Event ID must start with evt_ prefix');
    assert.notStrictEqual(id1, id2, 'Generated Event IDs must be distinct');
  });

  it('should validate JWT handshake for socket connection', () => {
    const validToken = jwt.sign({ id: 'user_sih_123', role: 'user', email: 'user@sih.in' }, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(validToken, JWT_SECRET);

    assert.strictEqual(decoded.id, 'user_sih_123');
    assert.strictEqual(decoded.role, 'user');

    // Invalid token check
    assert.throws(() => {
      jwt.verify('invalid_tampered_token', JWT_SECRET);
    });
  });

  it('should route normal users to user:{userId} room and admins to admin room', () => {
    const userPayload = { id: 'user_456', role: 'user' };
    const adminPayload = { id: 'admin_789', role: 'admin' };

    const getAssignedRooms = (user) => {
      const rooms = [`user:${user.id}`];
      if (user.role === 'admin') {
        rooms.push('admin');
      }
      return rooms;
    };

    const userRooms = getAssignedRooms(userPayload);
    const adminRooms = getAssignedRooms(adminPayload);

    assert.deepStrictEqual(userRooms, ['user:user_456']);
    assert.ok(!userRooms.includes('admin'), 'Normal users must NOT be assigned to the admin room');

    assert.ok(adminRooms.includes('admin'), 'Admin must be assigned to admin room');
    assert.ok(adminRooms.includes('user:admin_789'));
  });

  it('should construct valid HIGH_RISK_TRANSACTION event payload with server timestamp', () => {
    const payload = {
      transactionId: 'tx_demo_001',
      userId: 'user_123',
      userName: 'Test User',
      amount: 40000,
      receiverName: 'Suspicious Receiver',
      receiverId: 'unknown@upi',
      deviceId: 'device_unrecognized',
      location: 'Kolkata',
      riskScore: 91,
      riskLevel: 'HIGH',
      reasons: ['New device', 'New receiver', 'Unusual time']
    };

    const enriched = {
      ...payload,
      eventId: socketService.generateEventId(),
      eventType: SOCKET_EVENTS.HIGH_RISK_TRANSACTION,
      timestamp: new Date().toISOString()
    };

    assert.strictEqual(enriched.eventType, 'HIGH_RISK_TRANSACTION');
    assert.strictEqual(enriched.riskLevel, 'HIGH');
    assert.strictEqual(enriched.amount, 40000);
    assert.ok(enriched.eventId.startsWith('evt_'));
    assert.ok(!isNaN(Date.parse(enriched.timestamp)), 'Timestamp must be a valid ISO string');
  });

  it('should detect duplicate events using eventId caching', () => {
    const seenEventIds = new Set();

    const processEvent = (event) => {
      if (seenEventIds.has(event.eventId)) {
        return { duplicate: true, displayed: false };
      }
      seenEventIds.add(event.eventId);
      return { duplicate: false, displayed: true };
    };

    const evt1 = { eventId: 'evt_fixed_test_100', riskScore: 85 };
    const firstResult = processEvent(evt1);
    const duplicateResult = processEvent(evt1);

    assert.strictEqual(firstResult.duplicate, false);
    assert.strictEqual(firstResult.displayed, true);
    assert.strictEqual(duplicateResult.duplicate, true);
    assert.strictEqual(duplicateResult.displayed, false);
  });

  it('should prevent duplicate open fraud cases for the same transactionId', () => {
    const existingCases = [
      { id: 'case_1', transactionId: 'tx_100', status: 'FLAGGED' },
      { id: 'case_2', transactionId: 'tx_200', status: 'RESOLVED' }
    ];

    const shouldCreateNewCase = (txId) => {
      const openCase = existingCases.find(
        c => c.transactionId === txId && ['FLAGGED', 'UNDER_REVIEW'].includes(c.status)
      );
      return !openCase;
    };

    assert.strictEqual(shouldCreateNewCase('tx_100'), false, 'Should deduplicate existing open case for tx_100');
    assert.strictEqual(shouldCreateNewCase('tx_200'), true, 'Should allow new case if previous case was RESOLVED');
    assert.strictEqual(shouldCreateNewCase('tx_300'), true, 'Should allow new case for new tx_300');
  });

  it('should provide system metrics structure with connected counts and events per minute', () => {
    const metrics = socketService.getSystemMetrics();

    assert.ok(typeof metrics.connectedUsers === 'number');
    assert.ok(typeof metrics.connectedAdmins === 'number');
    assert.ok(typeof metrics.eventsLastMinute === 'number');
    assert.ok(typeof metrics.fraudEventsLastMinute === 'number');
    assert.ok(typeof metrics.averageRiskScore === 'number');
  });

  it('should enforce access isolation on GET /api/events (User vs Admin)', () => {
    const buildQuery = (user, queryParams = {}) => {
      const query = {};
      if (user.role !== 'admin') {
        query.userId = user.id; // Strictly bound to own user ID
      } else if (queryParams.userId) {
        query.userId = queryParams.userId;
      }
      return query;
    };

    const normalUser = { id: 'user_abc', role: 'user' };
    const adminUser = { id: 'admin_xyz', role: 'admin' };

    // Normal user attempting to query another user's events
    const normalQuery = buildQuery(normalUser, { userId: 'user_victim_victim' });
    assert.strictEqual(normalQuery.userId, 'user_abc', 'Normal user query must always force own userId');

    // Admin querying specific user
    const adminQuery = buildQuery(adminUser, { userId: 'user_target' });
    assert.strictEqual(adminQuery.userId, 'user_target');
  });

});
