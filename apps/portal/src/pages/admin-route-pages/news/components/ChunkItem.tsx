"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, AlignLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuillEditor from "./QuillEditor";
import ImageChunkUpload from "./ImageChunkUpload";

import type { NewsChunkRequest } from "@/types/news/NewsRequest";

interface ChunkItemProps {
  id: string; // Used strictly for DND Sortable identification
  chunk: NewsChunkRequest;
  onChange: (content: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ChunkItem({
  id,
  chunk,
  onChange,
  onRemove,
  disabled = false,
}: ChunkItemProps) {
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

  const isText = chunk.type === "TEXT";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex gap-3 bg-white border rounded-xl overflow-hidden shadow-sm transition-all
        ${isDragging ? "opacity-50 ring-2 ring-emerald-500 z-50 scale-[1.01]" : "hover:border-slate-300"}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center px-2 bg-slate-50 border-r border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-grab active:cursor-grabbing transition-colors"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 pl-2">
        <div className="flex items-center justify-between mb-3 text-slate-500">
          <div className="flex items-center gap-2">
            {isText ? (
              <AlignLeft className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              Khối Nội Dung: {isText ? "Văn Bản" : "Hình Ảnh"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            onClick={onRemove}
            disabled={disabled}
            title="Xóa khối nội dung này"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Dynamic Editor Component based on Chunk Type */}
        {isText ? (
          <QuillEditor
            value={chunk.content}
            onChange={onChange}
            disabled={disabled}
          />
        ) : (
          <ImageChunkUpload
            value={chunk.content}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
