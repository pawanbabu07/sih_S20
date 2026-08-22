import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function FraudClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await API.get('/admin/fraud-clusters');
        if (res.data && res.data.success) {
          setClusters(res.data.clusters);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load fraud clusters');
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          👥 Coordinated Fraud Syndicates & Clusters
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Network analysis automatically detects syndicates of users sharing untrusted devices, mule receivers, and high-velocity fraud bursts.
        </Typography>
      </Box>

      {/* Summary Highlights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.85 }}>Active Clusters</Typography>
              <Typography variant="h3" fontWeight="bold">{clusters.length}</Typography>
              <Typography variant="caption">Identified network rings</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Compromised Users</Typography>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {clusters.reduce((acc, c) => acc + (c.users || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Accounts in syndicates</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Linked Mule Receivers</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {clusters.reduce((acc, c) => acc + (c.receivers || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Target destination hubs</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">High-Risk Payments</Typography>
              <Typography variant="h3" fontWeight="bold" color="error.main">
                {clusters.reduce((acc, c) => acc + (c.highRiskTransactions || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Flagged transaction volume</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cluster List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : clusters.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No coordinated fraud clusters currently detected.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {clusters.map((cluster) => (
            <Grid size={{ xs: 12, md: 6 }} key={cluster.clusterId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: cluster.riskLevel === 'HIGH' ? 'error.light' : 'divider' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Top Bar */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{cluster.name}</Typography>
                      <Typography variant="caption" color="text.secondary">ID: {cluster.clusterId}</Typography>
                    </Box>
                    <Chip
                      label={`${cluster.riskScore}/100 ${cluster.riskLevel}`}
                      color={cluster.riskLevel === 'HIGH' ? 'error' : 'warning'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Entity Counts Grid */}
                  <Grid container spacing={1} sx={{ mb: 2.5, bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                    <Grid size={3} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Users</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">{cluster.users}</Typography>
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Devices</Typography>
                      <Typography variant="h6" fontWeight="bold" color="secondary.main">{cluster.devices}</Typography>
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Receivers</Typography>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">{cluster.receivers}</Typography>
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">High Risk</Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">{cluster.highRiskTransactions}</Typography>
                    </Grid>
                  </Grid>

                  {/* Reasons */}
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
                    NETWORK ANOMALY EXPLANATION:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 3 }}>
                    {cluster.reasons?.map((reason, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <span style={{ color: '#ef4444' }}>⚠️</span>
                        {reason}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>

                <Divider />

                <Box sx={{ p: 2, bgcolor: 'background.default', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/admin/fraud-graph/${cluster.anchorType || 'DEVICE'}/${cluster.anchorId || 'device_sih_demo_b99'}`)}
                  >
                    🕸️ Investigate in Graph Visualizer
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
