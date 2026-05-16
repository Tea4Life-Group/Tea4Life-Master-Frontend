import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import DOMPurify from "dompurify";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["link", "blockquote", "code-block"],
  ["clean"], // remove formatting button
  // ẢNH VÀ VIDEO ĐÃ BỊ LOẠI BỎ THEO YÊU CẦU ĐỀ BÀI
];

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;

    // Aggressively clean up any lingering toolbars before initialization
    if (parent) {
      const toolbars = parent.querySelectorAll(".ql-toolbar");
      toolbars.forEach(tb => tb.remove());

      parent.style.position = "relative";
    }

    if (!quillRef.current) {
      quillRef.current = new Quill(container, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          clipboard: {
            matchVisual: false, // Don't preserve visual wrapping when pasting
          },
        },
        readOnly: disabled,
        placeholder: "Viết nội dung bài viết...",
      });

      quillRef.current.on("text-change", () => {
        const rawHtml = quillRef.current?.root.innerHTML || "";
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          USE_PROFILES: { html: true }, // Cho phép các tag HTML tiêu chuẩn format text
          FORBID_TAGS: ['img', 'figure', 'video', 'audio', 'iframe', 'object', 'embed', 'picture', 'source'],
        });

        // Chỉ notify onChange nếu thực sự nội dung được đổi (khi type)
        // chứ k phải set lúc init, tránh vòng lặp re-render liên tục.
        onChange(cleanHtml);
      });
    }

    return () => {
      // Restore from closure variables since containerRef.current may be null here
      if (parent) {
        const toolbars = parent.querySelectorAll(".ql-toolbar");
        toolbars.forEach(tb => tb.remove());
      }
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value from Props -> Editor
  useEffect(() => {
    if (quillRef.current) {
      const curHtml = quillRef.current.root.innerHTML;
      if (value !== curHtml) {
        const delta = quillRef.current.clipboard.convert({ html: value });
        quillRef.current.setContents(delta, "silent");
      }
    }
  }, [value]);

  // Sync disabled state
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled);
    }
  }, [disabled]);

  return (
    <div className="bg-white border rounded-lg">
      <div
        ref={containerRef}
        className="min-h-[160px] text-base leading-relaxed p-0 border-none"
      />
    </div>
  );
};

export default QuillEditor;
