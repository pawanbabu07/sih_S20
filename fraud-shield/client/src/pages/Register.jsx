import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLocalLoading(true);
    try {
      await API.post('/auth/register', { name, email, password, phone });
      setLocalLoading(false);
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setLocalLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5, mb: 5 }}>
      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              🛡️ Register
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Join the Fraud Shield platform
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              type="text"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Phone Number"
              type="text"
              fullWidth
              variant="outlined"
              margin="dense"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {localLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1e293b', fontWeight: 'bold', textDecoration: 'none' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
