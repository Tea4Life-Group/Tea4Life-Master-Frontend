import { Sprout, Droplets, Sun } from "lucide-react";

export function CraftingProcessSection() {
  return (
    <section className="space-y-12 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#5c4033]/20 pb-6 gap-4">
        <div>
          <p className="text-[#d97743] font-bold text-lg mb-2">
            ● QUY TRÌNH CỦA CHÚNG TÔI
          </p>
          <h3 className="text-4xl md:text-5xl font-bold font-sans text-[#5c4033]">
            Nghệ Thuật Pha Chế
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-16">
        <div className="absolute top-[80px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d97743] to-transparent hidden md:block z-0 opacity-30" />

        {[
          {
            icon: <Sprout className="w-10 h-10" />,
            title: "1. LÁ TRÀ TƯƠI",
            desc: "Được hái thủ công từ các nông trại hữu cơ vùng cao nguyên ngập sương.",
          },
          {
            icon: <Droplets className="w-10 h-10" />,
            title: "2. Ủ LẠNH TINH KHIẾT",
            desc: "Ủ lạnh suốt 12 giờ đồng hồ để chắt lọc hương vị tinh túy nhất.",
          },
          {
            icon: <Sun className="w-10 h-10" />,
            title: "3. HƯƠNG VỊ RỰC RỠ",
            desc: "Phục vụ tươi mát để thắp sáng ngày dài và tăng cường vẻ khỏe khoắn của bạn.",
          },
        ].map((step, index) => (
          <div
            key={index}
            className="relative z-10 bg-white rounded-3xl p-8 text-center group hover:-translate-y-2 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#5c4033]/5"
          >
            <div className="w-20 h-20 mx-auto bg-[#F8F5F0] text-[#5c4033] flex items-center justify-center mb-6 group-hover:bg-[#d97743] group-hover:text-white transition-colors rounded-full shadow-inner group-hover:shadow-md">
              {step.icon}
            </div>
            <h4 className="font-bold text-xl text-[#5c4033] mb-4">
              {step.title}
            </h4>
            <p className="text-[#5c4033]/70 font-medium leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
