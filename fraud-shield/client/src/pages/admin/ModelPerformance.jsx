import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Alert, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Slider, Stack
} from '@mui/material';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';

// Interactive SVG ROC Curve Comparison
const RocCurveChart = () => {
  const width = 450;
  const height = 260;
  const padding = 35;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  // ROC Curve Points (FPR -> TPR)
  const xgbPoints = [
    { x: 0, y: 0 }, { x: 0.02, y: 0.75 }, { x: 0.05, y: 0.90 },
    { x: 0.10, y: 0.96 }, { x: 0.20, y: 0.98 }, { x: 0.50, y: 0.99 }, { x: 1, y: 1 }
  ];
  const lgbPoints = [
    { x: 0, y: 0 }, { x: 0.03, y: 0.70 }, { x: 0.08, y: 0.88 },
    { x: 0.15, y: 0.94 }, { x: 0.25, y: 0.97 }, { x: 0.60, y: 0.99 }, { x: 1, y: 1 }
  ];
  const rfPoints = [
    { x: 0, y: 0 }, { x: 0.05, y: 0.60 }, { x: 0.12, y: 0.82 },
    { x: 0.22, y: 0.90 }, { x: 0.40, y: 0.95 }, { x: 1, y: 1 }
  ];

  const toSvgX = (fpr) => padding + fpr * chartW;
  const toSvgY = (tpr) => height - padding - tpr * chartH;

  const makePath = (pts) => pts.reduce((acc, p, i) => {
    const sx = toSvgX(p.x);
    const sy = toSvgY(p.y);
    return i === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
  }, '');

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: 320 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => {
          const y = toSvgY(v);
          const x = toSvgX(v);
          return (
            <g key={v}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padding - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="600">{v}</text>
              <text x={x} y={height - padding + 15} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">{v}</text>
            </g>
          );
        })}

        {/* Diagonal Baseline (Random Guess) */}
        <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(1)} y2={toSvgY(1)} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4" />

        {/* Curves */}
        <path d={makePath(rfPoints)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <path d={makePath(lgbPoints)} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
        <path d={makePath(xgbPoints)} fill="none" stroke="#2563eb" strokeWidth="3" />

        {/* Axes Labels */}
        <text x={width / 2} y={height - 2} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">False Positive Rate (1 - Specificity)</text>
        <text x={12} y={height / 2} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700" transform={`rotate(-90 12 ${height / 2})`}>True Positive Rate (Recall)</text>
      </svg>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563eb' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>XGBoost (AUC 0.984)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>LightGBM (AUC 0.979)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>Random Forest (AUC 0.951)</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Confusion Matrix Component
const ConfusionMatrix = () => (
  <Grid container spacing={1.5}>
    <Grid size={6}>
      <Box sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#ecfdf5',
        border: '1.5px solid #a7f3d0',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
          True Negatives (TN)
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#065f46', my: 0.5 }}>
          94,880
        </Typography>
        <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600 }}>
          Clean Transactions Approved
        </Typography>
      </Box>
    </Grid>

    <Grid size={6}>
      <Box sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#fffbeb',
        border: '1.5px solid #fed7aa',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
          False Positives (FP)
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#c2410c', my: 0.5 }}>
          120
        </Typography>
        <Typography variant="caption" sx={{ color: '#9a3412', fontWeight: 600 }}>
          Legitimate Flagged (0.12%)
        </Typography>
      </Box>
    </Grid>

    <Grid size={6}>
      <Box sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#fef2f2',
        border: '1.5px solid #fecaca',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
          False Negatives (FN)
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#b91c1c', my: 0.5 }}>
          290
        </Typography>
        <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
          Missed Fraud Incidents
        </Typography>
      </Box>
    </Grid>

    <Grid size={6}>
      <Box sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#eff6ff',
        border: '1.5px solid #bfdbfe',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
          True Positives (TP)
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e40af', my: 0.5 }}>
          4,710
        </Typography>
        <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 600 }}>
          Fraud Intercepted (94.2%)
        </Typography>
      </Box>
    </Grid>
  </Grid>
);

