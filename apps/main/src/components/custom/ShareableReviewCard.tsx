import React, { useEffect, useRef, useState } from "react";
import { getMediaUrl } from "@/lib/utils";
import { handleUpload } from "@/services/storageApi";

type Props = {
  title: string;
  summary?: string;
  rating?: number;
  thumbnailUrl?: string;
  logoUrl?: string;
  width?: number;
  height?: number;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Infinity,
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      // if next line would exceed allowed lines, ellipsize
      if (lineCount + 1 >= maxLines) {
        const remaining = words.slice(n).join(" ");
        const ell = "...";
        let shortLine = line.trim();
        while (ctx.measureText(shortLine + ell).width > maxWidth && shortLine.length > 0) {
          shortLine = shortLine.slice(0, -1);
        }
        ctx.fillText(shortLine + ell, x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (lineCount < maxLines) ctx.fillText(line.trim(), x, y);
}

export default function ShareableReviewCard({
  title,
  summary,
  rating = 5,
  thumbnailUrl,
  logoUrl,
  width = 1200,
  height = 630,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [template, setTemplate] = useState<"light" | "dark">("light");

  const render = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRendering(true);
    try {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // background and color scheme based on template
      const isDark = template === "dark";
      const bg = isDark ? "#0f172a" : "#fff7ee";
      const textColor = isDark ? "#f8fafc" : "#1A4331";
      const accent = isDark ? "#fbbf24" : "#d97743";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // thumbnail
      if (thumbnailUrl) {
        try {
          const img = await loadImage(getMediaUrl(thumbnailUrl));
          // cover left portion
          const thumbW = Math.floor(width * 0.45);
          ctx.drawImage(img, 0, 0, thumbW, height);
        } catch (e) {
          // draw placeholder if image fails (CORS or missing)
          drawPlaceholder(ctx, 0, 0, Math.floor(width * 0.45), height, title);
        }
      } else {
        drawPlaceholder(ctx, 0, 0, Math.floor(width * 0.45), height, title);
      }

      // right panel
      const pad = 60;
      const rightX = Math.floor(width * 0.48);
      ctx.fillStyle = textColor;
      ctx.font = "bold 48px Inter, sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(title, rightX + pad, pad, width - rightX - pad * 2);

      ctx.font = "normal 20px Inter, sans-serif";
      const summaryText = summary ? stripHtml(summary) : "";
      wrapText(ctx, summaryText, rightX + pad, pad + 80, width - rightX - pad * 2, 28, 6);

      // rating
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillStyle = accent;
      ctx.fillText("★".repeat(Math.max(0, Math.min(5, rating))) + " " + rating + "/5", rightX + pad, height - pad - 30);

      // logo
      if (logoUrl) {
        try {
          const logo = await loadImage(logoUrl);
          const logoH = 48;
          ctx.drawImage(logo, rightX + pad, height - pad - logoH - 60, logoH * 3, logoH);
        } catch (e) {
          // ignore logo errors
        }
      }

      // create preview data URL for quick display
      try {
        const dataUrl = canvas.toDataURL("image/png");
        setPreviewUrl(dataUrl);
      } catch (e) {
        setPreviewUrl(null);
      }
    } finally {
      setRendering(false);
    }
  };

  useEffect(() => {
    // auto-render when mounted or when content changes
    void render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, summary, thumbnailUrl, logoUrl, width, height]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(title)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const upload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    canvas.toBlob(async (blob) => {
      try {
        if (!blob) throw new Error("No blob");
        const file = new File([blob], `${slugify(title)}.png`, { type: "image/png" });
        const objectKey = await handleUpload(file);
        if (objectKey) {
          const url = getMediaUrl(objectKey);
          setShareUrl(url);
        } else {
          setShareUrl(null);
        }
      } catch (e) {
        console.error(e);
        setShareUrl(null);
      } finally {
        setUploading(false);
      }
    }, "image/png");
  };

  // One-click share: render -> upload -> copy link
  const shareOneClick = async () => {
    if (rendering || uploading) return;
    setRendering(true);
    setUploading(true);
    try {
      await render();
      await new Promise((res) => setTimeout(res, 150)); // small delay to ensure canvas updated
      await new Promise<void>((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve();
        canvas.toBlob(async (blob) => {
          try {
            if (!blob) return resolve();
            const file = new File([blob], `${slugify(title)}.png`, { type: "image/png" });
            const objectKey = await handleUpload(file);
            if (objectKey) {
              const url = getMediaUrl(objectKey);
              setShareUrl(url);
              try {
                await navigator.clipboard.writeText(url);
              } catch (e) {
                /* ignore */
              }
            }
          } catch (e) {
            console.error(e);
          } finally {
            resolve();
          }
        }, "image/png");
      });
    } finally {
      setRendering(false);
      setUploading(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
  };

  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard) return;
    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b)));
      if (!blob) return;
      // @ts-ignore ClipboardItem global
      const item = new (window as any).ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
    } catch (e) {
      console.error("Copy image failed", e);
    }
  };

  return (
    <div className="share-card">
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
      <div className="mt-3 flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplate("light")}
            className={`px-2 py-1 rounded text-sm ${template === "light" ? "border bg-white" : "border bg-transparent"}`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTemplate("dark")}
            className={`px-2 py-1 rounded text-sm ${template === "dark" ? "border bg-black text-white" : "border bg-transparent"}`}
          >
            Dark
          </button>
        </div>
        <button
          type="button"
          onClick={() => void render()}
          disabled={rendering}
          className="rounded-md border px-3 py-1 text-sm"
        >
            {rendering ? "Đang tạo..." : "Tạo"}
        </button>
        <button type="button" onClick={download} className="rounded-md bg-[#1A4331] text-white px-3 py-1 text-sm">
          Tải ảnh
        </button>
        <button
          type="button"
          onClick={upload}
          disabled={uploading}
          className="rounded-md border px-3 py-1 text-sm"
        >
          {uploading ? "Uploading..." : "Upload & Get Link"}
        </button>
        <button
          type="button"
          onClick={() => void shareOneClick()}
          disabled={rendering || uploading}
          className="ml-2 rounded-md bg-[#1A4331] text-white px-3 py-1 text-sm"
        >
          {rendering || uploading ? "Processing..." : "Share Card"}
        </button>
        {shareUrl && (
          <div className="ml-3 flex items-center gap-2">
            <a href={shareUrl} target="_blank" rel="noreferrer" className="text-sm text-[#1A4331] underline">
              Open
            </a>
            <button onClick={copyLink} className="text-sm border rounded px-2 py-0.5">Copy</button>
            <button onClick={copyImageToClipboard} className="text-sm border rounded px-2 py-0.5">Copy Image</button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-500"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-700"
            >
              Facebook
            </a>
          </div>
        )}
      </div>
      {previewUrl && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2">Preview</p>
          <img src={previewUrl} alt="Share card preview" className="w-full rounded border" />
        </div>
      )}
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string) {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "#e6f4f1");
  grad.addColorStop(1, "#f7efe6");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // initials
  const initials = (title || "").split(" ").slice(0, 2).map(s => s.charAt(0).toUpperCase()).join("");
  ctx.fillStyle = "#c1d9cf";
  ctx.font = "bold 96px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials || "T", x + w / 2, y + h / 2);
  // reset align
  ctx.textAlign = "start";
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^ -\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
