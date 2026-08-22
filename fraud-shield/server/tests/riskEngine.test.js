const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateRisk, DEFAULT_WEIGHTS } = require('../services/riskEngine');
const { detectBehaviorAnomalies } = require('../services/behaviorService');
const { hashIpAddress, getTrustCategory } = require('../services/deviceService');

describe('Central Real-Time Risk Engine — Unit Tests (Phase 6)', () => {

  describe('1. calculateRisk() Composite Formula Tests', () => {
    it('should evaluate Safe scenario as LOW risk level', () => {
      // Transaction = 10, Behavior = 10, Device Trust = 90 (device risk = 10), Voice = 0
      const result = calculateRisk({
        transactionML: 10,
        behavioral: 10,
        deviceTrust: 90,
        voice: 0
      });

      // 10 * 0.40 = 4.0
      // 10 * 0.25 = 2.5
      // 10 * 0.15 = 1.5
      // 0 * 0.20 = 0.0
      // Sum = 8.0 -> 8
      assert.strictEqual(result.finalScore, 8);
      assert.strictEqual(result.riskLevel, 'LOW');
      assert.strictEqual(result.recommendedAction, 'ALLOW');
    });

    it('should evaluate Medium scenario as MEDIUM risk level', () => {
      // Transaction = 50, Behavior = 50, Device Trust = 50 (device risk = 50), Voice = 0
      const result = calculateRisk({
        transactionML: 50,
        behavioral: 50,
        deviceTrust: 50,
        voice: 0
      });

      // 50 * 0.30 = 15.0
      // 50 * 0.20 = 10.0
      // 50 * 0.15 = 7.5
      // 0 * 0.15 = 0.0
      // Active sum = 0.80 -> 32.5 / 0.80 = 40.6 -> 41
      assert.strictEqual(result.finalScore, 41);
      assert.strictEqual(result.riskLevel, 'MEDIUM');
      assert.strictEqual(result.recommendedAction, 'WARN_AND_CONFIRM');
    });

    it('should evaluate High scenario as HIGH risk level', () => {
      // Transaction = 90, Behavior = 85, Device Trust = 20 (device risk = 80), Voice = 95
      const result = calculateRisk({
        transactionML: 90,
        behavioral: 85,
        deviceTrust: 20,
        voice: 95
      });

      // 90 * 0.30 = 27.0
      // 85 * 0.20 = 17.0
      // 80 * 0.15 = 12.0
      // 95 * 0.15 = 14.25
      // Active sum = 0.80 -> 70.25 / 0.80 = 87.8 -> 88
      assert.strictEqual(result.finalScore, 88);
      assert.strictEqual(result.riskLevel, 'HIGH');
      assert.strictEqual(result.recommendedAction, 'STRONG_WARNING');
    });

    it('should properly normalize weights when voice signal is absent', () => {
      // Transaction = 80, Behavior = 75, Device Trust = 40 (device risk = 60), Voice = null
      const result = calculateRisk({
        transactionML: 80,
        behavioral: 75,
        deviceTrust: 40,
        voice: null
      });

      // Active sum = 0.30 + 0.20 + 0.15 = 0.65
      // 80 * 0.30 = 24.0
      // 75 * 0.20 = 15.0
      // 60 * 0.15 = 9.0
      // Sum = 48.0 / 0.65 = 73.846 -> 74
      assert.strictEqual(result.finalScore, 74);
      assert.strictEqual(result.riskLevel, 'HIGH');
    });
  });

  describe('2. Behavioral Baseline Anomaly Detection Tests', () => {
    const mockBaseline = {
      averageTransactionAmount: 1000,
      maximumNormalAmount: 5000,
      averageDailyTransactions: 3,
      usualTransactionHours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      usualLocations: ['Delhi', 'Noida'],
      knownReceivers: ['rahul@upi', 'amit@upi'],
      knownDevices: ['device_laptop_1'],
      averageTransactionFrequency: 2
    };

    it('should detect AMOUNT_ANOMALY when transaction amount exceeds normal maximum', () => {
      const anomalies = detectBehaviorAnomalies(mockBaseline, {
        amount: 40000,
        transactionHour: 14,
        receiverId: 'rahul@upi',
        location: 'Delhi',
        deviceId: 'device_laptop_1'
      });

      assert.ok(anomalies.signals.includes('AMOUNT_ANOMALY'));
      assert.ok(anomalies.reasons.some(r => r.includes('normal pattern')));
    });

    it('should detect TIME_ANOMALY when transaction occurs in unusual hours (e.g. 2 AM)', () => {
      const anomalies = detectBehaviorAnomalies(mockBaseline, {
        amount: 500,
        transactionHour: 2,
        receiverId: 'rahul@upi',
        location: 'Delhi',
        deviceId: 'device_laptop_1'
      });

      assert.ok(anomalies.signals.includes('TIME_ANOMALY'));
      assert.ok(anomalies.reasons.some(r => r.includes('usual transaction hours')));
    });

    it('should detect NEW_RECEIVER anomaly when receiver has not transacted before', () => {
      const anomalies = detectBehaviorAnomalies(mockBaseline, {
        amount: 500,
        transactionHour: 12,
        receiverId: 'unknown_attacker@upi',
        location: 'Delhi',
        deviceId: 'device_laptop_1'
      });

      assert.ok(anomalies.signals.includes('NEW_RECEIVER'));
      assert.ok(anomalies.reasons.some(r => r.includes('recipient has not previously appeared')));
    });

    it('should detect NEW_DEVICE anomaly for unfamiliar device IDs', () => {
      const anomalies = detectBehaviorAnomalies(mockBaseline, {
        amount: 500,
        transactionHour: 12,
        receiverId: 'rahul@upi',
        location: 'Delhi',
        deviceId: 'unrecognized_phone_99'
      }, true);

      assert.ok(anomalies.signals.includes('NEW_DEVICE'));
      assert.ok(anomalies.reasons.some(r => r.includes('device not previously associated')));
    });

    it('should detect LOCATION_ANOMALY when payment is made from unusual city', () => {
      const anomalies = detectBehaviorAnomalies(mockBaseline, {
        amount: 500,
        transactionHour: 12,
        receiverId: 'rahul@upi',
        location: 'Goa',
        deviceId: 'device_laptop_1'
      });

      assert.ok(anomalies.signals.includes('LOCATION_ANOMALY'));
      assert.ok(anomalies.reasons.some(r => r.includes('location differs')));
    });

    it('should detect FREQUENCY_ANOMALY during rapid multiple transactions or failures', () => {
      const anomalies = detectBehaviorAnomalies(mockBaseline, {
        amount: 500,
        transactionHour: 12,
        receiverId: 'rahul@upi',
        location: 'Delhi',
        deviceId: 'device_laptop_1',
        transactionFrequency: 12,
        failedTransactions: 4
      });

      assert.ok(anomalies.signals.includes('FREQUENCY_ANOMALY'));
    });
  });

  describe('3. Device Trust Score Categorization Tests', () => {
    it('should categorize 0–29 as UNKNOWN', () => {
      assert.strictEqual(getTrustCategory(20), 'UNKNOWN');
      assert.strictEqual(getTrustCategory(0), 'UNKNOWN');
    });

    it('should categorize 30–69 as UNTRUSTED', () => {
      assert.strictEqual(getTrustCategory(30), 'UNTRUSTED');
      assert.strictEqual(getTrustCategory(55), 'UNTRUSTED');
      assert.strictEqual(getTrustCategory(69), 'UNTRUSTED');
    });

    it('should categorize 70–100 as TRUSTED', () => {
      assert.strictEqual(getTrustCategory(70), 'TRUSTED');
      assert.strictEqual(getTrustCategory(85), 'TRUSTED');
      assert.strictEqual(getTrustCategory(100), 'TRUSTED');
    });
  });

  describe('4. Privacy & Hashing Requirements Tests', () => {
    it('should hash IP addresses with SHA-256 for privacy compliance', () => {
      const rawIp = '192.168.1.100';
      const hash = hashIpAddress(rawIp);

      assert.notStrictEqual(hash, rawIp);
      assert.strictEqual(typeof hash, 'string');
      assert.strictEqual(hash.length, 64); // 256-bit hex string is exactly 64 characters
    });

    it('should handle empty/missing IP safely', () => {
      assert.strictEqual(hashIpAddress(''), '');
      assert.strictEqual(hashIpAddress(null), '');
    });
  });

});
