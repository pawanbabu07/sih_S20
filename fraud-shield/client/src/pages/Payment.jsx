import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox, Grid, LinearProgress, List, ListItem, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Payment = () => {
  const navigate = useNavigate();
  const [receiverName, setReceiverName] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [deviceId, setDeviceId] = useState('device_win_11');
  const [location, setLocation] = useState('Delhi');

  // Behavioral Sim Parameters
  const [isNewReceiver, setIsNewReceiver] = useState(false);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [locationChange, setLocationChange] = useState(false);
  const [transactionHour, setTransactionHour] = useState(12);
  const [failedTransactions, setFailedTransactions] = useState(0);
  const [transactionFrequency, setTransactionFrequency] = useState(1);
  const [accountAgeDays, setAccountAgeDays] = useState(365);

  const [checking, setChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  const steps = [
    'Checking transaction behavior...',
    'Checking device information...',
    'Checking receiver information...',
    'Checking location pattern...',
    'Calculating ML fraud risk...'
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

  const loadDemoScenario = () => {
    setReceiverName('Rahul');
    setReceiverId('rahul_unknown@upi');
    setAmount('40000');
    setDeviceId('device_sih_demo_b99');
    setLocation('Jamshedpur');
    setIsNewReceiver(true);
    setIsNewDevice(true);
    setLocationChange(true);
    setTransactionHour(2);
    setFailedTransactions(3);
    setTransactionFrequency(15);
    setAccountAgeDays(180);
  };

  const handleSafetyCheck = async (e) => {
    e.preventDefault();
    setError('');

    if (!receiverName || !receiverId || !amount || !deviceId || !location) {
      setError('Please fill in all basic payment details.');
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
    }, 500);

    try {
      const devInfo = parseDeviceInfo();
      const res = await API.post('/fraud/check', {
        amount: Number(amount),
        receiverId,
        receiverName,
        transactionType: 'UPI',
        deviceId,
        deviceInfo: {
          ...devInfo,
          deviceId
        },
        location,
        transactionHour: Number(transactionHour),
        isNewReceiver,
        isNewDevice,
        locationChange,
        failedTransactions: Number(failedTransactions),
        transactionFrequency: Number(transactionFrequency),
        accountAgeDays: Number(accountAgeDays)
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
              deviceId,
              location,
              amount: Number(amount)
            }, 
            amount,
            transactionId: txId,
            receiverId,
            receiverName,
            deviceId,
            location
          } 
        });
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setChecking(false);
      setError(err.response?.data?.message || 'Safety verification failed. Make sure server is running.');
    }
  };

  if (checking) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Card sx={{ boxShadow: 4, borderRadius: 3, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              🛡️ Analyzing Transaction Safety...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentStep / steps.length) * 100} 
              sx={{ height: 10, borderRadius: 5, mb: 4 }}
            />
            <List>
              {steps.map((stepText, idx) => (
                <ListItem key={idx} sx={{ py: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: idx === currentStep ? 'bold' : 'normal',
                      color: idx < currentStep ? '#10b981' : idx === currentStep ? '#1e293b' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {idx < currentStep ? '✓' : idx === currentStep ? '⏳' : '○'} {stepText}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
          Simulated UPI Payment
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={loadDemoScenario}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
        >
          🚀 Load SIH Demo Case
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSafetyCheck}>
        <Grid container spacing={3}>
          {/* UPI Basic Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                  UPI Details
                </Typography>
                <TextField
                  label="Receiver Name"
                  fullWidth
                  required
                  margin="normal"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Receiver UPI ID / ID"
                  placeholder="name@upi"
                  fullWidth
                  required
                  margin="normal"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Amount (₹)"
                  type="number"
                  fullWidth
                  required
                  margin="normal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Device ID"
                  fullWidth
                  required
                  margin="normal"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Location"
                  fullWidth
                  required
                  margin="normal"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Advanced Behavioral Simulation Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Accordion defaultExpanded sx={{ boxShadow: 3, borderRadius: '12px !important', overflow: 'hidden' }}>
              <AccordionSummary expandIcon="▼" sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#1e293b' }}>
                Advanced Fraud Simulation Settings
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Tweak parameters to trigger low, medium, and high ML risk scores.
                </Typography>
                
                <FormControlLabel
                  control={<Checkbox checked={isNewReceiver} onChange={(e) => setIsNewReceiver(e.target.checked)} />}
                  label="New Receiver UPI ID"
                  sx={{ display: 'block', mb: 1 }}
                />
                <FormControlLabel
                  control={<Checkbox checked={isNewDevice} onChange={(e) => setIsNewDevice(e.target.checked)} />}
                  label="New Device signature"
                  sx={{ display: 'block', mb: 1 }}
                />
                <FormControlLabel
                  control={<Checkbox checked={locationChange} onChange={(e) => setLocationChange(e.target.checked)} />}
                  label="Unusual Location Change"
                  sx={{ display: 'block', mb: 2 }}
                />

                <TextField
                  label="Hour of Day (0-23)"
                  type="number"
                  slotProps={{ htmlInput: { min: 0, max: 23 } }}
                  fullWidth
                  margin="dense"
                  value={transactionHour}
                  onChange={(e) => setTransactionHour(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Failed Transactions (Last 24h)"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={failedTransactions}
                  onChange={(e) => setFailedTransactions(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Transaction Frequency (Last 24h)"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={transactionFrequency}
                  onChange={(e) => setTransactionFrequency(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="Account Age (Days)"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={accountAgeDays}
                  onChange={(e) => setAccountAgeDays(e.target.value)}
                  sx={{ borderRadius: 2 }}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            sx={{ 
              backgroundColor: '#1e293b', 
              '&:hover': { backgroundColor: '#334155' },
              fontWeight: 'bold',
              textTransform: 'none',
              px: 6,
              py: 1.5,
              borderRadius: 2
            }}
          >
            🛡️ Check Payment Safety
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default Payment;
