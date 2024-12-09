import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { AudioFile } from '../types';
import { cn } from '../lib/utils';

interface FileListProps {
  files: AudioFile[];
  onReorder: (files: AudioFile[]) => void;
  onRemove: (fileId: string) => void;
}

export function FileList({ files, onReorder, onRemove }: FileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = files.findIndex((file) => file.id === active.id);
      const newIndex = files.findIndex((file) => file.id === over.id);

      const newFiles = arrayMove(files, oldIndex, newIndex).map((file, index) => ({
        ...file,
        order: index,
      }));

      onReorder(newFiles);
    }
  };

  const getStatusIcon = (status: AudioFile['status']) => {
    switch (status) {
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {files.map((file) => (
            <SortableItem
              key={file.id}
              id={file.id}
              file={file}
              onRemove={onRemove}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
