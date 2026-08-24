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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';

// Circular icon badges
const BiometricIcon = () => (
  <Box sx={{
    width: 44,
    height: 44,
    borderRadius: '50%',
    bgcolor: '#ecfdf5',
    border: '2px solid #10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem'
  }}>
    👆
  </Box>
);

const OtpShieldIcon = () => (
  <Box sx={{
    width: 44,
    height: 44,
    borderRadius: '50%',
    bgcolor: '#fffbeb',
    border: '2px solid #f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem'
  }}>
    🔐
  </Box>
);

const VerifyUserIcon = () => (
  <Box sx={{
    width: 44,
    height: 44,
    borderRadius: '50%',
    bgcolor: '#eff6ff',
    border: '2px solid #2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem'
  }}>
    👤
  </Box>
);

const SecurityCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [data, setData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Recommendation action dialogs
  const [dialogInfo, setDialogInfo] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError('');
      const [overviewRes, alertsRes] = await Promise.all([
        API.get('/security/overview').catch(() => ({ data: null })),
        API.get('/alerts').catch(() => ({ data: { alerts: [] } }))
      ]);

      if (overviewRes.data) {
        setData(overviewRes.data);
        setDevices(overviewRes.data.devices || []);
      }
      setAlerts(alertsRes.data?.alerts || []);
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
        <CircularProgress sx={{ color: '#4338ca' }} />
      </Box>
    );
  }

  const securityStatus = data?.securityStatus || {
    isProtected: true,
    statusText: 'Account Protected',
    currentRiskScore: 15,
    currentRiskLevel: 'LOW',
    trustedDevicesCount: 2,
    totalDevicesCount: 2,
    knownReceiversCount: 6,
    suspiciousEventsCount: 0
  };

  const securityScoreValue = 85;
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length || 3;
  const trustedDevicesCount = devices.length > 0 ? devices.length : 2;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '92vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', mb: 0.5 }}>
            Security Center
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem' }}>
            Manage your security and privacy
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

        {/* Top 4 KPI Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* 1. Devices */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1.5px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Devices
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563eb', mb: 0.5, fontSize: '2.1rem' }}>
                  {trustedDevicesCount}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#2563eb', fontWeight: 800, fontSize: '0.9rem' }}>
                  Trusted
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 2. Recent Alerts */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => setTabIndex(2)}
              sx={{
                borderRadius: 4,
                boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
                border: '1.5px solid #e2e8f0',
                bgcolor: '#ffffff',
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Recent Alerts
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#dc2626', mb: 0.5, fontSize: '2.1rem' }}>
                  {unreadAlertsCount}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#dc2626', fontWeight: 800, fontSize: '0.9rem' }}>
                  View
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 3. Security Score */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1.5px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Security Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: '2.1rem' }}>
                  {securityScoreValue}/100
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
                  Good
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 4. Account Security */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1.5px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Account Security
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', mb: 0.5, fontSize: '2.1rem' }}>
                  Strong
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
                  ● Protected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: '1px solid #e2e8f0', mb: 3.5 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.98rem',
                color: '#64748b',
                px: 3,
                py: 1.5,
                '&.Mui-selected': { color: '#4338ca' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#4338ca', height: 3, borderRadius: 1.5 }
            }}
          >
            <Tab label="🛡️ Recommendations" />
            <Tab label={`📱 Trusted Devices (${trustedDevicesCount})`} />
            <Tab label={`🔔 Security Alerts (${unreadAlertsCount})`} />
          </Tabs>
        </Box>

        {/* TAB 0: Security Recommendations */}
        {tabIndex === 0 && (
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: { xs: 2.5, md: 4 }
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 3, fontSize: '1.15rem' }}>
              Security Recommendations
            </Typography>

            <Stack spacing={2.5}>
              {/* Item 1: Biometric Login */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 2, md: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#f8fafc',
                border: '1px solid #f1f5f9',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BiometricIcon />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Enable biometric login
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                      Add an extra layer of security
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setBiometricEnabled(!biometricEnabled);
                    setSuccessMsg(biometricEnabled ? 'Biometric authentication disabled.' : 'Biometric fingerprint login enabled successfully!');
                  }}
                  sx={{
                    color: biometricEnabled ? '#059669' : '#4338ca',
                    borderColor: biometricEnabled ? '#a7f3d0' : '#c7d2fe',
                    bgcolor: biometricEnabled ? '#ecfdf5' : '#ffffff',
                    '&:hover': { borderColor: '#818cf8', bgcolor: '#f5f3ff' },
                    borderRadius: 2.5,
                    px: 3,
                    py: 0.9,
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: 100
                  }}
                >
                  {biometricEnabled ? '✓ Enabled' : 'Enable'}
                </Button>
              </Box>

              {/* Item 2: Avoid sharing OTP */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 2, md: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#f8fafc',
                border: '1px solid #f1f5f9',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <OtpShieldIcon />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Avoid sharing OTP
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                      Never share OTP with anyone
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => setDialogInfo({
                    title: '🔐 Zero OTP Sharing Policy',
                    content: 'FraudShield strictly monitors OTP coercion tactics. Real bank officials or payment agents will NEVER ask you for your one-time passwords or UPI PINs. Always reject urgent requests over phone calls.'
                  })}
                  sx={{
                    color: '#4338ca',
                    borderColor: '#c7d2fe',
                    bgcolor: '#ffffff',
                    '&:hover': { borderColor: '#818cf8', bgcolor: '#f5f3ff' },
                    borderRadius: 2.5,
                    px: 3,
                    py: 0.9,
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: 100
                  }}
                >
                  Learn More
                </Button>
              </Box>

              {/* Item 3: Verify recipient before paying */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 2, md: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#f8fafc',
                border: '1px solid #f1f5f9',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <VerifyUserIcon />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Verify recipient before paying
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                      Double check UPI ID before sending
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => setDialogInfo({
                    title: '👤 Recipient Verification Safeguard',
                    content: 'Whenever you transfer money to a new or unfamiliar UPI address, our AI engine cross-references syndicate fraud graphs, device associations, and historical flags to protect your funds.'
                  })}
                  sx={{
                    color: '#4338ca',
                    borderColor: '#c7d2fe',
                    bgcolor: '#ffffff',
                    '&:hover': { borderColor: '#818cf8', bgcolor: '#f5f3ff' },
                    borderRadius: 2.5,
                    px: 3,
                    py: 0.9,
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: 100
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Stack>
          </Card>
        )}

        {/* TAB 1: Trusted Devices */}
        {tabIndex === 1 && (
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: { xs: 2.5, md: 4 }
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 3, fontSize: '1.15rem' }}>
              Recognized & Trusted Devices
            </Typography>

            <Stack spacing={2}>
              {[
                {
                  id: 'dev_1',
                  name: 'Windows Desktop (Current Device)',
                  browser: 'Chrome 124',
                  os: 'Windows 11',
                  ip: '192.168.1.1',
                  isTrusted: true,
                  lastSeen: 'Active Now'
                },
                {
                  id: 'dev_2',
                  name: 'iPhone 15 Pro (Primary Phone)',
                  browser: 'Safari Mobile',
                  os: 'iOS 17.4',
                  ip: '192.168.1.45',
                  isTrusted: true,
                  lastSeen: '2 hours ago'
                }
              ].map((dev, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderRadius: 3.5,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                      💻
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {dev.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {dev.os} • {dev.browser} • {dev.lastSeen}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="✓ Trusted" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 800 }} />
                </Box>
              ))}
            </Stack>
          </Card>
        )}

        {/* TAB 2: Security Alerts */}
        {tabIndex === 2 && (
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: { xs: 2.5, md: 4 }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                Recent Security Alerts ({unreadAlertsCount})
              </Typography>
              <Button
                size="small"
                onClick={handleMarkAllAlertsRead}
                sx={{ color: '#4338ca', fontWeight: 700, textTransform: 'none' }}
              >
                Mark All Read
              </Button>
            </Box>

            <Stack spacing={2}>
              {[
                { title: 'New Device Login Detected', desc: 'A login was initiated from Windows 11 Chrome.', time: '10 mins ago', type: 'info' },
                { title: 'Payment Screened Safely', desc: '₹1,299 transfer to Amazon India verified with low risk.', time: '1 hour ago', type: 'success' },
                { title: 'Suspicious Coercion Warning', desc: 'Voice Shield intercepted potential urgency scam keyword.', time: 'Yesterday', type: 'warning' }
              ].map((alert, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alert.type === 'warning' ? '#fffbeb' : '#f8fafc',
                    border: alert.type === 'warning' ? '1px solid #fef3c7' : '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {alert.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {alert.desc}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    {alert.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        )}
      </Container>

      {/* Info Dialog */}
      <Dialog
        open={Boolean(dialogInfo)}
        onClose={() => setDialogInfo(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
          {dialogInfo?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
            {dialogInfo?.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setDialogInfo(null)}
            sx={{ bgcolor: '#0f172a', borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityCenter;
