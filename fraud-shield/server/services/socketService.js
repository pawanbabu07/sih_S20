const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SOCKET_EVENTS = require('../config/socketEvents');

let io = null;

// Telemetry & metrics state
const connectedUsers = new Map(); // socketId -> { userId, role, email }
const connectedAdmins = new Set(); // socketIds
const recentEvents = []; // [{ timestamp, isFraud, riskScore }]

/**
 * Generate a cryptographically unique event ID with server timestamp
 */
const generateEventId = () => {
  return `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Clean up events older than 1 minute for sliding telemetry window
 */
const cleanOldEvents = () => {
  const cutoff = Date.now() - 60 * 1000;
  while (recentEvents.length > 0 && recentEvents[0].timestamp < cutoff) {
    recentEvents.shift();
  }
};

/**
 * Initialize Socket.IO server with production CORS and JWT authentication
 */
const initSocket = (httpServer) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL].filter(Boolean)
    : [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS origin not allowed for socket connection'), false);
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 20000,
    pingInterval: 10000
  });

  // JWT Authentication Middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
                    socket.handshake.query?.token;

      if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string') {
        return next(new Error('Authentication failed: Missing token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sih_jwt_super_secret_key_2026');
      socket.user = {
        id: decoded.id,
        role: decoded.role || 'user',
        email: decoded.email
      };
      next();
    } catch (err) {
      return next(new Error('Authentication failed: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    connectedUsers.set(socket.id, user);

    // Join user-specific private room
    socket.join(`user:${user.id}`);

    // If institutional admin, join admin room
    if (user.role === 'admin') {
      connectedAdmins.add(socket.id);
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      connectedAdmins.delete(socket.id);
    });
  });

  return io;
};

/**
 * Get active IO instance
 */
const getIO = () => io;

/**
 * Calculate system metrics and events-per-minute
 */
const getSystemMetrics = () => {
  cleanOldEvents();

  const uniqueUsers = new Set();
  connectedUsers.forEach((u) => {
    if (u.role !== 'admin') uniqueUsers.add(u.id);
  });

  const eventsLastMinute = recentEvents.length;
  const fraudEventsLastMinute = recentEvents.filter(e => e.isFraud).length;
  const averageRiskScore = recentEvents.length > 0
    ? Math.round(recentEvents.reduce((acc, e) => acc + (e.riskScore || 0), 0) / recentEvents.length)
    : 0;

  return {
    connectedUsers: uniqueUsers.size,
    connectedAdmins: connectedAdmins.size,
    totalActiveSockets: connectedUsers.size,
    eventsLastMinute,
    fraudEventsLastMinute,
    averageRiskScore
  };
};

/**
 * Record event in telemetry sliding window
 */
const recordMetricEvent = (riskScore = 0, isFraud = false) => {
  recentEvents.push({
    timestamp: Date.now(),
    riskScore: Number(riskScore) || 0,
    isFraud: Boolean(isFraud)
  });
  cleanOldEvents();
};

/**
 * Emit HIGH_RISK_TRANSACTION to admin room
 */
const emitHighRiskTransaction = (payload) => {
  if (!io) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.HIGH_RISK_TRANSACTION,
    timestamp
  };

  recordMetricEvent(payload.riskScore, true);
  io.to('admin').emit(SOCKET_EVENTS.HIGH_RISK_TRANSACTION, enrichedPayload);
  return enrichedPayload;
};

/**
 * Emit FRAUD_RISK_UPDATED to specific user room
 */
const emitFraudRiskUpdated = (userId, payload) => {
  if (!io || !userId) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.FRAUD_RISK_UPDATED,
    timestamp
  };

  recordMetricEvent(payload.riskScore, (payload.riskScore || 0) >= 70);
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.FRAUD_RISK_UPDATED, enrichedPayload);
  return enrichedPayload;
};

/**
 * Emit VOICE_RISK_DETECTED to admin room and user room
 */
const emitVoiceRiskDetected = (payload, userId = null) => {
  if (!io) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.VOICE_RISK_DETECTED,
    timestamp
  };

  recordMetricEvent(payload.riskScore, (payload.riskScore || 0) >= 70);
  io.to('admin').emit(SOCKET_EVENTS.VOICE_RISK_DETECTED, enrichedPayload);

  if (userId) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.VOICE_RISK_DETECTED, enrichedPayload);
  }
  return enrichedPayload;
};

/**
 * Emit DEVICE_CHANGE_DETECTED to specific user room
 */
const emitDeviceChangeDetected = (userId, payload) => {
  if (!io || !userId) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.DEVICE_CHANGE_DETECTED,
    timestamp
  };

  recordMetricEvent(payload.riskScore || 30, false);
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.DEVICE_CHANGE_DETECTED, enrichedPayload);
  return enrichedPayload;
};

/**
 * Emit SECURITY_ALERT to specific user room
 */
const emitSecurityAlert = (userId, payload) => {
  if (!io || !userId) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.SECURITY_ALERT,
    timestamp
  };

  io.to(`user:${userId}`).emit(SOCKET_EVENTS.SECURITY_ALERT, enrichedPayload);
  return enrichedPayload;
};

/**
 * Emit TRANSACTION_STATUS_CHANGED to user room and admin room
 */
const emitTransactionStatusChanged = (userId, payload) => {
  if (!io) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.TRANSACTION_STATUS_CHANGED,
    timestamp
  };

  if (userId) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.TRANSACTION_STATUS_CHANGED, enrichedPayload);
  }
  io.to('admin').emit(SOCKET_EVENTS.TRANSACTION_STATUS_CHANGED, enrichedPayload);
  return enrichedPayload;
};

/**
 * Emit FRAUD_CASE_CREATED to admin room
 */
const emitFraudCaseCreated = (payload) => {
  if (!io) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.FRAUD_CASE_CREATED,
    timestamp
  };

  io.to('admin').emit(SOCKET_EVENTS.FRAUD_CASE_CREATED, enrichedPayload);
  return enrichedPayload;
};

/**
 * Emit FRAUD_CASE_UPDATED to admin room and user room
 */
const emitFraudCaseUpdated = (userId, payload) => {
  if (!io) return null;
  const eventId = payload.eventId || generateEventId();
  const timestamp = payload.timestamp || new Date().toISOString();
  const enrichedPayload = {
    ...payload,
    eventId,
    eventType: SOCKET_EVENTS.FRAUD_CASE_UPDATED,
    timestamp
  };

  io.to('admin').emit(SOCKET_EVENTS.FRAUD_CASE_UPDATED, enrichedPayload);
  if (userId) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.FRAUD_CASE_UPDATED, {
      ...enrichedPayload,
      message: 'Your reported transaction case status has been updated by bank compliance.'
    });
  }
  return enrichedPayload;
};

module.exports = {
  initSocket,
  getIO,
  generateEventId,
  getSystemMetrics,
  emitHighRiskTransaction,
  emitFraudRiskUpdated,
  emitVoiceRiskDetected,
  emitDeviceChangeDetected,
  emitSecurityAlert,
  emitTransactionStatusChanged,
  emitFraudCaseCreated,
  emitFraudCaseUpdated
};
