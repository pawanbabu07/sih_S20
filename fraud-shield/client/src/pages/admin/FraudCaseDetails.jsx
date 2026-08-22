import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel, Divider } from '@mui/material';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import RiskBadge from '../../components/RiskBadge';
import API from '../../services/api';

const reasonExplanations = {
  device: 'The transaction originated from a device not previously associated with this user.',
  receiver: 'The recipient has not previously been used by this account.',
  amount: 'The transaction amount is significantly higher than the user\'s normal activity.',
  location: 'The transaction location has high spatial distance from normal login patterns.',
  time: 'The transaction occurred at unusual late-night or early-morning hours.',
  failure: 'Multiple recent transaction authorization failures were detected.'
};

const getExplanation = (reason) => {
  const r = reason.toLowerCase();
  for (const [key, text] of Object.entries(reasonExplanations)) {
    if (r.includes(key)) return text;
  }
  return 'Matched a high-risk pattern in the ML classifier model.';
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
        setStatus(res.data.transaction?.status || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load case details.');
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
      setError('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <AdminSidebarLayout><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box></AdminSidebarLayout>;
  }

  if (!transaction) {
    return (
      <AdminSidebarLayout>
        <Alert severity="error">Case not found.</Alert>
        <Button component={Link} to="/admin/fraud-cases" variant="contained" sx={{ mt: 2 }}>Back</Button>
      </AdminSidebarLayout>
    );
  }

  const tx = transaction;
  const va = voiceAnalysis;
  const combinedRisk = va ? Math.round(tx.riskScore * 0.65 + va.riskScore * 0.35) : null;

  return (
    <AdminSidebarLayout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Button variant="outlined" component={Link} to="/admin/fraud-cases" size="small" sx={{ mb: 1, mr: 1, borderRadius: 2 }}>← Back to Fraud Cases</Button>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/admin/fraud-graph/DEVICE/${tx.deviceId || 'device_default'}`}
            size="small"
            sx={{ mb: 1, borderRadius: 2 }}
          >
            🕸️ Explore in Relationship Graph
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Case: #{tx.id}</Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="case-status-label">Case Status</InputLabel>
          <Select 
            labelId="case-status-label"
            value={['FLAGGED', 'UNDER_REVIEW', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED', 'COMPLETED', 'PENDING', 'CANCELLED'].includes(status) ? status : ''} 
            label="Case Status" 
            disabled={updating} 
            onChange={handleStatusChange}
            MenuProps={{
              disableAutoFocusItem: true,
              disableAutoFocus: true,
              disableRestoreFocus: true,
              disableEnforceFocus: true,
              TransitionProps: { timeout: 0 }
            }}
          >
            {['FLAGGED', 'UNDER_REVIEW', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED', 'COMPLETED', 'PENDING', 'CANCELLED'].map(s => (
              <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Transaction Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1, mb: 2 }}>Transaction Details</Typography>
              {[
                ['Sender', tx.userId?.name || 'Unknown'],
                ['Email', tx.userId?.email || 'N/A'],
                ['Phone', tx.userId?.phone || 'N/A'],
                ['Receiver', `${tx.receiverName} (${tx.receiverId})`],
                ['Amount', `₹${Number(tx.amount).toLocaleString('en-IN')}`],
                ['Device', tx.deviceId],
                ['Location', tx.location],
                ['Time', new Date(tx.createdAt).toLocaleString('en-IN')]
              ].map(([label, val]) => (
                <Grid container spacing={1} key={label} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 4 }}><Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>{label}:</Typography></Grid>
                  <Grid size={{ xs: 8 }}><Typography variant="body2" sx={{ fontWeight: 500, fontFamily: label === 'Device' ? 'monospace' : 'inherit' }}>{val}</Typography></Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1, mb: 2 }}>ML Risk Classification</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box sx={{
                  width: 90, height: 90, borderRadius: '50%', border: '4px solid #fee2e2',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 1
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ef4444' }}>{tx.riskScore}</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>SCORE</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#64748b' }}>Risk Level:</Typography>
                  <Box sx={{ mt: 0.5 }}><RiskBadge riskLevel={tx.riskLevel} /></Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    Fraud Probability: {tx.fraudProbability ? (tx.fraudProbability * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Explainability */}
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1, mb: 2 }}>
                Why was this flagged?
              </Typography>
              {tx.fraudReasons.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No custom indicators matched.</Typography>
              ) : (
                tx.fraudReasons.map((reason, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                    <Typography sx={{ color: '#ef4444' }}>⚠️</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{reason}</Typography>
                      <Typography variant="caption" color="textSecondary">{getExplanation(reason)}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Combined Risk View (if voice analysis linked) */}
      {va && (
        <Card sx={{ boxShadow: 3, borderRadius: 3, mt: 4, border: '2px solid #8b5cf6' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>
              🔗 Combined Risk Analysis (Transaction + Voice)
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{tx.riskScore}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>Transaction Risk</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>{va.riskScore}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>Voice Risk</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: combinedRisk >= 70 ? '#fee2e2' : '#d1fae5', borderRadius: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: combinedRisk >= 70 ? '#dc2626' : '#059669' }}>{combinedRisk}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>Combined Risk</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>Why?</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569', mb: 1 }}>Transaction Indicators:</Typography>
                {tx.fraudReasons.map((r, i) => (
                  <Typography key={i} variant="body2" sx={{ ml: 2, color: '#1e293b' }}>• {r}</Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569', mb: 1 }}>Voice Indicators:</Typography>
                {va.indicators.map((ind, i) => (
                  <Typography key={i} variant="body2" sx={{ ml: 2, color: '#1e293b' }}>• {ind.label}</Typography>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </AdminSidebarLayout>
  );
};

export default FraudCaseDetails;
