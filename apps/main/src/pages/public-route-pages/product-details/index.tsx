"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  ChevronLeft,
  Leaf,
  Loader2,
  MessageSquareText,
  ThumbsUp,
  Share2,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";

import { getProductByIdApi, getProductsApi } from "@/services/productApi";
import { getLatestNewsApi } from "@/services/newsApi";
import type { ProductDetailResponse } from "@/types/product/ProductDetailResponse";
import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import type { NewsSummaryResponse } from "@/types/news/NewsSummaryResponse";
import { getMediaUrl, handleError } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";
import { RequireLoginDialog } from "@/components/custom/RequireLoginDialog";
import { addCartItemApi } from "@/services/cartApi";
import {
  createBlogReviewCommentApi,
  createMyBlogReviewApi,
  hasReviewedProductApi,
  getBlogReviewCommentsApi,
  getPublicProductRatingStatsApi,
  getPublicBlogReviewsApi,
  shareBlogReviewApi,
  toggleBlogReviewLikeApi,
} from "@/services/blogApi";
import type { CartItemOptionSelectionRequest } from "@/types/cart/CartItemOptionSelectionRequest";
import type { BlogReviewResponse } from "@/types/blog/BlogReviewResponse";
import { toast } from "sonner";
import { useAppDispatch } from "@/features/store";
import { fetchCart, setLastAction } from "@/features/cart/cartSlice";
import { QuickOrderModal } from "@/components/custom/QuickOrderModal.tsx";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<
    ProductSummaryResponse[]
  >([]);

  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Quick Order Modal state for related products
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // State for selected options mapping: optionId -> array of selected valueIds
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [note, setNote] = useState("");
  const [reviews, setReviews] = useState<BlogReviewResponse[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsSummaryResponse[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentMap, setCommentMap] = useState<Record<string, { id: string; authorEmail: string; content: string }[]>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);
  const [sharingReviewId, setSharingReviewId] = useState<string | null>(null);
  const [hasReviewedCurrentProduct, setHasReviewedCurrentProduct] =
    useState(false);

  const fetchProductReviews = useCallback(async (productId: string) => {
    try {
      setReviewLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        getPublicBlogReviewsApi({
          productId,
          page: 0,
          size: 6,
        }),
        getPublicProductRatingStatsApi([productId]),
      ]);

      const payload = reviewsRes.data.data;
      setReviews(payload?.content || []);

      const stats = statsRes.data.data || [];
      const productStats = stats.find((item) => item.productId === productId);
      if (productStats) {
        setReviewTotal(productStats.reviewCount || 0);
        setAvgRating(productStats.averageRating || 0);
      } else {
        setReviewTotal(0);
        setAvgRating(0);
      }
    } catch (error) {
      handleError(error, "Không thể tải đánh giá sản phẩm.");
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const fetchLatestNews = useCallback(async () => {
    try {
      setNewsLoading(true);
      const res = await getLatestNewsApi();
      setLatestNews((res.data.data || []).slice(0, 3));
    } catch (error) {
      handleError(error, "Không thể tải bài blog mới.");
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const fetchMyReviewStatus = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        setHasReviewedCurrentProduct(false);
        return;
      }

      try {
        const res = await hasReviewedProductApi(productId);
        setHasReviewedCurrentProduct(Boolean(res.data.data));
      } catch (error) {
        console.error("Không thể kiểm tra trạng thái đánh giá sản phẩm:", error);
        setHasReviewedCurrentProduct(false);
      }
    },
    [isAuthenticated],
  );

  const fetchProductDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getProductByIdApi(id);
      const productData = res.data.data;
      setProduct(productData);

      // Initialize default selections: select first value of required single-select options
      const initialSelections: Record<string, string[]> = {};
      productData.productOptions?.forEach((opt) => {
        if (
          opt.isRequired &&
          !opt.isMultiSelect &&
          opt.productOptionValues?.length > 0
        ) {
          // Sort option values by sortOrder
          const sortedValues = [...opt.productOptionValues].sort(
            (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
          );
          initialSelections[opt.id] = [sortedValues[0].id];
        } else {
          initialSelections[opt.id] = [];
        }
      });
      setSelectedOptions(initialSelections);

      // Fetch related products (same category)
      if (productData.productCategory?.id) {
        const relatedRes = await getProductsApi({
          categoryId: productData.productCategory.id.toString(),
          page: 1,
          size: 4,
        });
        // filter out current
        const related = (relatedRes.data.data.content || []).filter(
          (p) => p.id.toString() !== id,
        );
        setRelatedProducts(related.slice(0, 4));
      }

      await Promise.all([
        fetchProductReviews(String(productData.id)),
        fetchMyReviewStatus(String(productData.id)),
      ]);
    } catch (error) {
      handleError(error, "Không thể tải chi tiết sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [id, fetchMyReviewStatus, fetchProductReviews]);

  useEffect(() => {
    fetchProductDetail();
    window.scrollTo(0, 0); // Scroll to top when changing product
  }, [fetchProductDetail]);

  useEffect(() => {
    if (!id) return;

    const state = location.state as { openQuickOrder?: boolean } | null;
    if (!state?.openQuickOrder) return;

    setSelectedProductId(id);
    setShowQuickOrderModal(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [id, location.pathname, location.state, navigate]);

  useEffect(() => {
    fetchLatestNews();
  }, [fetchLatestNews]);

  const handleOptionToggle = (
    optionId: string,
    valueId: string,
    isMultiSelect: boolean,
  ) => {
    setSelectedOptions((prev) => {
      const currentSelected = prev[optionId] || [];
      if (isMultiSelect) {
        if (currentSelected.includes(valueId)) {
          return {
            ...prev,
            [optionId]: currentSelected.filter((id) => id !== valueId),
          };
        } else {
          return { ...prev, [optionId]: [...currentSelected, valueId] };
        }
      } else {
        // Single select
        if (currentSelected.includes(valueId)) {
          return prev; // Optional: allow deselect if not required, but here we just replace or keep
        }
        return { ...prev, [optionId]: [valueId] };
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let unitPrice = product.basePrice || 0;

    // Add extra prices from selected options
    product.productOptions?.forEach((opt) => {
      const selectedIds = selectedOptions[opt.id] || [];
      opt.productOptionValues?.forEach((val) => {
        if (selectedIds.includes(val.id)) {
          unitPrice += val.extraPrice || 0;
        }
      });
    });

    return unitPrice * quantity;
  }, [product, selectedOptions, quantity]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    if (!product) return;

    // Build selected options array
    const optionsPayload: CartItemOptionSelectionRequest[] = [];
    let hasMissingRequired = false;
    
    product.productOptions?.forEach(opt => {
      const selectedIds = selectedOptions[opt.id] || [];
      if (opt.isRequired && selectedIds.length === 0) {
         hasMissingRequired = true;
      }
      
      selectedIds.forEach(valId => {
        const val = opt.productOptionValues?.find(v => v.id === valId);
        if (val) {
          optionsPayload.push({
            productOptionId: opt.id,
            productOptionName: opt.name,
            productOptionValueId: val.id,
            productOptionValueName: val.valueName,
            extraPrice: val.extraPrice || 0
          });
        }
      });
    });

    if (hasMissingRequired) {
      toast.warning("Vui lòng chọn đầy đủ các tùy chọn bắt buộc!");
      return;
    }

    try {
      const requestData = {
        productId: String(product.id),
        productName: product.name,
        productImageUrl: product.imageUrl,
        selectedOptions: optionsPayload,
        unitPrice: product.basePrice,
        quantity: quantity
      };

      await addCartItemApi(requestData);
      dispatch(setLastAction("add"));
      dispatch(fetchCart());
    } catch (error) {
      handleError(error, "Không thể thêm vào giỏ hàng");
    }
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!product) return;
    try {
      setSubmittingReview(true);
      const normalizedTitle = reviewTitle.trim();
      const normalizedContent = reviewContent.trim();
      await createMyBlogReviewApi({
        productId: String(product.id),
        productName: product.name,
        title: normalizedTitle || undefined,
        summary: normalizedContent ? normalizedContent.slice(0, 140) : undefined,
        content: normalizedContent || undefined,
        rating: reviewRating,
        thumbnailUrl: product.imageUrl || undefined,
      });

      toast.success("Đã gửi đánh giá thành công.");
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
      setHasReviewedCurrentProduct(true);
      await fetchProductReviews(String(product.id));
    } catch (error) {
      handleError(error, "Không thể gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLoadComments = async (reviewId: string) => {
    try {
      const res = await getBlogReviewCommentsApi(reviewId, { page: 0, size: 5 });
      const comments = res.data.data?.content || [];
      setCommentMap((prev) => ({
        ...prev,
        [reviewId]: comments.map((c) => ({
          id: c.id,
          authorEmail: c.authorEmail,
          content: c.content,
        })),
      }));
    } catch (error) {
      handleError(error, "Không thể tải bình luận.");
    }
  };

  const handleSubmitComment = async (reviewId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    const content = (commentInputs[reviewId] || "").trim();
    if (!content) {
      toast.warning("Vui lòng nhập nội dung bình luận.");
      return;
    }
    try {
      setSubmittingCommentFor(reviewId);
      await createBlogReviewCommentApi(reviewId, { content });
      setCommentInputs((prev) => ({ ...prev, [reviewId]: "" }));
      await handleLoadComments(reviewId);
      await fetchProductReviews(String(product?.id || ""));
      toast.success("Đã thêm bình luận.");
    } catch (error) {
      handleError(error, "Không thể gửi bình luận.");
    } finally {
      setSubmittingCommentFor(null);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    try {
      setLikingReviewId(reviewId);
      await toggleBlogReviewLikeApi(reviewId);
      await fetchProductReviews(String(product?.id || ""));
    } catch (error) {
      handleError(error, "Không thể like bài review.");
    } finally {
      setLikingReviewId(null);
    }
  };

  const handleShareReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    try {
      setSharingReviewId(reviewId);
      await shareBlogReviewApi(reviewId, { channel: "web" });
      await fetchProductReviews(String(product?.id || ""));
      toast.success("Đã ghi nhận lượt chia sẻ.");
    } catch (error) {
      handleError(error, "Không thể chia sẻ bài review.");
    } finally {
      setSharingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1A4331]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-sans text-[#5c4033] mb-4">
            Không tìm thấy sản phẩm
          </h1>
          <Link to="/shop">
            <Button className="bg-[#5c4033] text-[#F8F5F0] hover:bg-[#d97743] hover:text-white rounded-full text-sm font-semibold px-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại cửa hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#5c4033] relative pb-20">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#5c4033 1px, transparent 1px), linear-gradient(90deg, #5c4033 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/"
                  className="text-[#8A9A7A] hover:text-[#1A4331] text-sm font-bold"
                >
                  Trang chủ
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/shop"
                  className="text-[#8A9A7A] hover:text-[#1A4331] text-sm font-bold"
                >
                  Thực đơn
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#1A4331] text-sm font-bold truncate max-w-[200px] sm:max-w-none">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          {/* Product Image - 6 cols (Larger image) */}
          <div className="lg:col-span-6 relative">
            <div className="sticky top-24">
              <div className="overflow-hidden bg-white rounded-[2rem] shadow-sm group">
                <img
                  src={
                    product.imageUrl
                      ? getMediaUrl(product.imageUrl)
                      : "/placeholder.svg"
                  }
                  alt={product.name}
                  className="h-full w-full object-cover aspect-4/5 md:aspect-square hover:scale-105 transition-transform duration-700"
                />
              </div>
              {product.productCategory && (
                <Link to={`/shop?categoryId=${product.productCategory.id}`}>
                  <span className="absolute top-4 left-4 bg-[#d97743] text-white text-xs px-4 py-2 font-semibold tracking-wide hover:bg-[#5c4033] transition-colors cursor-pointer rounded-full shadow-md">
                    {product.productCategory.name}
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Product Info - 6 cols */}
          <div className="lg:col-span-6 flex flex-col pt-4">
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-[#5c4033] tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating Placeholder */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex bg-white px-3 py-1.5 rounded-full shadow-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(avgRating)
                        ? "fill-[#d97743] text-[#d97743]"
                        : "text-[#d97743]/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#d97743] font-medium bg-white px-3 py-1.5 rounded-full shadow-sm">
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"} ({reviewTotal} đánh giá)
              </span>
              <a
                href="#product-reviews"
                className="text-sm font-semibold px-4 py-1.5 rounded-full bg-[#F8F5F0] text-[#5c4033] border border-[#5c4033]/10 hover:border-[#d97743] transition-colors"
              >
                Viết review
              </a>
            </div>

            {/* Price */}
            <div className="mt-8 bg-[#5c4033] text-white inline-block w-fit px-8 py-4 rounded-3xl shadow-md">
              <span className="text-[#f0e6d8] font-medium block mb-1 text-sm">
                Giá cơ bản
              </span>
              <span className="text-3xl font-bold">
                {formatPrice(product.basePrice)}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-8 text-[#5c4033]/80 text-[15px] leading-relaxed whitespace-pre-line bg-white p-6 rounded-3xl shadow-sm font-medium">
                {product.description}
              </p>
            )}

            {/* Dynamic Options */}
            <div className="mt-10 space-y-6">
              {product.productOptions
                ?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((option) => (
                  <div
                    key={option.id}
                    className="bg-white p-6 pt-8 rounded-3xl shadow-sm relative border border-[#5c4033]/5"
                  >
                    <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#F8F5F0] px-4 py-1 rounded-full flex items-center gap-2 border border-[#5c4033]/10">
                      <label className="text-sm font-bold text-[#5c4033] flex items-center gap-2 m-0">
                        {option.name}
                        {option.isRequired && (
                          <span className="text-red-500 font-medium text-[11px] bg-red-50 px-2.5 py-0.5 rounded-full ml-1">
                            *Bắt buộc
                          </span>
                        )}
                        {option.isMultiSelect && (
                          <span className="text-[#d97743] font-medium text-[11px] bg-[#d97743]/10 px-2.5 py-0.5 rounded-full ml-1">
                            (Chọn nhiều)
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2">
                      {option.productOptionValues
                        ?.sort(
                          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
                        )
                        .map((val) => {
                          const isSelected = (
                            selectedOptions[option.id] || []
                          ).includes(val.id);
                          return (
                            <button
                              key={val.id}
                              onClick={() =>
                                handleOptionToggle(
                                  option.id,
                                  val.id,
                                  option.isMultiSelect,
                                )
                              }
                              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold border-2 transition-all rounded-full ${
                                isSelected
                                  ? "bg-[#5c4033] text-white border-[#5c4033] shadow-md -translate-y-0.5"
                                  : "bg-white text-[#5c4033] border-[#5c4033]/10 hover:border-[#d97743] hover:-translate-y-0.5 hover:shadow-sm"
                              }`}
                            >
                              {val.imageUrl && (
                                <img
                                  src={getMediaUrl(val.imageUrl)}
                                  alt={val.valueName}
                                  className={`w-9 h-9 object-cover rounded-full shrink-0 ${isSelected ? "border border-white/20" : "grayscale opacity-80"}`}
                                />
                              )}
                              <span>{val.valueName}</span>
                              {val.extraPrice > 0 && (
                                <span
                                  className={`text-xs ml-1 pl-2 border-l ${isSelected ? "text-emerald-100 border-white/20" : "text-[#d97743] border-[#5c4033]/20"}`}
                                >
                                  +{formatPrice(val.extraPrice)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>

            {/* Note */}
            <div className="mt-8 bg-white p-6 pt-8 rounded-3xl shadow-sm relative border border-[#5c4033]/5">
              <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#F8F5F0] px-4 py-1 rounded-full flex items-center gap-2 border border-[#5c4033]/10">
                <label className="text-sm font-bold text-[#5c4033] flex items-center gap-2 m-0">
                  Ghi chú cho quán
                </label>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Ít ngọt, thêm thật nhiều đá..."
                className="w-full h-24 mt-2 bg-slate-50 border border-[#5c4033]/10 px-5 py-4 text-sm text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#d97743]/50 focus:border-[#d97743] placeholder-gray-400 resize-none rounded-2xl transition-all"
              />
            </div>

            {/* Quantity + Actions (Sticky Bar) */}
            <div className="mt-12 pt-6 border-t-2 border-[#5c4033]/10 sticky bottom-0 bg-[#F8F5F0] pb-6 z-20 flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-auto">
                <label className="text-sm font-bold text-[#d97743] mb-3 block">
                  Số lượng
                </label>
                <div className="flex items-center bg-white border border-[#5c4033]/10 shadow-sm rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-14 h-14 flex items-center justify-center text-[#5c4033] hover:bg-[#F8F5F0] transition-colors font-bold text-xl"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-16 h-14 flex items-center justify-center text-lg font-bold text-[#5c4033] bg-slate-50">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-14 h-14 flex items-center justify-center text-[#5c4033] hover:bg-[#F8F5F0] transition-colors font-bold text-xl"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 flex-1 w-full relative">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#5c4033] text-white hover:bg-[#d97743] hover:shadow-lg shadow-md transition-all rounded-full h-14 font-semibold text-base border-none"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Thêm vào giỏ • {formatPrice(totalPrice)}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`rounded-full w-14 h-14 border border-[#5c4033]/10 shrink-0 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    isFavorite
                      ? "bg-red-50 text-red-500 border-red-200"
                      : "bg-white text-[#5c4033] hover:bg-slate-50"
                  }`}
                >
                  <Heart
                    className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details - Info */}
        <div className="mt-20 bg-white rounded-[2rem] p-10 shadow-sm relative border border-[#5c4033]/5">
          <div className="absolute -top-6 left-10 bg-[#d97743] text-white px-6 py-3 rounded-full shadow-md">
            <h3 className="text-base font-bold flex items-center gap-2 m-0">
              <Leaf className="h-5 w-5 text-yellow-200" />
              Thông tin chi tiết
            </h3>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 text-sm mt-6">
            <div className="bg-[#F8F5F0] p-6 rounded-3xl">
              <span className="text-[#d97743] font-semibold block mb-2">
                Danh mục
              </span>
              <p className="font-bold text-[#5c4033] text-xl">
                {product.productCategory?.name || "Khác"}
              </p>
            </div>
            <div className="bg-[#F8F5F0] p-6 rounded-3xl">
              <span className="text-[#d97743] font-semibold block mb-2">
                Đơn giá cơ bản
              </span>
              <p className="font-bold text-emerald-600 text-xl">
                {formatPrice(product.basePrice)}
              </p>
            </div>
            {product.productCategory?.description && (
              <div className="sm:col-span-2 bg-[#F8F5F0] p-8 rounded-3xl">
                <span className="text-[#d97743] font-semibold block mb-3">
                  Mô tả danh mục
                </span>
                <p className="text-[#5c4033] font-medium leading-relaxed text-base">
                  {product.productCategory.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          id="product-reviews"
          className="mt-20 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#5c4033]/5"
        >
          <div className="mb-6 pb-4 border-b border-[#5c4033]/10">
            <h3 className="text-2xl font-bold text-[#5c4033]">
              Đánh giá sản phẩm ({reviewTotal})
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              {hasReviewedCurrentProduct ? (
                <div className="rounded-2xl border border-[#5c4033]/15 bg-[#F8F5F0] px-4 py-3 text-sm text-[#8A9A7A]">
                  Bạn đã đánh giá sản phẩm này. Cảm ơn bạn đã chia sẻ!
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-[#5c4033]">
                    Viết đánh giá mới
                  </p>
                  <input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Tiêu đề đánh giá"
                    className="w-full rounded-2xl border border-[#5c4033]/15 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97743]/30"
                  />
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    className="w-full h-28 rounded-2xl border border-[#5c4033]/15 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#d97743]/30"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#5c4033]">
                      Điểm:
                    </span>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className="p-0.5"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              value <= reviewRating
                                ? "fill-[#d97743] text-[#d97743]"
                                : "text-[#d97743]/30"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="bg-[#5c4033] hover:bg-[#d97743] text-white rounded-full px-6"
                  >
                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-3">
              {reviewLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#5c4033]" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-sm text-[#8A9A7A] py-10 text-center border border-dashed border-[#5c4033]/20 rounded-2xl">
                  Chưa có đánh giá nào cho sản phẩm này.
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-[#5c4033]/10 rounded-2xl p-4 bg-[#F8F5F0]/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-[#5c4033]">{review.title}</p>
                      <span className="text-xs text-[#8A9A7A]">{review.authorEmail}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 ${
                            idx < review.rating
                              ? "fill-[#d97743] text-[#d97743]"
                              : "text-[#d97743]/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-[#5c4033]/80 whitespace-pre-line">
                      {review.summary || review.content}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(review.id)}
                        disabled={likingReviewId === review.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border ${
                          review.likedByMe
                            ? "bg-[#1A4331] text-white border-[#1A4331]"
                            : "bg-white text-[#5c4033] border-[#5c4033]/20"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {review.totalLikes || 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareReview(review.id)}
                        disabled={sharingReviewId === review.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border bg-white text-[#5c4033] border-[#5c4033]/20"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        {review.totalShares || 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadComments(review.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border bg-white text-[#5c4033] border-[#5c4033]/20"
                      >
                        <MessageSquareText className="h-3.5 w-3.5" />
                        {review.totalComments || 0}
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(commentMap[review.id] || []).map((comment) => (
                        <div
                          key={comment.id}
                          className="text-xs bg-white border border-[#5c4033]/10 rounded-xl px-3 py-2"
                        >
                          <span className="font-semibold">{comment.authorEmail}: </span>
                          <span>{comment.content}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <input
                          value={commentInputs[review.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          placeholder="Viết bình luận..."
                          className="flex-1 rounded-xl border border-[#5c4033]/15 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#d97743]/30"
                        />
                        <Button
                          onClick={() => handleSubmitComment(review.id)}
                          disabled={submittingCommentFor === review.id}
                          className="h-8 rounded-full px-3 text-xs bg-[#5c4033] hover:bg-[#d97743]"
                        >
                          Gửi
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#5c4033]/5">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#5c4033]/10">
            <h3 className="text-2xl font-bold text-[#5c4033]">Bài blog liên quan</h3>
            <Link
              to="/news"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-[#F8F5F0] text-[#5c4033] border border-[#5c4033]/10"
            >
              Xem tất cả
            </Link>
          </div>
          {newsLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#5c4033]" />
            </div>
          ) : latestNews.length === 0 ? (
            <div className="text-sm text-[#8A9A7A] py-10 text-center border border-dashed border-[#5c4033]/20 rounded-2xl">
              Chưa có bài blog nào.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {latestNews.map((news) => (
                <Link
                  key={news.id}
                  to={`/news/${news.slug}`}
                  className="border border-[#5c4033]/10 rounded-2xl p-4 bg-[#F8F5F0]/60 hover:bg-[#F8F5F0] transition-colors"
                >
                  <p className="text-xs text-[#d97743] font-semibold">{news.categoryName}</p>
                  <p className="font-bold text-[#5c4033] mt-2 line-clamp-2">{news.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pb-12">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#5c4033]/10">
              <h2 className="text-3xl font-bold font-sans text-[#5c4033] flex items-center gap-3">
                <Star className="h-7 w-7 text-[#d97743] fill-[#d97743]" />
                Có thể bạn thích
              </h2>
              <Link
                to={`/shop?categoryId=${product.productCategory?.id}`}
                className="text-sm font-semibold bg-white text-[#5c4033] hover:bg-[#d97743] hover:text-white px-6 py-2.5 rounded-full border border-[#5c4033]/10 shadow-sm transition-all hidden sm:block"
              >
                Xem thêm &rarr;
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/shop/products/${p.id}`}>
                  <div className="group bg-white p-5 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-lg flex flex-col h-full rounded-[2rem] border border-[#5c4033]/5">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F8F5F0] mb-5">
                      {p.imageUrl ? (
                        <img
                          src={getMediaUrl(p.imageUrl)}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#d97743] opacity-40">
                          <Leaf className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col px-1">
                      <h3 className="font-bold text-[#5c4033] text-lg line-clamp-2 mb-2 group-hover:text-[#d97743] transition-colors leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-xs bg-[#e0c4a4] text-[#5c4033] px-3 py-1 w-fit rounded-full mb-4 font-semibold">
                        {p.productCategoryName}
                      </p>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed border-[#5c4033]/10">
                        <span className="text-xl font-bold text-[#5c4033]">
                          {formatPrice(p.basePrice)}
                        </span>
                        <div 
                          onClick={(e) => handleQuickAdd(e, p)}
                          className="w-10 h-10 bg-[#F8F5F0] text-[#5c4033] rounded-full flex items-center justify-center group-hover:bg-[#d97743] group-hover:text-white transition-colors border border-[#5c4033]/5 shadow-sm"
                        >
                          <Plus className="w-5 h-5 font-bold" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to={`/shop?categoryId=${product.productCategory?.id}`}
              className="mt-8 text-sm font-semibold bg-white text-[#5c4033] hover:bg-[#d97743] hover:text-white px-6 py-3.5 rounded-full shadow-sm border border-[#5c4033]/10 transition-all block text-center sm:hidden"
            >
              Xem thêm &rarr;
            </Link>
          </div>
        )}
      </div>

      <RequireLoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Yêu cầu đăng nhập"
        description="Bạn cần đăng nhập để thêm món vào giỏ hàng nhé!"
      />

      <QuickOrderModal
        productId={selectedProductId}
        isOpen={showQuickOrderModal}
        onClose={() => setShowQuickOrderModal(false)}
      />
    </div>
  );
}
