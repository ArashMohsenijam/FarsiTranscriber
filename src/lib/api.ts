import { createFileChunks } from './fileChunker';

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
  try {
    // Convert blob to base64
    const buffer = await chunk.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: base64Audio
      }),
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