const FraudRelationship = require('../models/FraudRelationship');
const Transaction = require('../models/Transaction');
const { calculateReceiverRisk } = require('./receiverRiskService');
const { calculateDeviceRisk } = require('./deviceRiskService');

/**
 * Evaluates the full graph risk by examining device sharing, receiver concentration,
 * transaction bursts, and multi-entity pattern anomalies.
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.receiverId - Receiver UPI ID
 * @param {string} params.deviceId - Device identifier
 * @param {number} [params.amount] - Payment amount
 * @param {number} [params.transactionFrequency] - Frequency indicator
 * @param {number} [params.voiceRiskScore] - Voice analysis risk score
 * @returns {Promise<Object>} Graph risk evaluation with patterns and explainable reasons
 */
const evaluateGraphRisk = async ({
  userId,
  receiverId,
  deviceId,
  amount,
  transactionFrequency = 1,
  voiceRiskScore = 0
}) => {
  const patterns = [];
  const reasons = [];
  let score = 0;

  // 1. Evaluate Receiver Network Risk
  const receiverResult = await calculateReceiverRisk(receiverId);
  if (receiverResult.receiverRiskScore > 0) {
    score += receiverResult.receiverRiskScore * 0.45;
    reasons.push(...receiverResult.reasons);
  }

  // Receiver concentration pattern
  if (receiverResult.metrics.distinctUsers >= 3 && receiverResult.receiverRiskScore >= 30) {
    patterns.push({
      type: 'PATTERN_SHARED_RECEIVER',
      severity: receiverResult.metrics.distinctUsers >= 5 ? 'HIGH' : 'MEDIUM',
      description: `Receiver is connected to ${receiverResult.metrics.distinctUsers} separate user accounts with suspicious activity.`,
      riskContribution: 25
    });
  }

  // 2. Evaluate Device Network Risk
  const deviceResult = await calculateDeviceRisk(deviceId);
  if (deviceResult.deviceRiskScore > 0) {
    score += deviceResult.deviceRiskScore * 0.35;
    reasons.push(...deviceResult.reasons);
  }

  // Shared device pattern
  if (deviceResult.metrics.distinctUsers >= 2) {
    patterns.push({
      type: 'PATTERN_SHARED_DEVICE',
      severity: deviceResult.metrics.distinctUsers >= 4 ? 'HIGH' : 'MEDIUM',
      description: `Device is associated with ${deviceResult.metrics.distinctUsers} accounts involved in transactions.`,
      riskContribution: 20
    });
  }

  // 3. Transaction Burst Detection (>= 3 transactions in 10 minutes)
  try {
    if (userId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentCount = await Transaction.countDocuments({
        userId,
        createdAt: { $gte: tenMinutesAgo }
      });

      if (recentCount >= 3 || transactionFrequency >= 10) {
        score += 25;
        patterns.push({
          type: 'PATTERN_TRANSACTION_BURST',
          severity: 'HIGH',
          description: `Rapid transaction burst detected (${recentCount} payments in trailing 10 minutes).`,
          riskContribution: 25
        });
        reasons.push('Multiple high-value transactions executed within a short time window');
      }
    }
  } catch (err) {
    console.error('Error checking transaction burst:', err.message);
  }

  // 4. Voice Phishing Pattern
  if (voiceRiskScore >= 70) {
    patterns.push({
      type: 'PATTERN_VOICE_SCAM',
      severity: 'HIGH',
      description: 'Transaction is actively coordinated with a detected voice social-engineering attempt.',
      riskContribution: 25
    });
  }

  // Bounded graph risk score
  const graphRiskScore = Math.min(Math.round(score), 100);
  const riskLevel = graphRiskScore >= 70 ? 'HIGH' : (graphRiskScore >= 30 ? 'MEDIUM' : 'LOW');

  // De-duplicate reasons
  const uniqueReasons = Array.from(new Set(reasons));

  return {
    graphRiskScore,
    riskLevel,
    reasons: uniqueReasons,
    patterns,
    metrics: {
      receiver: receiverResult.metrics,
      device: deviceResult.metrics
    }
  };
};

/**
 * Traverses the graph from a root entity up to `maxDepth` hops (default 2, max 3).
 * Returns nodes and edges formatted for visual graph rendering.
 * 
 * @param {string} rootType - 'USER', 'DEVICE', 'RECEIVER', or 'TRANSACTION'
 * @param {string} rootId - Identifier of root node
 * @param {number} [maxDepth=2] - Traversal depth (1, 2, or 3)
 * @returns {Promise<Object>} { nodes: Array, edges: Array, rootNode: Object }
 */
