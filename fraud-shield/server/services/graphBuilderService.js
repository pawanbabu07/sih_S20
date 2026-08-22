const FraudRelationship = require('../models/FraudRelationship');

/**
 * Automatically creates and updates graph edges for a transaction event.
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.transactionId - Transaction ID
 * @param {string} params.receiverId - Receiver UPI ID
 * @param {string} params.deviceId - Device ID
 * @param {string} [params.location] - Location name
 * @param {string} [params.voiceAnalysisId] - Voice analysis ID
 * @param {number} [params.riskScore=0] - Risk score evaluated for the transaction
 */
const recordTransactionRelationships = async ({
  userId,
  transactionId,
  receiverId,
  deviceId,
  location,
  voiceAnalysisId,
  riskScore = 0
}) => {
  if (!userId || !transactionId) return;

  const relationshipsToUpsert = [];

  const uidStr = String(userId);
  const txIdStr = String(transactionId);

  // 1. USER -> SENDS -> TRANSACTION
  relationshipsToUpsert.push({
    sourceType: 'USER',
    sourceId: uidStr,
    relationship: 'SENDS',
    targetType: 'TRANSACTION',
    targetId: txIdStr,
    riskScore,
    transactionId
  });

  // 2. TRANSACTION -> TO -> RECEIVER
  if (receiverId) {
    const rxIdStr = String(receiverId).trim();
    relationshipsToUpsert.push({
      sourceType: 'TRANSACTION',
      sourceId: txIdStr,
      relationship: 'TO',
      targetType: 'RECEIVER',
      targetId: rxIdStr,
      riskScore,
      transactionId
    });
  }

  // 3. TRANSACTION -> FROM -> DEVICE
  if (deviceId) {
    const devIdStr = String(deviceId).trim();
    relationshipsToUpsert.push({
      sourceType: 'TRANSACTION',
      sourceId: txIdStr,
      relationship: 'FROM',
      targetType: 'DEVICE',
      targetId: devIdStr,
      riskScore,
      transactionId
    });

    // 4. USER -> USES -> DEVICE
    relationshipsToUpsert.push({
      sourceType: 'USER',
      sourceId: uidStr,
      relationship: 'USES',
      targetType: 'DEVICE',
      targetId: devIdStr,
      riskScore,
      transactionId
    });
  }

  // 5. TRANSACTION -> LOCATED_AT -> LOCATION
  if (location) {
    const locStr = String(location).trim();
    relationshipsToUpsert.push({
      sourceType: 'TRANSACTION',
      sourceId: txIdStr,
      relationship: 'LOCATED_AT',
      targetType: 'LOCATION',
      targetId: locStr,
      riskScore,
      transactionId
    });
  }

  // 6. TRANSACTION -> ASSOCIATED_WITH -> VOICE_EVENT
  if (voiceAnalysisId) {
    const voiceStr = String(voiceAnalysisId).trim();
    relationshipsToUpsert.push({
      sourceType: 'TRANSACTION',
      sourceId: txIdStr,
      relationship: 'ASSOCIATED_WITH',
      targetType: 'VOICE_EVENT',
      targetId: voiceStr,
      riskScore,
      transactionId
    });
  }

  try {
    for (const rel of relationshipsToUpsert) {
      await FraudRelationship.updateOne(
        {
          sourceType: rel.sourceType,
          sourceId: rel.sourceId,
          relationship: rel.relationship,
          targetType: rel.targetType,
          targetId: rel.targetId,
          transactionId: rel.transactionId
        },
        { $set: rel },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Error saving graph relationships:', err.message);
  }
};

module.exports = {
  recordTransactionRelationships
};
