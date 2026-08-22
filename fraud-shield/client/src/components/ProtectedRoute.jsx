import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control: redirect non-admins away from admin routes
  if (requiredRole === 'admin' && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
