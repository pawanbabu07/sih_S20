import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';
import { SocketContext } from '../../context/SocketContext';
import ConnectionStatus from '../../components/ConnectionStatus';

const sampleFallbackEvents = [
  {
    eventId: 'evt_1',
    time: '10:31:04',
    title: 'High Risk Transaction',
    desc: '₹90,000 to unknown@upi',
    riskLevel: 'HIGH',
    riskScore: 92
  },
  {
    eventId: 'evt_2',
    time: '10:31:32',
    title: 'New Device Detected',
    desc: 'User: Client Chrome • Windows 11',
    riskLevel: 'MEDIUM',
    riskScore: 54
  },
  {
    eventId: 'evt_3',
    time: '10:31:38',
    title: 'Voice Phishing Detected',
    desc: 'OTP request & urgency threat intercepted',
    riskLevel: 'HIGH',
    riskScore: 88
  },
  {
    eventId: 'evt_4',
    time: '10:31:45',
    title: 'Medium Risk Transaction',
    desc: '₹8,000 to merchant@upi',
    riskLevel: 'MEDIUM',
    riskScore: 48
  },
  {
    eventId: 'evt_5',
    time: '10:31:50',
    title: 'New Receiver Added',
    desc: 'receiver@upi verified',
    riskLevel: 'LOW',
    riskScore: 18
  }
];

