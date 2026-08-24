import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Grid, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

// Crisp inline Eye and EyeOff icons
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Blue Shield Logo Icon matching user's mockups
const ShieldLogo = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 3L4 9V17C4 25.5 10 32.5 18 34C26 32.5 32 25.5 32 17V9L18 3Z" fill="url(#shield_grad)" stroke="#2563eb" strokeWidth="1.5" />
    <rect x="13" y="16" width="10" height="8" rx="2" fill="white" />
    <path d="M15 16V13.5C15 11.8431 16.3431 10.5 18 10.5C19.6569 10.5 21 11.8431 21 13.5V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="20" r="1.2" fill="#2563eb" />
    <defs>
      <linearGradient id="shield_grad" x1="4" y1="3" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLocalLoading(true);
    try {
      await API.post('/auth/register', { name, email, password, phone });
      setLocalLoading(false);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setLocalLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, md: 4 }
    }}>
      <Card sx={{
        maxWidth: 960,
        width: '100%',
        borderRadius: 4,
        boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}>
        {/* Top Header Bar */}
        <Box sx={{
          px: { xs: 3, md: 5 },
          pt: { xs: 3, md: 4 },
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
            <ShieldLogo />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Fraud<span style={{ color: '#2563eb' }}>Shield</span>
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/home"
            sx={{
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              '&:hover': { color: '#0f172a', bgcolor: 'transparent' }
            }}
          >
            Back to Home
          </Button>
        </Box>

        <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
            {/* Left Column: Form */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.75rem', md: '2rem' }, mb: 0.5, letterSpacing: '-0.5px' }}>
                  Create Your Account
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Join FraudShield for secure payments
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Full Name
                  </Typography>
                  <TextField
                    placeholder="Enter your full name"
                    fullWidth
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Email Address
                  </Typography>
                  <TextField
                    placeholder="Enter your email"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Mobile Number
                  </Typography>
                  <TextField
                    placeholder="Enter mobile number"
                    type="tel"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Password
                  </Typography>
                  <TextField
                    placeholder="Create password (min 8 chars)"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: '#64748b' }}
                            >
                              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#ffffff' },
                        '&.Mui-focused': { backgroundColor: '#ffffff' }
                      }
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={localLoading}
                  sx={{
                    bgcolor: '#4338ca',
                    '&:hover': { bgcolor: '#3730a3', boxShadow: '0 8px 20px -6px rgba(67, 56, 202, 0.5)' },
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    boxShadow: '0 4px 14px 0 rgba(67, 56, 202, 0.35)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {localLoading ? 'Creating Account...' : 'Register'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#4338ca', fontWeight: 700, textDecoration: 'none' }}>
                    Login
                  </Link>
                </Typography>
              </Box>
            </Grid>

            {/* Right Column: 3D Illustration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{
                bgcolor: 'linear-gradient(135deg, #f0f7ff 0%, #e0e7ff 100%)',
                background: 'radial-gradient(circle at center, #eff6ff 0%, #e0e7ff 100%)',
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: '1px solid #e0e7ff'
              }}>
                <Box
                  component="img"
                  src="/images/auth_mobile_shield.jpg"
                  alt="Fraud Shield Mobile Security"
                  sx={{
                    width: '100%',
                    maxWidth: 340,
                    height: 'auto',
                    borderRadius: 3,
                    boxShadow: '0 15px 35px -10px rgba(37, 99, 235, 0.15)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                />
                <Box sx={{
                  mt: 2.5,
                  textAlign: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  px: 2.5,
                  py: 1,
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                }}>
                  <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🛡️ Multi-Signal UPI Fraud Shield Protection
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
