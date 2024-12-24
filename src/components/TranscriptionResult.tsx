import React, { useState } from 'react';
import { Download, Copy, RefreshCw, SwitchCamera } from 'lucide-react';
import clsx from 'clsx';

interface TranscriptionResultProps {
  text: {
    original: string;
    improved: string;
  };
  onReset: () => void;
}

export function TranscriptionResult({ text, onReset }: TranscriptionResultProps) {
  const [showImproved, setShowImproved] = useState(true);

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
      const content = showImproved ? text.improved : text.original;
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* Toggle Switch */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-sm p-2 inline-flex">
          <button
            onClick={() => setShowImproved(false)}
            className={clsx(
              'px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
              !showImproved
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            متن اصلی
          </button>
          <button
            onClick={() => setShowImproved(true)}
            className={clsx(
              'px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium mr-2',
              showImproved
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            متن بهبود یافته
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowImproved(!showImproved)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <SwitchCamera className="w-5 h-5 ml-2" />
            تغییر نمایش
          </button>
          <h2 className="text-xl font-semibold text-right">
            {showImproved ? 'متن بهبود یافته' : 'متن اصلی'}
          </h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 min-h-[300px] max-h-[500px] overflow-y-auto">
          <p className="text-right whitespace-pre-wrap leading-relaxed" dir="rtl">
            {showImproved ? text.improved : text.original}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            شروع مجدد
          </button>

          <div className="flex space-x-4 space-x-reverse">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 ml-2" />
              دانلود متن
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4 ml-2" />
              کپی متن
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Info */}
      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800 text-right">
          شما می‌توانید بین دو نسخه متن جابجا شوید. متن بهبود یافته شامل اصلاحات گرامری و ویرایشی است.
        </p>
      </div>
    </div>
  );
}