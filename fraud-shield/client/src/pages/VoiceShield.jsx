import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Tabs, Tab, Alert, Grid, CircularProgress, Chip, Stack, LinearProgress } from '@mui/material';
import API from '../services/api';

// Blue Mic SVG Icon
const MicIcon = ({ recording }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={recording ? '#dc2626' : '#2563eb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const sampleScenarios = [
  {
    title: 'Bank KYC Threat Scam',
    text: 'Sir your bank account will be blocked within 1 hour if you do not complete your KYC verification immediately. Please share the 6 digit OTP sent to your registered mobile number right now.',
    expected: 'HIGH'
  },
  {
    title: 'Electricity Bill Disconnection Scam',
    text: 'Dear customer your electricity power line will be disconnected tonight at 9:30 PM due to unpaid bill amount. Call this officer number and make payment to avoid disconnection.',
    expected: 'HIGH'
  },
  {
    title: 'Normal Friend Conversation',
    text: 'Hey Rahul, are you free this weekend? Let us meet up for coffee at the mall around 4 PM.',
    expected: 'LOW'
  }
];

const VoiceShield = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  // Audio recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [feedbackRegistered, setFeedbackRegistered] = useState('');

  // Handle timer
  useEffect(() => {
    if (recording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError('');
    setResult(null);
    setFeedbackRegistered('');
  };

  // Start MediaRecorder audio capture
  const startRecording = async () => {
    setError('');
    setResult(null);
    audioChunksRef.current = [];
    setAudioUrl('');
    setAudioFile(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio capture is not supported in this browser.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioFile(new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      };

      mediaRecorder.start(100);
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Microphone access denied. Please grant microphone permission.');
    }
  };

  // Stop MediaRecorder audio capture
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Audio file size exceeds 10 MB limit.');
      return;
    }

    setAudioUrl(URL.createObjectURL(file));
    setAudioFile(file);
  };

  const runAnalysis = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setResult(null);
    setFeedbackRegistered('');

    if (tabIndex === 1 && !audioFile) {
      setError('Please choose an audio file to upload.');
      return;
    }

    if (tabIndex === 2 && (!transcript || !transcript.trim())) {
      setError('Please enter conversation text or pick a sample scenario.');
      return;
    }

    if (tabIndex === 0 && !audioFile && !transcript) {
      setError('Please record a voice clip first.');
      return;
    }

    setChecking(true);

    try {
      let response;
      if (tabIndex === 2 || (tabIndex === 0 && !audioFile && transcript)) {
        response = await API.post('/voice/analyze', { transcript });
      } else {
        const formData = new FormData();
        formData.append('audio', audioFile);
        response = await API.post('/voice/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setResult(response.data.voiceAnalysis);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Voice analysis failed. Please verify server connectivity.');
    } finally {
      setChecking(false);
    }
  };

  const isHigh = result?.riskLevel === 'HIGH' || result?.riskScore >= 70;
  const isMedium = result?.riskLevel === 'MEDIUM' || (result?.riskScore >= 30 && result?.riskScore < 70);
  const isLow = result && !isHigh && !isMedium;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '92vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', mb: 0.5 }}>
            Voice Shield
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem' }}>
            Protect yourself from voice phishing & social engineering.
          </Typography>
        </Box>

        {/* Tab Switcher */}
        <Box sx={{ borderBottom: '1px solid #e2e8f0', mb: 4 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.98rem',
                color: '#64748b',
                px: 3,
                py: 1.5,
                '&.Mui-selected': { color: '#4338ca' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#4338ca', height: 3, borderRadius: 1.5 }
            }}
          >
            <Tab label="Record Audio" />
            <Tab label="Upload Audio" />
            <Tab label="Paste Transcript" />
          </Tabs>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
        {feedbackRegistered && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{feedbackRegistered}</Alert>}

        {/* Main Grid: Recording/Input (Left) & Tips / 3D Asset (Right) */}
        <Grid container spacing={3.5}>
          {/* Left Column: Interactive Input Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px -5px rgba(15, 23, 42, 0.05)',
              border: '1.5px solid #e2e8f0',
              bgcolor: '#ffffff',
              p: { xs: 3, md: 4 }
            }}>
              {tabIndex === 0 && (
                /* Tab 0: Record Audio Mode */
                <Box sx={{ textAlign: 'center', py: { xs: 2, md: 4 } }}>
                  {/* Large 3D Mic Circular Button */}
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Box
                      onClick={toggleRecording}
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        bgcolor: recording ? '#fef2f2' : '#f0f7ff',
                        border: recording ? '3px solid #ef4444' : '3px solid #bfdbfe',
                        boxShadow: recording
                          ? '0 0 35px rgba(239, 68, 68, 0.4)'
                          : '0 12px 30px -5px rgba(37, 99, 235, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        mx: 'auto',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'scale(1.04)',
                          boxShadow: recording
                            ? '0 0 45px rgba(239, 68, 68, 0.6)'
                            : '0 16px 35px -5px rgba(37, 99, 235, 0.25)'
                        }
                      }}
                    >
                      <MicIcon recording={recording} />
                    </Box>

                    {/* Timer indicator on right */}
                    <Box sx={{
                      position: { xs: 'static', sm: 'absolute' },
                      right: { sm: -100 },
                      top: { sm: '50%' },
                      transform: { sm: 'translateY(-50%)' },
                      mt: { xs: 2, sm: 0 },
                      textAlign: 'center'
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: recording ? '#dc2626' : '#0f172a', fontFamily: 'monospace' }}>
                        {formatTimer(recordingTime)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: recording ? '#dc2626' : '#0f172a', mb: 1, mt: 1 }}>
                    {recording ? 'Recording... Tap to Stop' : 'Tap to Start Recording'}
                  </Typography>

                  {audioUrl && !recording && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', maxWidth: 450, mx: 'auto' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                        Recorded Clip Preview:
                      </Typography>
                      <audio src={audioUrl} controls style={{ width: '100%' }} />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={runAnalysis}
                        disabled={checking}
                        sx={{
                          mt: 2,
                          bgcolor: '#4338ca',
                          '&:hover': { bgcolor: '#3730a3' },
                          fontWeight: 700,
                          py: 1.4,
                          borderRadius: 2.5,
                          textTransform: 'none'
                        }}
                      >
                        {checking ? 'Analyzing Audio...' : '🔍 Analyze Recording for Scams'}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {tabIndex === 1 && (
                /* Tab 1: Upload Audio Mode */
                <Box sx={{ py: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Upload Call Audio File
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Upload recorded call recordings (.wav, .mp3, .webm) up to 10MB.
                  </Typography>

                  <Box
                    component="label"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      border: '2px dashed #cbd5e1',
                      borderRadius: 3.5,
                      bgcolor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#4338ca', bgcolor: '#f0f7ff' },
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h3" sx={{ mb: 1 }}>📁</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {audioFile ? audioFile.name : 'Click to Browse Audio File'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5 }}>
                      Supports MP3, WAV, WebM, OGG
                    </Typography>
                    <input type="file" accept="audio/*" hidden onChange={handleFileUpload} />
                  </Box>

                  {audioUrl && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <audio src={audioUrl} controls style={{ width: '100%', maxWidth: 450 }} />
                      <Button
                        variant="contained"
                        onClick={runAnalysis}
                        disabled={checking}
                        sx={{
                          mt: 2,
                          bgcolor: '#4338ca',
                          '&:hover': { bgcolor: '#3730a3' },
                          fontWeight: 700,
                          px: 4,
                          py: 1.4,
                          borderRadius: 2.5,
                          textTransform: 'none'
                        }}
                      >
                        {checking ? 'Analyzing Audio...' : '🔍 Analyze Audio File'}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {tabIndex === 2 && (
                /* Tab 2: Paste Transcript Mode */
                <Box sx={{ py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Call Conversation Transcript
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    Paste the transcript text of a phone call or choose a pre-configured scenario below.
                  </Typography>

                  <TextField
                    placeholder="e.g. Sir your account will be blocked. Share the OTP code right now to verify..."
                    multiline
                    rows={4}
                    fullWidth
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    sx={{
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                        '&:hover': { bgcolor: '#ffffff' },
                        '&.Mui-focused': { bgcolor: '#ffffff' }
                      }
                    }}
                  />

                  {/* Sample Scenarios */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                      Try Preset Test Samples:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {sampleScenarios.map((sc, idx) => (
                        <Chip
                          key={idx}
                          label={sc.title}
                          size="small"
                          onClick={() => setTranscript(sc.text)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 700,
                            border: '1px solid #bfdbfe',
                            '&:hover': { bgcolor: '#dbeafe' }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={runAnalysis}
                    disabled={checking}
                    sx={{
                      bgcolor: '#4338ca',
                      '&:hover': { bgcolor: '#3730a3' },
                      fontWeight: 700,
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: 2.5,
                      textTransform: 'none'
                    }}
                  >
                    {checking ? 'Analyzing Transcript...' : '🔍 Analyze Call Transcript'}
                  </Button>
                </Box>
              )}

              {/* Subtext description below card */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                  We analyze your conversation in real-time and warn you if we detect any scam indicators.
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Tips & 3D Illustration Card */}
          <Grid size={{ xs: 12, md: 4 }}>
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
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, fontSize: '1.15rem' }}>
                  Tips
                </Typography>

                <Stack spacing={2} sx={{ mb: 3.5 }}>
                  {[
                    { num: '1.', text: 'Record the call or suspicious audio' },
                    { num: '2.', text: 'We never store raw audio permanently' },
                    { num: '3.', text: 'Your privacy is our priority' }
                  ].map((tip, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Typography sx={{ color: '#4338ca', fontWeight: 800, fontSize: '0.95rem' }}>
                        {tip.num}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.5, fontSize: '0.92rem' }}>
                        {tip.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* 3D Mic Asset Display */}
              <Box sx={{
                borderRadius: 3.5,
                background: 'radial-gradient(circle at center, #eff6ff 0%, #e0e7ff 100%)',
                p: 2,
                textAlign: 'center',
                border: '1px solid #e0e7ff'
              }}>
                <Box
                  component="img"
                  src="/images/voice_shield_mic.jpg"
                  alt="3D Voice Shield Intelligence"
                  sx={{
                    width: '100%',
                    maxWidth: 220,
                    height: 'auto',
                    borderRadius: 3,
                    boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.15)',
                    display: 'block',
                    mx: 'auto'
                  }}
                />
                <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700, display: 'block', mt: 1.5 }}>
                  🛡️ AI Social Engineering Interception
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Real-Time Voice Analysis Results */}
        {result && (
          <Card sx={{
            mt: 4,
            borderRadius: 4,
            border: isHigh ? '1.5px solid #fecaca' : isMedium ? '1.5px solid #fed7aa' : '1.5px solid #d1fae5',
            boxShadow: isHigh ? '0 15px 35px -5px rgba(239, 68, 68, 0.15)' : '0 15px 35px -5px rgba(16, 185, 129, 0.15)',
            bgcolor: '#ffffff',
            overflow: 'hidden'
          }}>
            <Box sx={{
              bgcolor: isHigh ? '#dc2626' : isMedium ? '#ea580c' : '#059669',
              color: '#ffffff',
              py: 1.5,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                Voice Threat Analysis Result
              </Typography>
              <Chip
                label={isHigh ? '🚨 High Scam Risk' : isMedium ? '⚠️ Medium Threat Risk' : '✓ Safe Call Verified'}
                size="small"
                sx={{ bgcolor: '#ffffff', color: isHigh ? '#dc2626' : isMedium ? '#ea580c' : '#059669', fontWeight: 800 }}
              />
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={3.5} sx={{ alignItems: 'center' }}>
                {/* Risk Score */}
                <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center', borderRight: { sm: '1.5px solid #e2e8f0' }, pr: { sm: 3 } }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: 0.8 }}>
                    VOICE RISK SCORE
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: isHigh ? '#dc2626' : isMedium ? '#ea580c' : '#059669', my: 0.5 }}>
                    {result.riskScore}<span style={{ fontSize: '0.5em', color: '#94a3b8' }}>/100</span>
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569' }}>
                    Confidence: {result.confidence ? `${Math.round(result.confidence * 100)}%` : '95%'}
                  </Typography>
                </Grid>

                {/* Signals & Phishing Indicators */}
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                    Detected Scam Tactics & Signals:
                  </Typography>

                  {result.detectedTactics?.length > 0 || result.signals?.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {(result.detectedTactics || result.signals || []).map((tactic, idx) => (
                        <Chip
                          key={idx}
                          label={`🚩 ${tactic}`}
                          sx={{
                            bgcolor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            fontWeight: 700,
                            borderRadius: 2
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600, mb: 2 }}>
                      ✓ No suspicious keywords, urgency pressure, or impersonation detected.
                    </Typography>
                  )}

                  {/* Explanation Reasons */}
                  {result.explanation?.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {result.explanation.map((exp, idx) => (
                        <Typography key={idx} variant="body2" sx={{ color: '#475569', fontSize: '0.88rem' }}>
                          • {exp}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default VoiceShield;
