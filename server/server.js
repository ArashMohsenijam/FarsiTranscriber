const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { optimizeAudio } = require('./utils/audioOptimizer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

require('dotenv').config();

const app = express();

// Ensure upload and optimized directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const optimizedDir = path.join(__dirname, 'optimized');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir);

const upload = multer({ dest: uploadsDir });

// List of allowed origins
const allowedOrigins = [
  'https://farsitranscriber.onrender.com',
  'http://localhost:5173'
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'FarsiTranscriber API is running',
    endpoints: {
      root: '/',
      test: '/test-cors',
      transcribe: '/api/transcribe'
    }
  });
});

// Test endpoint for CORS
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin',
    headers: req.headers
  });
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Set CORS headers again for SSE
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const cleanup = () => {
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      // Clean up optimized file if it exists
      const optimizedPath = path.join(optimizedDir, path.basename(req.file?.path || '') + '.mp3');
      if (fs.existsSync(optimizedPath)) {
        fs.unlinkSync(optimizedPath);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const sendStatus = (status, progress = 0) => {
    try {
      const data = JSON.stringify({ status, progress });
      console.log('Sending status:', data);
      res.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error('Error sending status:', error);
    }
  };

  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    console.log('File details:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      path: req.file.path
    });

    if (!req.file.mimetype?.startsWith('audio/')) {
      throw new Error('Invalid file type. Please upload an audio file.');
    }

    console.log('File received:', req.file.originalname);
    sendStatus('Uploading', 33);

    // Optimize audio file
    console.log('Optimizing audio...');
    sendStatus('Optimizing', 50);
    const optimizedPath = await optimizeAudio(req.file.path);
    
    console.log('Optimized file path:', optimizedPath);
    sendStatus('Transcribing', 75);

    // Verify optimized file exists and is readable
    if (!fs.existsSync(optimizedPath)) {
      throw new Error('Optimized file not found');
    }

    const stats = fs.statSync(optimizedPath);
    console.log('Optimized file stats:', {
      size: stats.size,
      isFile: stats.isFile(),
      permissions: stats.mode
    });

    const formData = new FormData();
    formData.append('file', fs.createReadStream(optimizedPath));
    formData.append('model', 'whisper-1');
    formData.append('language', 'fa');
    formData.append('response_format', 'text');

    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const transcription = await response.text();
    console.log('Transcription received, length:', transcription.length);
    console.log('Transcription preview:', transcription.substring(0, 100) + '...');
    
    // Send the final transcription result
    const finalResponse = JSON.stringify({ 
      status: 'Complete',
      progress: 100,
      transcription: transcription 
    });
    console.log('Sending final response:', finalResponse);
    res.write(`data: ${finalResponse}\n\n`);
    res.end();
  } catch (error) {
    console.error('Server error:', error);
    const errorResponse = JSON.stringify({ 
      status: 'Error',
      progress: 0,
      error: error.message || 'An unexpected error occurred'
    });
    console.log('Sending error response:', errorResponse);
    res.write(`data: ${errorResponse}\n\n`);
    res.end();
  } finally {
    cleanup();
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
