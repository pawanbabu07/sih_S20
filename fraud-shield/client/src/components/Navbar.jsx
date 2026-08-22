import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConnectionStatus from './ConnectionStatus';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1e293b', boxShadow: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', fontWeight: 'bold', letterSpacing: 1, gap: 1.5 }}
        >
          <span style={{ marginRight: '4px' }}>🛡️</span> Fraud Shield
          <ConnectionStatus />
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button color="inherit" component={Link} to="/home">Home</Button>
          <Button color="inherit" component={Link} to="/">Dashboard</Button>
          <Button color="inherit" component={Link} to="/payment">Send Money</Button>
          <Button color="inherit" component={Link} to="/security">Security Center</Button>
          <Button color="inherit" component={Link} to="/voice-shield">Voice Shield</Button>
          <Button color="inherit" component={Link} to="/transactions">History</Button>
          <Button
            component={Link}
            to="/demo"
            sx={{ fontWeight: 'bold', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: 2 }}
          >
            🎯 Demo Mode
          </Button>
          {user && user.role === 'admin' && (
            <Button
              component={Link}
              to="/admin"
              sx={{ fontWeight: 'bold', color: '#10b981', border: '1px solid #10b981', borderRadius: 2, ml: 0.5 }}
            >
              Admin Panel
            </Button>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, pl: 2, borderLeft: '1px solid #334155' }}>
            <Typography variant="body2" sx={{ mr: 2, color: '#cbd5e1', fontWeight: 500 }}>
              Hi, {user.name}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              size="small"
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
