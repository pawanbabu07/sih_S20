import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

// Crisp Green Checkmark Icon
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#ecfdf5" />
    <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="1.5" />
    <path d="M6 10.5L8.5 13L14 7.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const capabilities = [
  {
    number: '01',
    title: 'Real-Time Transaction ML',
    description: 'Calculates multi-signal risk in milliseconds before payment settlement using calibrated XGBoost & LightGBM models.',
    icon: '⚡',
    color: '#3b82f6'
  },
  {
    number: '02',
    title: 'Explainable AI Insights',
    description: 'Translates complex statistical model outputs into clear, human-understandable risk reasons without confusing jargon.',
    icon: '🔍',
    color: '#8b5cf6'
  },
  {
    number: '03',
    title: 'Voice Phishing Shield',
    description: 'Analyzes live call transcripts in real-time to flag urgent OTP requests, authority impersonation, and social engineering.',
    icon: '🎙️',
    color: '#ec4899'
  },
  {
    number: '04',
    title: 'Device & Behavior Intelligence',
    description: 'Continuously tracks habitual spending baselines and unrecognized device fingerprints with zero storage of private PINs.',
    icon: '📱',
    color: '#10b981'
  },
  {
    number: '05',
    title: 'Institutional Investigation Console',
    description: 'Provides risk & compliance teams with real-time Socket.IO live monitors, syndicate graph visualizers, and audit trails.',
    icon: '🏛️',
    color: '#f59e0b'
  }
];

const stats = [
  { value: '10K+', label: 'Protected Users' },
  { value: '2M+', label: 'Transactions Analyzed' },
  { value: '99.6%', label: 'Detection Accuracy' },
  { value: '24/7', label: 'Real-Time Monitoring' }
];

const steps = [
  { step: '01', title: 'Payment Request', desc: 'User initiates a UPI payment with amount, receiver ID, and device signature.', icon: '💳' },
  { step: '02', title: 'Multi-Signal Fusion', desc: 'Evaluates Transaction ML (30%), Behavior (20%), Device (15%), Voice (15%), Graph (20%).', icon: '📡' },
  { step: '03', title: 'AI Risk Engine', desc: 'Calculates calibrated 0-100 risk score and maps to adaptive business policies.', icon: '🧠' },
  { step: '04', title: 'Plain Explanation', desc: 'Translates model reasons into simple human language without confusing technical jargon.', icon: '💬' },
  { step: '05', title: 'Instant Protection', desc: 'User receives safe confirmation or clear warning to cancel suspicious transfers.', icon: '🛡️' },
  { step: '06', title: 'Admin Case Review', desc: 'Institutions receive instant Socket.IO alerts, investigate graph clusters, and audit.', icon: '🏛️' }
];

