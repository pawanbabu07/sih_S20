import React, { useState, useContext } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Grid,
  InputAdornment, IconButton, Chip, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
    <path d="M18 3L4 9V17C4 25.5 10 32.5 18 34C26 32.5 32 25.5 32 17V9L18 3Z" fill="url(#shield_grad_login)" stroke="#2563eb" strokeWidth="1.5" />
    <rect x="13" y="16" width="10" height="8" rx="2" fill="white" />
    <path d="M15 16V13.5C15 11.8431 16.3431 10.5 18 10.5C19.6569 10.5 21 11.8431 21 13.5V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="20" r="1.2" fill="#2563eb" />
    <defs>
      <linearGradient id="shield_grad_login" x1="4" y1="3" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState('');
  const navigate = useNavigate();

  // Step 1: Request Verification Code / Reset Link
  const handleRequestOtp = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotStatus({ type: 'error', message: 'Please enter a valid registered email address.' });
      return;
    }

    setForgotLoading(true);
    setForgotStatus(null);
    setForgotOtp('');
    try {
      const res = await API.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotLoading(false);
      setForgotStep(2);
      setForgotStatus({
        type: 'success',
        message: res.data?.message || `Verification code sent to ${forgotEmail}! Please check your email inbox.`
      });
    } catch (err) {
      setForgotLoading(false);
      setForgotStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send email. Please verify the email and try again.'
      });
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleResetPassword = async () => {
    if (!forgotOtp || forgotOtp.trim().length < 6) {
      setForgotStatus({ type: 'error', message: 'Please enter the 6-digit verification code.' });
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      setForgotStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await API.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword
      });
      setForgotLoading(false);
      // Success! Auto-populate login form
      setEmail(forgotEmail);
      setPassword(forgotNewPassword);
      setForgotOpen(false);
      setForgotStep(1);
      setForgotOtp('');
      setForgotNewPassword('');
      setLoginSuccessNotice('✓ Password updated successfully! Please click Login to continue.');
    } catch (err) {
      setForgotLoading(false);
      setForgotStatus({
        type: 'error',
        message: err.response?.data?.message || 'Invalid or expired verification code. Please try again.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter all required fields.');
      return;
    }
    
    setLocalLoading(true);
    try {
      await login(email, password);
      setLocalLoading(false);
      navigate('/');
    } catch (err) {
      setLocalLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
            {/* Left Column: Login Form */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.75rem', md: '2rem' }, mb: 0.5, letterSpacing: '-0.5px' }}>
                  Account Login
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Sign in to access real-time fraud protection
                </Typography>
              </Box>

              {loginSuccessNotice && (
                <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2.5, fontWeight: 700, bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                  {loginSuccessNotice}
                </Alert>
              )}

              {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                    Email
                  </Typography>
                  <TextField
                    placeholder="admin@fraudshield.com"
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

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      Password
                    </Typography>
                    <Button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email || '');
                        setForgotStatus(null);
                        setForgotOpen(true);
                      }}
                      sx={{
                        textTransform: 'none',
                        color: '#4338ca',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                  <TextField
                    placeholder="Enter your password"
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
                  {localLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#4338ca', fontWeight: 700, textDecoration: 'none' }}>
                    Create Account
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
                  src="/images/auth_desktop_shield.jpg"
                  alt="FraudShield Desktop Intelligence"
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
                    🏛️ Institutional Real-Time Fraud Intelligence
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 3D Forgot Password & OTP Reset Recovery Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false);
          setForgotStep(1);
          setForgotStatus(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1, display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <span>🔐</span> {forgotStep === 1 ? 'Reset Account Password' : 'Enter Verification Code'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2, lineHeight: 1.5 }}>
            {forgotStep === 1
              ? 'Enter your registered account email. We will send a secure 6-digit verification code to your email.'
              : `A 6-digit verification code has been sent to ${forgotEmail}. Enter it below along with your new password.`}
          </Typography>

          {forgotStatus && (
            <Alert severity={forgotStatus.type} sx={{ mb: 2, borderRadius: 2.5, fontWeight: 600 }}>
              {forgotStatus.message}
            </Alert>
          )}

          {forgotStep === 1 ? (
            <TextField
              label="Registered Email Address"
              type="email"
              fullWidth
              autoFocus
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="user@example.com"
              sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="6-Digit Verification Code (OTP)"
                type="text"
                name="otp_code"
                fullWidth
                autoFocus
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                slotProps={{
                  htmlInput: {
                    maxLength: 6,
                    autoComplete: 'one-time-code',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: { letterSpacing: 6, fontWeight: 800, textAlign: 'center', fontSize: '1.15rem' }
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
              <TextField
                label="New Password (min 8 characters)"
                type="password"
                name="new_password"
                fullWidth
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                slotProps={{
                  htmlInput: {
                    autoComplete: 'new-password'
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              if (forgotStep === 2) {
                setForgotStep(1);
                setForgotStatus(null);
              } else {
                setForgotOpen(false);
              }
            }}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 700 }}
          >
            {forgotStep === 2 ? '← Back' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            onClick={forgotStep === 1 ? handleRequestOtp : handleResetPassword}
            disabled={forgotLoading}
            sx={{
              bgcolor: '#4338ca',
              '&:hover': { bgcolor: '#3730a3' },
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5
            }}
          >
            {forgotLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : forgotStep === 1 ? (
              'Send Verification Code'
            ) : (
              'Confirm & Update Password'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
