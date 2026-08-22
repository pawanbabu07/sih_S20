import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const NODE_COLORS = {
  USER: '#2196f3',
  DEVICE: '#9c27b0',
  RECEIVER: '#ff9800',
  TRANSACTION: '#00bcd4',
  LOCATION: '#4caf50',
  VOICE_EVENT: '#e91e63'
};

export default function FraudGraph() {
  const { type = 'DEVICE', id = 'device_sih_demo_b99' } = useParams();
  const navigate = useNavigate();

  const [currentType, setCurrentType] = useState(type.toUpperCase());
  const [currentId, setCurrentId] = useState(id);
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);

  const [searchType, setSearchType] = useState('DEVICE');
  const [searchId, setSearchId] = useState('');

  const svgRef = useRef(null);

  const fetchGraph = async (nodeType, nodeId, hopDepth) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(
        `/admin/fraud-graph/${nodeType}/${nodeId}?depth=${hopDepth}`
      );
      if (res.data && res.data.success) {
        setGraphData(res.data.graph);
        const root = res.data.graph.nodes.find(n => n.isRoot) || res.data.graph.nodes[0];
        setSelectedNode(root || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fraud relationship graph');
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
    setCurrentType(searchType);
    setCurrentId(searchId.trim());
    navigate(`/admin/fraud-graph/${searchType}/${searchId.trim()}`);
  };

  // Compute 2D node positions in a radial / force layout
  const calculateNodePositions = (nodes) => {
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions = {};
    const rootNode = nodes.find(n => n.isRoot) || nodes[0];

    if (rootNode) {
      positions[rootNode.id] = { x: centerX, y: centerY };
    }

    const nonRootNodes = nodes.filter(n => !n.isRoot);
    const radiusStep = 140;

    // Group by depth
    const byDepth = {};
    nonRootNodes.forEach(n => {
      const d = n.depth || 1;
      if (!byDepth[d]) byDepth[d] = [];
      byDepth[d].push(n);
    });

    Object.keys(byDepth).forEach(dStr => {
      const d = Number(dStr);
      const group = byDepth[d];
      const r = d * radiusStep;
      const angleStep = (2 * Math.PI) / group.length;

      group.forEach((node, idx) => {
        const angle = idx * angleStep;
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            🕸️ Fraud Relationship Graph
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Multi-hop network investigation connecting Users, Devices, Receivers, Transactions, and Voice Scams.
          </Typography>
        </Box>

        {/* Quick Demo Shortcuts */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setCurrentType('DEVICE');
              setCurrentId('device_sih_demo_b99');
            }}
          >
            Demo Device Ring
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={() => {
              setCurrentType('RECEIVER');
              setCurrentId('rahul_unknown@upi');
            }}
          >
            Demo Receiver Hub
          </Button>
        </Box>
      </Box>

      {/* Control Bar: Search & Hop Depth */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Entity Type</InputLabel>
                  <Select
                    value={searchType}
                    label="Entity Type"
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <MenuItem value="DEVICE">Device</MenuItem>
                    <MenuItem value="RECEIVER">Receiver</MenuItem>
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="TRANSACTION">Transaction</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Enter Device ID, UPI ID, or User ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <Button variant="contained" type="submit">
                  🔍 Inspect
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Traversal Radius:
              </Typography>
              {[1, 2, 3].map((h) => (
                <Button
                  key={h}
                  variant={depth === h ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setDepth(h)}
                >
                  {h} {h === 1 ? 'Hop' : 'Hops'}
                </Button>
              ))}

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              <Tooltip title="Zoom In">
                <Button size="small" variant="outlined" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
                  ➕
                </Button>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <Button size="small" variant="outlined" onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))}>
                  ➖
                </Button>
              </Tooltip>
              <Tooltip title="Refresh Graph">
                <Button size="small" variant="outlined" onClick={() => fetchGraph(currentType, currentId, depth)}>
                  🔄
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Canvas & Details Sidebar */}
      <Grid container spacing={3}>
        {/* Interactive SVG Canvas */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: 600, position: 'relative', overflow: 'hidden', bgcolor: '#0f172a' }}>
            {loading ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color="white">Traversing relationship network ({depth} hops)...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : graphData.nodes.length === 0 ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No graph relationships found for this entity.</Typography>
              </Box>
            ) : (
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 800 500"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {/* Graph Edges */}
                {graphData.edges.map((edge) => {
                  const sourcePos = nodePositions[edge.source];
                  const targetPos = nodePositions[edge.target];
                  if (!sourcePos || !targetPos) return null;

                  const midX = (sourcePos.x + targetPos.x) / 2;
                  const midY = (sourcePos.y + targetPos.y) / 2;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={edge.riskScore >= 70 ? '#f44336' : '#64748b'}
                        strokeWidth={edge.riskScore >= 70 ? 2.5 : 1.5}
                        strokeDasharray={edge.riskScore >= 70 ? '5,5' : 'none'}
                        opacity={0.8}
                      />
                      <text
                        x={midX}
                        y={midY - 4}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        style={{ userSelect: 'none' }}
                      >
                        {edge.relationship}
                      </text>
                    </g>
                  );
                })}

                {/* Graph Nodes */}
                {graphData.nodes.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;

                  const isSelected = selectedNode?.id === node.id;
                  const color = NODE_COLORS[node.type] || '#2196f3';
                  const radius = node.isRoot ? 26 : 20;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={() => setSelectedNode(node)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Highlight ring for selected node */}
                      {isSelected && (
                        <circle
                          r={radius + 8}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth={2}
                          strokeDasharray="4,4"
                        />
                      )}

                      {/* Node circle */}
                      <circle
                        r={radius}
                        fill={color}
                        stroke={node.riskScore >= 70 ? '#f44336' : '#ffffff'}
                        strokeWidth={node.isRoot ? 3 : 1.5}
                        opacity={0.9}
                      />

                      {/* Node label */}
                      <text
                        y={radius + 14}
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight={node.isRoot ? 'bold' : 'normal'}
                        textAnchor="middle"
                        style={{ userSelect: 'none' }}
                      >
                        {node.label}
                      </text>

                      <text
                        y={4}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{ userSelect: 'none' }}
                      >
                        {node.type.slice(0, 3)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Legend Overlay */}
            <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(15, 23, 42, 0.85)', p: 1.5, borderRadius: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: 10 }}>{type}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Sidebar details panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', minHeight: 600 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🔍 Entity Investigation
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {selectedNode ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                      label={selectedNode.type}
                      sx={{
                        bgcolor: NODE_COLORS[selectedNode.type] || '#2196f3',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    />
                    {selectedNode.isRoot && (
                      <Chip label="INVESTIGATION ROOT" color="primary" variant="outlined" size="small" />
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Entity Identifier</Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover', wordBreak: 'break-all' }}>
                      <Typography variant="body2" fontWeight="bold">{selectedNode.rawId}</Typography>
                    </Paper>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Graph Depth</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedNode.depth || 0} Hops</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Associated Risk</Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={selectedNode.riskScore >= 70 ? 'error.main' : 'success.main'}
                      >
                        {selectedNode.riskScore || 0} / 100
                      </Typography>
                    </Box>
                  </Box>

                  {/* Quick Action: Re-center graph around this node */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      setCurrentType(selectedNode.type);
                      setCurrentId(selectedNode.rawId);
                      navigate(`/admin/fraud-graph/${selectedNode.type}/${selectedNode.rawId}`);
                    }}
                  >
                    Re-center Network on This Node →
                  </Button>

                  <Divider />

                  <Typography variant="subtitle2" fontWeight="bold">Graph Insights & Coordinated Risk</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Alert severity={selectedNode.riskScore >= 70 ? 'error' : 'info'} variant="outlined">
                      {selectedNode.type === 'DEVICE' && (
                        'This device signature connects multiple user accounts and payment transactions across the network.'
                      )}
                      {selectedNode.type === 'RECEIVER' && (
                        'Concentration hub: This recipient UPI ID is receiving transfers from multiple distinct accounts.'
                      )}
                      {selectedNode.type === 'USER' && (
                        'User account node: Shows associated devices, outgoing transactions, and receiver destinations.'
                      )}
                      {selectedNode.type === 'TRANSACTION' && (
                        'Payment event linking sender, recipient, origin device, and potential voice alerts.'
                      )}
                    </Alert>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary">Select any node on the graph to inspect relationships.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
