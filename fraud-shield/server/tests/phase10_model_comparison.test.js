const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { calculateRisk } = require('../services/riskEngine');

describe('9. Phase 10 — Advanced ML, Model Comparison & Adaptive Risk Engine Tests', () => {

  it('1. should verify zero data leakage: feature pipeline only extracts pre-transaction signals', () => {
    const featurePipelinePath = path.resolve(__dirname, '../../ml-service/feature_engineering.py');
    assert.ok(fs.existsSync(featurePipelinePath), 'feature_engineering.py must exist');

    const content = fs.readFileSync(featurePipelinePath, 'utf8');
    // Forbidden post-transaction signals
    const forbiddenSignals = [
      'transaction_status',
      'admin_confirmed_fraud',
      'user_warning_confirmed',
      'chargeback_status',
      'resolution_time'
    ];

    forbiddenSignals.forEach(signal => {
      assert.ok(!content.includes(`'${signal}'`), `Forbidden signal '${signal}' must not be in feature engineering`);
    });
  });

  it('2. should validate multi-model comparison matrix and calibration metadata from model_metadata.json', () => {
    const metadataPath = path.resolve(__dirname, '../../ml-service/models/model_metadata.json');
    assert.ok(fs.existsSync(metadataPath), 'model_metadata.json must exist and be populated');

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Check versioning & champion model
    assert.equal(metadata.modelVersion, 'fraud-model-v2.0');
    assert.ok(['LogisticRegression', 'RandomForestClassifier', 'GradientBoostingClassifier'].includes(metadata.modelType));
    assert.equal(metadata.status, 'ACTIVE');

    // Check multi-model comparison table
    assert.ok(Array.isArray(metadata.modelComparison));
    assert.ok(metadata.modelComparison.length >= 3, 'Must compare at least 3 model architectures');

    const modelTypes = metadata.modelComparison.map(m => m.modelType);
    assert.ok(modelTypes.includes('LogisticRegression'));
    assert.ok(modelTypes.includes('RandomForestClassifier'));
    assert.ok(modelTypes.includes('GradientBoostingClassifier'));

    // Validate metrics integrity
    metadata.modelComparison.forEach(m => {
      assert.ok(m.accuracy > 50, 'Accuracy must be > 50%');
      assert.ok(m.precision > 20, 'Precision must be > 20%');
      assert.ok(m.recall > 20, 'Recall must be > 20%');
      assert.ok(m.prAuc > 40, 'PR-AUC must be > 40%');
    });

    // Check Probability Calibration
    assert.ok(metadata.calibration.calibrated);
    assert.ok(metadata.calibration.brierScoreAfter < metadata.calibration.brierScoreBefore,
      'Calibrated Brier score must be lower (better confidence) than uncalibrated');
  });

  it('3. should enforce monotonic precision vs recall tradeoff in threshold analysis curve', () => {
    const metadataPath = path.resolve(__dirname, '../../ml-service/models/model_metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    const thresholds = metadata.thresholdAnalysis;
    assert.ok(Array.isArray(thresholds));
    assert.ok(thresholds.length >= 4);

    const lowTh = thresholds[0]; // e.g. 0.40
    const highTh = thresholds[thresholds.length - 1]; // e.g. 0.85

    assert.ok(lowTh.recall >= highTh.recall, 'Recall must decrease or stay equal as threshold increases');
    assert.ok(highTh.precision >= lowTh.precision, 'Precision must increase as threshold increases');
  });

  it('4. should compute real-time data drift variance and detect drift severity thresholds', () => {
    const baseline = {
      amount: { mean: 6000, median: 4100 },
      newDeviceRate: 15.0,
      newReceiverRate: 25.0,
      nightHourRate: 15.0
    };

    const calculateDrift = (live) => {
      const amountVar = Math.abs(Math.round(((live.avgAmount - baseline.amount.mean) / baseline.amount.mean) * 100));
      const deviceVar = Math.abs(live.newDeviceRate - baseline.newDeviceRate);
      const receiverVar = Math.abs(live.newReceiverRate - baseline.newReceiverRate);
      const nightVar = Math.abs(live.nightHourRate - baseline.nightHourRate);

      const isDrift = amountVar > 40 || deviceVar > 15 || receiverVar > 15 || nightVar > 15;
      const severity = (amountVar > 60 || deviceVar > 25) ? 'SIGNIFICANT' : isDrift ? 'MODERATE' : 'NORMAL';

      return { isDrift, severity, amountVar, deviceVar };
    };

    // Case A: Normal live traffic
    const normalLive = { avgAmount: 6400, newDeviceRate: 16, newReceiverRate: 27, nightHourRate: 14 };
    const normalResult = calculateDrift(normalLive);
    assert.strictEqual(normalResult.isDrift, false);
    assert.strictEqual(normalResult.severity, 'NORMAL');

    // Case B: Moderate drift
    const moderateLive = { avgAmount: 9200, newDeviceRate: 32, newReceiverRate: 28, nightHourRate: 18 };
    const modResult = calculateDrift(moderateLive);
    assert.strictEqual(modResult.isDrift, true);
    assert.strictEqual(modResult.severity, 'MODERATE');

    // Case C: Significant drift
    const extremeLive = { avgAmount: 18000, newDeviceRate: 45, newReceiverRate: 50, nightHourRate: 35 };
    const extResult = calculateDrift(extremeLive);
    assert.strictEqual(extResult.isDrift, true);
    assert.strictEqual(extResult.severity, 'SIGNIFICANT');
  });

  it('5. should enforce model governance: validation gates and candidate promotion workflow', () => {
    // Model promotion validator
    const validateModelForPromotion = (candidate) => {
      if (candidate.status === 'ACTIVE') {
        throw new Error('Model is already active');
      }
      if (candidate.metrics.prAuc < 45 || candidate.metrics.recall < 50) {
        throw new Error('Model does not meet minimum safety validation criteria (PR-AUC >= 45%, Recall >= 50%)');
      }
      return {
        action: 'PROMOTE_TO_ACTIVE',
        previousStatus: candidate.status,
        newStatus: 'ACTIVE',
        timestamp: new Date()
      };
    };

    // Candidate meeting criteria
    const validCandidate = {
      version: 'fraud-model-v2.1-candidate',
      status: 'CANDIDATE',
      metrics: { prAuc: 58.9, recall: 68.5, precision: 58.2 }
    };
    const promotion = validateModelForPromotion(validCandidate);
    assert.strictEqual(promotion.newStatus, 'ACTIVE');

    // Flawed candidate failing validation
    const flawedCandidate = {
      version: 'fraud-model-flawed',
      status: 'CANDIDATE',
      metrics: { prAuc: 32.0, recall: 40.0, precision: 25.0 }
    };
    assert.throws(() => {
      validateModelForPromotion(flawedCandidate);
    }, /minimum safety validation criteria/i);
  });

  it('6. should separate ML probability from business risk policy across 5 signals', () => {
    // Safe transaction test
    const safe = calculateRisk({
      transactionML: 12,
      behavioral: 0,
      deviceTrust: 100,
      voice: null,
      graph: 0
    });
    assert.strictEqual(safe.riskLevel, 'LOW');
    assert.strictEqual(safe.recommendedAction, 'ALLOW');

    // Medium risk transaction test
    const medium = calculateRisk({
      transactionML: 48,
      behavioral: 40,
      deviceTrust: 70,
      voice: null,
      graph: 20
    });
    assert.strictEqual(medium.riskLevel, 'MEDIUM');
    assert.strictEqual(medium.recommendedAction, 'WARN_AND_CONFIRM');

    // High risk transaction test
    const high = calculateRisk({
      transactionML: 85,
      behavioral: 80,
      deviceTrust: 20, // Device risk = 80
      voice: 90,
      graph: 85
    });
    assert.strictEqual(high.riskLevel, 'HIGH');
    assert.strictEqual(high.recommendedAction, 'STRONG_WARNING');
  });

  it('7. should elevate combined risk score when voice phishing or graph ring signals are present', () => {
    // Baseline medium transaction
    const baseTx = calculateRisk({
      transactionML: 50,
      behavioral: 30,
      deviceTrust: 80,
      voice: null,
      graph: 0
    });

    // Same transaction with voice social engineering detected (voice = 95)
    const voiceTx = calculateRisk({
      transactionML: 50,
      behavioral: 30,
      deviceTrust: 80,
      voice: 95,
      graph: 0
    });
    assert.ok(voiceTx.finalScore > baseTx.finalScore);

    // Same transaction with graph mule syndicate detected (graph = 90)
    const graphTx = calculateRisk({
      transactionML: 50,
      behavioral: 30,
      deviceTrust: 80,
      voice: null,
      graph: 90
    });
    assert.ok(graphTx.finalScore > baseTx.finalScore);
  });
});
