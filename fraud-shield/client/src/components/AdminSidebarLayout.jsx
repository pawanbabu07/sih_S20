import React from 'react';
import { Box, Paper, List, ListItemButton, ListItemText, Typography, Divider } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { text: '📊 Dashboard', path: '/admin' },
  { text: '⚡ Live Monitor', path: '/admin/live-monitor' },
  { text: '🖥️ System Telemetry', path: '/admin/system-monitoring' },
  { text: '🕸️ Relationship Graph', path: '/admin/fraud-graph' },
  { text: '👥 Fraud Clusters', path: '/admin/fraud-clusters' },
  { text: '🧠 ML Model Health', path: '/admin/model-monitoring' },
  { text: '🎯 ML Performance & Governance', path: '/admin/model-performance' },
  { text: '🚨 Fraud Cases', path: '/admin/fraud-cases' },
  { text: '🎙️ Voice Cases', path: '/admin/voice-cases' },
  { text: '🔍 False Positives', path: '/admin/false-positives' },
  { text: '📜 Audit Logs', path: '/admin/audit-logs' }
];

const AdminSidebarLayout = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <Paper sx={{
        width: 240,
        borderRadius: 0,
        borderRight: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        boxShadow: 'none',
        flexShrink: 0
      }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Admin Review Panel
          </Typography>
        </Box>
        <List sx={{ p: 1.5 }}>
          {menuItems.map((item) => {
            const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: active ? '#f1f5f9' : 'transparent',
                  borderLeft: active ? '4px solid #1e293b' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#f8fafc' },
                  textDecoration: 'none',
                  px: 2
                }}
              >
                <ListItemText
                  disableTypography
                  primary={
                    <Typography sx={{
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.9rem',
                      color: active ? '#1e293b' : '#475569'
                    }}>
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ListItemButton
            component={Link}
            to="/demo"
            sx={{ borderRadius: 2, textDecoration: 'none', bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            <ListItemText
              disableTypography
              primary={
                <Typography sx={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 'bold' }}>
                  🎯 Launch Demo Mode
                </Typography>
              }
            />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/"
            sx={{ borderRadius: 2, textDecoration: 'none' }}
          >
            <ListItemText
              disableTypography
              primary={
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                  ← Back to User View
                </Typography>
              }
            />
          </ListItemButton>
        </Box>
      </Paper>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminSidebarLayout;