const ModelPerformance = () => {
  const [comparison, setComparison] = useState([]);
  const [selectedThreshold, setSelectedThreshold] = useState(0.40);
  const [loading, setLoading] = useState(false);

  const featureWeights = [
    { name: 'Transaction Velocity Spike', weight: 28.4, color: '#2563eb' },
    { name: 'Unrecognized Device Signature', weight: 22.1, color: '#3b82f6' },
    { name: 'Voice Scam Urgency Embeddings', weight: 16.8, color: '#8b5cf6' },
    { name: 'Syndicate 2-Hop Graph Density', weight: 14.2, color: '#ec4899' },
    { name: 'Amount Deviation from Z-Score', weight: 10.5, color: '#f59e0b' },
    { name: 'Hour of Transaction Anomaly', weight: 5.0, color: '#10b981' },
    { name: 'Location Distance Mismatch', weight: 3.0, color: '#64748b' }
  ];

  return (
    <AdminSidebarLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Model Performance & Governance
            </Typography>
            <Chip label="Benchmarking Lab" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800 }} />
          </Box>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem', mt: 0.5 }}>
            Comparative ROC benchmarks, confusion matrix telemetry, feature importance, and threshold optimization.
          </Typography>
        </Box>
      </Box>

      {/* Champion vs Challenger 3D Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Active Champion Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '2px solid #a7f3d0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Chip label="● ACTIVE CHAMPION" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 800, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  XGBoost v2.4 (Platt Calibrated)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Gradient Boosted Ensembles • 100 Trees • Production Traffic 100%
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#059669' }}>
                98.4%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ACCURACY</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>96.8%</Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>RECALL</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563eb' }}>94.2%</Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>LATENCY</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>18ms</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Challenger Model Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '2px solid #e0e7ff',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Chip label="SHADOW CHALLENGER" size="small" sx={{ bgcolor: '#eff6ff', color: '#4338ca', fontWeight: 800, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  LightGBM v2.5-rc1 (Staging)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Fast Histogram Tree • Shadow Testing on Live Feeds
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#4338ca' }}>
                97.9%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ACCURACY</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>96.2%</Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>RECALL</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563eb' }}>93.9%</Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>LATENCY</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#4338ca' }}>12ms</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* 2-Column Evaluation Section: ROC Curve (Left) & Confusion Matrix (Right) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left: ROC Curve Benchmark */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.15rem' }}>
              📈 Receiver Operating Characteristic (ROC Curves)
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
              Multi-model separation capability across shifting classification thresholds.
            </Typography>

            <RocCurveChart />
          </Card>
        </Grid>

        {/* Right: Confusion Matrix */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.15rem' }}>
                🎛️ Confusion Matrix (100,000 Transaction Test Holdout)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
                Categorization of verified predictions vs ground truth outcomes.
              </Typography>

              <ConfusionMatrix />
            </Box>

            <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>
                💡 Key Observation: High Catch Rate of 94.2% with an extremely low False Positive Rate of only 0.12%.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Feature Importance & Threshold Optimization Grid */}
      <Grid container spacing={3}>
        {/* Left: Feature Importance Signals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.15rem' }}>
              📊 Top Feature Importance Weights (SHAP Analysis)
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
              Relative contribution of multi-signal inputs to final risk classification.
            </Typography>

            <Stack spacing={2}>
              {featureWeights.map((feat, i) => (
                <Box key={i}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>
                      {i + 1}. {feat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: feat.color }}>
                      {feat.weight}%
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 7, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ width: `${feat.weight * 3}%`, height: '100%', bgcolor: feat.color, borderRadius: 4 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Right: Decision Threshold Slider */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 3.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.15rem' }}>
                🎚️ Decision Threshold Sensitivity Tuning
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Simulate business impact by dynamically tuning the probability threshold cut-off.
              </Typography>

              <Box sx={{ px: 1, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                  Operating Cutoff: <span style={{ color: '#4338ca' }}>{selectedThreshold.toFixed(2)}</span>
                </Typography>
                <Slider
                  value={selectedThreshold}
                  min={0.10}
                  max={0.90}
                  step={0.05}
                  onChange={(e, val) => setSelectedThreshold(val)}
                  valueLabelDisplay="auto"
                  sx={{ color: '#4338ca' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>0.10 (High Sensitivity)</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>0.90 (Low Alarms)</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  Simulated Trade-Off Metrics:
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Estimated Fraud Catch Rate:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563eb' }}>
                      {(98.5 - (selectedThreshold - 0.1) * 15).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Model Precision Score:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                      {(85.0 + (selectedThreshold - 0.1) * 14).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>False Alarm Ratio:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ea580c' }}>
                      {(8.5 - (selectedThreshold - 0.1) * 8).toFixed(2)}%
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </AdminSidebarLayout>
  );
};

export default ModelPerformance;
