import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButtonGroup, ToggleButton, Box, CircularProgress, Alert, Chip, Typography } from '@mui/material';
import RiskBadge from '../components/RiskBadge';
import API from '../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/transactions');
        setTransactions(res.data.transactions || []);
        setFilteredTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Failed to load transaction history:', err.message);
        setError('Could not retrieve transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleFilterChange = (event, newFilter) => {
    if (!newFilter) return;
    setFilter(newFilter);

    if (newFilter === 'ALL') {
      setFilteredTransactions(transactions);
    } else if (newFilter === 'LOW' || newFilter === 'MEDIUM' || newFilter === 'HIGH') {
      setFilteredTransactions(transactions.filter(t => t.riskLevel === newFilter));
    } else if (newFilter === 'COMPLETED' || newFilter === 'CANCELLED') {
      setFilteredTransactions(transactions.filter(t => t.status === newFilter));
    }
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'COMPLETED',
          style: {
            color: '#059669',
            backgroundColor: '#d1fae5',
            borderColor: '#a7f3d0'
          }
        };
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          style: {
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            borderColor: '#fca5a5'
          }
        };
      case 'FLAGGED':
        return {
          label: 'FLAGGED',
          style: {
            color: '#d97706',
            backgroundColor: '#fef3c7',
            borderColor: '#fde68a'
          }
        };
      case 'PENDING':
      default:
        return {
          label: 'PENDING',
          style: {
            color: '#2563eb',
            backgroundColor: '#dbeafe',
            borderColor: '#bfdbfe'
          }
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>
        Transaction History
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          color="primary"
          sx={{ backgroundColor: '#ffffff', boxShadow: 1, borderRadius: 2, flexWrap: 'wrap' }}
        >
          <ToggleButton value="ALL" sx={{ textTransform: 'none', fontWeight: 'bold', px: 2 }}>All</ToggleButton>
          <ToggleButton value="LOW" sx={{ textTransform: 'none', fontWeight: 'bold', px: 2 }}>Low Risk</ToggleButton>
          <ToggleButton value="MEDIUM" sx={{ textTransform: 'none', fontWeight: 'bold', px: 2 }}>Medium Risk</ToggleButton>
          <ToggleButton value="HIGH" sx={{ textTransform: 'none', fontWeight: 'bold', px: 2 }}>High Risk</ToggleButton>
          <ToggleButton value="COMPLETED" sx={{ textTransform: 'none', fontWeight: 'bold', px: 2 }}>Completed</ToggleButton>
          <ToggleButton value="CANCELLED" sx={{ textTransform: 'none', fontWeight: 'bold', px: 2 }}>Cancelled</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Date / Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Receiver</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Risk Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Risk Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748b' }}>
                  No transaction records found matching this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => {
                const chipProps = getStatusChipProps(tx.status);
                return (
                  <TableRow key={tx.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: '#475569' }}>
                      {new Date(tx.createdAt).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                        {tx.receiverName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {tx.receiverId}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                      ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: tx.riskScore >= 70 ? '#ef4444' : tx.riskScore >= 30 ? '#f59e0b' : '#10b981' 
                        }}
                      >
                        {tx.riskScore}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <RiskBadge riskLevel={tx.riskLevel} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={chipProps.label}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 'bold',
                          borderRadius: 2,
                          color: chipProps.style.color,
                          backgroundColor: chipProps.style.backgroundColor,
                          borderColor: chipProps.style.borderColor,
                          px: 1
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TransactionHistory;
