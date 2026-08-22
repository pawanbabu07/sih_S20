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
  LinearProgress
} from '@mui/material';
import API from '../../services/api';

export default function ModelMonitoring() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModelHealth = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/model-health');
      if (res.data && res.data.success) {
        setModelData(res.data.model);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ML model health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelHealth();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            🧠 Machine Learning Model Health & Drift Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continuous performance tracking, versioned inference logs, false-positive feedback loops, and data drift diagnostics.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={fetchModelHealth}>
          🔄 Refresh Diagnostics
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : modelData ? (
        <>
          {/* Active Model Banner */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.dark', color: 'white', borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography variant="h5" fontWeight="bold">{modelData.name}</Typography>
                  <Chip label={modelData.version} color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
                  <Chip label={`✓ ${modelData.status}`} color="success" size="small" />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Scikit-Learn Random Forest Pipeline with StandardScaler • Balanced Class Weights • 100 Trees
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }} display="block">
                  Training Dataset Size: {modelData.trainingDatasetSize.toLocaleString()} records
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }} display="block">
                  Last Model Checkpoint: {modelData.lastTrainedDate}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Measured Performance Cards (Evaluated on Test Split) */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📊 Measured Offline Performance (1,000 Sample Test Set)
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Overall Accuracy</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {modelData.metrics.accuracy}%
                  </Typography>
                  <LinearProgress variant="determinate" value={modelData.metrics.accuracy} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">ROC-AUC Score</Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {modelData.metrics.rocAuc}%
                  </Typography>
                  <LinearProgress variant="determinate" value={modelData.metrics.rocAuc} color="secondary" sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Fraud Recall (Catch Rate)</Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {modelData.metrics.recall}%
                  </Typography>
                  <LinearProgress variant="determinate" value={modelData.metrics.recall} color="success" sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Precision (Low Alarm Fatigue)</Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {modelData.metrics.precision}%
                  </Typography>
                  <LinearProgress variant="determinate" value={modelData.metrics.precision} color="warning" sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">F1 Score (Harmonic Balance)</Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {modelData.metrics.f1Score}%
                  </Typography>
                  <LinearProgress variant="determinate" value={modelData.metrics.f1Score} color="info" sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Real-Time Inference & Drift Tracking */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📈 Real-Time Inference Drift & Production Rates
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Trailing 7-Day Prediction Rate</Typography>
                        <Typography variant="body2" fontWeight="bold">{modelData.monitoring.predictionRate}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={modelData.monitoring.predictionRate * 5} />
                      <Typography variant="caption" color="text.secondary">Transactions flagged as suspicious in real time</Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Confirmed Fraud Rate (Ground Truth)</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">{modelData.monitoring.confirmedRate}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={modelData.monitoring.confirmedRate * 10} color="error" />
                      <Typography variant="caption" color="text.secondary">Cases investigated and confirmed as actual fraud by bank compliance</Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">False-Positive Rate</Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">{modelData.monitoring.falsePositiveRate}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={modelData.monitoring.falsePositiveRate * 10} color="warning" />
                      <Typography variant="caption" color="text.secondary">Legitimate payments correctly verified and cleared via Warn & Confirm</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🧪 Human-in-the-Loop Feedback & Retraining Pipeline
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" variant="outlined">
                      <strong>Safe Retraining Policy:</strong> The production model is never retrained automatically after single cases. Admin resolutions are collected as verified ground truth labels to form periodic retraining datasets.
                    </Alert>

                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">Total Inferences Logged</Typography>
                          <Typography variant="h5" fontWeight="bold">{modelData.monitoring.totalPredictions}</Typography>
                        </Paper>
                      </Grid>

                      <Grid size={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">Labeled Feedback Samples</Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {(modelData.monitoring.confirmedFraud || 0) + (modelData.monitoring.falsePositives || 0)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="caption" color="text.secondary">
                      Feedback labels enable honest evaluation of Precision/Recall shifts over time before deploying candidate model revisions.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : null}
    </Container>
  );
}
