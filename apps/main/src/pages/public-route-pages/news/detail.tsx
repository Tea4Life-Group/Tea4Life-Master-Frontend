import { useState, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Newspaper, Calendar, Clock, ArrowLeft, Loader2, Tag } from "lucide-react";
import { getNewsBySlugApi } from "@/services/newsApi";
import type { NewsDetailResponse } from "@/types/news/NewsDetailResponse";
import type { NewsChunkResponse } from "@/types/news/NewsChunkResponse";
import { handleError, getMediaUrl } from "@/lib/utils";
import DOMPurify from "dompurify";

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Render từng chunk theo type */
function ChunkRenderer({ chunk }: { chunk: NewsChunkResponse }) {
  switch (chunk.type) {
    case "TEXT":
      return (
        <div
          className="text-[#1A4331]/80 leading-relaxed text-[15px] whitespace-pre-line"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(chunk.content, { USE_PROFILES: { html: true } }) 
          }}
        />
      );
    case "IMAGE":
      return (
        <figure className="my-8 flex justify-center">
          <div className="overflow-hidden border border-[#1A4331]/10 shadow-[2px_2px_0px_rgba(26,67,49,0.1)] rounded-md inline-block">
            <img
              src={getMediaUrl(chunk.content)}
              alt="Minh hoạ bài viết"
              className="max-w-[100%] max-h-[300px] sm:max-h-[350px] object-contain block bg-[#1A4331]/5"
              loading="lazy"
            />
          </div>
        </figure>
      );
    default:
      return null;
  }
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNewsDetail = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(false);
      const res = await getNewsBySlugApi(slug);
      setNews(res.data.data || null);
    } catch (err) {
      setError(true);
      handleError(err, "Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchNewsDetail();
  }, [fetchNewsDetail]);

  // Sắp xếp chunks theo sortIndex tăng dần
  const sortedChunks = news?.chunks
    ? [...news.chunks].sort((a, b) => a.sortIndex - b.sortIndex)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#8A9A7A]" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] relative">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{
            backgroundImage:
              "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-white border-2 border-[#1A4331]/20 rounded-full text-[#8A9A7A]">
            <Newspaper className="h-10 w-10" />
          </div>
          <h1 className="text-2xl pixel-text text-[#1A4331] mb-3">
            Không Tìm Thấy Bài Viết
          </h1>
          <p className="text-[#8A9A7A] text-sm mb-6">
            Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1A4331] hover:text-[#8A9A7A] transition-colors border-2 border-[#1A4331] px-4 py-2 hover:bg-[#1A4331] hover:text-[#F8F5F0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay Về Tin Tức
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-bold text-[#1A4331]/50">
          <Link to="/news" className="hover:text-[#1A4331] transition-colors">
            Tin Tức
          </Link>
          <span>/</span>
          {news.category && (
            <>
              <Link
                to={`/news/category/${news.category.slug}`}
                className="hover:text-[#1A4331] transition-colors"
              >
                {news.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#1A4331]/30 truncate max-w-[200px]">
            {news.title}
          </span>
        </div>

        {/* Back link */}
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8A9A7A] hover:text-[#1A4331] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay về danh sách
        </Link>

        {/* Article */}
        <article className="bg-white border-2 border-[#1A4331]/15 overflow-hidden">
          {/* Thumbnail */}
          {news.thumbnailUrl && (
            <div className="aspect-[21/9] w-full overflow-hidden border-b-2 border-[#1A4331]/10">
              <img
                src={getMediaUrl(news.thumbnailUrl)}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 md:p-10">
            {/* Category */}
            {news.category && (
              <Link
                to={`/news/category/${news.category.slug}`}
                className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#8A9A7A]/15 text-[#8A9A7A] border border-[#8A9A7A]/30 hover:bg-[#8A9A7A]/25 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {news.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl pixel-text text-[#1A4331] mb-6 leading-tight">
              {news.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b-2 border-[#1A4331]/10 text-xs text-[#1A4331]/50 font-bold">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Đăng ngày {formatDate(news.createdAt)}</span>
              </div>
              {news.updatedAt && news.updatedAt !== news.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Cập nhật {formatDateTime(news.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Content Chunks */}
            <div className="space-y-5">
              {sortedChunks.map((chunk) => (
                <ChunkRenderer key={chunk.id} chunk={chunk} />
              ))}
            </div>

            {/* Bottom */}
            <div className="mt-10 pt-6 border-t-2 border-[#1A4331]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {news.category && (
                <Link
                  to={`/news/category/${news.category.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A9A7A] border border-[#8A9A7A]/30 px-3 py-1.5 hover:bg-[#8A9A7A]/10 transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  Xem thêm: {news.category.name}
                </Link>
              )}
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1A4331] hover:text-[#8A9A7A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Tất cả tin tức
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
