

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  title = "TEA4LIFE",
  subtitle = "Đang pha chế ly trà sữa tuyệt hảo...",
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F5F0] overflow-hidden font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            @keyframes float-boba {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-3px) scale(1.05); }
            }
            @keyframes float-cloud-1 {
              0% { transform: translateX(110vw); }
              100% { transform: translateX(-50vw); }
            }
            @keyframes float-cloud-2 {
              0% { transform: translateX(120vw); }
              100% { transform: translateX(-50vw); }
            }
            @keyframes float-cloud-3 {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-50vw); }
            }
            @keyframes loading-fill {
              0% { width: 0%;; }
              50% { width: 70%; }
              100% { width: 100%; }
            }
            @keyframes straw-bob {
              0%, 100% { transform: rotate(12deg) translateY(0); }
              50% { transform: rotate(14deg) translateY(-2px); }
            }
            .anim-float { animation: float 4s ease-in-out infinite; }
            .anim-straw { animation: straw-bob 4s ease-in-out infinite; }
            .boba-1 { animation: float-boba 3s ease-in-out infinite 0s; }
            .boba-2 { animation: float-boba 3.5s ease-in-out infinite 0.5s; }
            .boba-3 { animation: float-boba 2.8s ease-in-out infinite 1s; }
            .boba-4 { animation: float-boba 3.2s ease-in-out infinite 0.2s; }
            .boba-5 { animation: float-boba 3s ease-in-out infinite 0.8s; }
            .cloud-layer-1 { animation: float-cloud-1 35s linear infinite; }
            .cloud-layer-2 { animation: float-cloud-2 45s linear infinite; }
            .cloud-layer-3 { animation: float-cloud-3 55s linear infinite; }
            .loading-bar { animation: loading-fill 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            
            /* Enhanced Leaf Motion */
            @keyframes leaf-fall {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 0.9; }
              80% { opacity: 0.9; }
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
            
            .leaf-fall-a { animation: leaf-fall 12s linear infinite; }
            .leaf-fall-b { animation: leaf-fall 16s linear infinite; }
            .leaf-fall-c { animation: leaf-fall 10s linear infinite; }
            .leaf-fall-d { animation: leaf-fall 14s linear infinite; }
            
            .leaf-sway-a { animation: leaf-sway-1 4s ease-in-out infinite; }
            .leaf-sway-b { animation: leaf-sway-2 5s ease-in-out infinite; }
            .leaf-sway-c { animation: leaf-sway-3 4.5s ease-in-out infinite; }
          `
        }}
      />

      {/* --- SCENIC LANDSCAPE BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] via-[#D8F1F5] to-[#F1F9E3]" />

        {/* Floating Leaves */}
        <div className="absolute left-[15%] w-8 h-8 opacity-0 leaf-fall-a" style={{ animationDelay: '0s' }}>
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#5AA683] fill-current drop-shadow-md leaf-sway-a"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
        </div>
        <div className="absolute left-[35%] w-10 h-10 opacity-0 leaf-fall-b" style={{ animationDelay: '4s' }}>
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#83BFA6] fill-current drop-shadow-sm opacity-60 leaf-sway-b"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
        </div>
        <div className="absolute left-[65%] w-6 h-6 opacity-0 leaf-fall-c" style={{ animationDelay: '2s' }}>
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1A4331] fill-current drop-shadow-md opacity-80 leaf-sway-c"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
        </div>
        <div className="absolute left-[85%] w-12 h-12 opacity-0 leaf-fall-d" style={{ animationDelay: '1s' }}>
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#5AA683] fill-current drop-shadow-lg opacity-40 leaf-sway-a"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
        </div>
        <div className="absolute left-[50%] w-7 h-7 opacity-0 leaf-fall-a" style={{ animationDelay: '7s' }}>
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#83BFA6] fill-current drop-shadow-md leaf-sway-b"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
        </div>
        <div className="absolute left-[25%] w-9 h-9 opacity-0 leaf-fall-c" style={{ animationDelay: '8s' }}>
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1A4331] fill-current drop-shadow-md opacity-70 leaf-sway-c"><path d="M17,8C8,10 5,16 5,16C5,16 11,16 18,10C19.5,8.5 21,5 21,5C21,5 18.5,6.5 17,8Z" /></svg>
        </div>

        {/* Sun / Light source */}
        <div className="absolute top-[10%] left-[20%] w-32 h-32 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute top-[12%] left-[22%] w-24 h-24 bg-yellow-100/90 rounded-full blur-md" />

        {/* Clouds */}
        <div className="absolute top-[15%] w-full h-full opacity-90 cloud-layer-1">
          <div className="relative w-48 h-16 bg-white/90 rounded-full blur-[1px]">
            <div className="absolute top-[-25px] left-[30px] w-20 h-20 bg-white/90 rounded-full" />
            <div className="absolute top-[-35px] right-[40px] w-24 h-24 bg-white/90 rounded-full" />
          </div>
        </div>
        
        <div className="absolute top-[28%] w-full h-full opacity-70 cloud-layer-2 inline-block">
          <div className="relative w-32 h-10 bg-white/80 rounded-full blur-[1.5px] scale-90">
            <div className="absolute top-[-15px] left-[20px] w-14 h-14 bg-white/80 rounded-full" />
            <div className="absolute top-[-25px] right-[25px] w-16 h-16 bg-white/80 rounded-full" />
          </div>
        </div>

        <div className="absolute top-[8%] w-full h-full opacity-60 cloud-layer-3 inline-block">
          <div className="relative w-56 h-20 bg-white/70 rounded-full blur-[2px] scale-75">
            <div className="absolute top-[-30px] left-[40px] w-24 h-24 bg-white/70 rounded-full" />
            <div className="absolute top-[-40px] right-[50px] w-28 h-28 bg-white/70 rounded-full" />
          </div>
        </div>

        {/* Mountains / Hills */}
        <div className="absolute bottom-0 w-full h-full flex flex-col justify-end">
          {/* Distant Mountains */}
          <div className="absolute bottom-0 w-full h-[55%]">
            <svg preserveAspectRatio="none" viewBox="0 0 1440 320" className="w-full h-full text-[#83BFA6] fill-current opacity-80">
              <path d="M0,256L48,229.3C96,203,192,149,288,144C384,139,480,181,576,197.3C672,213,768,203,864,170.7C960,139,1056,85,1152,80C1248,75,1344,117,1392,138.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          {/* Midground Hills */}
          <div className="absolute bottom-0 w-full h-[40%]">
            <svg preserveAspectRatio="none" viewBox="0 0 1440 320" className="w-full h-full text-[#5AA683] fill-current opacity-95">
              <path d="M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,128C840,128,960,160,1080,154.7C1200,149,1320,107,1380,85.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>

          {/* Foreground Hills */}
          <div className="absolute bottom-0 w-full h-[25%]">
            <svg preserveAspectRatio="none" viewBox="0 0 1440 320" className="w-full h-full text-[#1A4331] fill-current drop-shadow-[0_-5px_15px_rgba(0,0,0,0.15)]">
              <path d="M0,192L80,197.3C160,203,320,213,480,192C640,171,800,117,960,112C1120,107,1280,149,1360,170.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* --- MAIN CENTER PIECE CARDS --- */}
      <div className="relative z-10 flex flex-col items-center justify-center p-10 md:p-14 bg-white/25 backdrop-blur-[16px] rounded-[3rem] border border-white/60 shadow-[0_20px_50px_-5px_rgba(26,67,49,0.2)] max-w-md w-[90%] mx-auto transition-transform">
        
        {/* Milk Tea Cup Animation */}
        <div className="relative mb-12 anim-float">
          {/* Straw */}
          <div className="absolute -top-16 left-1/2 -translate-x-[70%] w-4 h-[110px] bg-gradient-to-t from-[#9B2C2C] via-[#C53030] to-[#E53E3E] rounded-t-xl origin-bottom anim-straw border-[1.5px] border-[#742A2A] z-0 shadow-lg" />
          
          {/* Dome Lid */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-[100px] h-10 bg-white/40 backdrop-blur-md rounded-t-[70px] border-2 border-white/90 border-b-0 z-20 shadow-[inset_0_4px_10px_rgba(255,255,255,0.7)]" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[108px] h-3.5 bg-white/80 rounded-full border border-white z-20 shadow-sm" />

          {/* Cup Body */}
          <div className="relative w-24 h-32 bg-white/30 backdrop-blur-lg border-x-[3.5px] border-b-[3.5px] border-white/90 rounded-b-3xl overflow-hidden z-10 flex flex-col justify-end drop-shadow-xl shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05)]">
            
            {/* Milk Tea Liquid */}
            <div className="relative w-full h-[88%] bg-gradient-to-b from-[#E2BC9B] via-[#D3A984] to-[#A8795A] rounded-b-[20px] overflow-hidden">
              {/* Highlight / Glass Reflection */}
              <div className="absolute top-1 right-2 w-2 h-[90%] bg-gradient-to-b from-white/40 to-transparent rounded-full transform rotate-3 blur-[1px]" />
              <div className="absolute top-4 left-2 w-1 h-[40%] bg-white/30 rounded-full transform -rotate-2 blur-[0.5px]" />
              
              {/* Foam at the top */}
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#F9EFE5] to-transparent" />

              {/* Boba Pearls */}
              <div className="absolute bottom-1.5 left-0 w-full flex justify-center gap-1.5 px-2">
                <div className="w-[14px] h-[14px] bg-gradient-to-br from-[#3D2517] to-[#0F0804] rounded-full boba-1 shadow-[inset_-1.5px_-1.5px_2px_rgba(0,0,0,0.7),_0_2px_4px_rgba(0,0,0,0.2)]" />
                <div className="w-[18px] h-[18px] bg-gradient-to-br from-[#3D2517] to-[#0F0804] rounded-full boba-2 shadow-[inset_-1.5px_-1.5px_2px_rgba(0,0,0,0.7),_0_2px_4px_rgba(0,0,0,0.2)]" />
                <div className="w-3 h-3 bg-gradient-to-br from-[#3D2517] to-[#0F0804] rounded-full boba-3 shadow-[inset_-1.5px_-1.5px_2px_rgba(0,0,0,0.7),_0_2px_4px_rgba(0,0,0,0.2)]" />
                <div className="w-[16px] h-[16px] bg-gradient-to-br from-[#3D2517] to-[#0F0804] rounded-full boba-4 shadow-[inset_-1.5px_-1.5px_2px_rgba(0,0,0,0.7),_0_2px_4px_rgba(0,0,0,0.2)]" />
                <div className="w-[15px] h-[15px] bg-gradient-to-br from-[#3D2517] to-[#0F0804] rounded-full boba-5 shadow-[inset_-1.5px_-1.5px_2px_rgba(0,0,0,0.7),_0_2px_4px_rgba(0,0,0,0.2)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-black text-[#1A4331] mb-3 tracking-tight drop-shadow-sm text-center">
          {title}
        </h1>
        <p className="text-[#1A4331] font-semibold tracking-wide mb-8 text-center text-sm md:text-base opacity-80">
          {subtitle}
        </p>

        {/* Loading Progress Bar */}
        <div className="w-full max-w-[240px] h-2.5 bg-black/5 rounded-full overflow-hidden shadow-inner border border-white/60 relative">
          <div className="h-full bg-gradient-to-r from-[#5AA683] to-[#1A4331] rounded-full loading-bar shadow-[0_0_10px_rgba(26,67,49,0.5)]" />
        </div>
      </div>
      
      {/* Bottom Footer Decoration */}
      <div className="absolute bottom-6 flex items-center justify-center gap-3 w-full z-10 px-4">
        <div className="w-10 h-[1.5px] bg-[#1A4331]/30 rounded-full" />
        <p className="text-[10px] md:text-xs text-[#1A4331]/60 font-bold tracking-[0.2em] uppercase text-center drop-shadow-sm">
          Nơi Thiên Nhiên Hội Ngộ Hoài Niệm
        </p>
        <div className="w-10 h-[1.5px] bg-[#1A4331]/30 rounded-full" />
      </div>
    </div>
  );
}
