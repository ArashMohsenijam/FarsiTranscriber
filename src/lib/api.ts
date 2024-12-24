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
  options = { optimizeAudio: false, improveTranscription: true },
  signal?: AbortSignal
): Promise<{ original: string; improved: string | null }> {
  console.log('Starting transcription request...');
  console.log('Sending request with options:', options);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('options', JSON.stringify(options));

  try {
    const response = await fetch(`${API_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'text/event-stream',
      },
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Set up event source for progress updates
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let transcriptionResult = '';
    let lastProgress = { status: '', progress: 0 };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        try {
          const parsedData = JSON.parse(data);
          console.log('Received data:', parsedData);

          if (parsedData.status && onProgress) {
            lastProgress = parsedData;
            onProgress(parsedData);
          }
          if (parsedData.transcription) {
            transcriptionResult = parsedData.transcription;
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      }
    }

    if (!transcriptionResult && lastProgress.status !== 'Error') {
      throw new Error('No transcription result received');
    }

    return {
      original: transcriptionResult,
      improved: null
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}