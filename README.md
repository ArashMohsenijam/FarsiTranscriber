# Farsi Transcriber

A web application for transcribing Farsi audio files to text using OpenAI's Whisper API.

## Features

- Multiple file upload support
- Drag and drop interface
- File reordering
- Sequential processing
- Combined transcription output
- Copy and download functionality

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Styling: TailwindCSS
- API: OpenAI Whisper

## Development

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
PORT=3002
```

3. Start the development server:
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
