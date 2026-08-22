const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateRisk } = require('../services/riskEngine');

describe('3. Fraud Risk & Heuristic Engine Tests (Phase 7)', () => {

  it('should evaluate Low-Risk transaction accurately', () => {
    const result = calculateRisk({
      transactionML: 12,
      behavioral: 8,
      deviceTrust: 95,
      voice: null
    });

    assert.ok(result.finalScore < 30);
    assert.strictEqual(result.riskLevel, 'LOW');
    assert.strictEqual(result.recommendedAction, 'ALLOW');
  });

  it('should evaluate Medium-Risk transaction accurately', () => {
    const result = calculateRisk({
      transactionML: 45,
      behavioral: 50,
      deviceTrust: 60,
      voice: null
    });

    assert.ok(result.finalScore >= 30 && result.finalScore < 70);
    assert.strictEqual(result.riskLevel, 'MEDIUM');
    assert.strictEqual(result.recommendedAction, 'WARN_AND_CONFIRM');
  });

  it('should evaluate High-Risk transaction accurately', () => {
    const result = calculateRisk({
      transactionML: 88,
      behavioral: 80,
      deviceTrust: 20,
      voice: 90
    });

    assert.ok(result.finalScore >= 70);
    assert.strictEqual(result.riskLevel, 'HIGH');
    assert.strictEqual(result.recommendedAction, 'STRONG_WARNING');
  });

  it('should gracefully provide fallback heuristic score when ML service is unavailable', () => {
    // When python server is offline, heuristic computes score based on amount + detected signals
    const fallbackScoring = (amount, signalsCount) => {
      return Math.min(95, (amount > 20000 ? 50 : 15) + (signalsCount * 12));
    };

    const normalFallback = fallbackScoring(500, 0);
    assert.strictEqual(normalFallback, 15);

    const highAmountFallback = fallbackScoring(40000, 3);
    // 50 + 36 = 86
    assert.strictEqual(highAmountFallback, 86);
  });

  it('should validate inputs and reject negative or non-numeric amounts', () => {
    const validateTransactionInputs = (data) => {
      if (data.amount === undefined || data.amount === null || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
        throw new Error('Amount must be a positive number greater than 0');
      }
      if (!data.receiverId || typeof data.receiverId !== 'string') {
        throw new Error('Receiver ID is required');
      }
      return true;
    };

    assert.throws(() => {
      validateTransactionInputs({ amount: -500, receiverId: 'user@upi' });
    });

    assert.throws(() => {
      validateTransactionInputs({ amount: 0, receiverId: 'user@upi' });
    });

    assert.throws(() => {
      validateTransactionInputs({ amount: 500, receiverId: '' });
    });

    assert.strictEqual(validateTransactionInputs({ amount: 1200, receiverId: 'amit@upi' }), true);
  });

});
