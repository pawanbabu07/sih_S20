const axios = require('axios');
const fs = require('fs');

/**
 * Transcribes a local audio file to text.
 * Defaults to SIMULATED mode if ASSEMBLY_AI_API_KEY is not defined.
 * 
 * @param {string} filePath - Path to the local audio file
 * @returns {Promise<string>} The transcribed text
 */
const transcribeAudio = async (filePath) => {
  const apiKey = process.env.ASSEMBLY_AI_API_KEY;
  const mode = process.env.STT_MODE || 'SIMULATED';

  // Fallback to simulation if config demands it or if API key is missing
  if (mode === 'SIMULATED' || !apiKey) {
    console.log('STT: Running in SIMULATED mode (no API key or configured fallback).');
    
    // Return the custom simulated transcript or a generic social-engineering phishing example
    return process.env.SIMULATED_TRANSCRIPT || 
      "Hello, I am calling from your bank. Your account will be blocked today. Tell me the OTP you received. You need to transfer ₹5,000 immediately to verify your account.";
  }

  // Real AssemblyAI Integration
  try {
    console.log(`STT: Uploading file ${filePath} to AssemblyAI...`);
    const fileData = fs.readFileSync(filePath);

    // 1. Upload audio buffer
    const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', fileData, {
      headers: {
        authorization: apiKey,
        'content-type': 'application/octet-stream'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const audioUrl = uploadResponse.data.upload_url;
    console.log(`STT: File uploaded successfully. Audio URL: ${audioUrl}. Requesting transcription...`);

    // 2. Request transcript creation
    const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
      audio_url: audioUrl
    }, {
      headers: {
        authorization: apiKey
      }
    });

    const transcriptId = transcriptResponse.data.id;
    console.log(`STT: Transcript request registered (ID: ${transcriptId}). Polling status...`);

    // 3. Poll for result
    let status = 'queued';
    let transcriptionText = '';

    while (status === 'queued' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s
      
      const pollResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          authorization: apiKey
        }
      });

      status = pollResponse.data.status;
      console.log(`STT: Polling ID ${transcriptId} - Status: ${status}`);

      if (status === 'completed') {
        transcriptionText = pollResponse.data.text;
      } else if (status === 'failed') {
        throw new Error(`AssemblyAI returned failure: ${pollResponse.data.error}`);
      }
    }

    return transcriptionText;

  } catch (error) {
    console.error('STT API Error during transcription:', error.message);
    throw new Error(`Speech-to-text conversion failed: ${error.message}`);
  }
};

module.exports = {
  transcribeAudio
};
