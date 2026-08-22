const crypto = require('crypto');
const Device = require('../models/Device');

/**
 * Hashes raw IP address with SHA-256 for privacy compliance.
 * Raw IP addresses are never permanently stored in the database.
 * @param {string} ip - Raw incoming IP address
 * @returns {string} SHA-256 hex hash
 */
const hashIpAddress = (ip) => {
  if (!ip || typeof ip !== 'string') return '';
  return crypto.createHash('sha256').update(ip.trim()).digest('hex');
};

/**
 * Determines device trust status category based on trust score:
 * 0–29   → UNKNOWN / LOW TRUST
 * 30–69  → UNTRUSTED / MEDIUM TRUST
 * 70–100 → TRUSTED
 * @param {number} trustScore
 * @returns {string} TRUSTED | UNTRUSTED | UNKNOWN
 */
const getTrustCategory = (trustScore) => {
  if (trustScore >= 70) return 'TRUSTED';
  if (trustScore >= 30) return 'UNTRUSTED';
  return 'UNKNOWN';
};

/**
 * Retrieves an existing device for a user or creates a new device entry.
 * New devices start with a low trust score (20) and are marked untrusted.
 * @param {string} userId - User Object ID
 * @param {Object} deviceInfo - Device parameters
 * @returns {Promise<{device: Object, isNew: boolean, trustScore: number, trustCategory: string}>}
 */
const getOrCreateDevice = async (userId, deviceInfo = {}) => {
  const deviceId = deviceInfo.deviceId || 'unknown_device';
  const ipAddressHash = deviceInfo.ipAddress ? hashIpAddress(deviceInfo.ipAddress) : '';

  let device = await Device.findOne({ userId, deviceId });

  if (device) {
    // Existing known device
    device.lastSeen = new Date();
    device.transactionCount = (device.transactionCount || 0) + 1;
    if (deviceInfo.browser) device.browser = deviceInfo.browser;
    if (deviceInfo.operatingSystem) device.operatingSystem = deviceInfo.operatingSystem;
    if (deviceInfo.deviceType) device.deviceType = deviceInfo.deviceType;
    if (ipAddressHash) device.ipAddressHash = ipAddressHash;

    // Slight trust score increase for established reliable devices (up to 95)
    if (device.isTrusted && device.trustScore < 95) {
      device.trustScore = Math.min(100, device.trustScore + 1);
    }

    await device.save();

    return {
      device,
      isNew: false,
      trustScore: device.trustScore,
      isTrusted: device.isTrusted,
      trustCategory: getTrustCategory(device.trustScore)
    };
  }

  // Brand new device detected
  const initialTrustScore = 20; // Starts with low score as specified in requirements
  device = new Device({
    userId,
    deviceId,
    deviceType: deviceInfo.deviceType || 'Desktop',
    browser: deviceInfo.browser || 'Chrome',
    operatingSystem: deviceInfo.operatingSystem || 'Windows',
    ipAddressHash,
    firstSeen: new Date(),
    lastSeen: new Date(),
    transactionCount: 1,
    isTrusted: false,
    trustScore: initialTrustScore
  });

  await device.save();

  return {
    device,
    isNew: true,
    trustScore: initialTrustScore,
    isTrusted: false,
    trustCategory: getTrustCategory(initialTrustScore)
  };
};

/**
 * Get all devices registered for a user
 * @param {string} userId - User Object ID
 * @returns {Promise<Array>}
 */
const getUserDevices = async (userId) => {
  const devices = await Device.find({ userId }).sort({ lastSeen: -1 });
  return devices.map(d => ({
    id: d.id || d._id.toString(),
    deviceId: d.deviceId,
    deviceType: d.deviceType,
    browser: d.browser,
    operatingSystem: d.operatingSystem,
    firstSeen: d.firstSeen,
    lastSeen: d.lastSeen,
    transactionCount: d.transactionCount,
    isTrusted: d.isTrusted,
    trustScore: d.trustScore,
    trustCategory: getTrustCategory(d.trustScore)
  }));
};

/**
 * Mark a device as trusted by user verification
 * @param {string} userId - User Object ID
 * @param {string} deviceId - Device identifier string or document ID
 * @returns {Promise<Object>}
 */
const markDeviceAsTrusted = async (userId, deviceId) => {
  let device = await Device.findOne({
    userId,
    $or: [{ deviceId }, { _id: deviceId.match(/^[0-9a-fA-F]{24}$/) ? deviceId : null }]
  });

  if (!device) {
    const error = new Error('Device not found for this account.');
    error.statusCode = 404;
    throw error;
  }

  device.isTrusted = true;
  device.trustScore = Math.max(device.trustScore, 85); // Upgrades trust score to trusted range (85)
  await device.save();

  return {
    id: device.id || device._id.toString(),
    deviceId: device.deviceId,
    deviceType: device.deviceType,
    browser: device.browser,
    operatingSystem: device.operatingSystem,
    isTrusted: device.isTrusted,
    trustScore: device.trustScore,
    trustCategory: getTrustCategory(device.trustScore)
  };
};

module.exports = {
  hashIpAddress,
  getTrustCategory,
  getOrCreateDevice,
  getUserDevices,
  markDeviceAsTrusted
};
