import React, { useState, useRef } from 'react';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import TranscriptionResult from './components/TranscriptionResult';
import { ProgressBar } from './components/ProgressBar';
import { WorkflowSettings } from './components/WorkflowSettings';
import { transcribeAudio } from './lib/api';
import { AudioFile } from './types';
import { saveTranscription } from './lib/fileUtils';
import { Toaster } from 'react-hot-toast';

interface TranscriptionResult {
  original: string;
  improved: string;
}

interface FileState {
  file: AudioFile;
  status: string;
  progress: number;
}

export function App() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<Error | null>(null);
  const [combinedTranscription, setCombinedTranscription] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState({ status: '', progress: 0 });
  const [optimizeAudio, setOptimizeAudio] = useState(false); 
  const [improveTranscription, setImproveTranscription] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFilesAccepted = (newFiles: AudioFile[]) => {
    console.log('Dropped files:', newFiles);
    const newFilesState = newFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFilesState]);
    
    // Select the first file for processing
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0]);
    }
  };

  const handleTranscriptionComplete = (transcription: TranscriptionResult) => {
    // Update the file status
    setFiles(prev => prev.map(fileState => {
      if (fileState.file === selectedFile) {
        return {
          ...fileState,
          status: 'completed',
          progress: 100
        };
      }
      return fileState;
    }));
    setCombinedTranscription(transcription);
  };

  const handleTranscriptionError = (error: Error) => {
    setTranscriptionError(error);
    // Update the file status
    setFiles(prev => prev.map(fileState => {
      if (fileState.file === selectedFile) {
        return {
          ...fileState,
          status: 'error',
          progress: 0
        };
      }
      return fileState;
    }));
  };

  const handleReset = () => {
    setFiles([]);
    setSelectedFile(null);
    setTranscriptionError(null);
    setCombinedTranscription(null);
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setError(null);
    setCombinedTranscription(null);
    setProcessingStatus({ status: 'Starting...', progress: 0 });
    
    // Create new AbortController for this operation
    abortControllerRef.current = new AbortController();
    
    const sortedFiles = [...files].sort((a, b) => a.file.order - b.file.order);
    const transcriptions: TranscriptionResult[] = [];

    try {
      for (const [index, file] of sortedFiles.entries()) {
        setFiles(prev => prev.map(fileState => {
          if (fileState.file === file.file) {
            return {
              ...fileState,
              status: 'processing',
              progress: 0
            };
          }
          return fileState;
        }));

        try {
          console.log('Processing file:', file.file.name);
          console.log('Sending request with options:', { optimizeAudio, improveTranscription });
          
          const transcription = await transcribeAudio(
            file.file.file,
            (progress) => {
              console.log('Progress update:', progress);
              setProcessingStatus({
                status: progress.status,
                progress: progress.progress
              });
              setFiles(prev => prev.map(fileState => {
                if (fileState.file === file.file) {
                  return {
                    ...fileState,
                    progress: progress.progress
                  };
                }
                return fileState;
              }));
            },
            { optimizeAudio, improveTranscription },
            abortControllerRef.current.signal
          );
          
          console.log('Transcription result received:', transcription);
          
          if (!transcription || !transcription.original) {
            throw new Error('Invalid transcription result received');
          }
          
          transcriptions.push({
            original: transcription.original,
            improved: transcription.improved || transcription.original
          });

          setFiles(prev => prev.map(fileState => {
            if (fileState.file === file.file) {
              return {
                ...fileState,
                status: 'completed',
                progress: 100
              };
            }
            return fileState;
          }));
        } catch (error) {
          console.error('Error processing file:', file.file.name, error);
          setFiles(prev => prev.map(fileState => {
            if (fileState.file === file.file) {
              return {
                ...fileState,
                status: 'error',
                progress: 0
              };
            }
            return fileState;
          }));
          throw error;
        }
      }

      const combined = transcriptions.reduce((acc, transcription) => {
        acc.original += `${transcription.original}\n\n---\n\n`;
        acc.improved += `${transcription.improved}\n\n---\n\n`;
        return acc;
      }, { original: '', improved: '' });
      console.log('Final transcription:', combined);
      setCombinedTranscription(combined);
      setProcessingStatus({ status: 'Complete', progress: 100 });

      // Save the transcription
      await saveTranscription(combined.original);
    } catch (error) {
      console.error('Processing error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setProcessingStatus({ status: 'Error', progress: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          رونویس صوتی فارسی
        </h1>

        {files.length === 0 ? (
          <DropZone onFilesAccepted={handleFilesAccepted} />
        ) : (
          <div className="space-y-6">
            <FileList 
              files={files.map(f => ({
                name: f.file.name,
                status: f.status,
                progress: f.progress
              }))} 
            />
            
            {selectedFile && (
              <TranscriptionResult
                file={selectedFile}
                onTranscriptionComplete={handleTranscriptionComplete}
                onError={handleTranscriptionError}
                onReset={handleReset}
              />
            )}
            
            <WorkflowSettings
              optimizeAudio={optimizeAudio}
              improveTranscription={improveTranscription}
              onOptimizeAudioChange={setOptimizeAudio}
              onImproveTranscriptionChange={setImproveTranscription}
            />

            <div className="flex justify-end">
              <button
                onClick={processFiles}
                disabled={isProcessing || files.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isProcessing ? 'در حال پردازش...' : 'شروع تبدیل'}
              </button>
            </div>

            {isProcessing && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow">
                <ProgressBar 
                  progress={processingStatus.progress} 
                  status={processingStatus.status}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                        abortControllerRef.current = null;
                      }
                      setIsProcessing(false);
                      setProcessingStatus({ status: 'Cancelled', progress: 0 });
                      setFiles(prev => prev.map(f => ({ ...f, status: 'pending' })));
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    لغو عملیات
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}