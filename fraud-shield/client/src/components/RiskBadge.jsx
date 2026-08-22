import React from 'react';
import { Chip } from '@mui/material';

const RiskBadge = ({ riskLevel }) => {
  let color = 'default';
  const label = riskLevel ? riskLevel.toUpperCase() : 'UNKNOWN';

  switch (label) {
    case 'LOW':
      color = 'success'; // Green
      break;
    case 'MEDIUM':
      color = 'warning'; // Orange/Yellow
      break;
    case 'HIGH':
      color = 'error'; // Red
      break;
    default:
      break;
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{ 
        fontWeight: 'bold', 
        minWidth: '80px', 
        borderRadius: 2, 
        letterSpacing: 0.5 
      }}
    />
  );
};

export default RiskBadge;
