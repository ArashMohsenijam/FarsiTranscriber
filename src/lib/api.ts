import { createFileChunks } from './fileChunker';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = 'ArashMohsenijam';
const REPO_NAME = 'FarsiTranscriber';
// Use the production API URL
const API_URL = 'https://farsitranscriber.onrender.com';

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function transcribeAudio(
  file: File, 
  onProgress?: (progress: { status: string; progress: number }) => void,
  options: { optimizeAudio: boolean; improveTranscription: boolean } = { optimizeAudio: true, improveTranscription: true }
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('optimizeAudio', options.optimizeAudio.toString());
    formData.append('improveTranscription', options.improveTranscription.toString());

    console.log('Sending request with options:', options);

    const response = await fetch(`${API_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      mode: 'cors'
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