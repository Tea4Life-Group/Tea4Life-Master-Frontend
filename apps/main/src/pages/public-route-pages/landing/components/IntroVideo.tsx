export function IntroVideo() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden z-10 rounded-b-[3rem] shadow-sm">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/common/introduce-vid.webm" type="video/webm" />
      </video>

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-15 z-10" />

      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4 gap-6">
        <h1 className="text-6xl md:text-9xl font-black font-sans text-white drop-shadow-md tracking-tight">
          TEA4LIFE
        </h1>
        <p className="text-lg md:text-2xl font-semibold font-sans text-[#5c4033] bg-[#F8F5F0]/95 px-8 py-3 rounded-full shadow-lg backdrop-blur-md">
          Nơi Thiên Nhiên Hội Ngộ Hoài Niệm
        </p>
      </div>
    </section>
  );
}
