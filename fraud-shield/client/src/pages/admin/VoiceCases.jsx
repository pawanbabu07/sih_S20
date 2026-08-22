import React, { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, CircularProgress, Alert, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import RiskBadge from '../../components/RiskBadge';
import API from '../../services/api';

const VoiceCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/voice-cases');
        setCases(res.data.cases || []);
      } catch (err) {
        setError('Failed to load voice cases.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actionColor = (action) => {
    if (action === 'DO_NOT_PAY') return { c: '#dc2626', bg: '#fee2e2' };
    if (action === 'VERIFY_CALLER') return { c: '#d97706', bg: '#fef3c7' };
    return { c: '#059669', bg: '#d1fae5' };
  };

  return (
    <AdminSidebarLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Voice Phishing Logs</Typography>
        <Typography variant="subtitle1" color="textSecondary">Review conversation transcript analysis, social engineering indicators, and recommended actions.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                {['User', 'Score', 'Risk', 'Indicators', 'Action', 'Date', 'Details'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748b' }}>No voice cases analyzed yet.</TableCell></TableRow>
              ) : cases.map(c => {
                const ac = actionColor(c.recommendedAction);
                return (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{c.userId?.name || 'Unknown'}</Typography>
                      <Typography variant="caption" color="textSecondary">{c.userId?.email || ''}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: c.riskScore >= 70 ? '#ef4444' : '#1e293b' }}>{c.riskScore}</TableCell>
                    <TableCell><RiskBadge riskLevel={c.riskLevel} /></TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {c.indicators.map((ind, i) => (
                          <Chip key={i} label={ind.label} size="small"
                            color={ind.severity === 'HIGH' ? 'error' : 'warning'}
                            sx={{ fontWeight: 'bold', fontSize: '0.7rem', borderRadius: 1.5 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={c.recommendedAction.replace(/_/g, ' ')} size="small"
                        sx={{ fontWeight: 'bold', borderRadius: 2, color: ac.c, backgroundColor: ac.bg, border: `1px solid ${ac.c}` }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Button variant="contained" size="small" component={Link} to={`/admin/voice-cases/${c.id}`}
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
      )}
    </AdminSidebarLayout>
  );
};

export default VoiceCases;
