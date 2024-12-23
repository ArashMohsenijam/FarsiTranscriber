# Farsi Transcriber

A web application for transcribing Farsi audio files to text using OpenAI's Whisper API.

## Features

- Upload and transcribe Farsi audio files
- Automatic audio optimization for better transcription results
- Real-time progress updates during transcription
- Error handling and validation
- Clean and intuitive user interface
- Multiple file upload support
- Drag and drop interface
- File reordering
- Sequential processing
- Combined transcription output
- Copy and download functionality

## Dependencies

### Server Dependencies
- Express.js for the backend server
- Multer for file upload handling
- CORS for cross-origin resource sharing
- FFmpeg for audio file optimization
- OpenAI Whisper API for transcription

### Frontend Dependencies
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Styling: TailwindCSS
- API: OpenAI Whisper

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   npm install

   # Install server dependencies
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   PORT=3002
   ```

4. Start the development servers:
   ```bash
   # Start the frontend (from root directory)
   npm run dev

   # Start the backend (from server directory)
   cd server
   npm run dev
   ```

## Development

1. Start the development server:
```bash
npm run dev
```

## Production

1. Build the frontend:
```bash
npm run build
```

2. Build the server:
```bash
npm run build:server
```

3. Start the production server:
```bash
npm start
```

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Railway

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3002)
- `VITE_API_URL`: Backend API URL (for production)
