import React, { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Select, MenuItem, FormControl, CircularProgress, Alert, Chip
} from '@mui/material';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import RiskBadge from '../../components/RiskBadge';
import API from '../../services/api';

const FalsePositives = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/false-positives');
        setCases(res.data.cases || []);
      } catch (err) {
        setError('Failed to load false-positive reports.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdate = async (id, field, value) => {
    setUpdatingId(id);
    setError('');
    try {
      const res = await API.patch(`/admin/false-positives/${id}`, { [field]: value });
      setCases(prev => prev.map(c => c.id === id ? { ...c, ...res.data.feedback } : c));
    } catch (err) {
      setError('Failed to update.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminSidebarLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>False Positive Reports</Typography>
        <Typography variant="subtitle1" color="textSecondary">Audit safety warnings users reported as incorrect. Resolve to improve detection accuracy.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                {['User', 'Transaction', 'Voice Score', 'Level', 'Feedback', 'Date', 'Status', 'Resolution'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>No false positives reported yet.</TableCell></TableRow>
              ) : cases.map(c => {
                const tx = c.voiceAnalysisId?.transactionId;
                const isUp = updatingId === c.id;
                return (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{c.userId?.name || 'Unknown'}</Typography>
                      <Typography variant="caption" color="textSecondary">{c.userId?.email || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      {tx ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>₹{Number(tx.amount).toLocaleString('en-IN')}</Typography>
                          <Typography variant="caption" color="textSecondary">to {tx.receiverName}</Typography>
                        </Box>
                      ) : <Typography variant="caption" color="textSecondary">Voice Only</Typography>}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{c.voiceAnalysisId?.riskScore || 0}</TableCell>
                    <TableCell><RiskBadge riskLevel={c.voiceAnalysisId?.riskLevel || 'LOW'} /></TableCell>
                    <TableCell>
                      <Chip label={c.feedback.replace('_', ' ')} size="small" color="error" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth disabled={isUp} sx={{ minWidth: 110 }}>
                        <Select value={c.status} onChange={(e) => handleUpdate(c.id, 'status', e.target.value)}>
                          <MenuItem value="PENDING">Pending</MenuItem>
                          <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                          <MenuItem value="RESOLVED">Resolved</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth disabled={isUp} sx={{ minWidth: 150 }}>
                        <Select value={c.resolution || ''} displayEmpty onChange={(e) => handleUpdate(c.id, 'resolution', e.target.value)}>
                          <MenuItem value=""><em>Select...</em></MenuItem>
                          <MenuItem value="LEGITIMATE_TRANSACTION">Legitimate</MenuItem>
                          <MenuItem value="CONFIRMED_FRAUD">Confirmed Fraud</MenuItem>
                          <MenuItem value="INSUFFICIENT_INFORMATION">Insufficient Info</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </AdminSidebarLayout>
  );
};

export default FalsePositives;