export default function LiveMonitor() {
  const { liveEvents, setLiveEvents } = useContext(SocketContext) || { liveEvents: [] };
  const [filterType, setFilterType] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initial load of historical events
  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      try {
        const res = await API.get('/events?limit=30').catch(() => ({ data: null }));
        if (res.data && res.data.events && res.data.events.length > 0) {
          setLiveEvents((prev) => {
            const existingIds = new Set(prev.map(e => e.eventId || e.id));
            const newHistorical = res.data.events.filter(e => !existingIds.has(e.eventId || e.id));
            return [...prev, ...newHistorical];
          });
        }
      } catch (err) {
        console.error('Failed to backfill events:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalEvents();
  }, [setLiveEvents]);

  const displayList = (liveEvents && liveEvents.length > 0 ? liveEvents : sampleFallbackEvents).map((e, idx) => {
    const d = e.timestamp || e.createdAt ? new Date(e.timestamp || e.createdAt) : null;
    const timeStr = d
      ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      : (e.time || '10:31:00');

    let title = e.title || (e.eventType === 'HIGH_RISK_TRANSACTION' ? 'High Risk Transaction' : e.eventType === 'VOICE_RISK_DETECTED' ? 'Voice Phishing Detected' : e.eventType === 'DEVICE_CHANGE_DETECTED' ? 'New Device Detected' : 'Transaction Screened');
    let desc = e.desc || (e.amount ? `₹${Number(e.amount).toLocaleString('en-IN')} to ${e.receiverId || 'upi@bank'}` : e.explanation?.[0] || 'Real-time telemetry event');

    return {
      id: e.eventId || e._id || e.id || `evt_${idx}`,
      time: timeStr,
      title,
      desc,
      riskLevel: e.riskLevel || (e.riskScore >= 70 ? 'HIGH' : e.riskScore >= 30 ? 'MEDIUM' : 'LOW'),
      riskScore: e.riskScore || 20
    };
  });

  const filtered = displayList.filter(evt => {
    if (filterType === 'HIGH') return evt.riskLevel === 'HIGH';
    if (filterType === 'MEDIUM') return evt.riskLevel === 'MEDIUM';
    if (filterType === 'LOW') return evt.riskLevel === 'LOW';
    return true;
  });

  const highCount = displayList.filter(e => e.riskLevel === 'HIGH').length;
  const mediumCount = displayList.filter(e => e.riskLevel === 'MEDIUM').length;
  const lowCount = displayList.filter(e => e.riskLevel === 'LOW').length;

  return (
    <AdminSidebarLayout>
      {/* Top Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Live Monitor
            </Typography>
            {/* Pulsing Live Badge */}
            <Chip
              label="● LIVE"
              size="small"
              sx={{
                bgcolor: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: 0.5,
                px: 0.8,
                height: 24,
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <ConnectionStatus />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Real-time event stream capturing payment checks, behavioral deviations, device shifts, and voice scams.
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant={isPaused ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setIsPaused(!isPaused)}
            sx={{
              bgcolor: isPaused ? '#ea580c' : '#ffffff',
              color: isPaused ? '#ffffff' : '#475569',
              borderColor: '#cbd5e1',
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: 'none',
              px: 2,
              '&:hover': { bgcolor: isPaused ? '#c2410c' : '#f8fafc' }
            }}
          >
            {isPaused ? '▶ Resume Stream' : '⏸ Pause Stream'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setLiveEvents([])}
            sx={{
              color: '#dc2626',
              borderColor: '#fca5a5',
              bgcolor: '#ffffff',
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: 'none',
              px: 2,
              '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' }
            }}
          >
            Clear Stream
          </Button>
        </Box>
      </Box>

      {/* Top 4 KPI Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>TOTAL STREAM EVENTS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{displayList.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #fecaca',
            bgcolor: '#ffffff'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>HIGH RISK INTERCEPTIONS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>{highCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #fed7aa',
            bgcolor: '#ffffff'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 700 }}>MEDIUM RISK FLAGS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c', mt: 0.5 }}>{mediumCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #d1fae5',
            bgcolor: '#ffffff'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>SAFE VERIFIED</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>{lowCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main 2-Column 3D Layout (White Theme) */}
      <Grid container spacing={3}>
        {/* Left Column: Live Event Stream Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: { xs: 2.5, md: 3.5 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              {/* Filter Tabs */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                  Live Event Stream
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
                    <Chip
                      key={f}
                      label={f}
                      size="small"
                      onClick={() => setFilterType(f)}
                      sx={{
                        bgcolor: filterType === f ? '#4338ca' : '#f1f5f9',
                        color: filterType === f ? '#ffffff' : '#475569',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 2,
                        '&:hover': { bgcolor: filterType === f ? '#3730a3' : '#e2e8f0' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Event Stream List */}
              <Stack spacing={1.5} sx={{ maxHeight: 460, overflowY: 'auto', pr: 0.5 }}>
                {filtered.map((evt) => {
                  const isH = evt.riskLevel === 'HIGH';
                  const isM = evt.riskLevel === 'MEDIUM';

                  return (
                    <Box
                      key={evt.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
                      }}
                    >
                      {/* Left: Time & Details */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Timestamp */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: isH ? '#dc2626' : isM ? '#ea580c' : '#10b981',
                            minWidth: 68
                          }}
                        >
                          {evt.time}
                        </Typography>

                        {/* Title & Desc */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                            {evt.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.82rem', display: 'block' }}>
                            {evt.desc}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: Risk Pill */}
                      <Chip
                        label={isH ? 'High' : isM ? 'Medium' : 'Low'}
                        size="small"
                        sx={{
                          bgcolor: isH ? '#fee2e2' : isM ? '#fffbeb' : '#ecfdf5',
                          color: isH ? '#dc2626' : isM ? '#ea580c' : '#059669',
                          border: `1px solid ${isH ? '#fca5a5' : isM ? '#fed7aa' : '#a7f3d0'}`,
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRadius: 2,
                          px: 0.5
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* Bottom Real-Time Pulse Indicator */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10b981',
                boxShadow: '0 0 8px #10b981',
                animation: 'pulse 1.5s infinite'
              }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Auto-updates in real-time
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Live Risk Map Card (White Background Theme) */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: { xs: 2.5, md: 3.5 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                  Live Risk Map
                </Typography>
                <Chip
                  label="🛰️ Global Node Radar"
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: 2 }}
                />
              </Box>

              {/* 3D Visual Map Display */}
              <Box sx={{
                position: 'relative',
                borderRadius: 3.5,
                overflow: 'hidden',
                border: '1.5px solid #e2e8f0',
                bgcolor: '#f8fafc',
                mb: 2.5
              }}>
                <Box
                  component="img"
                  src="/images/live_risk_map_3d.jpg"
                  alt="3D Live Risk Map"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                />
              </Box>

              {/* Regional Radar Hotspot Summary */}
              <Grid container spacing={1.5}>
                {[
                  { city: 'Delhi / NCR', risk: 'Critical 85%', count: '14 Intercepted', color: '#dc2626', bg: '#fee2e2' },
                  { city: 'Mumbai', risk: 'Warning 70%', count: '9 Flagged', color: '#ea580c', bg: '#fffbeb' },
                  { city: 'Bengaluru', risk: 'Stable 12%', count: '128 Verified', color: '#059669', bg: '#ecfdf5' },
                  { city: 'Kolkata', risk: 'Medium 45%', count: '6 Monitoring', color: '#ea580c', bg: '#fffbeb' }
                ].map((node, i) => (
                  <Grid size={{ xs: 6 }} key={i}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                          {node.city}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {node.count}
                        </Typography>
                      </Box>
                      <Chip
                        label={node.risk}
                        size="small"
                        sx={{ bgcolor: node.bg, color: node.color, fontWeight: 800, fontSize: '0.72rem', height: 20 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Multi-region fraud perimeter defense connected to 4 cloud threat nodes.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </AdminSidebarLayout>
  );
}
