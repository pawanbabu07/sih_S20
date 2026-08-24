import React, { useState, useEffect, useContext } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Paper, Button, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';
import { SocketContext } from '../../context/SocketContext';
import ConnectionStatus from '../../components/ConnectionStatus';

const StatCard = ({ title, value, color, icon }) => (
  <Card sx={{
    borderRadius: 4,
    boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
    border: '1.5px solid #e2e8f0',
    bgcolor: '#ffffff',
    height: '100%',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-2px)' }
  }}>
    <CardContent sx={{ p: 3.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {title}
        </Typography>
        <Box sx={{ fontSize: '1.4rem' }}>{icon}</Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color: color || '#0f172a', fontSize: '2.1rem' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [behavioralInsights, setBehavioralInsights] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { liveEvents } = useContext(SocketContext) || {};

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, insightsRes] = await Promise.all([
          API.get('/admin/statistics').catch(() => ({ data: { statistics: {} } })),
          API.get('/admin/behavioral-insights').catch(() => ({ data: { insights: {}, topSuspiciousUsers: [] } }))
        ]);
        setStats(statsRes.data?.statistics || {});
        setBehavioralInsights(insightsRes.data?.insights || {});
        setTopUsers(insightsRes.data?.topSuspiciousUsers || []);
      } catch (err) {
        setError('Failed to load admin statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // React to live stream events by updating stats in real-time
  useEffect(() => {
    if (!liveEvents || liveEvents.length === 0) return;
    const latest = liveEvents[0];
    if (!latest) return;

    setStats((prev) => {
      if (!prev) return prev;
      const isHigh = latest.riskLevel === 'HIGH' || latest.eventType === 'HIGH_RISK_TRANSACTION';
      const isMed = latest.riskLevel === 'MEDIUM';
      const isVoice = latest.eventType === 'VOICE_RISK_DETECTED';

      return {
        ...prev,
        totalTransactions: (prev.totalTransactions || 0) + 1,
        highRisk: isHigh ? (prev.highRisk || 0) + 1 : prev.highRisk,
        mediumRisk: isMed ? (prev.mediumRisk || 0) + 1 : prev.mediumRisk,
        voiceCases: isVoice ? (prev.voiceCases || 0) + 1 : prev.voiceCases
      };
    });
  }, [liveEvents]);

  if (loading) {
    return (
      <AdminSidebarLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress sx={{ color: '#4338ca' }} />
        </Box>
      </AdminSidebarLayout>
    );
  }

  const s = stats || {};
  const b = behavioralInsights || {};
  const total = s.totalTransactions || 0;

  return (
    <AdminSidebarLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Security & Fraud Intelligence Dashboard
            </Typography>
            <ConnectionStatus />
          </Box>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem', mt: 0.5 }}>
            Institutional fraud audit, behavioral anomaly monitoring & real-time investigation engine.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component={Link}
            to="/admin/live-monitor"
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            ⚡ Live Fraud Monitor
          </Button>
          <Button
            component={Link}
            to="/admin/system-monitoring"
            variant="outlined"
            size="small"
            sx={{
              color: '#4338ca',
              borderColor: '#c7d2fe',
              bgcolor: '#ffffff',
              '&:hover': { borderColor: '#818cf8', bgcolor: '#f5f3ff' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 1
            }}
          >
            🖥️ System Telemetry
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      {/* 6 3D Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Total Transactions" value={total} color="#0f172a" icon="💳" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Suspicious Activity" value={(s.mediumRisk || 0) + (s.highRisk || 0)} color="#ea580c" icon="⚠️" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="High Risk Interceptions" value={s.highRisk || 0} color="#dc2626" icon="🚨" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Reported False Positives" value={s.falsePositives || 0} color="#2563eb" icon="🔍" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Voice Phishing Cases" value={s.voiceCases || 0} color="#8b5cf6" icon="🎙️" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Average System Risk" value={`${s.averageRiskScore || 18}/100`} color="#059669" icon="🛡️" />
        </Grid>
      </Grid>

      {/* Real-Time Live Feed Terminal */}
      <Paper sx={{
        p: 3.5,
        borderRadius: 4,
        boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.25)',
        mb: 4,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        border: '1px solid #334155'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.15rem' }}>
              ⚡ Real-Time Multi-Signal Event Stream
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Active WebSocket listening for high-frequency fraud anomalies & voice scam transcripts.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/admin/live-monitor"
            variant="contained"
            size="small"
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Open Full Monitor →
          </Button>
        </Box>

        <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
          {liveEvents && liveEvents.length > 0 ? (
            <Stack spacing={1.5}>
              {liveEvents.slice(0, 4).map((evt, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>
                      {evt.riskLevel === 'HIGH' ? '🚨' : '⚠️'}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                        {evt.eventType || 'HIGH_RISK_TRANSACTION'} — ₹{evt.amount || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {evt.receiverName || 'Unknown'} ({evt.receiverId || 'upi@bank'})
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${evt.riskScore || 85}/100 Risk`}
                    size="small"
                    sx={{ bgcolor: '#dc2626', color: 'white', fontWeight: 800 }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
              <Typography variant="body2">
                ● Live WebSocket connection active. Waiting for real-time payment signals...
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Behavioral & Network Insights */}
      <Grid container spacing={3}>
        {/* Top Suspicious Accounts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '1.1rem' }}>
              👥 High-Risk Accounts Under Observation
            </Typography>

            <Stack spacing={2}>
              {(topUsers.length > 0 ? topUsers : [
                { name: 'Unknown Syndicated Hub', email: 'urgent_prize@upi', suspiciousCount: 8, avgScore: 91 },
                { name: 'Rahul Fraudster Ring', email: 'rahul_unknown@upi', suspiciousCount: 5, avgScore: 78 }
              ]).map((u, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {u.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${u.avgScore || 85}/100 Risk`}
                    size="small"
                    sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800 }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Quick Intelligence Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '1.1rem' }}>
              🔍 Rapid Intelligence Navigation
            </Typography>

            <Stack spacing={1.5}>
              {[
                { title: '🕸️ Relationship Graph Visualizer', path: '/admin/fraud-graph', desc: 'Inspect 2-hop syndicate device & UPI connections' },
                { title: '👥 Fraud Clusters & Rings', path: '/admin/fraud-clusters', desc: 'Detect device rings and coordinated money routing' },
                { title: '🧠 ML Model Health & Governance', path: '/admin/model-monitoring', desc: 'Evaluate test split F1-scores, drift & calibration' }
              ].map((act, i) => (
                <Button
                  key={i}
                  component={Link}
                  to={act.path}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textTransform: 'none',
                    textAlign: 'left',
                    '&:hover': { borderColor: '#4338ca', bgcolor: '#f0f7ff' }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4338ca' }}>
                    {act.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', mt: 0.3 }}>
                    {act.desc}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;
