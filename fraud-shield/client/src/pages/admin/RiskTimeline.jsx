import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import RiskBadge from '../../components/RiskBadge';

const RiskTimeline = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get(`/admin/users/${userId}/risk-timeline`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load risk timeline:', err.message);
        setError(err.response?.data?.message || 'Could not retrieve user risk timeline.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTimeline();
    }
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const user = data?.user || { name: 'User', email: '***' };
  const timeline = data?.timeline || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/admin" underline="hover" color="inherit">
          Admin Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/admin/fraud-cases" underline="hover" color="inherit">
          Fraud Cases
        </MuiLink>
        <Typography color="textPrimary">User Investigation Timeline</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            ⏱️ User Risk Investigation Timeline
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Chronological multi-signal audit log for <strong>{user.name}</strong> ({user.email})
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
        >
          ← Back to Admin Cases
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {timeline.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h6" color="textSecondary">
            No risk events recorded for this user yet.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ position: 'relative', pl: { xs: 2, md: 4 } }}>
          {/* Vertical timeline line */}
          <Box sx={{
            position: 'absolute',
            top: 20,
            bottom: 20,
            left: { xs: 26, md: 42 },
            width: 3,
            backgroundColor: '#cbd5e1',
            zIndex: 0
          }} />

          {timeline.map((event, idx) => {
            const isHigh = event.riskLevel === 'HIGH';
            const isMed = event.riskLevel === 'MEDIUM';

            return (
              <Box key={event.id || idx} sx={{ display: 'flex', gap: 3, mb: 4, position: 'relative', zIndex: 1 }}>
                {/* Timeline Icon Node */}
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#dcfce7',
                  border: `3px solid ${isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                  boxShadow: 2
                }}>
                  {event.icon || '⚡'}
                </Box>

                {/* Timeline Event Card */}
                <Card sx={{
                  flexGrow: 1,
                  borderRadius: 3,
                  boxShadow: 3,
                  borderLeft: `6px solid ${isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981'}`,
                  backgroundColor: '#ffffff'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          🕒 {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`Risk: ${event.riskScore} / 100`}
                          color={isHigh ? 'error' : isMed ? 'warning' : 'success'}
                          sx={{ fontWeight: 'bold' }}
                        />
                        <RiskBadge riskLevel={event.riskLevel} />
                      </Box>
                    </Box>

                    {/* Detected Signals */}
                    {event.signals && event.signals.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1.5 }}>
                        {event.signals.map((sig, sIdx) => (
                          <Chip
                            key={sIdx}
                            size="small"
                            label={`🚩 ${sig}`}
                            variant="outlined"
                            sx={{ fontWeight: 'bold', fontSize: '0.75rem', borderColor: '#cbd5e1' }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Explainable Reasons */}
                    {event.reasons && event.reasons.length > 0 && (
                      <Box sx={{ mt: 1.5, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#334155', mb: 0.5 }}>
                          Detected Risk Factors:
                        </Typography>
                        {event.reasons.map((reason, rIdx) => (
                          <Typography key={rIdx} variant="body2" sx={{ color: '#475569', display: 'flex', gap: 1, my: 0.3 }}>
                            <span>•</span> {reason}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {/* Metadata Context */}
                    {event.metadata && (
                      <Grid container spacing={2} sx={{ mt: 1, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                        {event.metadata.amount !== undefined && (
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Amount</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>₹{event.metadata.amount}</Typography>
                          </Grid>
                        )}
                        {event.metadata.receiverId && (
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Receiver</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{event.metadata.receiverId}</Typography>
                          </Grid>
                        )}
                        {event.metadata.deviceId && (
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Device ID</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{event.metadata.deviceId}</Typography>
                          </Grid>
                        )}
                        {event.metadata.location && (
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Location</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{event.metadata.location}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default RiskTimeline;
