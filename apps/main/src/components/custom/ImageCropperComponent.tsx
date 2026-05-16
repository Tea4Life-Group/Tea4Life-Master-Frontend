import React, { useState, useRef, useEffect, useCallback } from "react";
import { Crop, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ================================================================
   TYPES
   ================================================================ */

/**
 * Props cho ImageCropperComponent.
 *
 * @param imageSrc - Data URL hoặc Object URL của ảnh gốc cần crop.
 * @param open - Trạng thái mở/đóng modal.
 * @param onClose - Callback khi đóng modal (huỷ crop).
 * @param onCropComplete - Callback trả về File đã crop (150×150 PNG).
 * @param outputSize - Kích thước output (px). Mặc định 150.
 */
interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  outputSize?: number;
}

/* ================================================================
   COMPONENT
   ================================================================ */

export default function ImageCropperComponent({
  imageSrc,
  open,
  onClose,
  onCropComplete,
  outputSize = 150,
}: ImageCropperProps) {
  /* ---- Refs ---- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  /* ---- State ---- */
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  // Vị trí ảnh (drag offset)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  // Kích thước canvas hiển thị
  const CANVAS_SIZE = 300;
  // Vùng crop cố định hình tròn ở giữa canvas
  const CROP_RADIUS = 120;

  /**
   * Clamp offset để ảnh luôn phủ kín vùng crop tròn.
   * Ảnh không thể bị kéo ra ngoài khiến vùng crop trống.
   */
  const clampOffset = useCallback(
    (newOffset: { x: number; y: number }, currentScale: number) => {
      const img = imageRef.current;
      if (!img) return newOffset;

      const drawW = img.width * currentScale;
      const drawH = img.height * currentScale;

      // Giới hạn tối đa offset theo mỗi trục
      // Ảnh phải phủ từ (cx - CROP_RADIUS) đến (cx + CROP_RADIUS)
      const maxOffsetX = Math.max(0, (drawW - CROP_RADIUS * 2) / 2);
      const maxOffsetY = Math.max(0, (drawH - CROP_RADIUS * 2) / 2);

      return {
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffset.x)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffset.y)),
      };
    },
    [],
  );

  /* ---- Load ảnh khi src thay đổi ---- */
  useEffect(() => {
    if (!imageSrc || !open) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);

      // Tính scale mặc định sao cho ảnh vừa khít vùng crop
      const minDim = Math.min(img.width, img.height);
      const fitScale = (CROP_RADIUS * 2) / minDim;
      setScale(fitScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;

    return () => {
      setImageLoaded(false);
    };
  }, [imageSrc, open]);

  /* ---- Vẽ canvas ---- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = CANVAS_SIZE;
    const h = CANVAS_SIZE;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Vẽ ảnh ở giữa canvas + offset + scale
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = cx - drawW / 2 + offset.x;
    const drawY = cy - drawH / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Overlay tối bên ngoài vùng crop tròn
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();

    // Viền vùng crop
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [scale, offset]);

  useEffect(() => {
    if (imageLoaded) draw();
  }, [imageLoaded, draw]);

  /* ---- Mouse / Touch Drag ---- */
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const raw = {
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    };
    setOffset(clampOffset(raw, scale));
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  /* ---- Zoom ---- */
  const handleZoom = (delta: number) => {
    const img = imageRef.current;
    if (!img) return;

    // Min scale: ảnh phải >= vùng crop (đường kính)
    const minDim = Math.min(img.width, img.height);
    const minScale = (CROP_RADIUS * 2) / minDim;

    setScale((prev) => {
      const next = Math.max(minScale, Math.min(5, prev + delta));
      // Clamp offset theo scale mới
      setOffset((prevOffset) => clampOffset(prevOffset, next));
      return next;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY > 0 ? -0.05 : 0.05);
  };

  /* ---- Reset ---- */
  const handleReset = () => {
    const img = imageRef.current;
    if (!img) return;
    const minDim = Math.min(img.width, img.height);
    setScale((CROP_RADIUS * 2) / minDim);
    setOffset({ x: 0, y: 0 });
  };

  /* ---- Crop & Export ---- */
  const handleCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const offscreen = document.createElement("canvas");
    offscreen.width = outputSize;
    offscreen.height = outputSize;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // Clip tròn
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Tính toán vùng ảnh tương ứng
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = cx - drawW / 2 + offset.x;
    const drawY = cy - drawH / 2 + offset.y;

    // Crop region trên canvas hiển thị
    const cropLeft = cx - CROP_RADIUS;
    const cropTop = cy - CROP_RADIUS;
    const cropDiameter = CROP_RADIUS * 2;

    // Scale ratio: outputSize / cropDiameter
    const ratio = outputSize / cropDiameter;

    // Vẽ ảnh vào offscreen canvas, dịch đúng vị trí
    const destX = (drawX - cropLeft) * ratio;
    const destY = (drawY - cropTop) * ratio;
    const destW = drawW * ratio;
    const destH = drawH * ratio;

    ctx.drawImage(img, destX, destY, destW, destH);

    offscreen.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "avatar-cropped.png", {
          type: "image/png",
        });
        onCropComplete(file);
      },
      "image/png",
      1,
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0 gap-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Crop className="h-5 w-5 text-emerald-600" />
            Cắt ảnh đại diện
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Kéo và phóng to/thu nhỏ để chọn vùng ảnh bạn muốn.
          </DialogDescription>
        </DialogHeader>

        {/* Canvas Area */}
        <div className="flex justify-center py-4 bg-slate-950/5">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-2xl cursor-grab active:cursor-grabbing touch-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-3 py-3">
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (scale / 3) * 100)}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors ml-1"
            title="Đặt lại"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <DialogFooter className="px-6 pb-6 pt-2 flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-2xl h-11 px-6 gap-1.5"
          >
            <X className="h-4 w-4" />
            Huỷ
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            className="rounded-2xl h-11 px-6 bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
          >
            <Crop className="h-4 w-4" />
            Cắt ảnh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
