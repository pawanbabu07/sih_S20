import React, { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, TextField, Select, MenuItem, InputLabel, FormControl,
  Pagination, Chip, CircularProgress, Alert, Grid
} from '@mui/material';
import { Link } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import RiskBadge from '../../components/RiskBadge';
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
      setCases(res.data.cases || []);
      setTotalPages(res.data.totalPages || 1);
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Fraud Case Investigations</Typography>
        <Typography variant="subtitle1" color="textSecondary">Review flagged transactions, update case status, and examine explainable fraud indicators.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Search user, receiver, or ID..." fullWidth size="small" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Risk</InputLabel>
                <Select value={riskLevel} label="Risk" onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }} MenuProps={{ disableAutoFocusItem: true, autoFocus: false }}>
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
                <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }} MenuProps={{ disableAutoFocusItem: true, autoFocus: false }}>
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
                <Select value={date} label="Date" onChange={(e) => { setDate(e.target.value); setPage(1); }} MenuProps={{ disableAutoFocusItem: true, autoFocus: false }}>
                  <MenuItem value="ALL">All Time</MenuItem>
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                  <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#1e293b', '&:hover': { backgroundColor: '#334155' }, fontWeight: 'bold' }}>Search</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  {['User', 'Amount', 'Receiver', 'Score', 'Risk', 'Status', 'Date', 'Action'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>No cases match current filters.</TableCell></TableRow>
                ) : cases.map(c => {
                  const sc = statusColors[c.status] || statusColors.FLAGGED;
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{c.userId?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="textSecondary">{c.userId?.email || ''}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>₹{Number(c.amount).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{c.receiverName}</Typography>
                        <Typography variant="caption" color="textSecondary">{c.receiverId}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: c.riskScore >= 70 ? '#ef4444' : '#1e293b' }}>{c.riskScore}</TableCell>
                      <TableCell><RiskBadge riskLevel={c.riskLevel} /></TableCell>
                      <TableCell>
                        <Chip label={c.status.replace(/_/g, ' ')} size="small" variant="outlined"
                          sx={{ fontWeight: 'bold', borderRadius: 2, color: sc.c, backgroundColor: sc.bg, borderColor: sc.c }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Button variant="contained" size="small" component={Link} to={`/admin/fraud-cases/${c._id || c.id || c.transactionId}`}
                          sx={{ backgroundColor: '#1e293b', '&:hover': { backgroundColor: '#334155' }, fontWeight: 'bold', borderRadius: 1.5 }}>
                          View
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
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Box>
          )}
        </>
      )}
    </AdminSidebarLayout>
  );
};

export default FraudCases;
