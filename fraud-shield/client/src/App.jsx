import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LiveAlert from './components/LiveAlert';

// Public & Demo Pages
import Home from './pages/Home';
import Demo from './pages/Demo';
import Login from './pages/Login';
import Register from './pages/Register';

// User Feature Pages
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import FraudWarning from './pages/FraudWarning';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import VoiceShield from './pages/VoiceShield';
import SecurityCenter from './pages/SecurityCenter';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FraudCases from './pages/admin/FraudCases';
import FraudCaseDetails from './pages/admin/FraudCaseDetails';
import FalsePositives from './pages/admin/FalsePositives';
import VoiceCases from './pages/admin/VoiceCases';
import VoiceCaseDetails from './pages/admin/VoiceCaseDetails';
import AuditLogs from './pages/admin/AuditLogs';
import RiskTimeline from './pages/admin/RiskTimeline';
import FraudGraph from './pages/admin/FraudGraph';
import FraudClusters from './pages/admin/FraudClusters';
import ModelMonitoring from './pages/admin/ModelMonitoring';
import ModelPerformance from './pages/admin/ModelPerformance';
import LiveMonitor from './pages/admin/LiveMonitor';
import SystemMonitoring from './pages/admin/SystemMonitoring';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e293b', // Slate 800
    },
    secondary: {
      main: '#10b981', // Emerald 500
    },
    background: {
      default: '#f8fafc', // Slate 50
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableAutoFocusItem: true,
          disableAutoFocus: true,
          disableRestoreFocus: true,
          disableEnforceFocus: true,
          TransitionProps: { timeout: 0 }
        }
      }
    },
    MuiMenu: {
      defaultProps: {
        disableAutoFocusItem: true,
        disableAutoFocus: true,
        disableRestoreFocus: true,
        disableEnforceFocus: true,
        TransitionProps: { timeout: 0 }
      }
    },
    MuiModal: {
      defaultProps: {
        disableRestoreFocus: true,
        disableAutoFocus: true,
        disableEnforceFocus: true
      }
    }
  }
});

const AppContent = () => {
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {token && <Navbar />}
      <LiveAlert />
      <Routes>
        {/* Public Landing & Presentation Demo Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/demo" element={<Demo />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />

        {/* User Protected Feature Routes */}
        <Route path="/" element={
          token ? (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ) : (
            <Home />
          )
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/fraud-warning" element={
          <ProtectedRoute>
            <FraudWarning />
          </ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute>
            <SecurityCenter />
          </ProtectedRoute>
        } />
        <Route path="/security/devices" element={
          <ProtectedRoute>
            <SecurityCenter />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        } />
        <Route path="/voice-shield" element={
          <ProtectedRoute>
            <VoiceShield />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes — require admin role */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/live-monitor" element={
          <ProtectedRoute requiredRole="admin">
            <LiveMonitor />
          </ProtectedRoute>
        } />
        <Route path="/admin/system-monitoring" element={
          <ProtectedRoute requiredRole="admin">
            <SystemMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:userId/risk-timeline" element={
          <ProtectedRoute requiredRole="admin">
            <RiskTimeline />
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud-graph" element={
          <ProtectedRoute requiredRole="admin">
            <FraudGraph />
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud-graph/:type/:id" element={
          <ProtectedRoute requiredRole="admin">
            <FraudGraph />
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud-clusters" element={
          <ProtectedRoute requiredRole="admin">
            <FraudClusters />
          </ProtectedRoute>
        } />
        <Route path="/admin/model-monitoring" element={
          <ProtectedRoute requiredRole="admin">
            <ModelMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/admin/model-performance" element={
          <ProtectedRoute requiredRole="admin">
            <ModelPerformance />
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud-cases" element={
          <ProtectedRoute requiredRole="admin">
            <FraudCases />
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud-cases/:id" element={
          <ProtectedRoute requiredRole="admin">
            <FraudCaseDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/voice-cases" element={
          <ProtectedRoute requiredRole="admin">
            <VoiceCases />
          </ProtectedRoute>
        } />
        <Route path="/admin/voice-cases/:id" element={
          <ProtectedRoute requiredRole="admin">
            <VoiceCaseDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/false-positives" element={
          <ProtectedRoute requiredRole="admin">
            <FalsePositives />
          </ProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute requiredRole="admin">
            <AuditLogs />
          </ProtectedRoute>
        } />

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
