import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  LinearProgress
} from '@mui/material';
import API from '../../services/api';
import { SocketContext } from '../../context/SocketContext';
import ConnectionStatus from '../../components/ConnectionStatus';

export default function SystemMonitoring() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { connectionStatus } = useContext(SocketContext) || {};

  const fetchSystemHealth = async () => {
    try {
      const res = await API.get('/admin/system-health');
      if (res.data && res.data.success) {
        setHealthData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch system health telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 5000); // 5s telemetry polling
    return () => clearInterval(interval);
  }, []);

  const services = healthData?.services || {
    backend: 'online',
    database: 'online',
    ml: 'online',
    socket: connectionStatus === 'LIVE' ? 'online' : 'offline'
  };

  const metrics = healthData?.metrics || {
    connectedUsers: 0,
    connectedAdmins: 0,
    eventsLastMinute: 0,
    fraudEventsLastMinute: 0,
    averageRiskScore: 0
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            🖥️ System Health & Real-Time Telemetry
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continuous diagnostic probes across API, Database, ML Flask Server, and Socket.IO Event Engine.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectionStatus />
          <Button variant="outlined" onClick={fetchSystemHealth}>
            🔄 Refresh Metrics
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* Services Health Grid */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Service Cluster Status
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Backend API */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: `4px solid ${services.backend === 'online' ? '#10b981' : '#ef4444'}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Node.js Express API</Typography>
                    <Chip
                      size="small"
                      label={services.backend === 'online' ? '● ONLINE' : '○ OFFLINE'}
                      color={services.backend === 'online' ? 'success' : 'error'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Port 5000 • Helmet & Rate-Limit</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* MongoDB Atlas */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: `4px solid ${services.database === 'online' ? '#10b981' : '#ef4444'}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">MongoDB Atlas</Typography>
                    <Chip
                      size="small"
                      label={services.database === 'online' ? '● ONLINE' : '○ OFFLINE'}
                      color={services.database === 'online' ? 'success' : 'error'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Primary Document Database</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Python ML Service */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: `4px solid ${services.ml === 'online' ? '#10b981' : '#ef4444'}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Flask ML Model Server</Typography>
                    <Chip
                      size="small"
                      label={services.ml === 'online' ? '● ONLINE' : '○ OFFLINE'}
                      color={services.ml === 'online' ? 'success' : 'error'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Port 8000 • Random Forest Pipeline</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Socket.IO Engine */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: `4px solid ${services.socket === 'online' ? '#10b981' : '#ef4444'}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Socket.IO Stream Engine</Typography>
                    <Chip
                      size="small"
                      label={services.socket === 'online' ? '● ONLINE' : '○ OFFLINE'}
                      color={services.socket === 'online' ? 'success' : 'error'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">WebSockets + Polling Fallback</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Telemetry Real-Time Metrics */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Real-Time Stream Telemetry & Throughput
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Active Users Connected</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">{metrics.connectedUsers}</Typography>
                  <Typography variant="caption" color="text.secondary">Subscribed in private rooms</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Admin Analysts Connected</Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">{metrics.connectedAdmins}</Typography>
                  <Typography variant="caption" color="text.secondary">Subscribed to admin room</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Events in Last Minute</Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">{metrics.eventsLastMinute}</Typography>
                  <Typography variant="caption" color="text.secondary">Real-time throughput rate</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Fraud Interceptions / Min</Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">{metrics.fraudEventsLastMinute}</Typography>
                  <Typography variant="caption" color="text.secondary">High-risk events triggered</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Live Avg Risk Score</Typography>
                  <Typography variant="h4" fontWeight="bold">{metrics.averageRiskScore} / 100</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.averageRiskScore}
                    color={metrics.averageRiskScore >= 70 ? 'error' : metrics.averageRiskScore >= 40 ? 'warning' : 'success'}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
