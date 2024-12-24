import React, { useState, useEffect } from 'react';
import { transcribeAudio } from '../lib/api';
import { toast } from 'react-hot-toast';

interface TranscriptionResultProps {
  file: File | null;
  onTranscriptionComplete?: (transcription: string) => void;
  onError?: (error: Error) => void;
}

interface TranscriptionState {
  status: string;
  progress: number;
  transcription?: string;
  error?: string;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ 
  file, 
  onTranscriptionComplete,
  onError 
}) => {
  const [state, setState] = useState<TranscriptionState>({
    status: '',
    progress: 0,
    transcription: undefined,
    error: undefined
  });

  useEffect(() => {
    let abortController: AbortController | null = null;

    const processFile = async () => {
      if (!file) return;

      console.log('Processing file:', file.name);
      setState({ status: 'Starting', progress: 0 });

      try {
        abortController = new AbortController();
        
        await transcribeAudio(
          file,
          (progress) => {
            console.log('Progress update:', progress);
            setState(prev => ({
              ...prev,
              ...progress,
            }));

            // If we receive a transcription, notify parent
            if (progress.transcription && onTranscriptionComplete) {
              onTranscriptionComplete(progress.transcription);
            }
          },
          { optimizeAudio: false, improveTranscription: true },
          abortController.signal
        );
      } catch (error) {
        console.error('Processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setState(prev => ({
          ...prev,
          status: 'Error',
          error: errorMessage
        }));
        if (onError && error instanceof Error) {
          onError(error);
        }
        toast.error(`Error: ${errorMessage}`);
      }
    };

    if (file) {
      processFile();
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [file, onTranscriptionComplete, onError]);

  if (!file) return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Processing: {file.name}</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${state.progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {state.status}: {state.progress}%
        </p>
      </div>

      {state.error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p className="font-medium">Error: {state.error}</p>
        </div>
      )}

      {state.transcription && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Transcription Result:</h4>
          <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap font-farsi text-right">
            {state.transcription}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionResult;