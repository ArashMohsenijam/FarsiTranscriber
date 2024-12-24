import { createFileChunks } from './fileChunker';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = 'ArashMohsenijam';
const REPO_NAME = 'FarsiTranscriber';
// Use the production API URL
const API_URL = 'https://farsitranscriber-api.onrender.com';

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
  options: { optimizeAudio: boolean; improveTranscription: boolean } = { optimizeAudio: true, improveTranscription: true },
  signal?: AbortSignal
): Promise<{ original: string; improved: string }> {
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
      mode: 'cors',
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    let result: { original: string; improved: string } | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert the chunk to text
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      // Process each line
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.result) {
              result = data.result;
            }
            if (data.status && onProgress) {
              onProgress(data);
            }
            if (data.error) {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    if (!result) {
      throw new Error('No transcription result received');
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was cancelled');
      throw new Error('Operation cancelled');
    }
    throw error;
  }
}