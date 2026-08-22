const axios = require('axios');

/**
 * Sends transaction data to the Python Flask ML service for prediction
 * @param {Object} transactionData - Transaction details (camelCase)
 * @returns {Promise<Object>} Object containing fraud_probability, risk_score, modelVersion, optimalThreshold, featureContributions
 */
const predictFraud = async (transactionData) => {
  // Use ML_SERVICE_URL from process.env, falling back to localhost:8000
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  const url = `${mlServiceUrl}/predict`;

  // Map camelCase (Node.js) to snake_case (Python)
  const payload = {
    amount: transactionData.amount,
    transaction_hour: transactionData.transactionHour,
    is_new_receiver: transactionData.isNewReceiver,
    is_new_device: transactionData.isNewDevice,
    location_change: transactionData.locationChange ?? false,
    failed_transactions: transactionData.failedTransactions ?? 0,
    transaction_frequency: transactionData.transactionFrequency ?? 1,
    account_age_days: transactionData.accountAgeDays ?? 365
  };

  try {
    const response = await axios.post(url, payload, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Error connecting to ML service:', error.message);
    const serviceError = new Error('Fraud detection service is temporarily unavailable');
    serviceError.statusCode = 503;
    throw serviceError;
  }
};

/**
 * Fetches model metadata and calibration curves from the Python ML service
 * @returns {Promise<Object>}
 */
const getModelMetadata = async () => {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  const url = `${mlServiceUrl}/model/metadata`;

  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.data?.metadata || {};
  } catch (error) {
    console.warn('ML metadata fetch failed, returning empty metadata:', error.message);
    return {};
  }
};

module.exports = {
  predictFraud,
  getModelMetadata
};
