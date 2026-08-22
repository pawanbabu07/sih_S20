const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateRisk } = require('../services/riskEngine');
const { detectBehaviorAnomalies } = require('../services/behaviorService');
const { hashIpAddress, getTrustCategory } = require('../services/deviceService');

describe('Phase 6 SIH End-to-End Multi-Signal Scenario Tests', () => {

  it('SIH Final Demo Scenario: Device B + New Receiver + ₹40,000 + 2 AM + Voice Urgency', () => {
    // 1. User Baseline Profile
    const baseline = {
      averageTransactionAmount: 1250,
      maximumNormalAmount: 5000,
      averageDailyTransactions: 4,
      usualTransactionHours: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      usualLocations: ['Bhubaneswar', 'Delhi'],
      knownReceivers: ['amit@upi', 'shop_a@upi', 'shop_b@upi'],
      knownDevices: ['device_win_primary_123'],
      averageTransactionFrequency: 2
    };

    // 2. Incoming Attack Transaction:
    // Device B (unrecognized, trustScore = 20)
    // New Receiver (rahul_unknown@upi)
    // Amount = 40,000 (>> 5,000 max normal)
    // Hour = 2 AM (outside usual 10-20)
    // Location = Jamshedpur (unusual location)
    // Frequency = 15 (>> 2 avg freq)
    const incomingTx = {
      amount: 40000,
      receiverId: 'rahul_unknown@upi',
      receiverName: 'Rahul',
      deviceId: 'device_sih_demo_b99',
      location: 'Jamshedpur',
      locationChange: true,
      transactionHour: 2,
      failedTransactions: 3,
      transactionFrequency: 15
    };

    // 3. Detect Behavioral Anomalies
    const behaviorResult = detectBehaviorAnomalies(baseline, incomingTx, true);

    assert.ok(behaviorResult.signals.includes('AMOUNT_ANOMALY'), 'Should detect amount anomaly');
    assert.ok(behaviorResult.signals.includes('TIME_ANOMALY'), 'Should detect time anomaly');
    assert.ok(behaviorResult.signals.includes('NEW_RECEIVER'), 'Should detect new receiver');
    assert.ok(behaviorResult.signals.includes('NEW_DEVICE'), 'Should detect new device');
    assert.ok(behaviorResult.signals.includes('LOCATION_ANOMALY'), 'Should detect location anomaly');
    assert.ok(behaviorResult.signals.includes('FREQUENCY_ANOMALY'), 'Should detect frequency anomaly');
    assert.ok(behaviorResult.score >= 80, 'Behavior score should be high due to combined anomalies');

    // 4. Voice Phishing Analysis (Detected pressure, OTP request, urgency)
    const voicePhishingScore = 95; // High urgency/pressure detected

    // 5. ML Model Transaction Score
    const mlTransactionScore = 92; // High probability from Random Forest

    // 6. Device Trust Score
    const deviceTrustScore = 20; // New device starts at 20 -> device risk = 80

    // 7. Central Real-Time Risk Engine Calculation
    const centralRisk = calculateRisk({
      transactionML: mlTransactionScore,
      behavioral: behaviorResult.score,
      deviceTrust: deviceTrustScore,
      voice: voicePhishingScore
    });

    // 92 * 0.40 = 36.8
    // 100 * 0.25 = 25.0
    // 80 * 0.15 = 12.0
    // 95 * 0.20 = 19.0
    // Sum = 92.8 -> 93
    assert.ok(centralRisk.finalScore >= 90, `Final risk score (${centralRisk.finalScore}) should exceed 90`);
    assert.strictEqual(centralRisk.riskLevel, 'HIGH');
    assert.strictEqual(centralRisk.recommendedAction, 'STRONG_WARNING');

    // 8. Explainability verification
    assert.ok(behaviorResult.reasons.length >= 4, 'Must provide detailed human-readable explainable reasons');
  });

  it('Safe Payment Verification Scenario: Familiar Device + Known Receiver + Normal Amount + Usual Hours', () => {
    const baseline = {
      averageTransactionAmount: 1250,
      maximumNormalAmount: 5000,
      usualTransactionHours: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      usualLocations: ['Bhubaneswar'],
      knownReceivers: ['amit@upi'],
      knownDevices: ['device_win_primary_123'],
      averageTransactionFrequency: 2
    };

    const safeTx = {
      amount: 450,
      receiverId: 'amit@upi',
      deviceId: 'device_win_primary_123',
      location: 'Bhubaneswar',
      transactionHour: 14,
      transactionFrequency: 1,
      failedTransactions: 0
    };

    const behaviorResult = detectBehaviorAnomalies(baseline, safeTx, false);
    assert.strictEqual(behaviorResult.signals.length, 0, 'No anomalies should be flagged for normal transaction');
    assert.strictEqual(behaviorResult.score, 0);

    const centralRisk = calculateRisk({
      transactionML: 8,
      behavioral: behaviorResult.score,
      deviceTrust: 95, // Established trusted device
      voice: null
    });

    assert.ok(centralRisk.finalScore < 30, `Safe score (${centralRisk.finalScore}) should be < 30`);
    assert.strictEqual(centralRisk.riskLevel, 'LOW');
    assert.strictEqual(centralRisk.recommendedAction, 'ALLOW');
  });

  it('Device Trust Lifecycle: Upgrade from Untrusted (20) to Trusted (85)', () => {
    // When user marks a device as trusted:
    const initialScore = 20;
    assert.strictEqual(getTrustCategory(initialScore), 'UNKNOWN');

    const upgradedScore = 85;
    assert.strictEqual(getTrustCategory(upgradedScore), 'TRUSTED');

    // Evaluate risk before and after trust upgrade
    const riskBefore = calculateRisk({
      transactionML: 30,
      behavioral: 30,
      deviceTrust: initialScore,
      voice: null
    });

    const riskAfter = calculateRisk({
      transactionML: 30,
      behavioral: 30,
      deviceTrust: upgradedScore,
      voice: null
    });

    assert.ok(riskAfter.finalScore < riskBefore.finalScore, 'Trusted device must reduce composite device risk');
  });

});
