import { memo } from "react";

export const PingMeFloatingBtn = memo(() => {
  return (
    <div className="fixed top-1/2 right-4 md:right-8 z-50 -translate-y-1/2 flex items-center group">
      
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shine-sweep {
              0% { transform: translateX(-150%) skewX(-15deg); }
              20% { transform: translateX(200%) skewX(-15deg); }
              100% { transform: translateX(200%) skewX(-15deg); }
            }
            .animate-shine {
              animation: shine-sweep 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `
        }}
      />

      {/* Message Bubble (Hidden until hover) */}
      <div className="absolute right-full mr-4 w-[260px] md:w-[320px] opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
        <div className="bg-[#F8F5F0] text-[#1A4331] p-4 rounded-2xl shadow-[0_10px_30px_rgba(26,67,49,0.15)] border-2 border-[#1A4331] relative">
          
          {/* Arrow pointing to the button */}
          <div className="absolute top-1/2 -right-[11px] -translate-y-1/2 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-[#1A4331]"></div>
          <div className="absolute top-1/2 -right-[7px] -translate-y-1/2 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-[#F8F5F0]"></div>
          
          <p className="text-sm font-medium leading-relaxed drop-shadow-sm">
            <strong className="text-[#d97743] text-base block mb-1">PingMe!</strong> 
            Nhắn là tới, gọi là nghe. Ứng dụng chat tối giản giúp bạn giữ liên lạc với những người thân yêu mọi lúc, mọi nơi một cách mượt mà nhất.
          </p>
        </div>
      </div>

      {/* Floating Button / Avatar */}
      <a 
        href="https://www.pingme.click"
        target="_blank"
        rel="noopener noreferrer"
        className="relative group/btn w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-gradient-to-br from-[#ffffff] to-[#f0ece1] border-2 border-[#1A4331] shadow-[4px_4px_0_#1A4331,0_0_15px_rgba(255,255,255,0.5)] hover:shadow-[6px_6px_0_#1A4331,0_0_25px_rgba(217,119,67,0.4)] active:shadow-[2px_2px_0_#1A4331] transition-all duration-300 hover:-translate-y-1 active:translate-y-1 p-2 md:p-3 overflow-hidden z-10 cursor-pointer flex items-center justify-center"
        aria-label="Khám phá PingMe"
      >
        {/* Shine sweeping layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-[150%] animate-shine z-20 pointer-events-none mix-blend-overlay" />

        <div className="w-full h-full rounded-lg md:rounded-xl overflow-hidden bg-transparent flex items-center justify-center relative z-10">
          <img 
            src="/common/pingme-logo.webp" 
            alt="PingMe App" 
            className="w-full h-full object-contain drop-shadow-sm group-hover/btn:scale-110 transition-transform duration-500"
          />
        </div>
      </a>

    </div>
  );
});
