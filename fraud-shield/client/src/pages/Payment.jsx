import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Grid, LinearProgress, List, ListItem, Alert, Stack, Chip, InputAdornment } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

// Blue Shield Logo Icon
const ShieldLogo = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 3L4 9V17C4 25.5 10 32.5 18 34C26 32.5 32 25.5 32 17V9L18 3Z" fill="url(#shield_grad_pay)" stroke="#2563eb" strokeWidth="1.5" />
    <rect x="13" y="16" width="10" height="8" rx="2" fill="white" />
    <path d="M15 16V13.5C15 11.8431 16.3431 10.5 18 10.5C19.6569 10.5 21 11.8431 21 13.5V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="20" r="1.2" fill="#2563eb" />
    <defs>
      <linearGradient id="shield_grad_pay" x1="4" y1="3" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

const quickAmounts = [500, 1000, 2500, 5000, 10000];

const Payment = () => {
  const navigate = useNavigate();
  const [receiverName, setReceiverName] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [deviceId] = useState('device_win_11');
  const [location] = useState('Delhi');

  const [checking, setChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  const steps = [
    'Analyzing behavioral spending patterns...',
    'Checking device intelligence & fingerprint...',
    'Verifying receiver reputation & syndicate flags...',
    'Evaluating geo-location anomalies...',
    'Calculating AI multi-signal fraud risk score...'
  ];

  const parseDeviceInfo = () => {
    const ua = navigator.userAgent || '';
    let browser = 'Chrome';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    let os = 'Windows';
    if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';

    const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
    return {
      browser,
      operatingSystem: os,
      deviceType: isMobile ? 'Mobile' : 'Desktop'
    };
  };

  const handleSafetyCheck = async (e) => {
    e.preventDefault();
    setError('');

    if (!receiverName || !receiverId || !amount) {
      setError('Please fill in all required payment details.');
      return;
    }

    if (Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setChecking(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    try {
      const devInfo = parseDeviceInfo();
      const currentHour = new Date().getHours();

      const res = await API.post('/fraud/check', {
        amount: Number(amount),
        receiverId,
        receiverName,
        transactionType: 'UPI',
        deviceId: deviceId || 'device_win_11',
        deviceInfo: {
          ...devInfo,
          deviceId: deviceId || 'device_win_11'
        },
        location: location || 'Delhi',
        transactionHour: currentHour,
        isNewReceiver: false,
        isNewDevice: false,
        locationChange: false,
        failedTransactions: 0,
        transactionFrequency: 1,
        accountAgeDays: 365,
        note
      });

      clearInterval(interval);
      setCurrentStep(steps.length);

      setTimeout(() => {
        setChecking(false);
        const data = res.data || {};
        const txId = data.transactionId || data._id || data.id;
        navigate('/fraud-warning', { 
          state: { 
            result: {
              ...data,
              transactionId: txId,
              receiverId,
              receiverName,
              deviceId: deviceId || 'device_win_11',
              location: location || 'Delhi',
              amount: Number(amount)
            }, 
            amount,
            transactionId: txId,
            receiverId,
            receiverName,
            deviceId: deviceId || 'device_win_11',
            location: location || 'Delhi'
          } 
        });
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setChecking(false);
      setError(err.response?.data?.message || 'Payment safety verification failed. Please try again.');
    }
  };

  if (checking) {
    return (
      <Box sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: '#f8fafc'
      }}>
        <Card sx={{
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.1)',
          borderRadius: 4,
          p: 4,
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          bgcolor: '#ffffff'
        }}>
          <CardContent>
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              mx: 'auto',
              mb: 2.5
            }}>
              🛡️
            </Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
              Screening Payment Safety
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5 }}>
              Running multi-signal AI verification for ₹{Number(amount).toLocaleString('en-IN')} to {receiverName}
            </Typography>

            <LinearProgress 
              variant="determinate" 
              value={(currentStep / steps.length) * 100} 
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 3.5,
                bgcolor: '#eff6ff',
                '& .MuiLinearProgress-bar': { bgcolor: '#4338ca' }
              }}
            />

            <List sx={{ textAlign: 'left' }}>
              {steps.map((stepText, idx) => (
                <ListItem key={idx} sx={{ py: 0.8, px: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: idx === currentStep ? 700 : 500,
                      color: idx < currentStep ? '#059669' : idx === currentStep ? '#0f172a' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    {idx < currentStep ? '✓' : idx === currentStep ? '⏳' : '○'} {stepText}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '90vh',
      bgcolor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, md: 4 }
    }}>
      <Card sx={{
        maxWidth: 1000,
        width: '100%',
        borderRadius: 4,
        boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}>
        {/* Top Header Bar */}
        <Box sx={{
          px: { xs: 3, md: 5 },
          pt: { xs: 3, md: 4 },
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldLogo />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Fraud<span style={{ color: '#2563eb' }}>Shield</span> <span style={{ fontSize: '0.85em', color: '#64748b', fontWeight: 600 }}>Pay</span>
            </Typography>
          </Box>
          <Chip
            label="● AI Shield Active"
            size="small"
            sx={{
              bgcolor: '#ecfdf5',
              color: '#059669',
              fontWeight: 700,
              border: '1px solid #a7f3d0',
              fontSize: '0.8rem'
            }}
          />
        </Box>

        <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
            {/* Left Column: Transfer Form */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.75rem', md: '2rem' }, mb: 0.5, letterSpacing: '-0.5px' }}>
                  UPI Payment Transfer
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Seamless payment transfer with real-time fraud defense
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

              <form onSubmit={handleSafetyCheck}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Receiver Name
                  </Typography>
                  <TextField
                    placeholder="e.g. Priya Sharma"
                    fullWidth
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Receiver UPI ID
                  </Typography>
                  <TextField
                    placeholder="e.g. priya@okhdfcbank"
                    fullWidth
                    required
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Chip label="UPI" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '0.72rem' }} />
                          </InputAdornment>
                        )
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Amount (₹)
                  </Typography>
                  <TextField
                    placeholder="5000"
                    type="number"
                    fullWidth
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Typography fontWeight="bold" color="#0f172a">₹</Typography></InputAdornment>
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                {/* Quick Amount Chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {quickAmounts.map((amt) => (
                    <Chip
                      key={amt}
                      label={`+ ₹${amt.toLocaleString('en-IN')}`}
                      size="small"
                      onClick={() => setAmount(String(amt))}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: Number(amount) === amt ? '#e0e7ff' : '#f1f5f9',
                        color: Number(amount) === amt ? '#4338ca' : '#475569',
                        fontWeight: 700,
                        border: Number(amount) === amt ? '1px solid #c7d2fe' : '1px solid transparent',
                        '&:hover': { bgcolor: '#e2e8f0' }
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Note / Purpose (Optional)
                  </Typography>
                  <TextField
                    placeholder="e.g. Rent, Groceries, Shopping"
                    fullWidth
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#4338ca',
                    '&:hover': { bgcolor: '#3730a3', boxShadow: '0 8px 20px -6px rgba(67, 56, 202, 0.5)' },
                    py: 1.6,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    boxShadow: '0 4px 14px 0 rgba(67, 56, 202, 0.35)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  🛡️ Verify & Pay Securely
                </Button>
              </form>

              {/* Security Badges */}
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  🔒 256-bit Encrypted
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  ⚡ Sub-Second AI Check
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  🛡️ Zero PIN Storage
                </Typography>
              </Stack>
            </Grid>

            {/* Right Column: 3D Illustration & Security Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{
                background: 'radial-gradient(circle at center, #eff6ff 0%, #e0e7ff 100%)',
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: '1px solid #e0e7ff'
              }}>
                <Box
                  component="img"
                  src="/images/payment_shield_3d.jpg"
                  alt="FraudShield 3D UPI Payment"
                  sx={{
                    width: '100%',
                    maxWidth: 340,
                    height: 'auto',
                    borderRadius: 3,
                    boxShadow: '0 15px 35px -10px rgba(37, 99, 235, 0.15)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                />
                <Box sx={{
                  mt: 2.5,
                  textAlign: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  width: '100%',
                  maxWidth: 340
                }}>
                  <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    ⚡ Real-Time Multi-Signal Interception Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', display: 'block', mt: 0.3 }}>
                    XGBoost & LightGBM Machine Learning Protection
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payment;
