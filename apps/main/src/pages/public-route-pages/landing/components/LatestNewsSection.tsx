import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, ArrowRight, Rss } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { getLatestNewsApi } from "@/services/newsApi";
import type { NewsSummaryResponse } from "@/types/news/NewsSummaryResponse";
import { getMediaUrl } from "@/lib/utils";

export function LatestNewsSection() {
  const [latestNews, setLatestNews] = useState<NewsSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        const res = await getLatestNewsApi();
        if (res.data?.data) {
          setLatestNews(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải tin tức mới nhất:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestNews();
  }, []);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading || latestNews.length === 0) {
    return null;
  }

  return (
    <section className="space-y-12 relative pt-16 border-t border-[#1A4331]/10">
      <div className="flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#1A4331]/5 text-[#1A4331] px-5 py-2 rounded-full w-fit mb-6 shadow-sm border border-[#1A4331]/10">
          <Rss className="w-4 h-4" />
          <span className="font-semibold text-sm tracking-widest uppercase">
            Góc Trà Đạo
          </span>
          <Rss className="w-4 h-4" />
        </div>
        <h3 className="text-4xl md:text-5xl font-bold font-sans text-[#1A4331] leading-tight">
          Tin Tức Mới Nhất
        </h3>
        <p className="mt-4 text-[#8A9A7A] font-medium max-w-2xl mx-auto mb-8">
          Đón đọc những thông tin, sự kiện và chia sẻ mới nhất từ thế giới trà của chúng tôi qua các bài viết nổi bật.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 px-0 sm:px-4 lg:px-0">
        {latestNews.map((news) => (
          <Link
            key={news.id}
            to={`/news/${news.slug}`}
            className="group bg-white border border-[#1A4331]/10 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-[6px_6px_0px_rgba(26,67,49,0.1)] rounded-xl overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="aspect-[16/10] bg-[#F8F5F0] border-b border-[#1A4331]/10 relative overflow-hidden">
              {news.thumbnailUrl ? (
                <img
                  src={getMediaUrl(news.thumbnailUrl)}
                  alt={news.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#1A4331]/5">
                  <Newspaper className="h-12 w-12 text-[#1A4331]/20" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <span className="inline-block self-start mb-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8A9A7A]/15 text-[#8A9A7A] border border-[#8A9A7A]/30 rounded">
                {news.categoryName}
              </span>

              <h3 className="font-bold text-[#1A4331] text-lg leading-snug line-clamp-2 mb-4 group-hover:text-[#8A9A7A] transition-colors">
                {news.title}
              </h3>

              <div className="mt-auto pt-4 border-t border-[#1A4331]/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#1A4331]/50">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(news.createdAt)}
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-[#1A4331] group-hover:gap-2 transition-all">
                  Đọc tiếp
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-12 w-full relative z-10">
        <Link to="/news">
          <Button className="bg-[#1A4331] hover:bg-[#8A9A7A] text-[#F8F5F0] rounded-full px-8 h-12 font-bold gap-2 transition-all shadow-md active:scale-95">
            XEM TẤT CẢ BÀI VIẾT
          </Button>
        </Link>
      </div>
    </section>
  );
}