const Home = () => {
  return (
    <Box sx={{ bgcolor: '#ffffff', color: '#0f172a', minHeight: '100vh', pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{
        background: 'radial-gradient(ellipse 70% 60% at 50% -10%, #eff6ff 0%, #ffffff 100%)',
        pt: { xs: 6, md: 9 },
        pb: { xs: 6, md: 8 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'center' }}>
            {/* Left Column: Copy & CTAs */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="✨ Next-Generation AI Fraud Defense"
                  sx={{
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid #bfdbfe',
                    mb: 2.5
                  }}
                />
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.1rem' },
                    color: '#0f172a',
                    lineHeight: 1.15,
                    letterSpacing: '-0.8px',
                    mb: 2
                  }}
                >
                  Explainable Real-Time <br />
                  <span style={{ color: '#2563eb' }}>Fraud Protection</span> <br />
                  <span style={{ fontSize: '0.82em', color: '#1e293b' }}>
                    for UPI, Voice Phishing & Social Engineering
                  </span>
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', mb: 0.8 }}>
                  Detect. Explain. Warn. Protect.
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 520, mb: 3 }}>
                  FraudShield combines multiple intelligence signals and AI models to detect and stop fraud <strong>before your money moves</strong>.
                </Typography>
              </Box>

              {/* Checkmark List */}
              <Stack spacing={1.5} sx={{ mb: 4 }}>
                {[
                  'Multi-Signal AI Detection',
                  'Voice & Social Engineering Shield',
                  'Real-Time Interception & Alerts',
                  'Plain Explainable Risk Score'
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#4338ca',
                    '&:hover': { bgcolor: '#3730a3', boxShadow: '0 8px 20px -6px rgba(67, 56, 202, 0.5)' },
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(67, 56, 202, 0.35)'
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component="a"
                  href="#how-it-works"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: '#4338ca',
                    borderColor: '#c7d2fe',
                    bgcolor: '#ffffff',
                    '&:hover': { borderColor: '#818cf8', bgcolor: '#f5f3ff' },
                    px: 3.5,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    textTransform: 'none'
                  }}
                >
                  Explore How It Works ↓
                </Button>
              </Stack>
            </Grid>

            {/* Right Column: 3D Hero Illustration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, md: 3 }
              }}>
                <Box
                  component="img"
                  src="/images/home_hero_shield.jpg"
                  alt="FraudShield 3D Security"
                  sx={{
                    width: '100%',
                    maxWidth: 480,
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.18)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Stats Bar */}
          <Box sx={{
            mt: { xs: 6, md: 8 },
            p: { xs: 3, md: 4 },
            bgcolor: '#ffffff',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)'
          }}>
            <Grid container spacing={3} sx={{ textAlign: 'center' }}>
              {stats.map((stat, idx) => (
                <Grid size={{ xs: 6, md: 3 }} key={idx}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.8rem', md: '2.3rem' }, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* 5 Core Capabilities Section */}
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography variant="overline" sx={{ color: '#2563eb', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.85rem' }}>
            INTELLIGENT DEFENSE ARCHITECTURE
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 0.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Five Integrated Layers of Fraud Prevention
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 620, mx: 'auto', mt: 1 }}>
            Engineered to safeguard financial transactions across devices, communication channels, and transaction endpoints.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {capabilities.map((cap, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: idx === 4 ? 12 : 6 }} key={idx}>
              <Card sx={{
                bgcolor: '#ffffff',
                color: '#0f172a',
                borderRadius: 3.5,
                border: '1px solid #e2e8f0',
                height: '100%',
                boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.08)',
                  borderColor: '#cbd5e1'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem'
                    }}>
                      {cap.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 800, fontFamily: 'monospace' }}>
                      {cap.number}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', mb: 1.2 }}>
                    {cap.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.65, fontSize: '0.95rem' }}>
                    {cap.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 11 }, borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="overline" sx={{ color: '#059669', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.85rem' }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 0.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              How FraudShield Protects Each Payment
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 580, mx: 'auto', mt: 1 }}>
              End-to-end multi-signal evaluation occurring in sub-second latency before money settlement.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {steps.map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{
                  p: 3.5,
                  height: '100%',
                  bgcolor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: 3.5,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 15px -4px rgba(15, 23, 42, 0.04)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      bgcolor: '#4338ca',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      {item.step}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      {item.icon} {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Footer Banner */}
      <Container maxWidth="md" sx={{ mt: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Box sx={{
          p: { xs: 5, md: 7 },
          borderRadius: 5,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          boxShadow: '0 25px 50px -15px rgba(15, 23, 42, 0.3)',
          border: '1px solid #334155'
        }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Ready to Secure Your Transactions?
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4.5, maxWidth: 540, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Experience instant AI risk scoring, voice phishing protection, and institutional compliance intelligence.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                fontWeight: 700,
                px: 4.5,
                py: 1.6,
                fontSize: '1rem',
                borderRadius: 2.5,
                textTransform: 'none'
              }}
            >
              Get Started Free
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                color: '#f8fafc',
                borderColor: '#475569',
                '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(255,255,255,0.08)' },
                fontWeight: 700,
                px: 4.5,
                py: 1.6,
                fontSize: '1rem',
                borderRadius: 2.5,
                textTransform: 'none'
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
