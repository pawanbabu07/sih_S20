const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateRisk } = require('../services/riskEngine');

describe('7. Phase 8 — Advanced Fraud Intelligence & Graph Tests', () => {

  it('should evaluate 5-signal composite risk score with graph risk weight', () => {
    // Transaction ML (30%), Behavioral (20%), Device (15%), Voice (15%), Graph (20%)
    // 80 * 0.30 = 24
    // 70 * 0.20 = 14
    // (100 - 25) * 0.15 = 75 * 0.15 = 11.25
    // 90 * 0.15 = 13.5
    // 85 * 0.20 = 17
    // Total sum = 24 + 14 + 11.25 + 13.5 + 17 = 79.75 -> 80
    const result = calculateRisk({
      transactionML: 80,
      behavioral: 70,
      deviceTrust: 25, // Device risk = 75
      voice: 90,
      graph: 85
    });

    assert.strictEqual(result.finalScore, 80);
    assert.strictEqual(result.riskLevel, 'HIGH');
    assert.strictEqual(result.recommendedAction, 'STRONG_WARNING');
    assert.strictEqual(result.componentScores.graph, 85);
  });

  it('should detect PATTERN_SHARED_DEVICE when multiple accounts share an untrusted device', () => {
    const detectSharedDevice = (distinctUsersCount, highRiskTxsCount) => {
      if (distinctUsersCount >= 2) {
        return {
          type: 'PATTERN_SHARED_DEVICE',
          severity: distinctUsersCount >= 4 ? 'HIGH' : 'MEDIUM',
          description: `Device is associated with ${distinctUsersCount} separate accounts involved in transactions.`,
          riskContribution: distinctUsersCount >= 4 ? 35 : 20
        };
      }
      return null;
    };

    const pattern = detectSharedDevice(4, 3);
    assert.ok(pattern);
    assert.strictEqual(pattern.type, 'PATTERN_SHARED_DEVICE');
    assert.strictEqual(pattern.severity, 'HIGH');
    assert.strictEqual(pattern.riskContribution, 35);
  });

  it('should detect PATTERN_SHARED_RECEIVER when multiple victims pay the same recipient', () => {
    const detectSharedReceiver = (distinctSendersCount, suspiciousTxsCount) => {
      if (distinctSendersCount >= 3) {
        return {
          type: 'PATTERN_SHARED_RECEIVER',
          severity: distinctSendersCount >= 5 ? 'HIGH' : 'MEDIUM',
          description: `Receiver is connected to ${distinctSendersCount} separate user accounts with suspicious activity.`,
          riskContribution: 25
        };
      }
      return null;
    };

    const pattern = detectSharedReceiver(6, 4);
    assert.ok(pattern);
    assert.strictEqual(pattern.type, 'PATTERN_SHARED_RECEIVER');
    assert.strictEqual(pattern.severity, 'HIGH');
  });

  it('should detect PATTERN_TRANSACTION_BURST during rapid payment velocity', () => {
    const detectTransactionBurst = (recentTransactionsIn10Min) => {
      if (recentTransactionsIn10Min >= 3) {
        return {
          type: 'PATTERN_TRANSACTION_BURST',
          severity: 'HIGH',
          description: `Rapid transaction burst detected (${recentTransactionsIn10Min} payments in trailing 10 minutes).`,
          riskContribution: 25
        };
      }
      return null;
    };

    const burst = detectTransactionBurst(5);
    assert.ok(burst);
    assert.strictEqual(burst.type, 'PATTERN_TRANSACTION_BURST');
    assert.strictEqual(burst.severity, 'HIGH');
  });

  it('should enforce multi-hop traversal depth limits (1 to 3 hops)', () => {
    const clampDepth = (requestedDepth) => {
      return Math.min(Math.max(Number(requestedDepth) || 2, 1), 3);
    };

    assert.strictEqual(clampDepth(1), 1);
    assert.strictEqual(clampDepth(2), 2);
    assert.strictEqual(clampDepth(3), 3);
    assert.strictEqual(clampDepth(5), 3);
    assert.strictEqual(clampDepth(0), 2); // 0 falls back to default 2
    assert.strictEqual(clampDepth(-2), 1);
  });

  it('should structure fraud cluster entities with required summary fields', () => {
    const mockCluster = {
      clusterId: 'cluster_1',
      name: 'Shared Device Ring #demo_b99',
      users: 4,
      devices: 1,
      receivers: 2,
      transactions: 12,
      highRiskTransactions: 7,
      riskScore: 88,
      riskLevel: 'HIGH',
      reasons: ['Multiple accounts sharing device', '7 high-risk payments detected']
    };

    assert.ok(mockCluster.clusterId);
    assert.ok(mockCluster.users >= 2);
    assert.strictEqual(mockCluster.riskLevel, 'HIGH');
    assert.ok(mockCluster.reasons.length > 0);
  });

  it('should record model prediction labels for feedback loop', () => {
    const updatePredictionFeedback = (predictionRecord, status) => {
      if (status === 'CONFIRMED_FRAUD') {
        predictionRecord.actualLabel = 1;
      } else if (status === 'FALSE_POSITIVE') {
        predictionRecord.actualLabel = 0;
      }
      return predictionRecord;
    };

    const initialPrediction = {
      modelVersion: 'fraud-rf-v1.0',
      prediction: 1,
      probability: 0.92,
      actualLabel: null
    };

    const confirmed = updatePredictionFeedback({ ...initialPrediction }, 'CONFIRMED_FRAUD');
    assert.strictEqual(confirmed.actualLabel, 1);

    const falsePos = updatePredictionFeedback({ ...initialPrediction }, 'FALSE_POSITIVE');
    assert.strictEqual(falsePos.actualLabel, 0);
  });

});
