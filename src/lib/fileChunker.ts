import { chunk } from './utils';

const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB chunks to stay under 25MB limit

export async function* createFileChunks(file: File): AsyncGenerator<Blob> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    yield file.slice(start, end);
  }
}