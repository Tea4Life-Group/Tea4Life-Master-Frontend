"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Leaf, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPopularProductsApi } from "@/services/productApi";
import { getMediaUrl } from "@/lib/utils";
import type { PopularProductCardResponse } from "@/types/product/PopularProductCardResponse";

const banners = [
  {
    title: "MATCHA LATTE TƯƠI",
    subtitle: "Mới Ra Mắt",
    description:
      "Matcha hữu cơ hái thủ công hòa quyện cùng sữa kem tươi mềm mịn. Sự cân bằng hoàn hảo giữa thiên nhiên và hương vị.",
    image: "https://picsum.photos/seed/matcha/1200/800",
    bgColor: "bg-[#8A9A7A]", // Sage Green
    textColor: "text-[#F8F5F0]",
    linkTo: "/shop",
  },
  {
    title: "HỒNG TRÀ SỮA ĐẶC TRƯNG",
    subtitle: "Hương Vị Truyền Thống",
    description:
      "Sự kết hợp hoài niệm giữa hồng trà hảo hạng và kem béo ngậy. Gợi nhớ về những ngày tháng tươi đẹp.",
    image: "https://picsum.photos/seed/milktea/1200/800",
    bgColor: "bg-[#D2A676]", // Caramel/Soft Brown
    textColor: "text-[#1A4331]",
    linkTo: "/shop",
  },
  {
    title: "LỤC TRÀ TRÁI CÂY NHIỆT ĐỚI",
    subtitle: "Sảng Khoái Tinh Thần",
    description:
      "Lục trà ủ lạnh phủ đầy trái cây nhiệt đới tươi mát. Cú hích năng lượng cho ngày mới!",
    image: "https://picsum.photos/seed/fruittea/1200/800",
    bgColor: "bg-[#1A4331]", // Forest Green
    textColor: "text-[#F8F5F0]",
    linkTo: "/shop",
  },
];

const slideStyles = [
  { bgColor: "bg-[#8A9A7A]", textColor: "text-[#F8F5F0]" },
  { bgColor: "bg-[#D2A676]", textColor: "text-[#1A4331]" },
  { bgColor: "bg-[#1A4331]", textColor: "text-[#F8F5F0]" },
  { bgColor: "bg-[#B19470]", textColor: "text-[#1A4331]" },
];

export function HeroCarousel() {
  const navigate = useNavigate();
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  );
  
  const [popularProducts, setPopularProducts] = React.useState<PopularProductCardResponse[]>([]);

  React.useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const res = await getPopularProductsApi(4);
        if (res.data.data && res.data.data.length > 0) {
          setPopularProducts(res.data.data);
        }
      } catch (error) {
        console.error("Không thể tải sản phẩm bán chạy", error);
      }
    };
    fetchPopularProducts();
  }, []);

  const displayItems = popularProducts.length > 0
    ? popularProducts.map((item, index) => {
        const style = slideStyles[index % slideStyles.length];
        const formattedPrice = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.basePrice);

        return {
          title: item.name,
          subtitle: item.productCategoryName,
          description: `Được yêu thích với ${item.popularity.orderCount} lượt mua! Giá mở bán chỉ từ ${formattedPrice}.`,
          image: getMediaUrl(item.imageUrl),
          bgColor: style.bgColor,
          textColor: style.textColor,
          linkTo: `/product-details/${item.id}`,
        };
      })
    : banners;

  return (
    <section className="relative group rounded-3xl overflow-hidden pixel-border bg-[#F8F5F0] shadow-md transition-transform hover:-translate-y-1 duration-300">
      <Carousel
        key={displayItems.length}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {displayItems.map((banner, index) => (
            <CarouselItem key={index}>
              <div
                className={`relative h-[550px] md:h-[600px] w-full ${banner.bgColor} overflow-hidden group/slide`}
              >
                {/* Soft Decor */}
                <div className="absolute top-4 left-4 flex gap-2 z-20 bg-white/20 p-2 border-2 border-[#1A4331] shadow-[2px_2px_0px_#1A4331] backdrop-blur-sm hidden md:flex">
                  <div className="w-3 h-3 bg-red-400 border border-[#1A4331]" />
                  <div className="w-3 h-3 bg-yellow-400 border border-[#1A4331]" />
                  <div className="w-3 h-3 bg-green-400 border border-[#1A4331]" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-10 w-full md:w-3/5 pt-14 md:pt-16 pb-8">
                  <div className={`space-y-6 ${banner.textColor}`}>
                    {/* Subtitle Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#F8F5F0] text-[#5c4033] px-5 py-2 rounded-full border-2 border-[#5c4033] shadow-sm transform transition-transform hover:scale-105">
                      <Leaf className="w-4 h-4" />
                      <span className="font-bold text-sm tracking-wide">
                        {banner.subtitle}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl md:text-6xl font-bold font-sans leading-[1.1] drop-shadow-sm tracking-tight line-clamp-2">
                      {banner.title}
                    </h2>

                    {/* Description Box */}
                    <div className="relative group/box">
                      <p className="relative text-lg md:text-xl font-medium font-sans max-w-md bg-[#F8F5F0] text-[#5c4033] p-5 md:p-6 rounded-2xl border-2 border-[#5c4033]/20 shadow-sm transition-all duration-300 group-hover/box:shadow-md group-hover/box:-translate-y-1 line-clamp-3">
                        {banner.description}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      onClick={() => navigate(banner.linkTo)}
                      className="bg-[#5c4033] text-[#F8F5F0] hover:bg-[#8A9A7A] hover:text-[#F8F5F0] pixel-button text-xl px-10 h-14 group/btn mt-4 relative overflow-hidden rounded-full shadow-md"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <Coffee className="w-6 h-6 group-hover/btn:rotate-12 transition-transform duration-300" />
                        Đặt Hàng Ngay
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Background Image Layer with specific masking */}
                <div className="absolute right-0 top-0 h-full w-full md:w-1/2 select-none overflow-hidden flex items-center justify-end z-[5]">
                  <div className="absolute inset-0 bg-gradient-to-r from-inherit via-transparent to-transparent z-[1]" />
                  <div className="relative w-full h-full flex items-center justify-center pt-12 pr-12 group-hover/slide:scale-105 transition-transform duration-1000 hidden sm:flex">
                    <div className="relative">
                      <img
                        src={banner.image}
                        className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-cover rounded-3xl border-8 border-white/20 z-10 shadow-xl bg-white/80"
                        alt={banner.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Controls */}
        <div className="hidden lg:block">
          <CarouselPrevious className="left-8 w-14 h-14 bg-[#F8F5F0] text-[#5c4033] hover:bg-[#8A9A7A] hover:text-[#F8F5F0] border-2 border-[#5c4033]/20 shadow-md rounded-full opacity-50 group-hover:opacity-100 transition-all hover:scale-110" />
          <CarouselNext className="right-8 w-14 h-14 bg-[#F8F5F0] text-[#5c4033] hover:bg-[#8A9A7A] hover:text-[#F8F5F0] border-2 border-[#5c4033]/20 shadow-md rounded-full opacity-50 group-hover:opacity-100 transition-all hover:scale-110" />
        </div>
      </Carousel>
    </section>
  );
}
