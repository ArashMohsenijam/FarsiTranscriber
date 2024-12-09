import { createFileChunks } from './fileChunker';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

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

  try {
    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Transcription failed: ' + (error instanceof Error ? error.message : 'Failed to fetch'));
  }
}