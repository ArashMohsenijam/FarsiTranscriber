import React from 'react';

interface WorkflowSettingsProps {
  optimizeAudio: boolean;
  improveTranscription: boolean;
  onOptimizeAudioChange: (value: boolean) => void;
  onImproveTranscriptionChange: (value: boolean) => void;
}

export function WorkflowSettings({
  optimizeAudio,
  improveTranscription,
  onOptimizeAudioChange,
  onImproveTranscriptionChange
}: WorkflowSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">تنظیمات گردش کار</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={optimizeAudio}
              onChange={(e) => onOptimizeAudioChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-900">بهینه‌سازی صدا</span>
        </div>
        <div className="flex items-center justify-between">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={improveTranscription}
              onChange={(e) => onImproveTranscriptionChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-900">بهبود متن با هوش مصنوعی</span>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-right">
        <p>بهینه‌سازی صدا: کاهش حجم و بهبود کیفیت فایل صوتی</p>
        <p>بهبود متن: اصلاح خطاهای گرامری و املایی با GPT-4</p>
      </div>
    </div>
  );
}