const getMultiHopGraph = async (rootType, rootId, maxDepth = 2) => {
  const depth = Math.min(Math.max(Number(maxDepth) || 2, 1), 3);
  const cleanRootId = String(rootId).trim();
  const cleanRootType = String(rootType).toUpperCase().trim();

  const visitedEntityKeys = new Set();
  const nodesMap = new Map();
  const edgesMap = new Map();

  const rootKey = `${cleanRootType}:${cleanRootId}`;
  visitedEntityKeys.add(rootKey);

  nodesMap.set(rootKey, {
    id: rootKey,
    rawId: cleanRootId,
    type: cleanRootType,
    label: cleanRootId.length > 16 ? `${cleanRootId.slice(0, 8)}...${cleanRootId.slice(-6)}` : cleanRootId,
    isRoot: true,
    riskScore: 0,
    depth: 0
  });

  let currentLevelKeys = [rootKey];

  for (let d = 1; d <= depth; d++) {
    if (currentLevelKeys.length === 0 || nodesMap.size >= 60) break;

    const nextLevelKeys = [];

    for (const key of currentLevelKeys) {
      const [type, id] = key.split(':');

      // Outgoing relationships (sourceId = id)
      const outgoing = await FraudRelationship.find({
        sourceType: type,
        sourceId: id
      }).limit(20).lean();

      // Incoming relationships (targetId = id)
      const incoming = await FraudRelationship.find({
        targetType: type,
        targetId: id
      }).limit(20).lean();

      const allRels = [...outgoing, ...incoming];

      for (const rel of allRels) {
        const sourceKey = `${rel.sourceType}:${rel.sourceId}`;
        const targetKey = `${rel.targetType}:${rel.targetId}`;

        // Ensure both source and target nodes exist in map
        if (!nodesMap.has(sourceKey) && nodesMap.size < 60) {
          nodesMap.set(sourceKey, {
            id: sourceKey,
            rawId: rel.sourceId,
            type: rel.sourceType,
            label: rel.sourceId.length > 16 ? `${rel.sourceId.slice(0, 8)}...${rel.sourceId.slice(-6)}` : rel.sourceId,
            isRoot: false,
            riskScore: rel.riskScore || 0,
            depth: d
          });
          if (!visitedEntityKeys.has(sourceKey)) {
            visitedEntityKeys.add(sourceKey);
            nextLevelKeys.push(sourceKey);
          }
        }

        if (!nodesMap.has(targetKey) && nodesMap.size < 60) {
          nodesMap.set(targetKey, {
            id: targetKey,
            rawId: rel.targetId,
            type: rel.targetType,
            label: rel.targetId.length > 16 ? `${rel.targetId.slice(0, 8)}...${rel.targetId.slice(-6)}` : rel.targetId,
            isRoot: false,
            riskScore: rel.riskScore || 0,
            depth: d
          });
          if (!visitedEntityKeys.has(targetKey)) {
            visitedEntityKeys.add(targetKey);
            nextLevelKeys.push(targetKey);
          }
        }

        const edgeId = `${sourceKey}->${rel.relationship}->${targetKey}`;
        if (!edgesMap.has(edgeId)) {
          edgesMap.set(edgeId, {
            id: edgeId,
            source: sourceKey,
            target: targetKey,
            relationship: rel.relationship,
            riskScore: rel.riskScore || 0
          });
        }
      }
    }

    currentLevelKeys = nextLevelKeys;
  }

  return {
    rootId: cleanRootId,
    rootType: cleanRootType,
    depth,
    totalNodes: nodesMap.size,
    totalEdges: edgesMap.size,
    nodes: Array.from(nodesMap.values()),
    edges: Array.from(edgesMap.values())
  };
};

/**
 * Detects suspicious clusters / syndicates by grouping entities sharing common
 * devices and receivers associated with high-risk payments.
 * 
 * @returns {Promise<Array<Object>>} List of detected fraud clusters
 */
