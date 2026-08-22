const fs = require('fs');
const VoiceAnalysis = require('../models/VoiceAnalysis');
const VoiceFeedback = require('../models/VoiceFeedback');
const speechToTextService = require('../services/speechToTextService');
const voiceAnalysisService = require('../services/voiceAnalysisService');

/**
 * @desc    Analyze audio or transcript text for social engineering risk
 * @route   POST /api/voice/analyze
 * @access  Private
 */
const analyzeVoiceCall = async (req, res, next) => {
  let tempFilePath = null;
  try {
    const { transactionId } = req.body;
    let transcriptText = req.body.transcript;

    // Check if files are uploaded
    if (req.file) {
      tempFilePath = req.file.path;
      console.log(`VoiceController: Received audio file. Path: ${tempFilePath}, MimeType: ${req.file.mimetype}`);

      // Perform speech-to-text conversion
      transcriptText = await speechToTextService.transcribeAudio(tempFilePath);

      // Delete temporary audio files immediately to guarantee user privacy
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`VoiceController: Temporary file ${tempFilePath} deleted.`);
        }
        tempFilePath = null;
      } catch (err) {
        console.error(`VoiceController: Failed to cleanup temporary audio file:`, err.message);
      }
    }

    if (!transcriptText || typeof transcriptText !== 'string' || !transcriptText.trim()) {
      res.status(400);
      throw new Error('A transcript text or audio recording is required.');
    }

    // Call keyword detection service
    const results = voiceAnalysisService.analyzeTranscriptText(transcriptText);

    // Save calculations to MongoDB without saving raw voice
    const voiceAnalysis = new VoiceAnalysis({
      userId: req.user.id,
      transactionId: transactionId || null,
      riskScore: results.riskScore,
      riskLevel: results.riskLevel,
      indicators: results.indicators,
      explanation: results.explanation,
      recommendedAction: results.recommendedAction,
      transcriptAvailable: true,
      transcript: transcriptText
    });

    const savedAnalysis = await voiceAnalysis.save();

    // Real-Time Event Streaming & Logging (Phase 9)
    try {
      const RiskEvent = require('../models/RiskEvent');
      const socketService = require('../services/socketService');
      const eventId = socketService.generateEventId();

      if (results.riskLevel === 'HIGH') {
        await RiskEvent.create({
          eventId,
          userId: req.user.id,
          voiceAnalysisId: savedAnalysis._id,
          transactionId: transactionId || null,
          eventType: 'VOICE_RISK_DETECTED',
          riskScore: results.riskScore,
          riskLevel: results.riskLevel,
          signals: (results.indicators || []).map(i => i.label),
          reasons: Array.isArray(results.explanation) ? results.explanation : [results.explanation],
          metadata: {
            recommendedAction: results.recommendedAction
          },
          timestamp: new Date()
        });

        socketService.emitVoiceRiskDetected({
          eventId,
          voiceAnalysisId: savedAnalysis._id.toString(),
          userId: req.user.id,
          userName: req.user.name || 'User',
          riskScore: results.riskScore,
          riskLevel: results.riskLevel,
          indicators: results.indicators,
          explanation: results.explanation,
          timestamp: savedAnalysis.createdAt
        }, req.user.id);
      }
    } catch (evtErr) {
      console.warn('Real-time voice event emission error:', evtErr.message);
    }

    res.status(200).json({
      success: true,
      voiceAnalysis: savedAnalysis
    });

  } catch (error) {
    // Delete temporary file in case of exception
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error('VoiceController: Exception cleanup failed:', err.message);
      }
    }
    next(error);
  }
};

/**
 * @desc    Submit false positive reports or warning correctness feedback
 * @route   POST /api/voice/feedback
 * @access  Private
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { voiceAnalysisId, feedback } = req.body;

    if (!voiceAnalysisId || !feedback) {
      res.status(400);
      throw new Error('voiceAnalysisId and feedback fields are required.');
    }

    if (!['FALSE_POSITIVE', 'CORRECT_WARNING'].includes(feedback)) {
      res.status(400);
      throw new Error('Feedback must be either FALSE_POSITIVE or CORRECT_WARNING.');
    }

    const voiceAnalysis = await VoiceAnalysis.findById(voiceAnalysisId);
    if (!voiceAnalysis) {
      res.status(404);
      throw new Error('Voice analysis report not found.');
    }

    if (voiceAnalysis.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Forbidden: You can only submit feedback for your own transactions.');
    }

    // Store in feedbacks collection
    const voiceFeedback = new VoiceFeedback({
      userId: req.user.id,
      voiceAnalysisId,
      feedback
    });
    await voiceFeedback.save();

    // Cache directly inside analysis document
    voiceAnalysis.feedback = feedback;
    await voiceAnalysis.save();

    res.status(200).json({
      success: true,
      message: 'Feedback registered successfully.',
      voiceAnalysis
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user voice analysis logs
 * @route   GET /api/voice/history
 * @access  Private
 */
const getVoiceHistory = async (req, res, next) => {
  try {
    const history = await VoiceAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get voice analysis by ID
 * @route   GET /api/voice/:id
 * @access  Private
 */
const getVoiceAnalysisById = async (req, res, next) => {
  try {
    const analysis = await VoiceAnalysis.findById(req.params.id);
    
    if (!analysis) {
      res.status(404);
      throw new Error('Voice analysis report not found.');
    }

    if (analysis.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Access forbidden: This report belongs to another user.');
    }

    res.status(200).json({
      success: true,
      voiceAnalysis: analysis
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeVoiceCall,
  submitFeedback,
  getVoiceHistory,
  getVoiceAnalysisById
};
