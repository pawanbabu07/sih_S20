import React, { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, CircularProgress, Alert, Chip
} from '@mui/material';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actionColor = (action) => {
    if (action.includes('FRAUD')) return 'error';
    if (action.includes('FALSE_POSITIVE') || action.includes('RESOLVE')) return 'info';
    return 'default';
  };

  return (
    <AdminSidebarLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Admin Audit Trail</Typography>
        <Typography variant="subtitle1" color="textSecondary">Chronological record of all administrative actions taken on cases and reports.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                {['Admin', 'Action', 'Description', 'Case ID', 'Timestamp'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>No audit log entries yet.</TableCell></TableRow>
              ) : logs.map(log => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{log.adminId?.name || 'System'}</Typography>
                    <Typography variant="caption" color="textSecondary">{log.adminId?.email || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.action.replace(/_/g, ' ')} size="small" color={actionColor(log.action)}
                      sx={{ fontWeight: 'bold', fontSize: '0.7rem', borderRadius: 1.5 }} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 350 }}>
                    <Typography variant="body2" sx={{ color: '#475569' }}>{log.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                      {log.caseId || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </AdminSidebarLayout>
  );
};

export default AuditLogs;
