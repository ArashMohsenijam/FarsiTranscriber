import { createFileChunks } from './fileChunker';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = 'ArashMohsenijam';
const REPO_NAME = 'FarsiTranscriber';

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

    // Create a dispatch event to trigger the GitHub Action
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'transcribe',
        client_payload: {
          audioData: base64Audio
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to trigger transcription');
    }

    // Poll for the result in issues
    const result = await pollForTranscriptionResult();
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Transcription failed: ' + (error instanceof Error ? error.message : 'Failed to fetch'));
  }
}

async function pollForTranscriptionResult(attempts = 30, interval = 2000): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&labels=transcription&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    if (response.ok) {
      const issues = await response.json();
      if (issues.length > 0) {
        const transcription = issues[0].body;
        // Close the issue
        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issues[0].number}`,
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
        return transcription;
      }
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for transcription result');
}