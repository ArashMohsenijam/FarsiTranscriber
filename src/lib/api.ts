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
    const base64Audio = arrayBufferToBase64(buffer);

    // Create a new issue with the audio data
    const createIssueResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Transcription Request ${new Date().toISOString()}`,
        body: JSON.stringify({ audioData: base64Audio }),
        labels: ['transcription-request']
      })
    });

    if (!createIssueResponse.ok) {
      throw new Error('Failed to create transcription request');
    }

    const issue = await createIssueResponse.json();
    const issueNumber = issue.number;

    // Poll for the transcription result
    const result = await pollForTranscriptionResult(issueNumber);
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Transcription failed: ' + (error instanceof Error ? error.message : 'Failed to fetch'));
  }
}

async function pollForTranscriptionResult(issueNumber: number, attempts = 30, interval = 2000): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    if (response.ok) {
      const comments = await response.json();
      if (comments.length > 0) {
        // Close the issue
        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ state: 'closed' })
          }
        );
        return comments[0].body;
      }
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for transcription result');
}