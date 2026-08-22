/**
 * Service to analyze conversation transcripts for social engineering indicators,
 * calculate a risk score, and generate explanation arrays.
 */

/**
 * Check if the transcript contains any keywords in a given set.
 * @param {string} text - Lowercase transcript
 * @param {Array<string>} keywords - Keywords list
 * @returns {boolean} True if matching keyword found
 */
const hasKeywords = (text, keywords) => {
  return keywords.some(kw => text.includes(kw));
};

/**
 * Analyzes raw transcript text and returns risk calculations.
 * @param {string} transcript - Conversation transcript text
 * @returns {Object} Voice analysis results containing riskScore, riskLevel, indicators, explanations, and action
 */
const analyzeTranscriptText = (transcript) => {
  if (!transcript || typeof transcript !== 'string') {
    throw new Error('Transcript text is required for analysis');
  }

  const indicators = [];
  const explanation = [];
  let rawScore = 0;

  const text = transcript.toLowerCase();

  // 1. OTP Request Check (+25 score)
  const otpKeywords = ['otp', 'one time password', 'verification code', 'security code', 'send me the code', 'tell me the code'];
  if (hasKeywords(text, otpKeywords)) {
    indicators.push({
      type: 'OTP_REQUEST',
      label: 'OTP Request',
      severity: 'HIGH',
      explanation: 'The caller requested a one-time security password.'
    });
    explanation.push('Caller requested a one-time password (OTP)');
    rawScore += 25;
  }

  // 2. Credential Request Check (+30 score)
  const credentialKeywords = ['upi pin', 'atm pin', 'card pin', 'password', 'banking password', 'login password'];
  if (hasKeywords(text, credentialKeywords)) {
    indicators.push({
      type: 'CREDENTIAL_REQUEST',
      label: 'Credential Request',
      severity: 'HIGH',
      explanation: 'The caller requested a personal PIN or login password.'
    });
    explanation.push('Caller requested highly sensitive credentials or UPI PIN');
    rawScore += 30;
  }

  // 3. Urgency Check (+15 score)
  const urgencyKeywords = ['immediately', 'right now', 'urgent', 'within 5 minutes', 'do it now', 'last warning', 'act immediately'];
  if (hasKeywords(text, urgencyKeywords)) {
    indicators.push({
      type: 'URGENCY',
      label: 'Urgency Pressure',
      severity: 'MEDIUM',
      explanation: 'The caller created immediate time pressure.'
    });
    explanation.push('Caller created artificial urgency to force immediate action');
    rawScore += 15;
  }

  // 4. Threat Check (+20 score)
  const threatKeywords = ['account will be blocked', 'police complaint', 'legal action', 'arrest', 'fine', 'penalty', 'account suspension'];
  if (hasKeywords(text, threatKeywords)) {
    indicators.push({
      type: 'THREAT',
      label: 'Threats / Coercion',
      severity: 'HIGH',
      explanation: 'The caller used fear tactics like account suspension or police action.'
    });
    explanation.push('Caller made threats of blocking accounts, penalties, or police complaints');
    rawScore += 20;
  }

  // 5. Impersonation Check (+15 score)
  const impersonationKeywords = ['i am calling from your bank', 'bank officer', 'rbi officer', 'police officer', 'customer care', 'government officer', 'kyc department'];
  if (hasKeywords(text, impersonationKeywords)) {
    indicators.push({
      type: 'IMPERSONATION',
      label: 'Possible Impersonation',
      severity: 'HIGH',
      explanation: 'The caller claimed to represent a bank, official, or customer service.'
    });
    explanation.push('Caller claimed to represent a trusted institution or bank department');
    rawScore += 15;
  }

  // 6. Payment Pressure Check (+20 score)
  const paymentKeywords = ['send money', 'transfer money', 'pay now', 'scan qr', 'make payment', 'refund fee', 'processing fee', 'verification payment', 'security deposit'];
  if (hasKeywords(text, paymentKeywords)) {
    indicators.push({
      type: 'PAYMENT_PRESSURE',
      label: 'Payment Pressure',
      severity: 'MEDIUM',
      explanation: 'The caller pressured the user to make a transfer or payment.'
    });
    explanation.push('Caller insisted on immediate money transfer or fee scan');
    rawScore += 20;
  }

  // 7. Remote Access Check (+25 score)
  const remoteKeywords = ['anydesk', 'teamviewer', 'remote access', 'screen sharing', 'install this application', 'download this app', 'give remote access'];
  if (hasKeywords(text, remoteKeywords)) {
    indicators.push({
      type: 'REMOTE_ACCESS_REQUEST',
      label: 'Remote Access Request',
      severity: 'HIGH',
      explanation: 'The caller requested screen sharing or app installation.'
    });
    explanation.push('Caller requested remote screen access tool installation');
    rawScore += 25;
  }

  // 8. Reward Scam Check (+20 score)
  const rewardKeywords = ['lottery', 'cashback', 'won a prize', 'won 10000', 'reward points', 'claim prize'];
  if (hasKeywords(text, rewardKeywords)) {
    indicators.push({
      type: 'REWARD_SCAM',
      label: 'Reward / Cashback Offer',
      severity: 'MEDIUM',
      explanation: 'The caller lured the user with prize winnings or cashback.'
    });
    explanation.push('Caller mentioned unverified lotteries, reward points, or cashback prizes');
    rawScore += 20;
  }

  // 9. KYC Scam Check (+20 score)
  const kycKeywords = ['kyc update', 'update kyc', 'verify kyc', 'kyc pending', 'aadhaar card verify'];
  if (hasKeywords(text, kycKeywords)) {
    indicators.push({
      type: 'KYC_SCAM',
      label: 'Suspicious KYC Notice',
      severity: 'MEDIUM',
      explanation: 'The caller claimed a KYC verification is urgently required.'
    });
    explanation.push('Caller demanded immediate Aadhaar card or KYC updates');
    rawScore += 20;
  }

  // 10. Refund Scam Check (+15 score)
  const refundKeywords = ['refund money', 'claim refund', 'overcharge refund', 'cancelled ticket refund'];
  if (hasKeywords(text, refundKeywords)) {
    indicators.push({
      type: 'REFUND_SCAM',
      label: 'Refund Processing Scam',
      severity: 'LOW',
      explanation: 'The caller offered processing details for unverified refunds.'
    });
    explanation.push('Caller referred to ticket or bill refund claims');
    rawScore += 15;
  }

  // Bounded risk score
  const riskScore = Math.min(rawScore, 100);

  // Set risk level thresholds
  let riskLevel = 'LOW';
  if (riskScore >= 70) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM';
  }

  // Set action recommendations
  let recommendedAction = 'CONTINUE_WITH_CAUTION';
  if (riskLevel === 'HIGH') {
    recommendedAction = 'DO_NOT_PAY';
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'VERIFY_CALLER';
  }

  return {
    riskScore,
    riskLevel,
    indicators,
    explanation,
    recommendedAction
  };
};

module.exports = {
  analyzeTranscriptText
};
