import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Alert, Chip, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    todayCount: 0,
    suspiciousCount: 0,
    avgRiskScore: 0,
    totalCount: 0
  });

  const [securityData, setSecurityData] = useState({
    currentRiskScore: 15,
    currentRiskLevel: 'LOW',
    trustedDevicesCount: 1,
    knownReceiversCount: 6,
    suspiciousEventsCount: 0,
    trendSequence: '15'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [txRes, secRes] = await Promise.all([
          API.get('/transactions'),
          API.get('/security/overview').catch(() => ({ data: null }))
        ]);

        const transactions = txRes.data.transactions || [];
        const totalCount = transactions.length;
        
        // Count transactions made today
        const today = new Date().toDateString();
        const todayCount = transactions.filter(t => new Date(t.createdAt).toDateString() === today).length;

        // Count suspicious transactions (MEDIUM or HIGH risk level)
        const suspiciousCount = transactions.filter(t => t.riskLevel === 'MEDIUM' || t.riskLevel === 'HIGH').length;

        // Compute average risk score
        const totalRisk = transactions.reduce((acc, t) => acc + (t.riskScore || 0), 0);
        const avgRiskScore = totalCount > 0 ? Math.round(totalRisk / totalCount) : 0;

        setStats({
          todayCount,
          suspiciousCount,
          avgRiskScore,
          totalCount
        });

        if (secRes.data) {
          const secStatus = secRes.data.securityStatus;
          const scores = secRes.data.recentScores || [];
          const trendSequence = scores.length > 0
            ? scores.slice(-5).map(s => s.riskScore).join(' → ')
            : `${secStatus.currentRiskScore}`;

          setSecurityData({
            currentRiskScore: secStatus.currentRiskScore,
            currentRiskLevel: secStatus.currentRiskLevel,
            trustedDevicesCount: secStatus.trustedDevicesCount,
            knownReceiversCount: secStatus.knownReceiversCount,
            suspiciousEventsCount: secStatus.suspiciousEventsCount,
            trendSequence
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err.message);
        setError('Could not retrieve full statistics. Displaying available baseline data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const isHighRisk = securityData.currentRiskScore >= 70;
  const isMediumRisk = securityData.currentRiskScore >= 30 && securityData.currentRiskScore < 70;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
            Welcome, {user?.name || 'User'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Explainable Real-Time Fraud Shield & Behavioral Security Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/payment" 
            size="large" 
            sx={{ 
              backgroundColor: '#10b981', 
              '&:hover': { backgroundColor: '#059669' }, 
              textTransform: 'none', 
              fontWeight: 'bold', 
              borderRadius: 2 
            }}
          >
            💸 Make Payment
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/security" 
            size="large" 
            sx={{ 
              color: '#1e293b', 
              borderColor: '#1e293b', 
              '&:hover': { borderColor: '#334155', backgroundColor: '#f1f5f9' }, 
              textTransform: 'none', 
              fontWeight: 'bold', 
              borderRadius: 2 
            }}
          >
            🛡️ Security Center
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* PHASE 6: Real-Time Security Activity Card */}
      <Card sx={{
        mb: 4,
        borderRadius: 3,
        boxShadow: 3,
        borderLeft: `8px solid ${isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981'}`,
        backgroundColor: '#ffffff'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                🛡️ Your Security Activity
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Continuous real-time risk engine monitoring across device signatures, behavioral baselines, and payment frequency
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/security"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              Open Security Center →
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            {/* Risk Gauge */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ p: 2.5, backgroundColor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                    Your Security Status
                  </Typography>
                  <Chip
                    label={isHighRisk ? '🚨 Immediate Attention' : isMediumRisk ? '⚠ Attention Required' : '● Protected'}
                    color={isHighRisk ? 'error' : isMediumRisk ? 'warning' : 'success'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981', my: 1 }}>
                  {securityData.currentRiskScore} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/ 100 Risk</span>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={securityData.currentRiskScore}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981'
                    }
                  }}
                />
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                    Recent Risk Trend:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e293b', letterSpacing: 0.5 }}>
                    {securityData.trendSequence}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Behavioral & Device Counters */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Card sx={{ boxShadow: 0, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {securityData.trustedDevicesCount}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' }}>
                      Trusted Devices
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={4}>
                  <Card sx={{ boxShadow: 0, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                      {securityData.knownReceiversCount}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase' }}>
                      Known Receivers
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={4}>
                  <Card sx={{ boxShadow: 0, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                      {securityData.suspiciousEventsCount}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#991b1b', textTransform: 'uppercase' }}>
                      Suspicious Events
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Overview Statistics Cards */}
      <Grid container spacing={3}>
        {/* Today's Transactions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3, borderTop: '4px solid #3b82f6' }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Today's Transactions
              </Typography>
              <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mt: 1, color: '#1e293b' }}>
                {stats.todayCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Suspicious Transactions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3, borderTop: '4px solid #ef4444' }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Suspicious Activities
              </Typography>
              <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mt: 1, color: '#ef4444' }}>
                {stats.suspiciousCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Risk Score */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3, borderTop: '4px solid #f59e0b' }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Average Risk Score
              </Typography>
              <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mt: 1, color: '#f59e0b' }}>
                {stats.avgRiskScore} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/ 100</span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Protected Transactions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3, borderTop: '4px solid #10b981' }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Protected Payments
              </Typography>
              <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mt: 1, color: '#10b981' }}>
                {stats.totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
