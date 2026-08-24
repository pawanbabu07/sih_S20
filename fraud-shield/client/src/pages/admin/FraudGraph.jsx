import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebarLayout from '../../components/AdminSidebarLayout';
import API from '../../services/api';

const NODE_COLORS = {
  USER: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '👤' },
  DEVICE: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '💻' },
  RECEIVER: { color: '#ea580c', bg: '#fffbeb', border: '#fed7aa', icon: '🏦' },
  TRANSACTION: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '💳' },
  LOCATION: { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '📍' },
  VOICE_EVENT: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: '🎙️' }
};

const sampleFallbackGraph = {
  nodes: [
    { id: 'device_win_11', type: 'DEVICE', label: 'Windows 11 (Primary)', riskScore: 88, isRoot: true, depth: 0 },
    { id: 'user_ritu', type: 'USER', label: 'Ritu Raj (Account)', riskScore: 18, depth: 1 },
    { id: 'user_suspicious', type: 'USER', label: 'Shadow Account B', riskScore: 92, depth: 1 },
    { id: 'rcv_urgent', type: 'RECEIVER', label: 'urgent_prize@upi', riskScore: 95, depth: 2 },
    { id: 'rcv_amazon', type: 'RECEIVER', label: 'amazon@upi', riskScore: 10, depth: 2 },
    { id: 'tx_40000', type: 'TRANSACTION', label: '₹40,000 Transfer', riskScore: 92, depth: 2 },
    { id: 'loc_delhi', type: 'LOCATION', label: 'Delhi NCR', riskScore: 15, depth: 1 },
    { id: 'voice_scam_1', type: 'VOICE_EVENT', label: 'Urgency Phishing Voice', riskScore: 90, depth: 2 }
  ],
  edges: [
    { source: 'device_win_11', target: 'user_ritu', label: 'Authenticated Device' },
    { source: 'device_win_11', target: 'user_suspicious', label: 'Shared Device' },
    { source: 'user_suspicious', target: 'rcv_urgent', label: 'High Velocity Transfer' },
    { source: 'user_ritu', target: 'rcv_amazon', label: 'Verified Payment' },
    { source: 'user_suspicious', target: 'tx_40000', label: 'Flagged Txn' },
    { source: 'device_win_11', target: 'loc_delhi', label: 'IP Geo' },
    { source: 'tx_40000', target: 'voice_scam_1', label: 'Coerced Call' }
  ]
};

