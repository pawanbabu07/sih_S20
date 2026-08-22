import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          minHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          backgroundColor: '#f8fafc'
        }}>
          <Paper sx={{ p: 5, maxWidth: 520, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>🛡️</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: '#1e293b' }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The fraud protection interface encountered an unexpected situation. No transaction or security data was affected.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{ backgroundColor: '#1e293b', '&:hover': { backgroundColor: '#334155' }, fontWeight: 'bold' }}
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
