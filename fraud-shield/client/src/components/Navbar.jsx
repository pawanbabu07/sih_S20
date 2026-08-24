import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConnectionStatus from './ConnectionStatus';
import GlassUserAvatar from './GlassUserAvatar';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.04)',
        color: '#0f172a'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Brand 3D Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Box
            component="img"
            src="/images/logo_3d.jpg"
            alt="FraudShield 3D Logo"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '28%',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.08)' }
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.4px',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Fraud<span style={{ color: '#2563eb' }}>Shield</span>
            </Typography>
            <ConnectionStatus />
          </Box>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
          <Button
            component={Link}
            to="/home"
            sx={{
              color: isActive('/home') ? '#2563eb' : '#475569',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 1.8,
              '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
            }}
          >
            Home
          </Button>

          {/* Logged-In User Links */}
          {user ? (
            <>
              <Button
                component={Link}
                to="/"
                sx={{
                  color: isActive('/') ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.8,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
                }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/payment"
                sx={{
                  color: isActive('/payment') ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.8,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
                }}
              >
                Send Money
              </Button>
              <Button
                component={Link}
                to="/security"
                sx={{
                  color: isActive('/security') ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.8,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
                }}
              >
                Security Center
              </Button>
              <Button
                component={Link}
                to="/voice-shield"
                sx={{
                  color: isActive('/voice-shield') ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.8,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
                }}
              >
                Voice Shield
              </Button>
              <Button
                component={Link}
                to="/transactions"
                sx={{
                  color: isActive('/transactions') ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.8,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
                }}
              >
                History
              </Button>

              {user.role === 'admin' && (
                <Button
                  component={Link}
                  to="/admin"
                  sx={{
                    fontWeight: 800,
                    color: '#4338ca',
                    bgcolor: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    px: 2,
                    ml: 0.5,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)',
                    '&:hover': { bgcolor: '#dbeafe' }
                  }}
                >
                  ⚡ Admin Cockpit
                </Button>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1.5, pl: 1.5, borderLeft: '1.5px solid #e2e8f0', gap: 1.2 }}>
                {/* 3D Glass User Avatar */}
                <GlassUserAvatar size={38} />

                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                  {user.name || 'User'}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2.5,
                    color: '#dc2626',
                    borderColor: '#fecaca',
                    fontWeight: 700,
                    px: 2,
                    py: 0.5,
                    '&:hover': { bgcolor: '#fee2e2', borderColor: '#fca5a5' }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            /* Guest / Non-Logged In User Links */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' }
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                sx={{
                  bgcolor: '#4338ca',
                  '&:hover': { bgcolor: '#3730a3', boxShadow: '0 4px 14px rgba(67, 56, 202, 0.35)' },
                  borderRadius: 2.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 2.5,
                  boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)'
                }}
              >
                Create Account
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
