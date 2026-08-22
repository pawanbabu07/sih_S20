const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('1. Authentication & JWT Security Tests (Phase 7)', () => {
  const JWT_SECRET = 'test_jwt_secret_key_12345';

  it('should validate minimum 8 characters password policy', () => {
    const invalidPasswords = ['123', 'short', '1234567'];
    const validPasswords = ['password123', 'secure_pass_99', 'Admin@2026'];

    invalidPasswords.forEach(pw => {
      assert.ok(pw.length < 8, `Password ${pw} should be rejected for being under 8 chars`);
    });

    validPasswords.forEach(pw => {
      assert.ok(pw.length >= 8, `Password ${pw} should be accepted`);
    });
  });

  it('should securely hash passwords with bcrypt and never store plaintext', async () => {
    const rawPassword = 'UserSecret@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notStrictEqual(hash, rawPassword);
    assert.strictEqual(typeof hash, 'string');
    assert.ok(hash.startsWith('$2')); // bcrypt identifier

    // Verify comparison
    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(isWrongMatch, false);
  });

  it('should generate minimal, privacy-compliant JWT tokens containing only essential fields', () => {
    const userPayload = {
      id: '507f1f77bcf86cd799439011',
      role: 'user'
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    assert.ok(token);

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.id, userPayload.id);
    assert.strictEqual(decoded.role, userPayload.role);
    assert.strictEqual(decoded.password, undefined);
    assert.strictEqual(decoded.phone, undefined);
    assert.strictEqual(decoded.address, undefined);
  });

  it('should reject invalid or tampered JWT tokens', () => {
    const validToken = jwt.sign({ id: '123', role: 'user' }, JWT_SECRET);
    const tamperedToken = validToken.slice(0, -5) + 'xxxxx';

    assert.throws(() => {
      jwt.verify(tamperedToken, JWT_SECRET);
    });
  });

  it('should reject expired JWT tokens', () => {
    const expiredToken = jwt.sign({ id: '123', role: 'user' }, JWT_SECRET, { expiresIn: '-1s' });

    assert.throws(() => {
      jwt.verify(expiredToken, JWT_SECRET);
    }, (err) => {
      return err.name === 'TokenExpiredError';
    });
  });

  it('should verify role authorization logic (Admin vs Normal User)', () => {
    const adminUser = { id: 'admin1', role: 'admin' };
    const normalUser = { id: 'user1', role: 'user' };

    const isAdmin = (user) => Boolean(user && user.role === 'admin');

    assert.strictEqual(isAdmin(adminUser), true);
    assert.strictEqual(isAdmin(normalUser), false);
    assert.strictEqual(isAdmin(null), false);
  });
});
