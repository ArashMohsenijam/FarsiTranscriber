import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  // Map status to Farsi text
  const getFarsiStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Starting': 'شروع',
      'Uploading': 'در حال آپلود',
      'Optimizing': 'بهینه‌سازی صدا',
      'Transcribing': 'در حال تبدیل به متن',
      'Improving transcription': 'بهبود متن',
      'Complete': 'تکمیل شد',
      'Error': 'خطا'
    };
    
    return statusMap[status] || status;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{getFarsiStatus(status)}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
          style={{ 
            width: `${progress}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </div>
    </div>
  );
}
