import { memo } from "react";

export const FloatingBackgroundObjects = memo(() => {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes leaf-fall {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 0.6; }
              80% { opacity: 0.6; }
              100% { top: 110%; opacity: 0; }
            }
            @keyframes leaf-sway-1 {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              25% { transform: translateX(-40px) rotate(-30deg); }
              75% { transform: translateX(40px) rotate(30deg); }
            }
            @keyframes leaf-sway-2 {
              0%, 100% { transform: translateX(0) rotate(45deg); }
              25% { transform: translateX(50px) rotate(90deg); }
              75% { transform: translateX(-30px) rotate(-15deg); }
            }
            @keyframes leaf-sway-3 {
              0%, 100% { transform: translateX(0) rotate(-45deg); }
              25% { transform: translateX(-50px) rotate(-90deg); }
              75% { transform: translateX(50px) rotate(15deg); }
            }
            
            .leaf-fall-a { animation: leaf-fall 18s linear infinite; }
            .leaf-fall-b { animation: leaf-fall 24s linear infinite; }
            .leaf-fall-c { animation: leaf-fall 20s linear infinite; }
            .leaf-fall-d { animation: leaf-fall 22s linear infinite; }
            
            .leaf-sway-a { animation: leaf-sway-1 4s ease-in-out infinite; }
            .leaf-sway-b { animation: leaf-sway-2 5s ease-in-out infinite; }
            .leaf-sway-c { animation: leaf-sway-3 4.5s ease-in-out infinite; }
          `
        }}
      />
      {/* Floating Leaves */}
      <div className="absolute left-[10%] w-8 h-8 opacity-0 leaf-fall-a" style={{ animationDelay: '0s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#5AA683] fill-current drop-shadow-md leaf-sway-a"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
      </div>
      <div className="absolute left-[35%] w-10 h-10 opacity-0 leaf-fall-b" style={{ animationDelay: '4s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#83BFA6] fill-current drop-shadow-sm leaf-sway-b opacity-50"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
      </div>
      <div className="absolute left-[80%] w-6 h-6 opacity-0 leaf-fall-c" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#1A4331] fill-current drop-shadow-md leaf-sway-c opacity-40"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
      </div>
      <div className="absolute left-[90%] w-12 h-12 opacity-0 leaf-fall-d" style={{ animationDelay: '8s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#5AA683] fill-current drop-shadow-lg leaf-sway-a opacity-30"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
      </div>
      <div className="absolute left-[50%] w-7 h-7 opacity-0 leaf-fall-a" style={{ animationDelay: '7s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#83BFA6] fill-current drop-shadow-md leaf-sway-b"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
      </div>
      <div className="absolute left-[20%] w-9 h-9 opacity-0 leaf-fall-c" style={{ animationDelay: '12s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#1A4331] fill-current drop-shadow-md leaf-sway-c opacity-40"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute left-[5%] w-3 h-3 opacity-0 leaf-fall-b" style={{ animationDelay: '3s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#d97743] fill-current leaf-sway-b opacity-80"><path d="M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3L12 2Z"/></svg>
      </div>
      <div className="absolute left-[70%] w-4 h-4 opacity-0 leaf-fall-a" style={{ animationDelay: '10s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#d97743] fill-current leaf-sway-c opacity-60"><path d="M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3L12 2Z"/></svg>
      </div>
      <div className="absolute left-[40%] w-3 h-3 opacity-0 leaf-fall-d" style={{ animationDelay: '15s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#8A9A7A] fill-current leaf-sway-a opacity-70"><path d="M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3L12 2Z"/></svg>
      </div>
    </div>
  );
});
