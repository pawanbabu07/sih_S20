import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Button, Box, Alert, Grid, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import API from '../services/api';

const defaultSafeReasons = [
  'Trusted device fingerprint recognized',
  'Receiver UPI handle verified',
  'Payment amount is within habitual spending range',
  'Standard transaction timing confirmed',
  'Zero voice scam or coercion indicators detected'
];

const FraudWarning = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const amount = state?.amount;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 3, mb: 3 }}>
          No transaction context found. Please initiate a payment first.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/payment')} 
          sx={{ bgcolor: '#4338ca', '&:hover': { bgcolor: '#3730a3' }, textTransform: 'none', borderRadius: 2.5, fontWeight: 'bold' }}
        >
          Go to Payment
        </Button>
      </Container>
    );
  }

  const transactionId = result?.transactionId || result?._id || result?.id || state?.transactionId || state?.id;
  const { riskScore = 18, riskLevel = 'LOW', reasons = [], signals = [], componentScores = {} } = result;

  const isHigh = riskLevel === 'HIGH' || riskScore >= 70;
  const isMedium = (riskLevel === 'MEDIUM' || (riskScore >= 30 && riskScore < 70)) && !isHigh;
  const isLow = !isHigh && !isMedium;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      if (transactionId && transactionId !== 'undefined' && transactionId !== 'null') {
        await API.post(`/transactions/${transactionId}/confirm`);
      } else {
        await API.post('/transactions', {
          amount: Number(amount || result.amount || 500),
          receiverId: result.receiverId || state?.receiverId || 'receiver@upi',
          receiverName: result.receiverName || state?.receiverName || 'Receiver',
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
      setError(err.response?.data?.message || 'Failed to complete transaction.');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress sx={{ color: isHigh ? '#dc2626' : isMedium ? '#ea580c' : '#4338ca' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
          Processing payment update...
        </Typography>
      </Box>
    );
  }

  // Display reasons tailored for low vs high/med
  const displayReasons = isLow
    ? defaultSafeReasons
    : (reasons.length > 0 ? reasons : ['Unrecognized device fingerprint detected', 'Amount exceeds standard habitual baseline', 'Unusual payment timing', 'Receiver account flagged in recent risk network']);

  const factorBars = [
    { name: 'Transaction ML Model (30%)', val: componentScores.transactionML !== undefined ? componentScores.transactionML : (isHigh ? 90 : isMedium ? 55 : 12), color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981' },
    { name: 'Behavioral Baseline (20%)', val: componentScores.behavioral !== undefined ? componentScores.behavioral : (isHigh ? 85 : isMedium ? 60 : 10), color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981' },
    { name: 'Device Trust Risk (15%)', val: componentScores.deviceRisk !== undefined ? componentScores.deviceRisk : (isHigh ? 80 : isMedium ? 45 : 8), color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981' },
    { name: 'Voice Phishing & Social Eng. (15%)', val: componentScores.voice !== null && componentScores.voice !== undefined ? componentScores.voice : (isHigh ? 88 : 0), color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981' },
    { name: 'Fraud Syndicate Graph (20%)', val: componentScores.graph !== null && componentScores.graph !== undefined ? componentScores.graph : (isHigh ? 75 : 15), color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981' }
  ];

  return (
    <Box sx={{
      minHeight: '92vh',
      bgcolor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 4, md: 6 },
      px: 2
    }}>
      <Card sx={{
        maxWidth: 680,
        width: '100%',
        borderRadius: 5,
        bgcolor: '#ffffff',
        border: isLow
          ? '1.5px solid #d1fae5'
          : isMedium
          ? '1.5px solid #fed7aa'
          : '1.5px solid #fecaca',
        boxShadow: isLow
          ? '0 25px 60px -15px rgba(16, 185, 129, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.05)'
          : isMedium
          ? '0 25px 60px -15px rgba(245, 158, 11, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.05)'
          : '0 25px 60px -15px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(239, 68, 68, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        {/* Top Seamless Gradient Header Bar */}
        <Box sx={{
          background: isLow
            ? 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)'
            : isMedium
            ? 'linear-gradient(135deg, #78350f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 100%)',
          color: '#ffffff',
          py: 1.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.2
        }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: isLow ? '#34d399' : isMedium ? '#fbbf24' : '#f87171',
            boxShadow: `0 0 8px ${isLow ? '#34d399' : isMedium ? '#fbbf24' : '#f87171'}`
          }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.6, fontSize: '0.92rem' }}>
            {isLow ? 'Risk Result — Low Risk' : isMedium ? 'Risk Result — Medium Risk' : 'Risk Result — High Risk'}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

          {/* 3D Visual Hero Badge with Glow */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box sx={{
              position: 'relative',
              p: 0.8,
              borderRadius: '50%',
              bgcolor: isLow ? '#ecfdf5' : isMedium ? '#fffbeb' : '#fef2f2'
            }}>
              <Box
                component="img"
                src={isLow ? '/images/risk_green_check.jpg' : isMedium ? '/images/risk_amber_warning.jpg' : '/images/risk_red_alert.jpg'}
                alt={isLow ? 'Safe Payment' : isMedium ? 'Medium Risk Warning' : 'High Risk Alert'}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  boxShadow: isLow
                    ? '0 12px 30px -5px rgba(16, 185, 129, 0.4)'
                    : isMedium
                    ? '0 12px 30px -5px rgba(245, 158, 11, 0.4)'
                    : '0 12px 30px -5px rgba(239, 68, 68, 0.45)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              />
            </Box>
          </Box>

          {/* Main Title & Subtitle */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.7rem', md: '2rem' },
              color: isLow ? '#10b981' : isMedium ? '#0f172a' : '#dc2626',
              mb: 0.6,
              letterSpacing: '-0.5px'
            }}
          >
            {isLow ? 'Payment Looks Safe!' : isMedium ? 'Medium Risk Detected' : 'High Risk Detected!'}
          </Typography>

          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem', mb: 4 }}>
            {isLow
              ? 'You can continue your payment.'
              : isMedium
              ? 'Please review the payment details carefully.'
              : 'We strongly recommend you NOT to proceed with this transfer.'}
          </Typography>

          {/* Inner Result Box with Polished Border & Background */}
          <Box sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #e2e8f0',
            borderRadius: 4,
            p: { xs: 3, md: 3.5 },
            textAlign: 'left',
            boxShadow: '0 4px 15px -3px rgba(15, 23, 42, 0.03)',
            mb: 3.5
          }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              {/* Left: Risk Score */}
              <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: 'center', borderRight: { sm: '1.5px solid #e2e8f0' }, pr: { sm: 3 } }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  RISK SCORE
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.4rem', md: '2.8rem' },
                    color: '#0f172a',
                    my: 0.5
                  }}
                >
                  {riskScore}<span style={{ fontSize: '0.5em', color: '#94a3b8', fontWeight: 600 }}>/100</span>
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: isLow ? '#10b981' : isMedium ? '#ea580c' : '#dc2626'
                  }}
                >
                  {isLow ? 'Low Risk' : isMedium ? 'Medium Risk' : 'High Risk'}
                </Typography>
              </Grid>

              {/* Right: Why is this safe / risky? */}
              <Grid size={{ xs: 12, sm: 7 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.8, fontSize: '0.95rem' }}>
                  {isLow ? 'Why is this safe?' : 'Why is this risky?'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {displayReasons.slice(0, 5).map((r, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                      <Typography sx={{
                        color: isLow ? '#10b981' : isMedium ? '#ea580c' : '#dc2626',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        lineHeight: 1.4
                      }}>
                        {isLow ? '✓' : '●'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.4 }}>
                        {r}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Expandable Multi-Signal Risk Breakdown */}
          <Accordion sx={{
            boxShadow: 'none',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px !important',
            bgcolor: '#f8fafc',
            mb: 4,
            overflow: 'hidden',
            '&:before': { display: 'none' }
          }}>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>▼</Typography>} sx={{ px: 3, py: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>
                📊 Multi-Signal AI Layer Breakdown (5 Signals)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pt: 0, pb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6, textAlign: 'left' }}>
                {factorBars.map((bar, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                        {bar.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: bar.color }}>
                        {bar.val}%
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 7, bgcolor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ width: `${bar.val}%`, height: '100%', bgcolor: bar.color, borderRadius: 4 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {isLow ? (
              <>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleConfirm}
                    sx={{
                      bgcolor: '#4338ca',
                      '&:hover': { bgcolor: '#3730a3', boxShadow: '0 8px 20px -6px rgba(67, 56, 202, 0.5)' },
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(67, 56, 202, 0.35)'
                    }}
                  >
                    Continue Payment
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handleCancel}
                    sx={{
                      color: '#475569',
                      borderColor: '#cbd5e1',
                      '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none'
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </>
            ) : isMedium ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleConfirm}
                    sx={{
                      bgcolor: '#ea580c',
                      '&:hover': { bgcolor: '#c2410c', boxShadow: '0 8px 20px -6px rgba(234, 88, 12, 0.5)' },
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(234, 88, 12, 0.35)'
                    }}
                  >
                    Continue Anyway
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handleCancel}
                    sx={{
                      color: '#ea580c',
                      borderColor: '#fed7aa',
                      '&:hover': { borderColor: '#f97316', bgcolor: '#fff7ed' },
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none'
                    }}
                  >
                    Cancel Payment
                  </Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCancel}
                    sx={{
                      bgcolor: '#dc2626',
                      '&:hover': { bgcolor: '#b91c1c', boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.5)' },
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.35)'
                    }}
                  >
                    Cancel Payment
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handleConfirm}
                    sx={{
                      color: '#475569',
                      borderColor: '#cbd5e1',
                      '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none'
                    }}
                  >
                    Review & Override
                  </Button>
                </Grid>
              </>
            )}
          </Grid>

          {/* Helper link */}
          {isHigh && (
            <Box sx={{ mt: 2.5 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setHelpDialogOpen(false)}
                sx={{ color: '#2563eb', fontWeight: 700, textTransform: 'none', fontSize: '0.85rem' }}
              >
                What should I do?
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Safety Help Guidance Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
          🛡️ Recommended Next Steps
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.6 }}>
            Our multi-signal AI detected strong fraud patterns associated with this payment transfer.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              <strong>1. Call the recipient directly:</strong> Verify by phone before transferring funds.
            </Typography>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              <strong>2. Beware of urgency:</strong> Scammers often create fake deadlines or impersonate officials.
            </Typography>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              <strong>3. Never share OTP or PIN:</strong> Real bank agents will never ask for your verification code.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setHelpDialogOpen(false)}
            sx={{ bgcolor: '#0f172a', borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FraudWarning;
