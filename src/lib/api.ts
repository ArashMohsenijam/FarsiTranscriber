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
  const formData = new FormData();
  formData.append('file', chunk);

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Transcription failed');
    }

    return data.transcription;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during transcription');
  }
}