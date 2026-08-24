const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// FraudShield Real-Time Security Gateway Server
dotenv.config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const fraudRoutes = require('./routes/fraudRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const riskRoutes = require('./routes/riskRoutes');
const securityRoutes = require('./routes/securityRoutes');
const alertRoutes = require('./routes/alertRoutes');
const eventRoutes = require('./routes/eventRoutes');
const modelRoutes = require('./routes/modelRoutes');
const { getRiskHistory } = require('./controllers/riskController');
const { protect } = require('./middleware/authMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const socketService = require('./services/socketService');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO with HTTP Server
socketService.initSocket(httpServer);

// Security Headers with Helmet
app.use(helmet());

// CORS Configuration — strict in production, flexible in development
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL].filter(Boolean)
  : [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));

// Rate Limiting Middlewares
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Reasonable max requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 attempts per minute to prevent brute-force while allowing active testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 1 minute.'
  }
});

const analysisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many analysis requests. Please try again after 1 minute.'
  }
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/fraud', analysisLimiter);
app.use('/api/risk', analysisLimiter);
app.use('/api/voice/analyze', analysisLimiter);

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fraud Shield API Running'
  });
});

// Comprehensive Health Check Route (Requirement 13)
app.get('/health', async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  let mlServiceStatus = 'unavailable';

  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    const mlRes = await axios.get(`${mlUrl}/health`, { timeout: 2000 });
    if (mlRes.data && mlRes.data.success) {
      mlServiceStatus = 'available';
    }
  } catch (err) {
    mlServiceStatus = 'unavailable';
  }

  const socketIO = socketService.getIO();

  res.status(200).json({
    success: true,
    server: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    mlService: mlServiceStatus,
    socketService: Boolean(socketIO) ? 'online' : 'offline'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin/models', modelRoutes);
app.get('/api/users/risk-history', protect, getRiskHistory);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running with Socket.IO in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

app.httpServer = httpServer;

module.exports = app;
module.exports.app = app;
module.exports.httpServer = httpServer;
