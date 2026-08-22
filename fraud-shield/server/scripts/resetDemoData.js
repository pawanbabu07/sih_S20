/**
 * Smart India Hackathon (SIH) Demo Dataset Reset Script
 * 
 * Purpose: Cleans up synthetic demo transactions, risk events, live alerts, 
 * and test audit trails between judge demonstration rounds.
 * 
 * Safety Constraint:
 * STRICTLY REQUIRES DEMO_MODE=true or --demo-mode flag to prevent accidental 
 * execution in production environments.
 * 
 * Usage:
 *   DEMO_MODE=true node scripts/resetDemoData.js
 *   node scripts/resetDemoData.js --demo-mode
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Transaction = require('../models/Transaction');
const RiskEvent = require('../models/RiskEvent');
const Alert = require('../models/Alert');
const VoiceAnalysis = require('../models/VoiceAnalysis');
const VoiceFeedback = require('../models/VoiceFeedback');
const AdminAuditLog = require('../models/AdminAuditLog');
const FraudRelationship = require('../models/FraudRelationship');
const User = require('../models/User');

const isDemoMode = process.env.DEMO_MODE === 'true' || process.argv.includes('--demo-mode');

if (!isDemoMode) {
  console.error('\n❌ EXECUTION BLOCKED:');
  console.error('This script will only run when DEMO_MODE=true or --demo-mode is passed.');
  console.error('This safety guard protects production database records from accidental deletion.\n');
  process.exit(1);
}

const runReset = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fraud_shield';

  try {
    await mongoose.connect(uri);
    console.log('\n======================================================');
    console.log('🔄 SIH DEMO DATA RESET INITIATED (DEMO_MODE=true)');
    console.log('======================================================');

    // Target demo emails and receivers
    const demoEmails = [
      'demo.user@example.com',
      'demo.admin@example.com',
      'test.user@example.com',
      'user@example.com'
    ];

    const demoUsers = await User.find({ email: { $in: demoEmails } }).select('_id email');
    const demoUserIds = demoUsers.map(u => u._id);

    console.log(`Found ${demoUserIds.length} synthetic demo accounts.`);

    // 1. Delete demo transactions
    const txRes = await Transaction.deleteMany({
      $or: [
        { userId: { $in: demoUserIds } },
        { receiverId: { $regex: /demo|mule|scam/i } },
        { deviceId: { $regex: /sih_demo|device_web|device_untrusted/i } }
      ]
    });
    console.log(`✓ Deleted ${txRes.deletedCount} demo transaction records.`);

    // 2. Delete demo risk events
    const evtRes = await RiskEvent.deleteMany({
      $or: [
        { userId: { $in: demoUserIds } },
        { deviceId: { $regex: /sih_demo|device_web|device_untrusted/i } }
      ]
    });
    console.log(`✓ Deleted ${evtRes.deletedCount} demo real-time risk events.`);

    // 3. Delete demo alerts
    const alertRes = await Alert.deleteMany({
      userId: { $in: demoUserIds }
    });
    console.log(`✓ Deleted ${alertRes.deletedCount} demo user alerts.`);

    // 4. Delete demo voice analyses & feedback
    const voiceRes = await VoiceAnalysis.deleteMany({
      userId: { $in: demoUserIds }
    });
    const feedbackRes = await VoiceFeedback.deleteMany({});
    console.log(`✓ Deleted ${voiceRes.deletedCount} demo voice analysis transcripts.`);
    console.log(`✓ Reset ${feedbackRes.deletedCount} voice feedback items.`);

    // 5. Delete demo relationship graph links
    const graphRes = await FraudRelationship.deleteMany({
      $or: [
        { fromId: { $in: demoUserIds.map(id => id.toString()) } },
        { toId: { $regex: /sih_demo|device_untrusted|mule/i } }
      ]
    });
    console.log(`✓ Cleared ${graphRes.deletedCount} demo syndicate graph relationships.`);

    // 6. Delete demo admin audit logs
    const auditRes = await AdminAuditLog.deleteMany({
      adminEmail: { $in: demoEmails }
    });
    console.log(`✓ Reset ${auditRes.deletedCount} demo admin audit log entries.`);

    console.log('======================================================');
    console.log('✨ SIH DEMO DATABASE SUCCESSFULLY RESET TO CLEAN STATE');
    console.log('======================================================\n');

  } catch (err) {
    console.error('Error during demo reset:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runReset();