const getFraudClusters = async () => {
  try {
    // Find all devices shared by >= 2 distinct users
    const sharedDevices = await FraudRelationship.aggregate([
      { $match: { targetType: 'DEVICE', relationship: 'USES' } },
      { $group: { _id: '$targetId', users: { $addToSet: '$sourceId' }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } }
    ]);

    // Find all receivers shared by >= 2 distinct users
    const sharedReceivers = await FraudRelationship.aggregate([
      { $match: { targetType: 'RECEIVER', relationship: 'TO' } },
      { $group: { _id: '$targetId', txs: { $addToSet: '$sourceId' } } },
      { $lookup: {
          from: 'fraudrelationships',
          localField: 'txs',
          foreignField: 'targetId',
          as: 'userRels'
      }},
      { $project: {
          receiverId: '$_id',
          userCount: { $size: '$userRels' }
      }},
      { $match: { userCount: { $gte: 2 } } }
    ]);

    const clusters = [];

    // Form cluster objects for shared device groups
    let clusterIdx = 1;
    for (const dev of sharedDevices) {
      const devId = dev._id;
      const userList = dev.users;

      // Find transactions associated with these users
      const txDocs = await Transaction.find({
        userId: { $in: userList }
      }).select('receiverId riskScore status').lean();

      const totalTxs = txDocs.length;
      const highRiskTxs = txDocs.filter(t => (t.riskScore || 0) >= 70).length;
      const receivers = Array.from(new Set(txDocs.map(t => t.receiverId).filter(Boolean)));

      const clusterRisk = Math.min(60 + (highRiskTxs * 8) + (userList.length * 5), 100);

      clusters.push({
        clusterId: `cluster_${clusterIdx++}`,
        name: `Shared Device Ring #${devId.slice(-6)}`,
        anchorType: 'DEVICE',
        anchorId: devId,
        users: userList.length,
        devices: 1,
        receivers: receivers.length,
        transactions: totalTxs,
        highRiskTransactions: highRiskTxs,
        riskScore: clusterRisk,
        riskLevel: clusterRisk >= 70 ? 'HIGH' : (clusterRisk >= 30 ? 'MEDIUM' : 'LOW'),
        reasons: [
          `Multiple distinct accounts (${userList.length}) transacted using device '${devId}'`,
          `${highRiskTxs} transactions within this cluster exhibited high fraud risk scores`
        ]
      });
    }

    // Form cluster objects for shared receiver hubs
    for (const rx of sharedReceivers) {
      const rxId = rx.receiverId;
      const txDocs = await Transaction.find({ receiverId: rxId }).select('userId riskScore status').lean();
      const userList = Array.from(new Set(txDocs.map(t => String(t.userId))));
      const highRiskTxs = txDocs.filter(t => (t.riskScore || 0) >= 70).length;

      const clusterRisk = Math.min(55 + (highRiskTxs * 9) + (userList.length * 4), 100);

      clusters.push({
        clusterId: `cluster_${clusterIdx++}`,
        name: `Receiver Concentration Hub (${rxId})`,
        anchorType: 'RECEIVER',
        anchorId: rxId,
        users: userList.length,
        devices: 1,
        receivers: 1,
        transactions: txDocs.length,
        highRiskTransactions: highRiskTxs,
        riskScore: clusterRisk,
        riskLevel: clusterRisk >= 70 ? 'HIGH' : (clusterRisk >= 30 ? 'MEDIUM' : 'LOW'),
        reasons: [
          `Receiver '${rxId}' receives funds from ${userList.length} distinct sender accounts`,
          `${highRiskTxs} payments to this recipient triggered fraud warnings`
        ]
      });
    }

    // Default demonstration cluster if database has few records
    if (clusters.length === 0) {
      clusters.push({
        clusterId: 'cluster_sih_17',
        name: 'Coordinated Payment Ring #17',
        anchorType: 'DEVICE',
        anchorId: 'device_sih_demo_b99',
        users: 4,
        devices: 2,
        receivers: 3,
        transactions: 14,
        highRiskTransactions: 8,
        riskScore: 88,
        riskLevel: 'HIGH',
        reasons: [
          '4 user accounts share device_sih_demo_b99 and route payments to rahul_unknown@upi',
          '8 recent transactions triggered high-risk voice phishing and amount anomalies'
        ]
      });
    }

    return clusters;
  } catch (err) {
    console.error('Error generating fraud clusters:', err.message);
    return [];
  }
};

/**
 * Returns detailed breakdown and multi-hop structure for a specific cluster.
 * @param {string} clusterId - Cluster ID
 */
const getFraudClusterDetails = async (clusterId) => {
  const allClusters = await getFraudClusters();
  const cluster = allClusters.find(c => c.clusterId === clusterId) || allClusters[0];

  if (!cluster) {
    throw new Error('Fraud cluster not found');
  }

  const graphData = await getMultiHopGraph(cluster.anchorType, cluster.anchorId, 2);

  return {
    ...cluster,
    graph: graphData
  };
};

module.exports = {
  evaluateGraphRisk,
  getMultiHopGraph,
  getFraudClusters,
  getFraudClusterDetails
};
