import React, { useState, useContext } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

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
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              🛡️ Login
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Explainable Real-Time Fraud Shield
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ borderRadius: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={localLoading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                backgroundColor: '#1e293b', 
                '&:hover': { backgroundColor: '#334155' },
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              {localLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1e293b', fontWeight: 'bold', textDecoration: 'none' }}>
                Create Account
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
