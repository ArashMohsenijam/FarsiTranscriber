# Farsi Transcriber

A sophisticated web application for transcribing Farsi (Persian) audio files to text using OpenAI's Whisper API, with advanced text improvement capabilities using the o1-mini model.

## Features

### Core Functionality
- **Audio Transcription**: Convert Farsi audio files to text using OpenAI's Whisper API
- **Text Improvement**: Optional enhancement of transcribed text using o1-mini model
- **Side-by-Side Comparison**: View original and improved transcriptions when text improvement is enabled
- **Multiple File Support**: Upload and process multiple audio files sequentially
- **Progress Tracking**: Real-time progress updates during transcription and improvement

### Audio Processing
- **Optional Audio Optimization**: Toggle audio preprocessing for better transcription quality
- **Format Support**: Handles various audio formats (mp3, wav, m4a, etc.)
- **File Size Management**: Automatic handling of large audio files
- **Quality Control**: Audio quality validation and optimization

### User Interface
- **Modern Design**: Clean, responsive interface with RTL support for Farsi
- **Drag and Drop**: Intuitive file upload with drag and drop functionality
- **File Management**: Reorder files before processing
- **Progress Visualization**: Clear progress indicators for each processing step
- **Error Handling**: Comprehensive error messages and recovery options
- **Workflow Settings**: Configurable options for audio optimization and text improvement

### Text Processing
- **Intelligent Text Improvement**:
  - Grammar and punctuation correction
  - Word boundary optimization
  - Dialect standardization
  - Formal/informal tone consistency
  - Preservation of technical terms and proper nouns
- **Output Options**: Copy, download, or view improved text

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: 
  - TailwindCSS for utility-first styling
  - Custom CSS for specific components
  - RTL support for Farsi text
- **State Management**: React Hooks and Context
- **File Handling**: Custom file processing utilities

### Backend
- **Server**: Node.js with Express
- **Audio Processing**: FFmpeg for optimization
- **API Integration**:
  - OpenAI Whisper API for transcription
  - o1-mini model for text improvement
- **File Management**: Multer for file uploads
- **Security**: CORS, rate limiting, and input validation

## Setup and Installation

### Prerequisites
- Node.js 16.x or higher
- FFmpeg installed on the system
- OpenAI API key with access to Whisper and o1-mini models
- Git for version control

### Frontend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/ArashMohsenijam/FarsiTranscriber.git
   cd FarsiTranscriber
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```env
   VITE_API_URL=http://localhost:10000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Clone the server repository:
   ```bash
   git clone https://github.com/ArashMohsenijam/FarsiTranscriberServer.git
   cd FarsiTranscriberServer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```env
   OPENAI_API_KEY=your_api_key_here
   PORT=10000
   ```

4. Start the server:
   ```bash
   node server.js
   ```

## Usage Guide

### Basic Usage
1. Open the application in your browser
2. Click "Upload" or drag files to the upload area
3. Configure workflow settings:
   - Toggle audio optimization if needed
   - Toggle text improvement if desired
4. Click "Start Transcription"
5. Monitor progress in real-time
6. View results:
   - Single column if no improvement
   - Side-by-side comparison with improvement

### Advanced Features
- **File Reordering**: Drag and drop files in the queue to change processing order
- **Cancellation**: Cancel ongoing transcription at any time
- **Workflow Settings**:
  - Audio Optimization: Better for poor quality recordings
  - Text Improvement: Enhanced readability and grammar
- **Error Recovery**: Automatic retry on temporary failures

## API Documentation

### Endpoints

#### POST /api/transcribe
- **Purpose**: Transcribe audio file(s)
- **Body**: FormData with:
  - file: Audio file
  - optimizeAudio: boolean
  - improveTranscription: boolean
- **Response**: Server-Sent Events with:
  - status: Current status
  - progress: 0-100
  - result: { original, improved }

## Deployment

### Frontend Deployment
- Hosted on GitHub Pages
- Automatic deployment via GitHub Actions
- Environment configuration through repository secrets

### Backend Deployment
- Hosted on Render
- Auto-deployment from main branch
- Environment variables configured in Render dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email [your-email@example.com] or create an issue in the repository.

## Acknowledgments

- OpenAI for Whisper and o1-mini models
- FFmpeg for audio processing
- All contributors and users of the application
