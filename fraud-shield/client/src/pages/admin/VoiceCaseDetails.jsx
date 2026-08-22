import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box, Alert, CircularProgress, Chip, Divider } from '@mui/material';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import RiskBadge from '../../components/RiskBadge';
import API from '../../services/api';

const VoiceCaseDetails = () => {
  const { id } = useParams();
  const [voiceCase, setVoiceCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all voice cases and find the one with matching id
        const res = await API.get('/admin/voice-cases');
        const found = (res.data.cases || []).find(c => c.id === id);
        if (found) setVoiceCase(found);
        else setError('Voice case not found.');
      } catch (err) {
        setError('Failed to load voice case details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <AdminSidebarLayout><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box></AdminSidebarLayout>;
  }

  if (!voiceCase) {
    return (
      <AdminSidebarLayout>
        <Alert severity="error">{error || 'Voice case not found.'}</Alert>
        <Button component={Link} to="/admin/voice-cases" variant="contained" sx={{ mt: 2 }}>Back</Button>
      </AdminSidebarLayout>
    );
  }

  const vc = voiceCase;
  const tx = vc.transactionId;
  const combinedRisk = tx ? Math.round(tx.riskScore * 0.65 + vc.riskScore * 0.35) : null;

  return (
    <AdminSidebarLayout>
      <Button variant="outlined" component={Link} to="/admin/voice-cases" size="small" sx={{ mb: 2, borderRadius: 2 }}>← Back to Voice Cases</Button>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>Voice Case: #{vc.id}</Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Risk Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1, mb: 2 }}>Voice Risk Classification</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box sx={{
                  width: 90, height: 90, borderRadius: '50%', border: '4px solid #ede9fe',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 1
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>{vc.riskScore}</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b' }}>SCORE</Typography>
                </Box>
                <Box>
                  <RiskBadge riskLevel={vc.riskLevel} />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    Action: <strong>{vc.recommendedAction.replace(/_/g, ' ')}</strong>
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    Analyzed: {new Date(vc.createdAt).toLocaleString('en-IN')}
                  </Typography>
                  {tx && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      Linked TX: {tx.id}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detected Indicators */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1, mb: 2 }}>Detected Social Engineering Indicators</Typography>
              {vc.indicators.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No indicators detected.</Typography>
              ) : vc.indicators.map((ind, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                  <Chip label={ind.severity} size="small" color={ind.severity === 'HIGH' ? 'error' : 'warning'} sx={{ fontWeight: 'bold', fontSize: '0.7rem', minWidth: 50 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{ind.label}</Typography>
                    <Typography variant="caption" color="textSecondary">{ind.explanation}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Caller Explanations */}
        {vc.explanation && vc.explanation.length > 0 && (
          <Grid size={12}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1, mb: 2 }}>Analysis Summary</Typography>
                {vc.explanation.map((e, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 1, color: '#475569' }}>• {e}</Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Combined Risk (if transaction linked) */}
      {tx && (
        <Card sx={{ boxShadow: 3, borderRadius: 3, mt: 4, border: '2px solid #8b5cf6' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>
              🔗 Combined Risk Analysis
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
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>{vc.riskScore}</Typography>
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569', mb: 1 }}>Transaction Reasons:</Typography>
                {(tx.fraudReasons || []).map((r, i) => (
                  <Typography key={i} variant="body2" sx={{ ml: 2 }}>• {r}</Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569', mb: 1 }}>Voice Indicators:</Typography>
                {vc.indicators.map((ind, i) => (
                  <Typography key={i} variant="body2" sx={{ ml: 2 }}>• {ind.label}</Typography>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </AdminSidebarLayout>
  );
};

export default VoiceCaseDetails;
