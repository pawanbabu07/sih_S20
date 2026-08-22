import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Button, Box, Alert, Grid, CircularProgress, List, ListItem, Chip } from '@mui/material';
import RiskBadge from '../components/RiskBadge';
import RiskExplanation from '../components/RiskExplanation';
import API from '../services/api';

const FraudWarning = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const amount = state?.amount;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!result) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>No transaction safety context found. Please submit a payment check first.</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/payment')} 
          sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
        >
          Go to Payment Simulator
        </Button>
      </Container>
    );
  }

  const transactionId = result?.transactionId || result?._id || result?.id || result?.transaction?._id || result?.transaction?.id || result?.transaction?.transactionId || state?.transactionId || state?.id;
  const { riskScore, riskLevel, reasons = [], signals = [], componentScores = {}, device = {} } = result;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      if (transactionId && transactionId !== 'undefined' && transactionId !== 'null') {
        await API.post(`/transactions/${transactionId}/confirm`);
      } else {
        // Fallback: create & save transaction record if no preexisting transactionId was present
        await API.post('/transactions', {
          amount: Number(amount || result.amount || 500),
          receiverId: result.receiverId || state?.receiverId || 'demo_receiver@upi',
          receiverName: result.receiverName || state?.receiverName || 'Demo Receiver',
          transactionType: 'UPI',
          deviceId: result.deviceId || state?.deviceId || 'device_web',
          location: result.location || state?.location || 'Delhi',
          transactionHour: new Date().getHours(),
          isNewReceiver: false,
          isNewDevice: false
        });
      }
      setLoading(false);
      navigate('/transactions');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to confirm transaction.');
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      if (transactionId && transactionId !== 'undefined' && transactionId !== 'null') {
        await API.post(`/transactions/${transactionId}/cancel`);
      }
      setLoading(false);
      navigate('/transactions');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to cancel transaction.');
    }
  };

  // Helper to determine risk bar metrics dynamically from the reasons array or signals
  const hasReason = (keyword) => {
    return reasons.some(r => r.toLowerCase().includes(keyword.toLowerCase())) ||
           signals.some(s => s.toLowerCase().includes(keyword.toLowerCase()));
  };

  const factorBars = [
    { name: 'Transaction ML Risk (30%)', val: componentScores.transactionML !== undefined ? componentScores.transactionML : (hasReason('amount') ? 90 : 15), level: (componentScores.transactionML >= 70 || hasReason('amount')) ? 'High' : 'Normal', color: (componentScores.transactionML >= 70 || hasReason('amount')) ? '#ef4444' : '#10b981' },
    { name: 'Behavioral Baseline Risk (20%)', val: componentScores.behavioral !== undefined ? componentScores.behavioral : (hasReason('pattern') || hasReason('amount') ? 85 : 10), level: (componentScores.behavioral >= 50 || hasReason('pattern')) ? 'High' : 'Normal', color: (componentScores.behavioral >= 50 || hasReason('pattern')) ? '#ef4444' : '#10b981' },
    { name: 'Device Trust Risk (15%)', val: componentScores.deviceRisk !== undefined ? componentScores.deviceRisk : (hasReason('device') ? 80 : 10), level: (componentScores.deviceRisk >= 50 || hasReason('device')) ? 'Untrusted' : 'Trusted', color: (componentScores.deviceRisk >= 50 || hasReason('device')) ? '#ef4444' : '#10b981' },
    { name: 'Voice & Social Engineering (15%)', val: componentScores.voice !== null && componentScores.voice !== undefined ? componentScores.voice : (hasReason('voice') || hasReason('otp') ? 85 : 0), level: (componentScores.voice >= 50 || hasReason('voice')) ? 'High Risk' : 'None', color: (componentScores.voice >= 50 || hasReason('voice')) ? '#ef4444' : '#10b981' },
    { name: 'Fraud Relationship Graph Risk (20%)', val: componentScores.graph !== null && componentScores.graph !== undefined ? componentScores.graph : (hasReason('shared') || hasReason('burst') ? 80 : 15), level: (componentScores.graph >= 50 || hasReason('shared')) ? 'Network Risk' : 'Normal', color: (componentScores.graph >= 50 || hasReason('shared')) ? '#ef4444' : '#10b981' }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Updating payment status...</Typography>
      </Box>
    );
  }

  const isHigh = riskLevel === 'HIGH';
  const isMedium = riskLevel === 'MEDIUM';
  const isLow = riskLevel === 'LOW';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Card sx={{ 
        boxShadow: 4, 
        borderRadius: 4, 
        borderLeft: `10px solid ${isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981'}`,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Risk Level Alert Indicator */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                fontWeight: 'bold', 
                color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981', 
                fontSize: '1.1rem',
                letterSpacing: 1 
              }}
            >
              {isHigh ? '⚠️ HIGH-RISK TRANSACTION' : isMedium ? '⚠️ PLEASE REVIEW THIS PAYMENT' : '✓ PAYMENT LOOKS SAFE'}
            </Typography>
            
            {/* Visual Risk Score Circle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 1 }}>
              <Box sx={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                border: `6px solid ${isHigh ? '#fee2e2' : isMedium ? '#fef3c7' : '#d1fae5'}`,
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: '#ffffff',
                boxShadow: 1
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981' }}>
                  {riskScore}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  RISK SCORE
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <RiskBadge riskLevel={riskLevel} />
            </Box>

            {/* Signals badge list */}
            {signals.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {signals.map((sig, sIdx) => (
                  <Chip key={sIdx} size="small" label={`🚩 ${sig}`} color={isHigh ? 'error' : 'warning'} variant="outlined" sx={{ fontWeight: 'bold' }} />
                ))}
              </Box>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* Explanatory reasons */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                Why was this flagged?
              </Typography>
              
              {reasons.length === 0 ? (
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  No significant suspicious behavior was detected.
                </Typography>
              ) : (
                <List sx={{ mb: 3 }}>
                  {reasons.map((reason, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                      <Typography variant="body1" sx={{ color: '#475569', display: 'flex', gap: 1 }}>
                        <span style={{ color: '#ef4444' }}>⚠️</span> {reason}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                  Recommended Action:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isHigh ? '#ef4444' : isMedium ? '#d97706' : '#059669' }}>
                  {isHigh ? 'STRONG WARNING: Do not proceed unless you have verbally verified the recipient.' :
                   isMedium ? 'WARN AND CONFIRM: Please verify the receiver before continuing.' :
                   'ALLOW: Transaction matches normal parameters.'}
                </Typography>
              </Box>
            </Grid>

            {/* Explainable AI metrics */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                Multi-Signal Risk Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {factorBars.map((bar, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
                        {bar.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: bar.color }}>
                        {bar.level} ({bar.val}%)
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ width: `${bar.val}%`, height: '100%', backgroundColor: bar.color }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <RiskExplanation
              riskScore={riskScore}
              riskLevel={riskLevel}
              reasons={reasons}
              signals={signals}
              componentScores={componentScores}
              device={device}
              graphRisk={result.graphRisk || {}}
              voiceScore={result.voiceScore}
            />
          </Box>

          {/* Action buttons */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            {!isLow && (
              <Button 
                variant="outlined" 
                color="error" 
                size="large" 
                onClick={handleCancel}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', px: 4 }}
              >
                🛑 Cancel Payment
              </Button>
            )}
            
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleConfirm}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2, 
                fontWeight: 'bold', 
                px: 4,
                backgroundColor: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981',
                '&:hover': {
                  backgroundColor: isHigh ? '#dc2626' : isMedium ? '#d97706' : '#059669'
                }
              }}
            >
              {isLow ? 'Continue Payment' : isHigh ? 'I Understand the Risk — Continue' : 'I Understand, Continue'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FraudWarning;
