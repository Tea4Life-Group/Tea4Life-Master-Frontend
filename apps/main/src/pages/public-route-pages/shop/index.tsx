import { useState, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  Filter,
  Leaf,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import FilterSidebar from "./components/FilterSidebar.tsx";
import { priceRanges } from "./constants.ts";
import PaginationComponent from "@/components/custom/PaginationComponent";
import { getProductsApi, getProductCategoriesApi } from "@/services/productApi";
import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import { handleError, getMediaUrl } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";
import { RequireLoginDialog } from "@/components/custom/RequireLoginDialog";
import { QuickOrderModal } from "@/components/custom/QuickOrderModal.tsx";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Quick Order Modal state
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // States for products from API
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [size] = useState(12);
  const [totalElements, setTotalElements] = useState(0);

  // Get filter values from URL
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId") || "all";
  const priceRange = searchParams.get("priceRange") || "all";

  // Local state for name input
  const [nameInput, setNameInput] = useState(keyword);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getProductCategoriesApi();
      setCategories(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh mục sản phẩm");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const resolvedPrice = priceRanges.find((p) => p.value === priceRange);
      let minPrice;
      let maxPrice;
      if (resolvedPrice) {
        minPrice = resolvedPrice.min;
        maxPrice = resolvedPrice.max;
      }

      const res = await getProductsApi({
        page,
        size,
        keyword: keyword || null,
        categoryId: categoryId === "all" ? null : categoryId,
        minPrice,
        maxPrice,
      });

      setProducts(res.data.data.content || []);
      setTotalElements(res.data.data.totalElements || 0);
    } catch (error) {
      handleError(error, "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, categoryId, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params
  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setPage(1); // Reset page on filter change
    setSearchParams(newParams);
  };

  // Handle name search submit
  const handleSearch = () => {
    updateParams({ keyword: nameInput });
  };

  // Clear all filters
  const clearFilters = () => {
    setNameInput("");
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handleQuickAdd = async (e: React.MouseEvent, p: ProductSummaryResponse) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    // Open Quick Order Modal instead of adding directly
    setSelectedProductId(String(p.id));
    setShowQuickOrderModal(true);
  };

  const hasActiveFilters = !!(
    keyword ||
    categoryId !== "all" ||
    priceRange !== "all"
  );

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

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
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Khám Phá Hương Vị
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331]">
            Thực Đơn
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar - Sticky */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white border-2 border-[#1A4331]/20 p-5">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1A4331]/20">
                <SlidersHorizontal className="h-4 w-4 text-[#8A9A7A]" />
                <h2 className="font-bold text-[#1A4331] text-sm uppercase tracking-wider">
                  Bộ Lọc
                </h2>
              </div>
              <FilterSidebar
                nameInput={nameInput}
                setNameInput={setNameInput}
                categoryId={categoryId}
                priceRange={priceRange}
                categories={categories}
                hasActiveFilters={hasActiveFilters}
                onSearch={handleSearch}
                onUpdateParams={updateParams}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowMobileFilter(true)}
              className="w-full bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none h-10 font-bold text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ Lọc
              {hasActiveFilters && (
                <span className="ml-2 bg-[#D2A676] text-[#1A4331] text-xs px-2 py-0.5 rounded-sm font-bold">
                  Đang lọc
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Filter Modal */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-[#F8F5F0] p-6 shadow-xl border-l-2 border-[#1A4331]/20 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#8A9A7A]" />
                    <h2 className="font-bold text-[#1A4331] text-sm">Bộ Lọc</h2>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => setShowMobileFilter(false)}
                    className="bg-transparent text-[#1A4331] hover:bg-[#1A4331]/10 rounded-none border border-[#1A4331]/20 w-9 h-9"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <FilterSidebar
                  nameInput={nameInput}
                  setNameInput={setNameInput}
                  categoryId={categoryId}
                  priceRange={priceRange}
                  categories={categories}
                  hasActiveFilters={hasActiveFilters}
                  onSearch={handleSearch}
                  onUpdateParams={updateParams}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          )}

          {/* Products */}
          <main className="flex-1">
            {/* Results Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-[#1A4331]/15 p-4">
              <p className="text-[#1A4331] font-bold text-sm">
                Hiển thị{" "}
                <span className="text-[#8A9A7A] text-base">
                  {totalElements}
                </span>{" "}
                sản phẩm
              </p>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {keyword && (
                  <span className="inline-flex items-center gap-1 bg-[#1A4331] text-[#F8F5F0] px-3 py-1 text-xs font-bold rounded-sm">
                    Tên: {keyword}
                    <button
                      onClick={() => {
                        setNameInput("");
                        updateParams({ keyword: "" });
                      }}
                      className="ml-1 hover:text-[#D2A676]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {categoryId !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-[#8A9A7A] text-[#F8F5F0] px-3 py-1 text-xs font-bold rounded-sm">
                    {categories.find((c) => c.id === categoryId)?.name ||
                      "Danh mục"}
                    <button
                      onClick={() => updateParams({ categoryId: "all" })}
                      className="ml-1 hover:text-[#1A4331]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-[#D2A676] text-[#1A4331] px-3 py-1 text-xs font-bold rounded-sm">
                    {priceRanges.find((p) => p.value === priceRange)?.label}
                    <button
                      onClick={() => updateParams({ priceRange: "all" })}
                      className="ml-1 hover:text-[#F8F5F0]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading / Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24 text-[#8A9A7A]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-10">
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white border-2 border-[#1A4331]/15 p-3 flex flex-col relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(26,67,49,0.1)]"
                    >
                      {/* Image */}
                      <Link to={`/shop/products/${product.id}`}>
                        <div className="aspect-square bg-[#F8F5F0] border border-[#1A4331]/10 mb-3 relative overflow-hidden">
                          <img
                            src={
                              product.imageUrl
                                ? getMediaUrl(product.imageUrl)
                                : "/placeholder.svg"
                            }
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex flex-col flex-1 space-y-2">
                        {/* Rating (Mock) */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 fill-[#D2A676] text-[#D2A676]`}
                            />
                          ))}
                        </div>

                        {/* Name */}
                        <Link to={`/shop/products/${product.id}`}>
                          <h3 className="font-bold text-[#1A4331] text-sm leading-tight line-clamp-2 hover:text-[#8A9A7A] transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Category */}
                        <p className="text-xs text-[#8A9A7A]">
                          {product.productCategoryName}
                        </p>

                        {/* Price + Button */}
                        <div className="mt-auto pt-2 border-t border-[#1A4331]/10 flex flex-col gap-2">
                          <div className="text-base font-bold text-[#1A4331]">
                            {formatPrice(product.basePrice)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => handleQuickAdd(e, product)}
                              className="flex-1 bg-[#D2A676] text-[#1A4331] hover:bg-[#B19470] rounded-none h-9 text-xs font-bold transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 -mt-px mr-1.5" />
                              Đặt Ngay
                            </Button>
                            <Link to={`/shop/products/${product.id}`} className="flex-1">
                              <Button className="w-full bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none h-9 text-xs font-bold transition-colors">
                                Chi Tiết
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  Không Tìm Thấy Sản Phẩm
                </h3>
                <p className="text-[#8A9A7A] text-sm mb-4">
                  Hãy thử thay đổi bộ lọc để tìm sản phẩm phù hợp
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none font-bold px-6 h-9 text-sm"
                >
                  Xóa Bộ Lọc
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <RequireLoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Yêu cầu đăng nhập"
        description="Bạn cần đăng nhập để mua nhanh sản phẩm này nhé!"
      />

      <QuickOrderModal
        productId={selectedProductId}
        isOpen={showQuickOrderModal}
        onClose={() => setShowQuickOrderModal(false)}
      />
    </div>
  );
}
