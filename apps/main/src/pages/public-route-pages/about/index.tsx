"use client";

import { Link } from "react-router-dom";
import { Leaf, Coffee, Heart, Users, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] relative">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <span className="text-xs text-[#8A9A7A] font-bold uppercase tracking-widest">
              Câu Chuyện Của Chúng Tôi
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl pixel-text text-[#1A4331] mb-6">
            Tea4Life
          </h1>
          <p className="text-[#1A4331]/60 max-w-2xl mx-auto leading-relaxed">
            Mỗi ly trà là một hành trình — từ những vườn trà xanh mướt đến tay
            bạn. Chúng tôi tin rằng trà không chỉ là thức uống, mà là phong cách
            sống.
          </p>
        </div>

        {/* Image */}
        <div className="mb-16 border-2 border-[#1A4331]/15 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&h=500&fit=crop"
            alt="Tea4Life Store"
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div>
            <h2 className="text-xl font-bold text-[#1A4331] mb-4 uppercase tracking-wider border-b-2 border-[#1A4331]/10 pb-3">
              Khởi Đầu
            </h2>
            <div className="space-y-4 text-sm text-[#1A4331]/70 leading-relaxed">
              <p>
                Tea4Life ra đời từ niềm đam mê với trà và mong muốn mang đến
                những ly trà chất lượng nhất cho cộng đồng. Được thành lập bởi
                những người yêu trà, chúng tôi bắt đầu từ một quán nhỏ và dần
                phát triển thành chuỗi thương hiệu trà được yêu thích.
              </p>
              <p>
                Với triết lý "Trà cho cuộc sống", mỗi sản phẩm của chúng tôi đều
                được chăm chút từ khâu chọn nguyên liệu đến pha chế, đảm bảo
                mang đến trải nghiệm tốt nhất.
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1A4331] mb-4 uppercase tracking-wider border-b-2 border-[#1A4331]/10 pb-3">
              Sứ Mệnh
            </h2>
            <div className="space-y-4 text-sm text-[#1A4331]/70 leading-relaxed">
              <p>
                Chúng tôi cam kết sử dụng nguyên liệu tươi ngon, có nguồn gốc rõ
                ràng. Trà được tuyển chọn từ các vùng trà nổi tiếng, sữa tươi
                100%, và topping được làm thủ công mỗi ngày.
              </p>
              <p>
                Hơn cả một ly trà, Tea4Life là nơi bạn có thể dừng lại, thư giãn
                và tận hưởng những khoảnh khắc nhẹ nhàng trong cuộc sống bận
                rộn.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Coffee, value: "50+", label: "Món trong thực đơn" },
            { icon: MapPin, value: "10+", label: "Chi nhánh" },
            { icon: Users, value: "100K+", label: "Khách hàng" },
            { icon: Clock, value: "5+", label: "Năm hoạt động" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#1A4331]/10 p-5 text-center"
            >
              <stat.icon className="h-5 w-5 text-[#8A9A7A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1A4331] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-[#8A9A7A]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-[#1A4331] mb-6 uppercase tracking-wider border-b-2 border-[#1A4331]/10 pb-3">
            Giá Trị Cốt Lõi
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: "Chất Lượng",
                desc: "Nguyên liệu tươi ngon, được chọn lọc kỹ càng mỗi ngày. Không sử dụng hương liệu nhân tạo.",
                icon: Leaf,
              },
              {
                title: "Tận Tâm",
                desc: "Mỗi ly trà được pha chế bằng sự tận tâm và yêu thương, đảm bảo chất lượng đồng nhất.",
                icon: Heart,
              },
              {
                title: "Cộng Đồng",
                desc: "Xây dựng cộng đồng yêu trà, kết nối mọi người thông qua hương vị và trải nghiệm.",
                icon: Users,
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white border border-[#1A4331]/10 p-5"
              >
                <value.icon className="h-5 w-5 text-[#D2A676] mb-3" />
                <h3 className="font-bold text-[#1A4331] text-sm mb-2">
                  {value.title}
                </h3>
                <p className="text-xs text-[#1A4331]/60 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white border-2 border-[#1A4331]/15 p-10">
          <h2 className="text-2xl pixel-text text-[#1A4331] mb-3">
            Thưởng Thức Ngay
          </h2>
          <p className="text-sm text-[#1A4331]/60 mb-6">
            Khám phá thực đơn đa dạng và đặt ly trà yêu thích của bạn
          </p>
          <Link to="/shop">
            <Button className="bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none h-11 px-8 font-bold text-sm">
              <Coffee className="w-4 h-4 mr-2" />
              Xem Thực Đơn
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
