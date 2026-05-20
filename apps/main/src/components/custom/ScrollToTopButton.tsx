import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const AI_CHAT_VISIBILITY_EVENT = "tea4life:ai-chat-visibility";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const initialState = document.body.dataset.aiChatOpen === "true";
    setIsAiChatOpen(initialState);

    const handleVisibilityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen?: boolean }>;
      setIsAiChatOpen(Boolean(customEvent.detail?.isOpen));
    };

    window.addEventListener(
      AI_CHAT_VISIBILITY_EVENT,
      handleVisibilityChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        AI_CHAT_VISIBILITY_EVENT,
        handleVisibilityChange as EventListener,
      );
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-[100] group flex h-14 w-14 items-center justify-center rounded-full bg-[#1A4331] text-[#F8F5F0] shadow-[0_8px_20px_rgba(26,67,49,0.3)] transition-all duration-500 hover:-translate-y-2 hover:bg-[#8A9A7A] hover:shadow-[0_12px_25px_rgba(26,67,49,0.5)] active:translate-y-1 active:shadow-[0_2px_10px_rgba(26,67,49,0.4)] focus:outline-none",
        isVisible && !isAiChatOpen
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-16 opacity-0 scale-50 pointer-events-none"
      )}
      aria-label="Lên đầu trang"
    >
      <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1 group-active:translate-y-1" strokeWidth={3} />
    </button>
  );
}
