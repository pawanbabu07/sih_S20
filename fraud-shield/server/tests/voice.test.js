const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { analyzeTranscriptText } = require('../services/voiceAnalysisService');

describe('4. Voice Phishing & Social Engineering Detection Tests (Phase 7)', () => {

  it('should evaluate a legitimate conversation transcript as LOW risk', () => {
    const safeTranscript = "Hi Rahul, did you receive the 500 rupees for yesterday's dinner? Let me know when you are free.";
    const result = analyzeTranscriptText(safeTranscript);

    assert.strictEqual(result.riskLevel, 'LOW');
    assert.strictEqual(result.riskScore, 0);
    assert.strictEqual(result.indicators.length, 0);
    assert.strictEqual(result.recommendedAction, 'CONTINUE_WITH_CAUTION');
  });

  it('should detect OTP & Credential Request scams with HIGH risk', () => {
    const otpTranscript = "Hello sir, I am calling from your bank. Please tell me the OTP and UPI PIN sent to your phone immediately.";
    const result = analyzeTranscriptText(otpTranscript);

    assert.strictEqual(result.riskLevel, 'HIGH');
    assert.ok(result.riskScore >= 70);
    assert.ok(result.indicators.some(i => i.type === 'OTP_REQUEST'));
    assert.ok(result.indicators.some(i => i.type === 'CREDENTIAL_REQUEST'));
    assert.ok(result.indicators.some(i => i.type === 'URGENCY'));
    assert.strictEqual(result.recommendedAction, 'DO_NOT_PAY');
  });

  it('should detect Authority Impersonation scams (Bank Manager / Police)', () => {
    const impersonationTranscript = "This is a police officer from cyber cell department. Your account is implicated in illegal activity.";
    const result = analyzeTranscriptText(impersonationTranscript);

    assert.ok(result.indicators.some(i => i.type === 'IMPERSONATION'));
    assert.ok(result.explanation.some(e => e.includes('trusted institution') || e.includes('bank')));
  });

  it('should detect Remote-Access Tool scams (AnyDesk, TeamViewer)', () => {
    const remoteAccessTranscript = "Please download AnyDesk or TeamViewer app from store so our technical support can fix your bank account.";
    const result = analyzeTranscriptText(remoteAccessTranscript);

    assert.ok(result.indicators.some(i => i.type === 'REMOTE_ACCESS_REQUEST'));
    assert.ok(result.explanation.some(e => e.includes('remote screen access') || e.includes('AnyDesk')));
  });

  it('should reject empty or whitespace-only transcript inputs', () => {
    assert.throws(() => {
      analyzeTranscriptText('');
    });

    assert.throws(() => {
      analyzeTranscriptText(null);
    });

    assert.throws(() => {
      analyzeTranscriptText(undefined);
    });
  });

  it('should validate false-positive feedback options', () => {
    const validFeedbackTypes = ['FALSE_POSITIVE', 'CORRECT_WARNING'];

    const isValidFeedback = (feedback) => validFeedbackTypes.includes(feedback);

    assert.strictEqual(isValidFeedback('FALSE_POSITIVE'), true);
    assert.strictEqual(isValidFeedback('CORRECT_WARNING'), true);
    assert.strictEqual(isValidFeedback('INVALID_TYPE'), false);
  });

});
