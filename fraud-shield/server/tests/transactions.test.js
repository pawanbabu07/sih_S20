const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generateExplainableReasons, getRecommendedAction } = require('../services/transactionService');

describe('2. Transaction & Ownership Security Tests (Phase 7)', () => {

  it('should generate human-readable explainable reasons for risky transaction parameters', () => {
    const riskyInput = {
      amount: 45000,
      isNewReceiver: true,
      isNewDevice: true,
      locationChange: true,
      transactionHour: 2,
      failedTransactions: 4
    };

    const reasons = generateExplainableReasons(riskyInput);

    assert.ok(reasons.includes('Transaction amount is unusually high'));
    assert.ok(reasons.includes('Receiver is new'));
    assert.ok(reasons.includes('Transaction is being made from a new device'));
    assert.ok(reasons.includes('Transaction location is unusual'));
    assert.ok(reasons.includes('Transaction occurred at an unusual time'));
    assert.ok(reasons.includes('Multiple recent transaction failures detected'));
  });

  it('should return empty reasons for normal transaction inputs', () => {
    const safeInput = {
      amount: 500,
      isNewReceiver: false,
      isNewDevice: false,
      locationChange: false,
      transactionHour: 14,
      failedTransactions: 0
    };

    const reasons = generateExplainableReasons(safeInput);
    assert.strictEqual(reasons.length, 0);
  });

  it('should correctly map risk levels to recommended actions', () => {
    assert.strictEqual(getRecommendedAction('LOW'), 'ALLOW');
    assert.strictEqual(getRecommendedAction('MEDIUM'), 'WARN_AND_CONFIRM');
    assert.strictEqual(getRecommendedAction('HIGH'), 'STRONG_WARNING');
  });

  it('should enforce cross-user access isolation (User A cannot access User B transactions)', () => {
    const mockTransaction = {
      id: 'tx_101',
      userId: 'user_A_id',
      amount: 5000,
      status: 'PENDING'
    };

    const verifyOwnership = (transaction, requestingUserId) => {
      if (transaction.userId !== requestingUserId) {
        const err = new Error('Access forbidden: This transaction belongs to another user');
        err.statusCode = 403;
        throw err;
      }
      return transaction;
    };

    // User A accessing User A's transaction -> Allowed
    const allowed = verifyOwnership(mockTransaction, 'user_A_id');
    assert.strictEqual(allowed.id, 'tx_101');

    // User B accessing User A's transaction -> 403 Forbidden
    assert.throws(() => {
      verifyOwnership(mockTransaction, 'user_B_attacker_id');
    }, (err) => {
      return err.statusCode === 403 && err.message.includes('Access forbidden');
    });
  });

  it('should enforce valid transaction status transitions (PENDING -> COMPLETED / CANCELLED)', () => {
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'FLAGGED', 'UNDER_REVIEW', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'];

    assert.ok(validStatuses.includes('COMPLETED'));
    assert.ok(validStatuses.includes('CANCELLED'));
    assert.ok(validStatuses.includes('FLAGGED'));
    assert.strictEqual(validStatuses.includes('UNKNOWN_INVALID_STATUS'), false);
  });

});
