import React, { useState, useEffect, useContext } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Paper, LinearProgress, Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';
import { SocketContext } from '../../context/SocketContext';
import ConnectionStatus from '../../components/ConnectionStatus';

const StatCard = ({ title, value, borderColor }) => (
  <Card sx={{ boxShadow: 2, borderRadius: 3, borderTop: `4px solid ${borderColor}` }}>
    <CardContent>
      <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1, color: '#1e293b' }}>
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
          API.get('/admin/statistics'),
          API.get('/admin/behavioral-insights').catch(() => ({ data: { insights: {}, topSuspiciousUsers: [] } }))
        ]);
        setStats(statsRes.data.statistics);
        setBehavioralInsights(insightsRes.data.insights || {});
        setTopUsers(insightsRes.data.topSuspiciousUsers || []);
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
          <CircularProgress />
        </Box>
      </AdminSidebarLayout>
    );
  }

  const s = stats || {};
  const b = behavioralInsights || {};
  const total = s.totalTransactions || 0;

  return (
    <AdminSidebarLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              Fraud Shield — Security Dashboard
            </Typography>
            <ConnectionStatus />
          </Box>
          <Typography variant="subtitle1" color="textSecondary">
            Institutional fraud audit, behavioral anomaly monitoring & real-time investigation engine.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component={Link}
            to="/admin/live-monitor"
            variant="contained"
            color="error"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            ⚡ Live Fraud Monitor
          </Button>
          <Button
            component={Link}
            to="/admin/system-monitoring"
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            🖥️ System Telemetry
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Total Transactions" value={total} borderColor="#475569" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Suspicious (Med + High)" value={(s.mediumRisk || 0) + (s.highRisk || 0)} borderColor="#f59e0b" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="High Risk Cases" value={s.highRisk || 0} borderColor="#ef4444" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="False Positives" value={s.falsePositives || 0} borderColor="#2563eb" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Voice Fraud Cases" value={s.voiceCases || 0} borderColor="#8b5cf6" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Average Risk Score" value={`${s.averageRiskScore || 0} / 100`} borderColor="#10b981" /></Grid>
      </Grid>

      {/* PHASE 8 & 9: Real-Time Stream & Fraud Intelligence Hub */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4, bgcolor: '#0f172a', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              🌐 Real-Time Event Streaming & Fraud Intelligence (Phase 9)
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Multi-entity relationship networks, suspicious syndicate clusters, and live event monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/admin/live-monitor"
              variant="contained"
              color="error"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              ⚡ Live Monitor
            </Button>
            <Button
              component={Link}
              to="/admin/system-monitoring"
              variant="contained"
              color="info"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              🖥️ Telemetry
            </Button>
            <Button
              component={Link}
              to="/admin/fraud-graph"
              variant="contained"
              color="primary"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              🕸️ Graph
            </Button>
            <Button
              component={Link}
              to="/admin/fraud-clusters"
              variant="contained"
              color="warning"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              👥 Clusters
            </Button>
            <Button
              component={Link}
              to="/admin/model-monitoring"
              variant="contained"
              color="secondary"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              🧠 ML Health
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* PHASE 6: Behavioral Anomalies Insight Card */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4, borderLeft: '6px solid #8b5cf6' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              🧠 Behavioral Anomalies & Deviation Signals
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aggregated real-time anomaly metrics across user accounts
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7c3aed' }}>
                {b.newDevices || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5b21b6' }}>
                New Devices
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                {b.unusualLocations || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
                Unusual Locations
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                {b.largeAmounts || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#991b1b' }}>
                Large Amounts
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                {b.frequencyAnomalies || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#92400e' }}>
                Frequency Anomalies
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                {b.newReceivers || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#166534' }}>
                New Receivers
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9333ea' }}>
                {b.voiceRisks || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6b21a8' }}>
                Voice Phishing
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Top suspicious users list with timeline link */}
        {topUsers.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1.5 }}>
              Top Flagged Users Under Investigation:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {topUsers.map((u) => (
                <Box key={u.userId} sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: '#f8fafc',
                  borderRadius: 2,
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      {u.name} ({u.email})
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {u.anomaliesCount} anomalous events recorded • Highest Risk: <strong>{u.highestRiskScore}/100</strong>
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to={`/admin/users/${u.userId}/risk-timeline`}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                  >
                    ⏱️ View Risk Timeline
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Risk Distribution */}
      {total > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>Risk Distribution</Typography>
          {[
            { label: 'LOW', count: s.lowRisk || 0, color: '#10b981' },
            { label: 'MEDIUM', count: s.mediumRisk || 0, color: '#f59e0b' },
            { label: 'HIGH', count: s.highRisk || 0, color: '#ef4444' }
          ].map(r => (
            <Box key={r.label} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>{r.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{r.count} ({total > 0 ? ((r.count / total) * 100).toFixed(1) : 0}%)</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={total > 0 ? (r.count / total) * 100 : 0}
                sx={{ height: 10, borderRadius: 5, backgroundColor: '#f1f5f9', '& .MuiLinearProgress-bar': { backgroundColor: r.color, borderRadius: 5 } }}
              />
            </Box>
          ))}
        </Paper>
      )}

      <Grid container spacing={4}>
        {/* Common Fraud Signals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>Common Fraud Signals</Typography>
            {(s.commonSignals || []).length === 0 ? (
              <Typography variant="body2" color="textSecondary">No patterns logged yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {s.commonSignals.map((sig, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                        {sig.name} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal' }}>({sig.source})</span>
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{sig.count} cases</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={total > 0 ? Math.min((sig.count / total) * 100, 100) : 0}
                      sx={{ height: 8, borderRadius: 4, backgroundColor: '#f1f5f9' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Fraud Trends */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>Fraud Trends (Last 7 Days)</Typography>
            {(s.trends || []).length === 0 ? (
              <Typography variant="body2" color="textSecondary">No recent activity.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {s.trends.map((t, i) => (
                  <Box key={i} sx={{
                    display: 'flex', justifyContent: 'space-between', p: 1.5,
                    backgroundColor: '#f8fafc', borderRadius: 2,
                    borderLeft: t.suspicious > 0 ? '4px solid #ef4444' : '4px solid #10b981'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
                      {new Date(t._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: t.suspicious > 0 ? '#b91c1c' : '#15803d' }}>
                      {t.suspicious} suspicious / {t.total} total
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;
