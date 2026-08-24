import React from 'react';
import { Box, Paper, List, ListItemButton, ListItemText, Typography, Divider, Chip, Stack } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const menuGroups = [
  {
    groupTitle: 'CORE MONITORING',
    items: [
      { text: '📊 Dashboard', path: '/admin' },
      { text: '⚡ Live Monitor', path: '/admin/live-monitor', badge: 'LIVE' },
      { text: '🖥️ System Telemetry', path: '/admin/system-monitoring' }
    ]
  },
  {
    groupTitle: 'GRAPH & SYNDICATES',
    items: [
      { text: '🕸️ Relationship Graph', path: '/admin/fraud-graph' },
      { text: '👥 Fraud Clusters', path: '/admin/fraud-clusters' }
    ]
  },
  {
    groupTitle: 'AI & ML GOVERNANCE',
    items: [
      { text: '🧠 ML Model Health', path: '/admin/model-monitoring' },
      { text: '🎯 Model Performance', path: '/admin/model-performance' }
    ]
  },
  {
    groupTitle: 'CASE INVESTIGATIONS',
    items: [
      { text: '🚨 Fraud Cases', path: '/admin/fraud-cases' },
      { text: '🎙️ Voice Cases', path: '/admin/voice-cases' },
      { text: '🔍 False Positives', path: '/admin/false-positives' },
      { text: '📜 Audit Logs', path: '/admin/audit-logs' }
    ]
  }
];

const AdminSidebarLayout = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: '#f8fafc' }}>
      {/* 3D Elevated Admin Sidebar */}
      <Paper sx={{
        width: 270,
        borderRadius: 0,
        borderRight: '1.5px solid #e2e8f0',
        bgcolor: '#ffffff',
        boxShadow: '4px 0 25px -5px rgba(15, 23, 42, 0.04)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto'
      }}>
        <Box>
          {/* 3D Sidebar Brand Header */}
          <Box sx={{
            p: 2.5,
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  component="img"
                  src="/images/logo_3d.jpg"
                  alt="FraudShield 3D Logo"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '28%',
                    objectFit: 'cover',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem', lineHeight: 1.2 }}>
                    FraudShield
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                    Admin Cockpit
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="● ACTIVE"
                size="small"
                sx={{
                  bgcolor: '#ecfdf5',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  height: 20,
                  border: '1px solid #a7f3d0'
                }}
              />
            </Box>
          </Box>

          {/* Grouped 3D Navigation Menu */}
          <Box sx={{ p: 2 }}>
            {menuGroups.map((group, gIdx) => (
              <Box key={gIdx} sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontSize: '0.7rem',
                    px: 1.5,
                    mb: 0.8,
                    display: 'block'
                  }}
                >
                  {group.groupTitle}
                </Typography>

                <List disablePadding>
                  {group.items.map((item) => {
                    const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                    return (
                      <ListItemButton
                        key={item.path}
                        component={Link}
                        to={item.path}
                        sx={{
                          borderRadius: 2.5,
                          mb: 0.6,
                          background: active
                            ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                            : 'transparent',
                          border: active ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
                          boxShadow: active
                            ? '0 6px 16px -3px rgba(37, 99, 235, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                            : 'none',
                          '&:hover': {
                            backgroundColor: active ? '#dbeafe' : '#f8fafc',
                            transform: 'translateX(3px)'
                          },
                          textDecoration: 'none',
                          px: 1.8,
                          py: 0.95,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography sx={{
                              fontWeight: active ? 800 : 600,
                              fontSize: '0.86rem',
                              color: active ? '#1d4ed8' : '#334155'
                            }}>
                              {item.text}
                            </Typography>
                          }
                        />
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              bgcolor: '#dc2626',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.62rem',
                              height: 18,
                              boxShadow: '0 0 8px rgba(220, 38, 38, 0.4)'
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom Profile & Exit Capsule */}
        <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2
          }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#4338ca',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              boxShadow: '0 4px 10px rgba(67, 56, 202, 0.3)'
            }}>
              SA
            </Box>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                Senior Fraud Lead
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
                Full Clearance
              </Typography>
            </Box>
          </Box>

          <ListItemButton
            component={Link}
            to="/"
            sx={{
              borderRadius: 2.5,
              textDecoration: 'none',
              bgcolor: '#ffffff',
              border: '1px solid #cbd5e1',
              py: 0.9,
              transition: 'all 0.18s ease',
              '&:hover': { bgcolor: '#f1f5f9', transform: 'translateY(-1px)' }
            }}
          >
            <ListItemText
              disableTypography
              primary={
                <Typography sx={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700, textAlign: 'center' }}>
                  ← Back to User Dashboard
                </Typography>
              }
            />
          </ListItemButton>
        </Box>
      </Paper>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2.5, md: 4 }, overflowY: 'auto', bgcolor: '#f8fafc' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminSidebarLayout;
