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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { SocketContext } from '../../context/SocketContext';
import ConnectionStatus from '../../components/ConnectionStatus';

export default function LiveMonitor() {
  const { liveEvents, setLiveEvents } = useContext(SocketContext) || { liveEvents: [] };
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'VOICE' | 'DEVICE' | 'TRANSACTION'
  const [timeRange, setTimeRange] = useState('all'); // '5m' | '15m' | '1h' | 'all'
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initial load of recent events from REST API
  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      try {
        const res = await API.get('/events?limit=50');
        if (res.data && res.data.success) {
          // Merge historical events into liveEvents without duplicating eventIds
          setLiveEvents((prev) => {
            const existingIds = new Set(prev.map(e => e.eventId));
            const newHistorical = res.data.events.filter(e => !existingIds.has(e.eventId));
            return [...prev, ...newHistorical];
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to backfill historical event stream');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalEvents();
  }, [setLiveEvents]);

  // Filter events based on active filters
  const filteredEvents = liveEvents.filter((evt) => {
    if (filterType === 'HIGH' && evt.riskLevel !== 'HIGH') return false;
    if (filterType === 'MEDIUM' && evt.riskLevel !== 'MEDIUM') return false;
    if (filterType === 'VOICE' && evt.eventType !== 'VOICE_RISK_DETECTED' && !evt.eventType?.includes('VOICE')) return false;
    if (filterType === 'DEVICE' && evt.eventType !== 'DEVICE_CHANGE_DETECTED' && !evt.eventType?.includes('DEVICE')) return false;
    if (filterType === 'TRANSACTION' && !['TRANSACTION', 'HIGH_RISK_TRANSACTION'].includes(evt.eventType)) return false;

    if (timeRange !== 'all') {
      const evtTime = new Date(evt.timestamp || evt.createdAt).getTime();
      const now = Date.now();
      if (timeRange === '5m' && now - evtTime > 5 * 60 * 1000) return false;
      if (timeRange === '15m' && now - evtTime > 15 * 60 * 1000) return false;
      if (timeRange === '1h' && now - evtTime > 60 * 60 * 1000) return false;
    }

    return true;
  });

  const highCount = liveEvents.filter(e => e.riskLevel === 'HIGH' || e.eventType === 'HIGH_RISK_TRANSACTION').length;
  const mediumCount = liveEvents.filter(e => e.riskLevel === 'MEDIUM').length;
  const voiceCount = liveEvents.filter(e => e.eventType === 'VOICE_RISK_DETECTED').length;
  const deviceCount = liveEvents.filter(e => e.eventType === 'DEVICE_CHANGE_DETECTED').length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" fontWeight="bold">
              ⚡ Live Real-Time Fraud Monitor
            </Typography>
            <ConnectionStatus />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Continuous event stream capturing payment checks, behavioral deviations, device shifts, and voice scams.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant={isPaused ? 'contained' : 'outlined'}
            color={isPaused ? 'warning' : 'primary'}
            size="small"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶ Resume Stream' : '⏸ Pause Stream'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setLiveEvents([])}
          >
            🗑 Clear View
          </Button>
        </Box>
      </Box>

      {/* Summary Stream Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card sx={{ bgcolor: '#0f172a', color: '#fff' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Stream Events</Typography>
              <Typography variant="h4" fontWeight="bold">{liveEvents.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #ef4444' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">High-Risk Interceptions</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">{highCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Medium-Risk Warnings</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{mediumCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #8b5cf6' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Voice Phishing Alerts</Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#8b5cf6' }}>{voiceCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #3b82f6' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Device Shifts</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">{deviceCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">Filter by:</Typography>
                {[
                  { label: 'All', val: 'ALL' },
                  { label: 'High Risk', val: 'HIGH' },
                  { label: 'Medium Risk', val: 'MEDIUM' },
                  { label: 'Voice Phishing', val: 'VOICE' },
                  { label: 'Device Shifts', val: 'DEVICE' },
                  { label: 'Payments', val: 'TRANSACTION' }
                ].map(f => (
                  <Chip
                    key={f.val}
                    label={f.label}
                    clickable
                    color={filterType === f.val ? 'primary' : 'default'}
                    variant={filterType === f.val ? 'filled' : 'outlined'}
                    onClick={() => setFilterType(f.val)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">Window:</Typography>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                size="small"
                onChange={(e, nextVal) => nextVal && setTimeRange(nextVal)}
              >
                <ToggleButton value="5m">5 Min</ToggleButton>
                <ToggleButton value="15m">15 Min</ToggleButton>
                <ToggleButton value="1h">1 Hour</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Event Stream Table */}
      <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No events matched the selected filter in this time window.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Event Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Signals & Explanations</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Entity Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((evt, idx) => {
                    const timeStr = new Date(evt.timestamp || evt.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });

                    const isHigh = evt.riskLevel === 'HIGH' || evt.eventType === 'HIGH_RISK_TRANSACTION' || evt.riskScore >= 70;
                    const isMed = evt.riskLevel === 'MEDIUM';

                    return (
                      <TableRow
                        key={evt.eventId || idx}
                        sx={{
                          bgcolor: isHigh ? 'rgba(239, 68, 68, 0.04)' : 'inherit',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {timeStr}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={`${evt.riskScore || (isHigh ? 91 : isMed ? 55 : 15)}/100 ${isHigh ? 'HIGH' : isMed ? 'MED' : 'LOW'}`}
                            color={isHigh ? 'error' : isMed ? 'warning' : 'success'}
                            sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {evt.eventType === 'HIGH_RISK_TRANSACTION' ? '⚡ Payment Alert' :
                             evt.eventType === 'VOICE_RISK_DETECTED' ? '🎙️ Voice Scam' :
                             evt.eventType === 'DEVICE_CHANGE_DETECTED' ? '📱 Device Shift' :
                             evt.eventType === 'TRANSACTION_STATUS_CHANGED' ? '🔄 Status Update' :
                             evt.eventType || 'Payment'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {evt.amount ? `₹${Number(evt.amount).toLocaleString('en-IN')}` : '—'}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 360 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {evt.reasons && evt.reasons.length > 0 ? (
                              evt.reasons.slice(0, 2).map((r, i) => (
                                <Typography key={i} variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <span style={{ color: isHigh ? '#ef4444' : '#f59e0b' }}>•</span> {r}
                                </Typography>
                              ))
                            ) : evt.indicators && evt.indicators.length > 0 ? (
                              evt.indicators.slice(0, 2).map((ind, i) => (
                                <Typography key={i} variant="caption" color="text.secondary">
                                  • {ind.label || ind}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {evt.message || 'Standard verification check completed.'}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" display="block">
                            User: <strong>{evt.userName || evt.userId?.name || 'Account'}</strong>
                          </Typography>
                          {evt.receiverId && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              To: {evt.receiverName ? `${evt.receiverName} (${evt.receiverId})` : evt.receiverId}
                            </Typography>
                          )}
                          {evt.deviceId && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }} display="block">
                              Dev: {evt.deviceId}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {evt.transactionId && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  const caseTxId = typeof evt.transactionId === 'object'
                                    ? (evt.transactionId._id || evt.transactionId.id || evt.transactionId.transactionId)
                                    : evt.transactionId;
                                  if (caseTxId && caseTxId !== '[object Object]') {
                                    navigate(`/admin/fraud-cases/${caseTxId}`);
                                  } else {
                                    navigate('/admin/fraud-cases');
                                  }
                                }}
                              >
                                Case
                              </Button>
                            )}
                            {evt.deviceId && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate(`/admin/fraud-graph/DEVICE/${evt.deviceId}`)}
                              >
                                Graph
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
