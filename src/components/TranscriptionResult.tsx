import React from 'react';
import { Download, Copy, RefreshCw } from 'lucide-react';

interface TranscriptionResultProps {
  text: {
    original: string;
    improved: string;
  };
  onReset: () => void;
}

export function TranscriptionResult({ text, onReset }: TranscriptionResultProps) {
  const handleDownload = () => {
    const content = `Original Transcription:\n${text.original}\n\nImproved Transcription:\n${text.improved}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      const content = `Original Transcription:\n${text.original}\n\nImproved Transcription:\n${text.improved}`;
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-right">متن اصلی</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto">
          <p className="text-right whitespace-pre-wrap" dir="rtl">{text.original}</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-right">متن بهبود یافته</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto">
          <p className="text-right whitespace-pre-wrap" dir="rtl">{text.improved}</p>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 ml-2" />
            دانلود متن
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Copy className="w-4 h-4 ml-2" />
            کپی متن
          </button>
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            شروع مجدد
          </button>
        </div>
      </div>
    </div>
  );
}