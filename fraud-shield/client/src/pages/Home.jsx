import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Card, CardContent, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const capabilities = [
  {
    number: '01',
    title: 'Real-Time Detection',
    description: 'Calculates multi-signal risk before transaction settlement using calibrated machine learning models.',
    icon: '⚡'
  },
  {
    number: '02',
    title: 'Explainable AI',
    description: 'Translates statistical model outputs into simple, human-understandable risk reasons without confusing jargon.',
    icon: '🔍'
  },
  {
    number: '03',
    title: 'Voice Phishing Detection',
    description: 'Analyzes live call transcripts to flag urgent OTP requests, authority impersonation, and coercion tactics.',
    icon: '🎙️'
  },
  {
    number: '04',
    title: 'Behavior & Device Intelligence',
    description: 'Tracks habitual spending ranges and unrecognized device fingerprints with zero storage of private PINs.',
    icon: '📱'
  },
  {
    number: '05',
    title: 'Institutional Investigation',
    description: 'Provides compliance teams with real-time Socket.IO live monitors, syndicate graphs, and audit trails.',
    icon: '🏛️'
  }
];

const Home = () => {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      {/* Top Hero Banner */}
      <Box sx={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), transparent)',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 },
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 3 }}>
            <Chip label="Smart India Hackathon Prototype" sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 'bold' }} />
            <Chip label="Multi-Signal Intelligence" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 'bold' }} />
          </Stack>

          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2.5,
              lineHeight: 1.15
            }}
          >
            Explainable Real-Time Fraud Shield
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#94a3b8',
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.25rem' },
              maxWidth: 680,
              mx: 'auto',
              mb: 4.5,
              lineHeight: 1.6
            }}
          >
            Detect suspicious UPI payments, voice phishing, device anomalies, and social-engineering attacks <strong>before the transaction is completed</strong>.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/demo"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                px: 4,
                py: 1.5,
                fontSize: '1.05rem',
                fontWeight: 'bold',
                borderRadius: 2.5,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              🚀 Try Interactive Demo
            </Button>
            <Button
              component="a"
              href="#how-it-works"
              variant="outlined"
              size="large"
              sx={{
                color: '#f8fafc',
                borderColor: '#334155',
                '&:hover': { borderColor: '#64748b', bgcolor: 'rgba(255,255,255,0.05)' },
                px: 4,
                py: 1.5,
                fontSize: '1.05rem',
                fontWeight: 'bold',
                borderRadius: 2.5
              }}
            >
              See How It Works ↓
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 5 Core Capabilities Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 'bold', letterSpacing: 1.5 }}>
            CORE FRAUD INTELLIGENCE
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff', mt: 0.5 }}>
            Five Integrated Layers of Defense
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {capabilities.map((cap, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: idx === 4 ? 12 : 6 }} key={idx}>
              <Card sx={{
                bgcolor: '#1e293b',
                color: '#f8fafc',
                borderRadius: 3,
                border: '1px solid #334155',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px -10px rgba(0,0,0,0.5)',
                  borderColor: '#475569'
                }
              }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h3">{cap.icon}</Typography>
                    <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {cap.number}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#f8fafc', mb: 1 }}>
                    {cap.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    {cap.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ bgcolor: '#0b1120', py: 10, borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{ color: '#34d399', fontWeight: 'bold', letterSpacing: 1.5 }}>
              THE 20-SECOND OVERVIEW
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff', mt: 0.5 }}>
              How Fraud Shield Protects Payments
            </Typography>
          </Box>

          {/* Step Flow Grid */}
          <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
            {[
              { step: '1', title: 'Payment Request', desc: 'User initiates a UPI payment with amount, receiver ID, and device signature.', icon: '💳' },
              { step: '2', title: 'Multi-Signals', desc: 'Evaluates Transaction ML (30%), Behavior (20%), Device (15%), Voice (15%), Graph (20%).', icon: '📡' },
              { step: '3', title: 'AI Risk Engine', desc: 'Calculates calibrated 0-100 risk score and maps to adaptive business policies.', icon: '🧠' },
              { step: '4', title: 'Plain Explanation', desc: 'Translates model reasons into human language without confusing technical jargon.', icon: '💬' },
              { step: '5', title: 'User Warning', desc: 'User receives safe confirmation or clear warning to cancel suspicious transfers.', icon: '🛡️' },
              { step: '6', title: 'Admin Case Review', desc: 'Institutions receive instant Socket.IO alerts, investigate graph clusters, and audit.', icon: '🏛️' }
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Paper sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: '#1e293b',
                  color: '#f8fafc',
                  borderRadius: 3,
                  border: '1px solid #334155'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      bgcolor: '#3b82f6', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '0.85rem'
                    }}>
                      {item.step}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.05rem' }}>
                      {item.icon} {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Footer Banner */}
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <Paper sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)'
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
            Ready for the Live SIH Demonstration?
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4, maxWidth: 520, mx: 'auto' }}>
            Experience the full real-time payment protection workflow, test pre-configured fraud scenarios, or inspect the administrative intelligence console.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/demo"
              variant="contained"
              size="large"
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 'bold', px: 4, borderRadius: 2 }}
            >
              Launch Demo Mode
            </Button>
            <Button
              component={Link}
              to="/admin"
              variant="outlined"
              size="large"
              sx={{ color: '#38bdf8', borderColor: '#38bdf8', '&:hover': { borderColor: '#7dd3fc', bgcolor: 'rgba(56,189,248,0.1)' }, fontWeight: 'bold', px: 4, borderRadius: 2 }}
            >
              Admin Intelligence Console
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
