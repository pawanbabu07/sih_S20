import React, { useContext } from 'react';
import { Chip } from '@mui/material';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

export default function ConnectionStatus({ size = 'small' }) {
  const { connectionStatus } = useContext(SocketContext) || {};
  const { token } = useContext(AuthContext) || {};

  // If not logged in, show clean secure status or omit
  if (!token) {
    return (
      <Chip
        size={size}
        label="● AI SHIELD ACTIVE"
        sx={{
          bgcolor: 'rgba(56, 189, 248, 0.12)',
          color: '#38bdf8',
          fontWeight: 'bold',
          fontSize: '0.72rem',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  }

  if (connectionStatus === 'LIVE') {
    return (
      <Chip
        size={size}
        label="● LIVE"
        sx={{
          bgcolor: '#dcfce7',
          color: '#15803d',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          border: '1px solid #86efac',
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  }

  if (connectionStatus === 'RECONNECTING') {
    return (
      <Chip
        size={size}
        label="↻ Reconnecting..."
        sx={{
          bgcolor: '#fef3c7',
          color: '#b45309',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          border: '1px solid #fde68a',
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  }

  return (
    <Chip
      size={size}
      label="○ DISCONNECTED"
      sx={{
        bgcolor: '#fee2e2',
        color: '#b91c1c',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        border: '1px solid #fca5a5',
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );
}
