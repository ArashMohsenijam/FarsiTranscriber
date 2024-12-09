export interface AudioFile {
  id: string;
  file: File;
  name: string;
  order: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  transcription?: string;
}
