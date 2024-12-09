import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Play, Check, AlertCircle } from 'lucide-react';
import { AudioFile } from '../types';
import { cn } from '../lib/utils';

interface SortableItemProps {
  id: string;
  file: AudioFile;
  onRemove: (id: string) => void;
}

export function SortableItem({ id, file, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between p-3 bg-white rounded-lg border',
        file.status === 'error' && 'border-red-200 bg-red-50',
        isDragging && 'opacity-50'
      )}
      {...attributes}
    >
      <div className="flex items-center space-x-3">
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{file.name}</p>
          <p className="text-xs text-gray-500">Order: {file.order + 1}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <button
          onClick={() => onRemove(id)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
