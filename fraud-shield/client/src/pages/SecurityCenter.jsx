import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import RiskBadge from '../components/RiskBadge';

const SecurityCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize tab index based on route (e.g. /security/devices -> tab 1)
  const initialTab = location.pathname.includes('/devices') ? 1 : 0;
  const [tabIndex, setTabIndex] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [data, setData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError('');
      const [overviewRes, alertsRes] = await Promise.all([
        API.get('/security/overview'),
        API.get('/alerts')
      ]);

      setData(overviewRes.data);
      setDevices(overviewRes.data.devices || []);
      setAlerts(alertsRes.data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch security center data:', err.message);
      setError('Could not load security center metrics. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError('');
    setSuccessMsg('');
  };

  const handleTrustDevice = async (deviceId) => {
    try {
      setActionLoading(true);
      setError('');
      const res = await API.patch(`/security/devices/${deviceId}/trust`);
      setSuccessMsg(res.data.message || 'Device marked as trusted.');

      // Refresh overview data
      await fetchSecurityData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update device trust.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAlertRead = async (alertId) => {
    try {
      await API.patch(`/alerts/${alertId}/read`);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    } catch (err) {
      console.error('Failed to mark alert as read:', err.message);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    try {
      await API.patch('/alerts/read-all');
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setSuccessMsg('All alerts marked as read.');
    } catch (err) {
      setError('Failed to mark all alerts as read.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const securityStatus = data?.securityStatus || {
    isProtected: true,
    statusText: 'Account Protected',
    currentRiskScore: 15,
    currentRiskLevel: 'LOW',
    trustedDevicesCount: 1,
    totalDevicesCount: 1,
    knownReceiversCount: 6,
    suspiciousEventsCount: 0
  };

  const recentEvents = data?.recentEvents || [];
  const recentScores = data?.recentScores || [];
  const isHighRisk = securityStatus.currentRiskScore >= 70;
  const isMediumRisk = securityStatus.currentRiskScore >= 30 && securityStatus.currentRiskScore < 70;

  // Format trend sequence: e.g. "20 → 25 → 18 → 32 → 72"
  const trendSequence = recentScores.length > 0
    ? recentScores.slice(-5).map(s => s.riskScore).join(' → ')
    : `${securityStatus.currentRiskScore}`;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            🛡️ User Security Center
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Continuous device intelligence, behavioral baseline profiling & real-time risk status
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/payment')}
          sx={{
            backgroundColor: '#10b981',
            '&:hover': { backgroundColor: '#059669' },
            borderRadius: 2,
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          💸 Test UPI Payment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

      {/* Tabs */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, backgroundColor: '#f8fafc' }}
        >
          <Tab label="📊 Security Overview" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
          <Tab
            label={`📱 Trusted Devices (${devices.length})`}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          />
          <Tab
            label={`🔔 Alerts (${alerts.filter(a => !a.isRead).length} Unread)`}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          />
          <Tab label="📈 Risk History" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
        </Tabs>

        {/* Tab 0: Security Overview */}
        {tabIndex === 0 && (
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Account Status Card */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Card sx={{
                  boxShadow: 2,
                  borderRadius: 3,
                  borderLeft: `8px solid ${isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981'}`,
                  backgroundColor: '#ffffff'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                        Account Protection Status
                      </Typography>
                      <Chip
                        label={securityStatus.statusText}
                        color={isHighRisk ? 'error' : isMediumRisk ? 'warning' : 'success'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      Continuous behavioral modeling actively evaluates device signatures, habitual payment hours, location shifts, and social engineering risk.
                    </Typography>

                    {/* Risk Gauge Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                          Current Account Risk Score
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981' }}>
                          {securityStatus.currentRiskScore} / 100 ({securityStatus.currentRiskLevel})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={securityStatus.currentRiskScore}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981'
                          }
                        }}
                      />
                    </Box>

                    {/* Trend Sequence */}
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                        Recent Risk Trend:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b', letterSpacing: 0.5 }}>
                        {trendSequence}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Metric Quick Stats */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Card sx={{ boxShadow: 1, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                        {securityStatus.trustedDevicesCount}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' }}>
                        Trusted Devices
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card sx={{ boxShadow: 1, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                        {securityStatus.knownReceiversCount}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase' }}>
                        Known Receivers
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card sx={{ boxShadow: 1, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                        {securityStatus.totalDevicesCount}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#92400e', textTransform: 'uppercase' }}>
                        Total Devices
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card sx={{ boxShadow: 1, borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                        {securityStatus.suspiciousEventsCount}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#991b1b', textTransform: 'uppercase' }}>
                        Suspicious Events
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Recent Security Timeline */}
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', mt: 2, mb: 2 }}>
                  Recent Security Events
                </Typography>
                {recentEvents.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>No security events recorded yet.</Alert>
                ) : (
                  <List sx={{ backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    {recentEvents.map((evt, idx) => (
                      <ListItem
                        key={evt.id || idx}
                        sx={{
                          borderBottom: idx < recentEvents.length - 1 ? '1px solid #f1f5f9' : 'none',
                          py: 1.5
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, fontSize: '1.4rem' }}>
                          {evt.riskLevel === 'HIGH' ? '🚨' : evt.riskLevel === 'MEDIUM' ? '⚠️' : '✓'}
                        </ListItemIcon>
                        <ListItemText
                          disableTypography
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body1" component="span" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {evt.eventType === 'DEVICE_CHANGE' ? 'New Device Detected' :
                                 evt.eventType === 'VOICE_RISK' ? 'Voice Phishing Risk Analyzed' :
                                 evt.eventType === 'COMBINED_RISK' ? 'Combined Transaction & Voice Evaluation' :
                                 evt.eventType === 'BEHAVIOR_ANOMALY' ? 'Behavioral Baseline Deviation' :
                                 'Transaction Security Evaluation'}
                              </Typography>
                              <RiskBadge riskLevel={evt.riskLevel} />
                              <Chip size="small" label={`Score: ${evt.riskScore}`} sx={{ fontWeight: 'bold', height: 22 }} />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" component="div" color="textSecondary" sx={{ mt: 0.5 }}>
                              {evt.reasons && evt.reasons.length > 0 ? evt.reasons.join(' • ') : 'Normal behavioral parameters verified.'}
                              {' — '}
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {new Date(evt.timestamp).toLocaleString()}
                              </span>
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Tab 1: Device Management */}
        {tabIndex === 1 && (
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  Registered Devices & Trust Scores
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Known devices receive higher trust scores over time. You can mark familiar devices as trusted.
                </Typography>
              </Box>
            </Box>

            {devices.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No devices registered yet. Initiate a transaction to record a device.</Alert>
            ) : (
              <Grid container spacing={3}>
                {devices.map((device) => (
                  <Grid size={{ xs: 12, md: 6 }} key={device.id || device.deviceId}>
                    <Card sx={{
                      boxShadow: 2,
                      borderRadius: 3,
                      border: `1px solid ${device.isTrusted ? '#86efac' : '#e2e8f0'}`,
                      backgroundColor: device.isTrusted ? '#f0fdf4' : '#ffffff'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{device.deviceType === 'Mobile' ? '📱' : '💻'}</span> {device.browser} / {device.operatingSystem}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                              ID: {device.deviceId}
                            </Typography>
                          </Box>
                          <Chip
                            label={device.trustCategory}
                            color={device.isTrusted ? 'success' : device.trustScore >= 30 ? 'warning' : 'default'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>

                        {/* Trust Score bar */}
                        <Box sx={{ my: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#475569' }}>
                              Device Trust Score
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: device.isTrusted ? '#16a34a' : '#d97706' }}>
                              {device.trustScore} / 100
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={device.trustScore}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: device.isTrusted ? '#16a34a' : device.trustScore >= 30 ? '#f59e0b' : '#94a3b8'
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                              Last Used: {new Date(device.lastSeen).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Transactions: <strong>{device.transactionCount || 1}</strong>
                            </Typography>
                          </Box>

                          {!device.isTrusted ? (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={actionLoading}
                              onClick={() => handleTrustDevice(device.deviceId)}
                              sx={{
                                backgroundColor: '#10b981',
                                '&:hover': { backgroundColor: '#059669' },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓ Mark as Trusted
                            </Button>
                          ) : (
                            <Chip label="✓ Verified Device" size="small" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        )}

        {/* Tab 2: Alerts */}
        {tabIndex === 2 && (
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  Security & Fraud Notifications
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Real-time alerts triggered by suspicious payment behavior, new devices, or voice phishing
                </Typography>
              </Box>
              {alerts.some(a => !a.isRead) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMarkAllAlertsRead}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  ✓ Mark All as Read
                </Button>
              )}
            </Box>

            {alerts.length === 0 ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>No active security alerts. Your account is clear of suspicious events.</Alert>
            ) : (
              <List sx={{ backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                {alerts.map((alert, idx) => (
                  <ListItem
                    key={alert.id || idx}
                    sx={{
                      borderBottom: idx < alerts.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: !alert.isRead ? '#fef2f2' : 'transparent',
                      py: 2
                    }}
                    secondaryAction={
                      !alert.isRead && (
                        <Button
                          size="small"
                          onClick={() => handleMarkAlertRead(alert.id)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Mark read
                        </Button>
                      )
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40, fontSize: '1.5rem' }}>
                      {alert.type === 'DEVICE_CHANGE' ? '📱' :
                       alert.type === 'VOICE_WARNING' ? '🎙️' :
                       alert.type === 'FRAUD_WARNING' ? '⚠️' : '🛡️'}
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: !alert.isRead ? 'bold' : 600, color: '#1e293b' }}>
                            {alert.title}
                          </Typography>
                          {!alert.isRead && (
                            <Chip size="small" label="NEW" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }} />
                          )}
                          <Chip size="small" label={alert.type} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" component="div" sx={{ color: '#475569', mb: 0.5 }}>
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ color: '#94a3b8' }}>
                            {new Date(alert.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        )}

        {/* Tab 3: Risk Score History */}
        {tabIndex === 3 && (
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
              Historical Risk Score Progression
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Chronological log of multi-signal risk evaluations for this account.
            </Typography>

            {recentScores.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No historical risk score entries found.</Alert>
            ) : (
              <Grid container spacing={2}>
                {recentScores.map((scoreEntry, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                    <Card sx={{
                      boxShadow: 1,
                      borderRadius: 2,
                      borderLeft: `6px solid ${scoreEntry.riskScore >= 70 ? '#ef4444' : scoreEntry.riskScore >= 30 ? '#f59e0b' : '#10b981'}`,
                      p: 2
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                          📅 {scoreEntry.date}
                        </Typography>
                        <RiskBadge riskLevel={scoreEntry.riskLevel || (scoreEntry.riskScore >= 70 ? 'HIGH' : scoreEntry.riskScore >= 30 ? 'MEDIUM' : 'LOW')} />
                      </Box>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                          {scoreEntry.riskScore}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                          / 100 RISK
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        )}
      </Card>
    </Container>
  );
};

export default SecurityCenter;
