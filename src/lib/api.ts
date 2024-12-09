import { createFileChunks } from './fileChunker';

// Use CORS proxy for development
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export async function transcribeAudio(file: File): Promise<string> {
  if (file.size <= 25 * 1024 * 1024) {
    // For files under 25MB, use direct upload
    return await transcribeChunk(file);
  }

  // For larger files, split and transcribe in chunks
  const chunks: string[] = [];
  for await (const chunk of createFileChunks(file)) {
    const transcription = await transcribeChunk(chunk);
    chunks.push(transcription);
  }

  return chunks.join(' ');
}

async function transcribeChunk(chunk: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('model', 'whisper-1');
  formData.append('language', 'fa');
  formData.append('response_format', 'text');

  try {
    const response = await fetch(`${CORS_PROXY}${OPENAI_API_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Origin': window.location.origin,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Transcription failed');
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Transcription failed: ' + (error instanceof Error ? error.message : 'Failed to fetch'));
  }
}