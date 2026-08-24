import React, { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, TextField, Select, MenuItem, InputLabel, FormControl,
  Pagination, Chip, CircularProgress, Alert, Grid, Card
} from '@mui/material';
import { Link } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';

const statusColors = {
  CONFIRMED_FRAUD: { c: '#dc2626', bg: '#fee2e2' },
  FALSE_POSITIVE: { c: '#2563eb', bg: '#dbeafe' },
  UNDER_REVIEW: { c: '#d97706', bg: '#fef3c7' },
  RESOLVED: { c: '#059669', bg: '#d1fae5' },
  FLAGGED: { c: '#4b5563', bg: '#f3f4f6' },
  PENDING: { c: '#64748b', bg: '#f1f5f9' },
  COMPLETED: { c: '#059669', bg: '#d1fae5' },
  CANCELLED: { c: '#9ca3af', bg: '#f9fafb' }
};

const FraudCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [date, setDate] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/fraud-cases', {
        params: {
          page, limit: 10,
          search: search || undefined,
          riskLevel: riskLevel !== 'ALL' ? riskLevel : 'ALL',
          status: status !== 'ALL' ? status : undefined,
          date: date !== 'ALL' ? date : undefined
        }
      });
      setCases(res.data?.cases || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError('Could not retrieve fraud cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, [page, riskLevel, status, date]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchCases(); };

  return (
    <AdminSidebarLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Fraud Case Investigations
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem', mt: 0.5 }}>
          Review flagged transactions, update case status, and examine explainable fraud indicators.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      {/* Filters Card */}
      <Card sx={{
        p: 3,
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
        border: '1.5px solid #e2e8f0',
        bgcolor: '#ffffff'
      }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Search user, receiver, or ID..."
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Risk</InputLabel>
                <Select
                  value={riskLevel}
                  label="Risk"
                  onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="FLAGGED">Flagged</MenuItem>
                  <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                  <MenuItem value="CONFIRMED_FRAUD">Confirmed Fraud</MenuItem>
                  <MenuItem value="FALSE_POSITIVE">False Positive</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date</InputLabel>
                <Select
                  value={date}
                  label="Date"
                  onChange={(e) => { setDate(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="ALL">All Time</MenuItem>
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                  <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#4338ca',
                  '&:hover': { bgcolor: '#3730a3' },
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1,
                  textTransform: 'none'
                }}
              >
                Filter Cases
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#4338ca' }} />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            borderRadius: 4,
            overflow: 'hidden',
            mb: 3
          }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['User', 'Amount', 'Receiver', 'Score', 'Risk', 'Status', 'Date', 'Action'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, color: '#475569', fontSize: '0.85rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>
                      No cases match current filters.
                    </TableCell>
                  </TableRow>
                ) : cases.map(c => {
                  const sc = statusColors[c.status] || statusColors.FLAGGED;
                  return (
                    <TableRow key={c.id || c._id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {typeof c.user === 'object' && c.user !== null
                          ? (c.user.name || c.user.email || 'User')
                          : typeof c.userId === 'object' && c.userId !== null
                          ? (c.userId.name || c.userId.email || 'User')
                          : (c.user || c.userId || 'N/A')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>₹{c.amount?.toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>
                        {typeof c.receiverName === 'string'
                          ? c.receiverName
                          : typeof c.receiverId === 'string'
                          ? c.receiverId
                          : 'Receiver'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{c.riskScore}/100</TableCell>
                      <TableCell>
                        <Chip
                          label={c.riskLevel}
                          size="small"
                          sx={{
                            bgcolor: c.riskLevel === 'HIGH' ? '#fee2e2' : c.riskLevel === 'MEDIUM' ? '#fffbeb' : '#d1fae5',
                            color: c.riskLevel === 'HIGH' ? '#dc2626' : c.riskLevel === 'MEDIUM' ? '#d97706' : '#059669',
                            fontWeight: 800,
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.status}
                          size="small"
                          sx={{ bgcolor: sc.bg, color: sc.c, fontWeight: 700, borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          to={`/admin/fraud-cases/${c.id}`}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: '#4338ca',
                            borderColor: '#c7d2fe',
                            '&:hover': { bgcolor: '#f5f3ff' },
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: 'none'
                          }}
                        >
                          Inspect →
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}
    </AdminSidebarLayout>
  );
};

export default FraudCases;
