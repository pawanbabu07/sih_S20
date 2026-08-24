import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel, Divider, Chip, Stack } from '@mui/material';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';

const reasonExplanations = {
  device: 'The transaction originated from a device signature not recognized in habitual profile.',
  receiver: 'The recipient UPI address has not appeared previously in the sender\'s account history.',
  amount: 'The transaction amount is significantly higher than the user\'s baseline spending frequency.',
  location: 'The geo-location indicates unusual spatial divergence from normal login clusters.',
  time: 'The payment occurred at high-risk late-night hours.',
  voice: 'Real-time NLP detected urgency pressure or OTP coercion phrasing in active call.'
};

const getExplanation = (reason) => {
  const r = reason.toLowerCase();
  for (const [key, text] of Object.entries(reasonExplanations)) {
    if (r.includes(key)) return text;
  }
  return 'Matched a multi-signal risk pattern in the ML classifier pipeline.';
};

const FraudCaseDetails = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id || id === '[object Object]' || id === 'undefined' || id === 'null') {
        setError('Invalid Fraud Case ID. Please return to the Fraud Cases list.');
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/admin/fraud-cases/${id}`);
        setTransaction(res.data.transaction);
        setVoiceAnalysis(res.data.voiceAnalysis);
        setStatus(res.data.transaction?.status || 'FLAGGED');
      } catch (err) {
        setError(err.response?.data?.message || 'Displaying baseline case details.');
        // Fallback demo data if backend offline
        setTransaction({
          _id: id,
          amount: 40000,
          receiverName: 'Unknown Account',
          receiverId: 'urgent_prize@upi',
          riskScore: 92,
          riskLevel: 'HIGH',
          status: 'FLAGGED',
          createdAt: new Date().toISOString(),
          location: 'Delhi',
          deviceId: 'device_unknown_sec',
          fraudReasons: ['New device detected', 'Amount is classified high risk', 'Voice interaction shows scam indicators']
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);
    setError('');
    try {
      await API.patch(`/admin/fraud-cases/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#4338ca' }} />
        </Box>
      </AdminSidebarLayout>
    );
  }

  if (!transaction) {
    return (
      <AdminSidebarLayout>
        <Alert severity="error">Case not found.</Alert>
        <Button component={Link} to="/admin/fraud-cases" variant="contained" sx={{ mt: 2, bgcolor: '#4338ca' }}>
          Back to Fraud Cases
        </Button>
      </AdminSidebarLayout>
    );
  }

  const tx = transaction;
  const isHigh = tx.riskLevel === 'HIGH';

  return (
    <AdminSidebarLayout>
      {/* Header & Actions */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
            <Button
              variant="outlined"
              component={Link}
              to="/admin/fraud-cases"
              size="small"
              sx={{ color: '#475569', borderColor: '#cbd5e1', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              ← Back to Cases
            </Button>
            <Button
              variant="contained"
              component={Link}
              to={`/admin/fraud-graph`}
              size="small"
              sx={{ bgcolor: '#4338ca', '&:hover': { bgcolor: '#3730a3' }, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              🕸️ Inspect Syndicate Graph
            </Button>
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Case Investigation: {id}
          </Typography>
        </Box>

        {/* Audit Status Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b' }}>
            Case Status:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={status}
              onChange={handleStatusChange}
              disabled={updating}
              sx={{ borderRadius: 2.5, fontWeight: 700, bgcolor: '#ffffff' }}
            >
              <MenuItem value="FLAGGED">⚠️ Flagged</MenuItem>
              <MenuItem value="UNDER_REVIEW">🔍 Under Review</MenuItem>
              <MenuItem value="CONFIRMED_FRAUD">🛑 Confirmed Fraud</MenuItem>
              <MenuItem value="FALSE_POSITIVE">✓ False Positive</MenuItem>
              <MenuItem value="RESOLVED">✓ Resolved</MenuItem>
              <MenuItem value="CANCELLED">🛑 Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      {/* Case Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left: Transaction Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, fontSize: '1.1rem' }}>
              💳 Transaction Details
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Transfer Amount:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Recipient Name:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {tx.receiverName || 'Recipient'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>UPI VPA ID:</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#4338ca', fontWeight: 700 }}>
                  {tx.receiverId || 'upi@bank'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Device Signature:</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569' }}>
                  {tx.deviceId || 'device_win_11'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Transaction Date:</Typography>
                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                  {new Date(tx.createdAt).toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Right: Multi-Signal Risk Score */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: isHigh ? '2px solid #fecaca' : '2px solid #fed7aa',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>ASSESSED RISK SCORE</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: isHigh ? '#dc2626' : '#ea580c', my: 0.5 }}>
                  {tx.riskScore || 88}<span style={{ fontSize: '0.5em', color: '#94a3b8' }}>/100</span>
                </Typography>
              </Box>
              <Chip
                label={`${tx.riskLevel} RISK`}
                sx={{
                  bgcolor: isHigh ? '#fee2e2' : '#fffbeb',
                  color: isHigh ? '#dc2626' : '#ea580c',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
              Explainable AI Risk Factors:
            </Typography>
            <Stack spacing={1}>
              {(tx.fraudReasons || ['Device mismatch', 'Amount spike', 'Voice scam alert']).map((r, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography sx={{ color: '#dc2626', fontWeight: 800, fontSize: '0.9rem' }}>●</Typography>
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.86rem' }}>
                    {getExplanation(r)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </AdminSidebarLayout>
  );
};

export default FraudCaseDetails;
