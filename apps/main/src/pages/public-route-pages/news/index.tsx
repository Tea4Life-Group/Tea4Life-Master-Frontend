import { useState, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Newspaper, Tag, Loader2, Search, Calendar, ArrowRight, FolderOpen } from "lucide-react";
import PaginationComponent from "@/components/custom/PaginationComponent";
import { getNewsApi, getNewsCategoriesApi, getNewsByCategorySlugApi } from "@/services/newsApi";
import type { NewsSummaryResponse } from "@/types/news/NewsSummaryResponse";
import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";
import { handleError, getMediaUrl } from "@/lib/utils";

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NewsPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const [newsList, setNewsList] = useState<NewsSummaryResponse[]>([]);
  const [categories, setCategories] = useState<NewsCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [size] = useState(9);
  const [totalElements, setTotalElements] = useState(0);

  // Tên category đang xem (nếu có)
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await getNewsCategoriesApi();
      setCategories(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh mục tin tức");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch news (all or by category)
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      if (categorySlug) {
        const res = await getNewsByCategorySlugApi(categorySlug, {
          page: page - 1,
          size,
        });
        setNewsList(res.data.data?.content || []);
        setTotalElements(res.data.data?.totalElements || 0);
      } else {
        const res = await getNewsApi({ page: page - 1, size });
        setNewsList(res.data.data?.content || []);
        setTotalElements(res.data.data?.totalElements || 0);
      }
    } catch (error) {
      handleError(error, "Không thể tải tin tức");
    } finally {
      setLoading(false);
    }
  }, [page, size, categorySlug]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Reset page khi đổi category
  useEffect(() => {
    setPage(1);
  }, [categorySlug]);

  // Cập nhật tên category đang xem
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const found = categories.find((c) => c.slug === categorySlug);
      setActiveCategoryName(found?.name || categorySlug);
    } else {
      setActiveCategoryName(null);
    }
  }, [categorySlug, categories]);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] overflow-hidden relative">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 border-b-2 border-[#1A4331]/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              {activeCategoryName ? `Danh mục: ${activeCategoryName}` : "Cập Nhật Mới Nhất"}
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331]">
            Tin Tức
          </h1>
          {activeCategoryName && (
            <Link
              to="/news"
              className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-[#8A9A7A] hover:text-[#1A4331] transition-colors"
            >
              ← Xem tất cả tin tức
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Danh mục */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 bg-white border-2 border-[#1A4331]/20 p-5">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1A4331]/20">
                <Tag className="h-4 w-4 text-[#8A9A7A]" />
                <h2 className="font-bold text-[#1A4331] text-sm uppercase tracking-wider">
                  Danh Mục
                </h2>
              </div>

              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#8A9A7A]" />
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-1">
                  {/* Tất cả */}
                  <Link
                    to="/news"
                    className={`block px-3 py-2.5 text-sm font-bold transition-all duration-200 border-l-3 ${
                      !categorySlug
                        ? "bg-[#1A4331] text-[#F8F5F0] border-l-[#8A9A7A]"
                        : "text-[#1A4331] hover:bg-[#1A4331]/5 border-l-transparent hover:border-l-[#8A9A7A]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-3.5 w-3.5" />
                      Tất Cả
                    </div>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/news/category/${cat.slug}`}
                      className={`block px-3 py-2.5 text-sm font-bold transition-all duration-200 border-l-3 ${
                        categorySlug === cat.slug
                          ? "bg-[#1A4331] text-[#F8F5F0] border-l-[#8A9A7A]"
                          : "text-[#1A4331] hover:bg-[#1A4331]/5 border-l-transparent hover:border-l-[#8A9A7A]"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A9A7A] text-center py-4">
                  Chưa có danh mục nào
                </p>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results info */}
            <div className="flex items-center justify-between gap-4 mb-6 bg-white border border-[#1A4331]/15 p-4">
              <p className="text-[#1A4331] font-bold text-sm">
                Hiển thị{" "}
                <span className="text-[#8A9A7A] text-base">
                  {totalElements}
                </span>{" "}
                bài viết
              </p>
            </div>

            {/* Loading / News Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24 text-[#8A9A7A]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : newsList.length > 0 ? (
              <div className="space-y-10">
                {/* News Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {newsList.map((news) => (
                    <Link
                      key={news.id}
                      to={`/news/${news.slug}`}
                      className="group bg-white border-2 border-[#1A4331]/15 flex flex-col relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(26,67,49,0.1)]"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] bg-[#F8F5F0] border-b border-[#1A4331]/10 relative overflow-hidden">
                        {news.thumbnailUrl ? (
                          <img
                            src={getMediaUrl(news.thumbnailUrl)}
                            alt={news.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-[#1A4331]/5">
                            <Newspaper className="h-12 w-12 text-[#1A4331]/20" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        {/* Category badge */}
                        <span className="inline-block self-start mb-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8A9A7A]/15 text-[#8A9A7A] border border-[#8A9A7A]/30">
                          {news.categoryName}
                        </span>

                        {/* Title */}
                        <h3 className="font-bold text-[#1A4331] text-sm leading-snug line-clamp-2 mb-3 group-hover:text-[#8A9A7A] transition-colors">
                          {news.title}
                        </h3>

                        {/* Footer */}
                        <div className="mt-auto pt-3 border-t border-[#1A4331]/10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-[#1A4331]/50">
                            <Calendar className="h-3 w-3" />
                            {formatDate(news.createdAt)}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-[#8A9A7A] group-hover:text-[#1A4331] transition-colors">
                            Đọc thêm
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalElements > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#1A4331]/10">
                    <PaginationComponent
                      currentPage={page}
                      pageSize={size}
                      totalCount={totalElements}
                      onPageChange={setPage}
                      className="border-[#1A4331]/20 bg-white"
                      showItemsPerPageSelect={false}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-[#1A4331]/15">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#F8F5F0] border border-[#1A4331]/20 rounded-full text-[#8A9A7A]">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A4331] mb-2">
                  Chưa Có Tin Tức
                </h3>
                <p className="text-[#8A9A7A] text-sm mb-4">
                  {activeCategoryName
                    ? `Chưa có tin tức trong danh mục "${activeCategoryName}"`
                    : "Hiện chưa có bài viết nào. Hãy quay lại sau nhé!"}
                </p>
                {activeCategoryName && (
                  <Link
                    to="/news"
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#8A9A7A] hover:text-[#1A4331] transition-colors border-b border-[#8A9A7A]"
                  >
                    ← Xem tất cả tin tức
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
