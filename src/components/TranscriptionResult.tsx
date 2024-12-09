import React from 'react';
import { Download, Copy, RefreshCw } from 'lucide-react';

interface TranscriptionResultProps {
  text: string;
  onReset: () => void;
}

export function TranscriptionResult({ text, onReset }: TranscriptionResultProps) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
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
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-right">متن شما</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto">
          <p className="text-right whitespace-pre-wrap" dir="rtl">{text}</p>
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