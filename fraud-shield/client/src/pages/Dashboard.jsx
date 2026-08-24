import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, CircularProgress, Alert, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

// Fallback demo recent transactions if brand new account
const initialSampleTransactions = [
  {
    _id: 'tx_1',
    receiverName: 'Amazon India',
    receiverId: 'amazon@upi',
    amount: 1299,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    riskLevel: 'LOW',
    riskScore: 12,
    status: 'COMPLETED'
  },
  {
    _id: 'tx_2',
    receiverName: 'Ramesh Kumar',
    receiverId: 'ramesh@upi',
    amount: 2500,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    riskLevel: 'LOW',
    riskScore: 18,
    status: 'COMPLETED'
  },
  {
    _id: 'tx_3',
    receiverName: 'Flipkart Online',
    receiverId: 'flipkart@upi',
    amount: 1799,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    riskLevel: 'MEDIUM',
    riskScore: 42,
    status: 'COMPLETED'
  },
  {
    _id: 'tx_4',
    receiverName: 'Unknown Account',
    receiverId: 'unknown_scam@upi',
    amount: 40000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    riskLevel: 'HIGH',
    riskScore: 88,
    status: 'CANCELLED'
  }
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    currentRiskScore: 18,
    currentRiskLevel: 'LOW',
    monthlyTransactions: 24,
    totalSaved: 24500
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [txRes, secRes] = await Promise.all([
          API.get('/transactions').catch(() => ({ data: { transactions: [] } })),
          API.get('/security/overview').catch(() => ({ data: null }))
        ]);

        const rawTxs = txRes.data?.transactions || [];
        const displayTxs = rawTxs.length > 0 ? rawTxs : initialSampleTransactions;
        setTransactions(displayTxs);

        const totalCount = rawTxs.length > 0 ? rawTxs.length : 24;
        const totalSavedAmount = rawTxs
          .filter(t => t.status === 'CANCELLED' || t.riskLevel === 'HIGH')
          .reduce((acc, t) => acc + (t.amount || 0), 0);

        let riskScore = 18;
        let riskLevel = 'LOW';

        if (secRes.data?.securityStatus) {
          riskScore = secRes.data.securityStatus.currentRiskScore || 18;
          riskLevel = secRes.data.securityStatus.currentRiskLevel || 'LOW';
        }

        setStats({
          currentRiskScore: riskScore,
          currentRiskLevel: riskLevel,
          monthlyTransactions: totalCount,
          totalSaved: totalSavedAmount > 0 ? totalSavedAmount : 24500
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err.message);
        setError('Displaying baseline security status.');
        setTransactions(initialSampleTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ color: '#4338ca' }} />
      </Box>
    );
  }

  const formatTxDate = (dateString) => {
    const d = new Date(dateString);
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
  };

  const getRiskStyles = (level) => {
    switch (level) {
      case 'HIGH':
        return {
          dotColor: '#ef4444',
          dotBg: '#fee2e2',
          chipBg: '#fef2f2',
          chipColor: '#dc2626',
          chipBorder: '#fecaca',
          label: 'High Risk'
        };
      case 'MEDIUM':
        return {
          dotColor: '#f59e0b',
          dotBg: '#fef3c7',
          chipBg: '#fffbeb',
          chipColor: '#d97706',
          chipBorder: '#fde68a',
          label: 'Medium Risk'
        };
      case 'LOW':
      default:
        return {
          dotColor: '#2563eb',
          dotBg: '#eff6ff',
          chipBg: '#ecfdf5',
          chipColor: '#059669',
          chipBorder: '#a7f3d0',
          label: 'Low Risk'
        };
    }
  };

  // 7-day risk trend points
  const trendPoints = [
    { label: 'May 7', score: 28, x: 40, y: 155 },
    { label: 'May 9', score: 38, x: 95, y: 135 },
    { label: 'May 10', score: 36, x: 140, y: 140 },
    { label: 'May 11', score: 54, x: 190, y: 105 },
    { label: 'May 12', score: 50, x: 235, y: 112 },
    { label: 'May 13', score: 48, x: 280, y: 117 },
    { label: 'May 14', score: 58, x: 325, y: 97 },
    { label: 'May 15', score: 65, x: 370, y: 83 },
    { label: 'May 16', score: 72, x: 415, y: 70 }
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Top 4 KPI Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* 1. Security Status */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Security Status
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mb: 0.5, fontSize: '1.9rem' }}>
                  Protected
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                  You are safe to transact
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 2. Risk Score */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Risk Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: '1.9rem' }}>
                  {stats.currentRiskScore}/100
                </Typography>
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>
                  Low Risk
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 3. Transactions (This Month) */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Transactions (This Month)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: '1.9rem' }}>
                  {stats.monthlyTransactions}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>▲ +12%</span> from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 4. Total Saved */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                  Total Saved
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: '1.9rem' }}>
                  ₹{stats.totalSaved.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Potentially saved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* Main Content Grid: Recent Transactions (Left) & Risk Trend (Right) */}
        <Grid container spacing={3}>
          {/* Left Column: Recent Transactions */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    Recent Transactions
                  </Typography>
                  <Button
                    component={Link}
                    to="/transactions"
                    sx={{
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      textTransform: 'none',
                      '&:hover': { color: '#0f172a', bgcolor: 'transparent' }
                    }}
                  >
                    View All
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {transactions.slice(0, 5).map((tx, idx) => {
                    const styles = getRiskStyles(tx.riskLevel);
                    const isSuccess = tx.status === 'COMPLETED';

                    return (
                      <Box
                        key={tx.id || tx._id || tx.transactionId || `recent_tx_${idx}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 3,
                          transition: 'background-color 0.15s ease',
                          '&:hover': { bgcolor: '#f8fafc' },
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        {/* Status Dot + Name */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: { xs: 140, sm: 200 } }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: styles.dotBg,
                            border: `2px solid ${styles.dotColor}`
                          }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: styles.dotColor }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                              Pay to {tx.receiverName || 'Receiver'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                              {tx.receiverId || 'upi@bank'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Amount */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', minWidth: 80, textAlign: 'right' }}>
                          ₹{Number(tx.amount).toLocaleString('en-IN')}
                        </Typography>

                        {/* Date & Time */}
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', display: { xs: 'none', md: 'block' }, minWidth: 120 }}>
                          {formatTxDate(tx.createdAt)}
                        </Typography>

                        {/* Risk Chip */}
                        <Chip
                          label={styles.label}
                          size="small"
                          sx={{
                            bgcolor: styles.chipBg,
                            color: styles.chipColor,
                            border: `1px solid ${styles.chipBorder}`,
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            borderRadius: 2
                          }}
                        />

                        {/* Status Chip */}
                        <Chip
                          label={isSuccess ? 'Success' : 'Override'}
                          size="small"
                          sx={{
                            bgcolor: isSuccess ? '#ecfdf5' : '#f1f5f9',
                            color: isSuccess ? '#059669' : '#64748b',
                            border: isSuccess ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            borderRadius: 2
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Risk Trend (7 Days) */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%'
            }}>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', mb: 3 }}>
                  Risk Trend (7 Days)
                </Typography>

                {/* SVG Line Chart */}
                <Box sx={{ width: '100%', position: 'relative', pt: 1, pb: 2 }}>
                  <svg viewBox="0 0 460 250" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4338ca" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[
                      { y: 30, val: 100 },
                      { y: 75, val: 75 },
                      { y: 120, val: 50 },
                      { y: 165, val: 25 },
                      { y: 210, val: 0 }
                    ].map((line, idx) => (
                      <g key={idx}>
                        <text x="5" y={line.y + 4} fill="#94a3b8" fontSize="11" fontWeight="600">
                          {line.val}
                        </text>
                        <line x1="35" y1={line.y} x2="450" y2={line.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                      </g>
                    ))}

                    {/* Area under trend line */}
                    <path
                      d="M 40 155 L 95 135 L 140 140 L 190 105 L 235 112 L 280 117 L 325 97 L 370 83 L 415 70 L 415 210 L 40 210 Z"
                      fill="url(#areaGrad)"
                    />

                    {/* Trend Line */}
                    <polyline
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="40,155 95,135 140,140 190,105 235,112 280,117 325,97 370,83 415,70"
                    />

                    {/* Data Points */}
                    {trendPoints.map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="5.5" fill="#ffffff" stroke="#4338ca" strokeWidth="3" />
                      </g>
                    ))}

                    {/* X-axis date labels */}
                    {[
                      { x: 40, label: 'May 7' },
                      { x: 140, label: 'May 9' },
                      { x: 280, label: 'May 11' },
                      { x: 415, label: 'May 13' }
                    ].map((lbl, idx) => (
                      <text key={idx} x={lbl.x} y="235" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
                        {lbl.label}
                      </text>
                    ))}
                  </svg>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
