"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleUpload } from "@/services/storageApi";
import { getMediaUrl } from "@/lib/utils";

interface ImageChunkUploadProps {
  value: string; // This is the S3 key of the image
  onChange: (key: string) => void;
  disabled?: boolean;
}

export default function ImageChunkUpload({
  value,
  onChange,
  disabled = false,
}: ImageChunkUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If value already exists (from BE), load the preview using utility
    if (value && !value.startsWith("blob:")) {
      setImagePreview(getMediaUrl(value));
    } else if (!value) {
      setImagePreview(null);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file hình ảnh hợp lệ.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước hình đại diện tối đa 5MB.");
        return;
      }

      setError(null);
      setIsUploading(true);

      // We can optionally show optimistic preview, but waiting for upload is safer for data integrity
      try {
        const uploadedKey = await handleUpload(file);
        if (uploadedKey) {
          onChange(uploadedKey);
        } else {
          setError("Tải ảnh thất bại. Vui lòng kiểm tra lại kết nối.");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi upload hệ thống.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    onChange("");
  };

  return (
    <div className="bg-white border rounded-xl p-4 w-full">
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 relative overflow-hidden group">
        {(imagePreview || value) && !isUploading ? (
          <>
            <img
              src={imagePreview || getMediaUrl(value)}
              alt="Chunk content preview"
              className="max-h-[300px] w-auto object-contain rounded"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              >
                <X className="h-8 w-8 text-white cursor-pointer bg-red-500/80 p-1.5 rounded-full" />
              </button>
            )}
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center space-y-2 text-emerald-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Đang tải ảnh lên S3...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 cursor-pointer" onClick={() => !disabled && fileInputRef.current?.click()}>
            <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Click để chọn ảnh</p>
              <p className="text-xs text-slate-500 mt-1">Định dạng JPG, PNG, WebP (Max 5MB)</p>
            </div>
            {!disabled && (
              <Button type="button" variant="outline" className="mt-2 h-8" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Ảnh
              </Button>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}
