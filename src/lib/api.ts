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

interface TranscriptionProgress {
  status: string;
  progress: number;
  transcription?: string;
  error?: string;
}

export async function transcribeAudio(
  file: File, 
  onProgress?: (progress: TranscriptionProgress) => void,
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
    let lastProgress: TranscriptionProgress = { status: '', progress: 0 };

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

          // Update progress
          if (parsedData.status) {
            lastProgress = parsedData;
            if (onProgress) {
              onProgress(parsedData);
            }
          }

          // Store transcription if available
          if (parsedData.transcription) {
            transcriptionResult = parsedData.transcription;
            // Also update progress with the transcription
            if (onProgress) {
              onProgress({
                status: 'Complete',
                progress: 100,
                transcription: transcriptionResult
              });
            }
          }

          // Handle error
          if (parsedData.error) {
            throw new Error(parsedData.error);
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
          if (e instanceof Error) {
            throw e;
          }
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
    if (onProgress) {
      onProgress({
        status: 'Error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
    throw error;
  }
}