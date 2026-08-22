import React from 'react';
import {
  Box, Typography, Paper, Chip, Divider, Accordion,
  AccordionSummary, AccordionDetails, List, ListItem,
  ListItemIcon, ListItemText
} from '@mui/material';

const RiskExplanation = ({
  riskScore = 0,
  riskLevel = 'LOW',
  reasons = [],
  signals = [],
  componentScores = {},
  device = {},
  graphRisk = {},
  voiceScore = null
}) => {
  // Categorize signals for plain-English presentation
  const categorizedSignals = [
    {
      category: 'Transaction Signals',
      icon: '💳',
      active: signals.some(s => ['AMOUNT_ANOMALY', 'FREQUENCY_ANOMALY'].includes(s)) || (componentScores?.transactionML >= 50),
      severity: (componentScores?.transactionML >= 70) ? 'HIGH' : (componentScores?.transactionML >= 40) ? 'MEDIUM' : 'LOW',
      details: reasons.filter(r => r.toLowerCase().includes('amount') || r.toLowerCase().includes('frequency') || r.toLowerCase().includes('normal') || r.toLowerCase().includes('transaction'))
    },
    {
      category: 'Device Intelligence',
      icon: '📱',
      active: device?.isNew || signals.includes('NEW_DEVICE') || (componentScores?.deviceRisk >= 50),
      severity: device?.isNew ? 'HIGH' : (componentScores?.deviceRisk >= 40) ? 'MEDIUM' : 'LOW',
      details: reasons.filter(r => r.toLowerCase().includes('device'))
    },
    {
      category: 'Behavior & Timing Patterns',
      icon: '👤',
      active: signals.some(s => ['TIME_ANOMALY', 'NEW_RECEIVER', 'LOCATION_ANOMALY'].includes(s)) || (componentScores?.behavioral >= 40),
      severity: (componentScores?.behavioral >= 70) ? 'HIGH' : (componentScores?.behavioral >= 35) ? 'MEDIUM' : 'LOW',
      details: reasons.filter(r => r.toLowerCase().includes('time') || r.toLowerCase().includes('receiver') || r.toLowerCase().includes('location') || r.toLowerCase().includes('hour'))
    },
    {
      category: 'Voice & Social Engineering Indicators',
      icon: '🎙️',
      active: (voiceScore !== null && voiceScore >= 40) || signals.includes('VOICE_RISK'),
      severity: (voiceScore >= 70) ? 'HIGH' : (voiceScore >= 40) ? 'MEDIUM' : 'LOW',
      details: reasons.filter(r => r.toLowerCase().includes('voice') || r.toLowerCase().includes('otp') || r.toLowerCase().includes('pressure') || r.toLowerCase().includes('social'))
    },
    {
      category: 'Network & Relationship Patterns',
      icon: '🕸️',
      active: (graphRisk?.graphRiskScore >= 40) || signals.includes('GRAPH_NETWORK_RISK'),
      severity: (graphRisk?.graphRiskScore >= 70) ? 'HIGH' : (graphRisk?.graphRiskScore >= 40) ? 'MEDIUM' : 'LOW',
      details: reasons.filter(r => r.toLowerCase().includes('mule') || r.toLowerCase().includes('cluster') || r.toLowerCase().includes('connected') || r.toLowerCase().includes('syndicate') || r.toLowerCase().includes('network'))
    }
  ];

  const activeCategories = categorizedSignals.filter(c => c.active || c.details.length > 0);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            🔍 Plain-English Risk Breakdown
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Why was this evaluation assigned? Each contributing signal is translated into simple language below.
          </Typography>
        </Box>
        <Chip
          label={`${riskScore}/100 ${riskLevel}`}
          color={riskLevel === 'HIGH' ? 'error' : riskLevel === 'MEDIUM' ? 'warning' : 'success'}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {activeCategories.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f0fdf4', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
            ✓ No suspicious anomalies detected across transaction, device, behavioral, voice, or network checks.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeCategories.map((cat, idx) => (
            <Accordion key={idx} defaultExpanded={idx === 0} variant="outlined" sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>▼</Typography>}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
                  <Typography variant="body1">{cat.icon}</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ flexGrow: 1, color: '#1e293b' }}>
                    {cat.category}
                  </Typography>
                  <Chip
                    label={cat.severity}
                    size="small"
                    color={cat.severity === 'HIGH' ? 'error' : cat.severity === 'MEDIUM' ? 'warning' : 'success'}
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                {cat.details.length > 0 ? (
                  <List dense disablePadding>
                    {cat.details.map((detail, dIdx) => (
                      <ListItem key={dIdx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>•</ListItemIcon>
                        <ListItemText
                          disableTypography
                          primary={<Typography variant="body2" color="text.primary">{detail}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Signal detected active variance contributing to elevated risk calculation.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Actionable Advice Footer */}
      <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid #3b82f6' }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
          🛡️ WHAT YOU SHOULD DO:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {riskLevel === 'HIGH'
            ? 'We strongly recommend cancelling this transaction. Never share OTPs or download screen-sharing apps during a phone call.'
            : riskLevel === 'MEDIUM'
            ? 'Please double-check the recipient name and amount before confirming with your UPI PIN.'
            : 'This payment appears consistent with your normal habits. You may proceed safely.'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RiskExplanation;
