import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Tabs, Tab, Alert, Grid, CircularProgress, MenuItem, Select, InputLabel, FormControl, LinearProgress } from '@mui/material';
import RiskBadge from '../components/RiskBadge';
import API from '../services/api';

const TRANSACTION_WEIGHT = 0.65;
const VOICE_WEIGHT = 0.35;

const VoiceShield = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  // Audio state
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Setup options
  const [transactions, setTransactions] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [feedbackRegistered, setFeedbackRegistered] = useState('');

  // Fetch transactions for combined risk matching
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await API.get('/transactions');
        // Retrieve transactions that are either PENDING or FLAGGED to allow mock analysis matching
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Failed to retrieve transactions:', err.message);
      }
    };
    fetchTransactions();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError('');
    setFeedbackRegistered('');
  };

  // Start MediaRecorder audio capture
  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    setAudioUrl('');
    setAudioFile(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser media capture APIs are not supported on this device.');
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
      setError(err.message || 'Microphone access denied. Please grant audio permissions.');
    }
  };

  // Stop MediaRecorder audio capture
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Stop all tracks to turn off mic light
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileUpload = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Audio files must not exceed 10 MB.');
      return;
    }

    setAudioUrl(URL.createObjectURL(file));
    setAudioFile(file);
  };

  const runAnalysis = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setFeedbackRegistered('');

    if (tabIndex === 1 && (!transcript || !transcript.trim())) {
      setError('Please paste a conversation transcript to analyze.');
      return;
    }

    if (tabIndex === 0 && !audioFile) {
      setError('Please record a voice clip or upload an audio file first.');
      return;
    }

    setChecking(true);

    try {
      let response;
      if (tabIndex === 1) {
        // Transcript Mode (JSON POST)
        response = await API.post('/voice/analyze', {
          transcript,
          transactionId: selectedTxId || undefined
        });
      } else {
        // Audio Mode (Multipart Form Data)
        const formData = new FormData();
        formData.append('audio', audioFile);
        if (selectedTxId) {
          formData.append('transactionId', selectedTxId);
        }

        response = await API.post('/voice/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setResult(response.data.voiceAnalysis);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Voice analysis request failed. Check system connectivity.');
    } finally {
      setChecking(false);
    }
  };

  // Report false positives
  const sendFeedback = async (feedbackType) => {
    if (!result) return;
    setError('');
    
    try {
      const res = await API.post('/voice/feedback', {
        voiceAnalysisId: result.id,
        feedback: feedbackType
      });
      setResult(res.data.voiceAnalysis);
      setFeedbackRegistered(feedbackType === 'FALSE_POSITIVE' 
        ? 'Warning reported as False Positive. Thank you for your feedback!' 
        : 'Feedback registered successfully.'
      );
    } catch (err) {
      console.error(err);
      setError('Failed to submit feedback.');
    }
  };

  // Compute combined risk if a transaction is selected
  const getCombinedRisk = () => {
    if (!result || !selectedTxId) return null;
    const tx = transactions.find(t => t.id === selectedTxId);
    if (!tx) return null;

    const txScore = tx.riskScore || 0;
    const voiceScore = result.riskScore || 0;

    const combinedScore = Math.round((txScore * TRANSACTION_WEIGHT) + (voiceScore * VOICE_WEIGHT));
    
    let combinedLevel = 'LOW';
    if (combinedScore >= 70) {
      combinedLevel = 'HIGH';
    } else if (combinedScore >= 30) {
      combinedLevel = 'MEDIUM';
    }

    return {
      txScore,
      txLevel: tx.riskLevel,
      txName: tx.receiverName,
      txAmount: tx.amount,
      voiceScore,
      voiceLevel: result.riskLevel,
      combinedScore,
      combinedLevel,
      reasons: [...(tx.fraudReasons || []), ...(result.explanation || [])]
    };
  };

  const combined = getCombinedRisk();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: '#1e293b' }}>
        Voice Phishing & Social Engineering Shield
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Analyze incoming calls or audio clips for manipulative social engineering threat patterns.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {feedbackRegistered && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{feedbackRegistered}</Alert>}

      <Grid container spacing={4}>
        {/* Left Side Inputs Form */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              sx={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
            >
              <Tab label="Audio Recording" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
              <Tab label="Paste Transcript" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
            </Tabs>

            <CardContent sx={{ p: 3 }}>
              {tabIndex === 0 ? (
                /* Audio Mode */
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Record a snippet of the conversation using your microphone, or upload an audio file (.wav, .mp3, .webm).
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {!recording ? (
                        <Button 
                          variant="contained" 
                          color="error" 
                          onClick={startRecording}
                          sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                        >
                          🔴 Start Recording
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={stopRecording}
                          sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                        >
                          ⏹ Stop Recording
                        </Button>
                      )}
                      
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                      >
                        📁 Upload Audio File
                        <input type="file" accept="audio/*" hidden onChange={handleFileUpload} />
                      </Button>
                    </Box>

                    {recording && (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Typography variant="caption" color="error" sx={{ fontWeight: 'bold', display: 'block', textAlign: 'center', mb: 0.5 }}>
                          Microphone Active: Recording audio...
                        </Typography>
                        <LinearProgress color="error" />
                      </Box>
                    )}

                    {audioUrl && (
                      <Box sx={{ width: '100%', mt: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Audio Preview:
                        </Typography>
                        <audio src={audioUrl} controls style={{ width: '100%' }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : (
                /* Transcript Mode */
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Enter or paste the caller's text script to identify social engineering triggers.
                  </Typography>
                  <TextField
                    label="Conversation Transcript"
                    multiline
                    rows={6}
                    fullWidth
                    placeholder="Enter transcript (e.g. 'I am calling from bank. Send OTP immediately...')"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    sx={{ mb: 3, borderRadius: 2 }}
                  />
                </Box>
              )}

              {/* Optional Link to Transaction */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="tx-select-label">Link to Pending Payment (Optional)</InputLabel>
                <Select
                  labelId="tx-select-label"
                  value={selectedTxId}
                  label="Link to Pending Payment (Optional)"
                  onChange={(e) => setSelectedTxId(e.target.value)}
                >
                  <MenuItem value=""><em>None - Voice check only</em></MenuItem>
                  {transactions.map((tx) => (
                    <MenuItem key={tx.id} value={tx.id}>
                      {tx.receiverName} (₹{tx.amount}) - Risk: {tx.riskScore} ({tx.riskLevel})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Privacy Banner */}
              <Box sx={{ p: 2, backgroundColor: '#f0fdf4', borderRadius: 3, border: '1px solid #bbf7d0', mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500, display: 'flex', gap: 1 }}>
                  🔒 <strong>Privacy Protection:</strong> Audio uploads are only processed for transcript generation and are immediately deleted.
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={checking}
                onClick={runAnalysis}
                sx={{ 
                  backgroundColor: '#1e293b', 
                  '&:hover': { backgroundColor: '#334155' }, 
                  fontWeight: 'bold', 
                  textTransform: 'none', 
                  borderRadius: 2 
                }}
              >
                {checking ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Analyzing Conversation...
                  </Box>
                ) : (
                  'Analyze Call Safety'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side Analysis Outcomes */}
        <Grid size={{ xs: 12, md: 7 }}>
          {result ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              {/* Standalone Voice Phishing Panel */}
              <Card sx={{ 
                boxShadow: 4, 
                borderRadius: 4, 
                borderLeft: `10px solid ${
                  result.riskLevel === 'HIGH' ? '#ef4444' : result.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
                }`,
                p: 1
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" sx={{ fontWeight: 'bold', color: result.riskLevel === 'HIGH' ? '#ef4444' : result.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981', fontSize: '1rem', tracking: 1 }}>
                    🎙️ Voice Phishing Report
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                        Risk Score: {result.riskScore} / 100
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <RiskBadge riskLevel={result.riskLevel} />
                      </Box>
                    </Box>
                    <Box sx={{ 
                      width: 70, 
                      height: 70, 
                      borderRadius: '50%', 
                      backgroundColor: result.riskLevel === 'HIGH' ? '#fee2e2' : result.riskLevel === 'MEDIUM' ? '#fef3c7' : '#d1fae5',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '1.4rem',
                      color: result.riskLevel === 'HIGH' ? '#ef4444' : result.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
                    }}>
                      {result.riskScore}%
                    </Box>
                  </Box>

                  {/* Indicators Checkbox */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                    Detected Indicators:
                  </Typography>
                  {result.indicators.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      No social engineering markers detected.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {result.indicators.map((ind, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 2, 
                            border: '1px solid',
                            borderColor: ind.severity === 'HIGH' ? '#fca5a5' : '#fde68a',
                            backgroundColor: ind.severity === 'HIGH' ? '#fef2f2' : '#fffbeb',
                            color: ind.severity === 'HIGH' ? '#b91c1c' : '#b45309',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}
                        >
                          ⚠️ {ind.label}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Explainable Reasons */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                    Manipulation Explanations:
                  </Typography>
                  <Box sx={{ mb: 3, pl: 2 }}>
                    {result.explanation.map((exp, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#475569', mb: 0.5, display: 'flex', gap: 1 }}>
                        • {exp}
                      </Typography>
                    ))}
                  </Box>

                  {/* Recommended Action */}
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 3, mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 0.5 }}>
                      Recommended Action:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: result.riskLevel === 'HIGH' ? '#ef4444' : result.riskLevel === 'MEDIUM' ? '#d97706' : '#059669' 
                      }}
                    >
                      {result.recommendedAction === 'DO_NOT_PAY' && '🔴 DO NOT PAY: Caller is requesting secrets under high threat pressure.'}
                      {result.recommendedAction === 'VERIFY_CALLER' && '🟡 VERIFY CALLER: High susceptibility. Ask the caller to authenticate via official app.'}
                      {result.recommendedAction === 'CONTINUE_WITH_CAUTION' && '🟢 CONTINUE WITH CAUTION: Conversation appears standard and non-manipulative.'}
                    </Typography>
                    {result.riskLevel === 'HIGH' && (
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                        * Do not share OTP, UPI PIN, or passwords. End the call immediately and contact the bank via official customer-care lines.
                      </Typography>
                    )}
                  </Box>

                  {/* Feedback options */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', pt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Is this warning accurate? Help us improve.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {result.feedback === 'PENDING' ? (
                        <>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => sendFeedback('FALSE_POSITIVE')}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            This Warning Was Incorrect
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="success" 
                            size="small"
                            onClick={() => sendFeedback('CORRECT_WARNING')}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            Correct Warning
                          </Button>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: result.feedback === 'FALSE_POSITIVE' ? '#ef4444' : '#10b981' }}>
                          Feedback saved: {result.feedback.replace('_', ' ')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Combined Risk Scoring Dashboard */}
              {combined && (
                <Card sx={{ 
                  boxShadow: 4, 
                  borderRadius: 4, 
                  borderLeft: `10px solid ${combined.combinedLevel === 'HIGH' ? '#ef4444' : combined.combinedLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'}`,
                  backgroundColor: '#fafaf9',
                  p: 1
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ fontWeight: 'bold', color: combined.combinedLevel === 'HIGH' ? '#ef4444' : combined.combinedLevel === 'MEDIUM' ? '#f59e0b' : '#10b981', fontSize: '1rem', tracking: 1 }}>
                      🛡️ COMBINED RISK WARNING
                    </Typography>

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
                      Combined analysis matches transaction characteristics and call transcripts to evaluate fraud risk.
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                          Transaction Risk
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mt: 0.5 }}>
                          {combined.txScore}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (Weight: 65%)
                        </Typography>
                      </Grid>
                      <Grid size={4} sx={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                          Voice Risk
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mt: 0.5 }}>
                          {combined.voiceScore}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (Weight: 35%)
                        </Typography>
                      </Grid>
                      <Grid size={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                          Combined Score
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: combined.combinedLevel === 'HIGH' ? '#ef4444' : combined.combinedLevel === 'MEDIUM' ? '#f59e0b' : '#10b981', mt: 0.5 }}>
                          {combined.combinedScore} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
                        </Typography>
                        <RiskBadge riskLevel={combined.combinedLevel} />
                      </Grid>
                    </Grid>

                    {/* Combined risk warning block */}
                    {combined.combinedLevel === 'HIGH' && (
                      <Box sx={{ p: 2, backgroundColor: '#fee2e2', borderRadius: 3, border: '1px solid #fca5a5', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#b91c1c', fontWeight: 'bold', mb: 0.5 }}>
                          🚨 DANGER DETECTED
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#991b1b' }}>
                          Payment behavior and conversation signals both indicate suspicious activity. Do not transfer funds to this receiver.
                        </Typography>
                      </Box>
                    )}

                    {/* Merged explanation reasons list */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                      Merged Risk Factors:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      {combined.reasons.map((reason, index) => (
                        <Typography key={index} variant="body2" sx={{ color: '#475569', mb: 0.5 }}>
                          • {reason}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, border: '2px dashed #cbd5e1', borderRadius: 4, minHeight: 350 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>🎙️</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                Safety Report Output
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', maxWidth: 300, mt: 1 }}>
                Record a voice call or paste the transcript text on the left to review social engineering risk scores.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default VoiceShield;
