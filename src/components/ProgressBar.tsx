import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  // Map status to Farsi text
  const statusText = {
    'Uploading': 'در حال آپلود',
    'Optimizing': 'بهینه‌سازی صدا',
    'Transcribing': 'در حال تبدیل به متن',
    'Improving transcription': 'بهبود متن',
    'Complete': 'تکمیل شد',
    'Error': 'خطا'
  }[status] || status;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span className="font-medium">{statusText}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
