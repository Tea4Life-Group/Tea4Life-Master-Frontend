import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { handleUpload } from "@/services/storageApi";
import { getMediaUrl } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export default function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState<string>(value || "");

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  useEffect(() => {
    onChange(html);
  }, [html]);

  const handleInput = () => {
    const raw = ref.current?.innerHTML || "";
    const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    setHtml(clean);
  };

  const insertImage = async (file?: File) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0] || file;
      if (!f) return;
      const key = await handleUpload(f);
      if (!key) return;
      const url = getMediaUrl(key);
      const img = document.createElement("img");
      img.src = url;
      img.alt = "image";
      img.style.maxWidth = "100%";
      ref.current?.appendChild(img);
      handleInput();
    };
    input.click();
  };

  return (
    <div className={className}>
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => document.execCommand("bold")}
          className="rounded-md border px-2 py-1 text-xs"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => document.execCommand("italic")}
          className="rounded-md border px-2 py-1 text-xs"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => document.execCommand("insertUnorderedList")}
          className="rounded-md border px-2 py-1 text-xs"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertImage()}
          className="rounded-md border px-2 py-1 text-xs"
        >
          Image
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className={`min-h-[120px] rounded-xl border border-[#1A4331]/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20 bg-white ${
          placeholder && !html ? "text-[#8A9A7A]" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html || placeholder || "" }}
      />
    </div>
  );
}