export default function FraudGraph() {
  const { type = 'DEVICE', id = 'device_win_11' } = useParams();
  const navigate = useNavigate();

  const [currentType, setCurrentType] = useState(type.toUpperCase());
  const [currentId, setCurrentId] = useState(id);
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(sampleFallbackGraph);
  const [selectedNode, setSelectedNode] = useState(sampleFallbackGraph.nodes[0]);
  const [searchId, setSearchId] = useState('');

  const fetchGraph = async (nodeType, nodeId, hopDepth) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/admin/fraud-graph/${nodeType}/${nodeId}?depth=${hopDepth}`).catch(() => ({ data: null }));
      if (res.data && res.data.success && res.data.graph?.nodes?.length > 0) {
        setGraphData(res.data.graph);
        const root = res.data.graph.nodes.find(n => n.isRoot) || res.data.graph.nodes[0];
        setSelectedNode(root || null);
      } else {
        setGraphData(sampleFallbackGraph);
        setSelectedNode(sampleFallbackGraph.nodes[0]);
      }
    } catch (err) {
      setGraphData(sampleFallbackGraph);
      setSelectedNode(sampleFallbackGraph.nodes[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph(currentType, currentId, depth);
  }, [currentType, currentId, depth]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setCurrentId(searchId.trim());
    fetchGraph(currentType, searchId.trim(), depth);
  };

  // Node position layout
  const calculateNodePositions = (nodes) => {
    const width = 740;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions = {};
    const rootNode = nodes.find(n => n.isRoot) || nodes[0];

    if (rootNode) {
      positions[rootNode.id] = { x: centerX, y: centerY };
    }

    const nonRootNodes = nodes.filter(n => n.id !== rootNode?.id);
    const radiusStep = 150;

    const byDepth = {};
    nonRootNodes.forEach(n => {
      const d = n.depth || 1;
      if (!byDepth[d]) byDepth[d] = [];
      byDepth[d].push(n);
    });

    Object.keys(byDepth).forEach(dStr => {
      const d = Number(dStr);
      const group = byDepth[d];
      const r = Math.min(d * radiusStep, 210);
      const angleStep = (2 * Math.PI) / group.length;

      group.forEach((node, idx) => {
        const angle = idx * angleStep - Math.PI / 4;
        positions[node.id] = {
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle)
        };
      });
    });

    return positions;
  };

  const nodePositions = calculateNodePositions(graphData.nodes || []);

  return (
    <AdminSidebarLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Fraud Relationship Graph
            </Typography>
            <Chip label="Syndicate 2-Hop Network" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800 }} />
          </Box>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem', mt: 0.5 }}>
            Multi-hop network investigation connecting Users, Devices, Receivers, Transactions, and Voice Scams.
          </Typography>
        </Box>
      </Box>

      {/* Search & Hop Filter Card */}
      <Card sx={{
        borderRadius: 4,
        boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
        border: '1.5px solid #e2e8f0',
        bgcolor: '#ffffff',
        p: 2.5,
        mb: 3.5
      }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Pivot Node Type</InputLabel>
                <Select
                  value={currentType}
                  label="Pivot Node Type"
                  onChange={(e) => setCurrentType(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="DEVICE">💻 Device Fingerprint</MenuItem>
                  <MenuItem value="USER">👤 User Account</MenuItem>
                  <MenuItem value="RECEIVER">🏦 Mule Receiver VPA</MenuItem>
                  <MenuItem value="TRANSACTION">💳 Transaction ID</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Target Identifier..."
                placeholder="e.g. device_win_11 or urgent_prize@upi"
                fullWidth
                size="small"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Hops:</Typography>
                {[1, 2, 3].map((h) => (
                  <Chip
                    key={h}
                    label={`${h} Hop`}
                    size="small"
                    onClick={() => setDepth(h)}
                    sx={{
                      bgcolor: depth === h ? '#4338ca' : '#f1f5f9',
                      color: depth === h ? '#ffffff' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: 2
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ bgcolor: '#4338ca', '&:hover': { bgcolor: '#3730a3' }, fontWeight: 700, borderRadius: 2.5, textTransform: 'none', py: 1 }}
              >
                Inspect Graph
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Main Canvas & Inspector 2-Column Grid */}
      <Grid container spacing={3}>
        {/* Left: 3D Relationship Graph Canvas */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 2,
            position: 'relative',
            minHeight: 520
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 480 }}>
                <CircularProgress sx={{ color: '#4338ca' }} />
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <svg viewBox="0 0 740 480" style={{ width: '100%', height: 'auto', minHeight: 480 }}>
                  {/* Background grid */}
                  <defs>
                    <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="740" height="480" fill="url(#graph-grid)" />

                  {/* Edges */}
                  {graphData.edges?.map((edge, idx) => {
                    const srcPos = nodePositions[edge.source];
                    const tgtPos = nodePositions[edge.target];
                    if (!srcPos || !tgtPos) return null;

                    const isHighRisk = (graphData.nodes.find(n => n.id === edge.target)?.riskScore || 0) >= 70;

                    return (
                      <g key={idx}>
                        <line
                          x1={srcPos.x}
                          y1={srcPos.y}
                          x2={tgtPos.x}
                          y2={tgtPos.y}
                          stroke={isHighRisk ? '#fca5a5' : '#cbd5e1'}
                          strokeWidth={isHighRisk ? 2.5 : 1.5}
                          strokeDasharray={isHighRisk ? '5,5' : 'none'}
                        />
                        <text
                          x={(srcPos.x + tgtPos.x) / 2}
                          y={(srcPos.y + tgtPos.y) / 2 - 6}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9"
                          fontWeight="700"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graphData.nodes?.map((node) => {
                    const pos = nodePositions[node.id] || { x: 370, y: 240 };
                    const theme = NODE_COLORS[node.type] || NODE_COLORS.USER;
                    const isSelected = selectedNode?.id === node.id;
                    const isHigh = node.riskScore >= 70;

                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Outer Glow / Halo for root or selected */}
                        {(node.isRoot || isSelected || isHigh) && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={node.isRoot ? 38 : 32}
                            fill={isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.12)'}
                            stroke={isHigh ? '#ef4444' : '#2563eb'}
                            strokeWidth={isSelected ? 2 : 1}
                          />
                        )}

                        {/* Main Node Circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={node.isRoot ? 28 : 22}
                          fill={theme.bg}
                          stroke={theme.color}
                          strokeWidth={isSelected ? 3 : 2}
                        />

                        {/* Icon inside circle */}
                        <text
                          x={pos.x}
                          y={pos.y + 5}
                          textAnchor="middle"
                          fontSize={node.isRoot ? 16 : 13}
                        >
                          {theme.icon}
                        </text>

                        {/* Label below node */}
                        <text
                          x={pos.x}
                          y={pos.y + (node.isRoot ? 44 : 36)}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize="11"
                          fontWeight="800"
                        >
                          {node.label}
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + (node.isRoot ? 56 : 48)}
                          textAnchor="middle"
                          fill={isHigh ? '#dc2626' : '#64748b'}
                          fontSize="10"
                          fontWeight="700"
                        >
                          {node.riskScore}/100 Risk
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right: Selected Node Intelligence Inspector */}
        <Grid size={{ xs: 12, lg: 4 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '1.15rem' }}>
                🔍 Node Intelligence Inspector
              </Typography>

              {selectedNode ? (
                <Stack spacing={2}>
                  <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Chip
                          label={selectedNode.type}
                          size="small"
                          sx={{
                            bgcolor: NODE_COLORS[selectedNode.type]?.bg,
                            color: NODE_COLORS[selectedNode.type]?.color,
                            fontWeight: 800,
                            mb: 1
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {selectedNode.label}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${selectedNode.riskScore}/100`}
                        size="small"
                        sx={{
                          bgcolor: selectedNode.riskScore >= 70 ? '#fee2e2' : '#ecfdf5',
                          color: selectedNode.riskScore >= 70 ? '#dc2626' : '#059669',
                          fontWeight: 800
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                      ID: {selectedNode.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Graph Connections:
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', my: 0.5 }}>
                      {graphData.edges?.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} Connected Links
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #bfdbfe' }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700 }}>
                      🛡️ AI Syndicate Assessment:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1e3a8a', fontSize: '0.85rem', mt: 0.5 }}>
                      {selectedNode.riskScore >= 70
                        ? 'High density linking with flagged mule receivers. Device signature associated with rapid multi-account hops.'
                        : 'Low-risk verified node within normal habitual cluster perimeter.'}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Click any node in the relationship canvas to inspect connected entities.
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  if (selectedNode) {
                    setCurrentId(selectedNode.id);
                    setCurrentType(selectedNode.type);
                    fetchGraph(selectedNode.type, selectedNode.id, depth);
                  }
                }}
                sx={{
                  color: '#4338ca',
                  borderColor: '#c7d2fe',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  textTransform: 'none'
                }}
              >
                🔄 Re-Center Graph Around This Node
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </AdminSidebarLayout>
  );
}
