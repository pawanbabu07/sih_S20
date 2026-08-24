import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';

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
          minHeight: '85vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, sm: 3 },
          bgcolor: '#f8fafc'
        }}>
          <Card sx={{
            maxWidth: 560,
            width: '100%',
            p: { xs: 3.5, md: 5 },
            textAlign: 'center',
            borderRadius: 5,
            bgcolor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.03)'
          }}>
            {/* 3D Shield Hero Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box
                component="img"
                src="/images/home_hero_shield.jpg"
                alt="FraudShield Security"
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 12px 30px -5px rgba(37, 99, 235, 0.25)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              />
            </Box>

            {/* Headline & Description */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '1.6rem', md: '1.85rem' },
                letterSpacing: '-0.5px',
                mb: 1.2
              }}
            >
              Something went wrong
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontSize: '0.96rem',
                lineHeight: 1.6,
                mb: 4,
                maxWidth: 440,
                mx: 'auto'
              }}
            >
              The fraud protection interface encountered an unexpected situation. No transaction or security data was affected.
            </Typography>

            {/* Action Buttons */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b', boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.4)' },
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: 0.5,
                  borderRadius: 3,
                  py: 1.4,
                  px: 3.5,
                  textTransform: 'uppercase',
                  minWidth: { xs: '100%', sm: 'auto' },
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
                }}
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => this.setState({ hasError: false, error: null })}
                sx={{
                  color: '#2563eb',
                  borderColor: '#93c5fd',
                  bgcolor: '#ffffff',
                  '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' },
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: 0.5,
                  borderRadius: 3,
                  py: 1.4,
                  px: 3.5,
                  textTransform: 'uppercase',
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Try Again
              </Button>
            </Box>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
