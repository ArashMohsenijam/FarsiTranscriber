import { createFileChunks } from './fileChunker';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = 'ArashMohsenijam';
const REPO_NAME = 'FarsiTranscriber';

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function transcribeAudio(file: File, onProgress?: (progress: { status: string; progress: number }) => void): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3001/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to connect to transcription server');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    let transcription = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      const events = text.split('\n\n').filter(Boolean);

      for (const event of events) {
        if (event.startsWith('data: ')) {
          try {
            const data = JSON.parse(event.slice(6));
            console.log('Received data:', data);
            
            if (data.transcription) {
              transcription = data.transcription;
              if (onProgress) {
                onProgress({ status: 'Complete', progress: 100 });
              }
            } else if (data.error) {
              throw new Error(data.error);
            } else if (data.status && onProgress) {
              onProgress({ status: data.status, progress: data.progress });
            }
          } catch (e) {
            console.error('Error parsing event data:', e);
          }
        }
      }
    }

    if (!transcription) {
      throw new Error('No transcription received');
    }

    return transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error instanceof Error ? error : new Error('Failed to transcribe audio');
  }
}