import React, { useContext } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

export default function LiveAlert() {
  const { activeAlert, clearAlert } = useContext(SocketContext) || {};
  const { user } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  if (!activeAlert) return null;

  const isVoice = activeAlert.eventType === 'VOICE_RISK_DETECTED';
  const isAdmin = user?.role === 'admin';

  const handleInspect = () => {
    const rawTxId = activeAlert.transactionId || activeAlert._id || activeAlert.id;
    const txId = typeof rawTxId === 'object'
      ? (rawTxId?._id || rawTxId?.id || rawTxId?.transactionId)
      : rawTxId;

    if (isAdmin) {
      if (txId && txId !== '[object Object]' && txId !== 'undefined') {
        navigate(`/admin/fraud-cases/${txId}`);
      } else {
        navigate('/admin/live-monitor');
      }
    } else {
      navigate('/fraud-warning', {
        state: {
          result: {
            transactionId: txId,
            riskScore: activeAlert.riskScore,
            riskLevel: activeAlert.riskLevel || 'HIGH',
            reasons: activeAlert.reasons || [],
            signals: activeAlert.signals || []
          },
          amount: activeAlert.amount,
          transactionId: txId
        }
      });
    }
    clearAlert();
  };

  return (
    <Snackbar
      open={Boolean(activeAlert)}
      autoHideDuration={10000}
      onClose={clearAlert}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 7 }}
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={clearAlert}
        sx={{
          width: 380,
          boxShadow: 6,
          borderRadius: 3,
          bgcolor: '#991b1b',
          color: '#ffffff',
          '& .MuiAlert-icon': { fontSize: '1.75rem' }
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{isVoice ? '🎙️ VOICE PHISHING DETECTED' : '⚠️ HIGH-RISK TRANSACTION'}</span>
          <Chip
            size="small"
            label={`${activeAlert.riskScore || 90}/100`}
            sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}
          />
        </AlertTitle>

        <Box sx={{ my: 1 }}>
          {activeAlert.amount && (
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Amount: ₹{Number(activeAlert.amount).toLocaleString('en-IN')}
            </Typography>
          )}

          {activeAlert.reasons && activeAlert.reasons.length > 0 && (
            <Box sx={{ mt: 0.5 }}>
              {activeAlert.reasons.slice(0, 2).map((r, i) => (
                <Typography key={i} variant="caption" display="block" sx={{ opacity: 0.9 }}>
                  • {r}
                </Typography>
              ))}
            </Box>
          )}

          {activeAlert.indicators && activeAlert.indicators.length > 0 && (
            <Box sx={{ mt: 0.5 }}>
              {activeAlert.indicators.slice(0, 2).map((ind, i) => (
                <Typography key={i} variant="caption" display="block" sx={{ opacity: 0.9 }}>
                  • {ind.label || ind}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={handleInspect}
            sx={{
              bgcolor: '#ffffff',
              color: '#991b1b',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            {isAdmin ? 'Inspect Case' : 'View Warning'}
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
}
