import React, { useContext } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { SocketContext } from '../context/SocketContext';

export default function ConnectionStatus({ size = 'small' }) {
  const { connectionStatus } = useContext(SocketContext) || {};

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
