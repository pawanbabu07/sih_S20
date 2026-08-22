const express = require('express');
const router = express.Router();
const { 
  analyzeVoiceCall, 
  submitFeedback, 
  getVoiceHistory, 
  getVoiceAnalysisById 
} = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protect all routes
router.use(protect);

// Analyze route can accept json or multipart audio upload
router.post('/analyze', upload.single('audio'), analyzeVoiceCall);

// Feedback, history logs, and get by ID routes
router.post('/feedback', submitFeedback);
router.get('/history', getVoiceHistory);
router.get('/:id', getVoiceAnalysisById);

module.exports = router;
