import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { getMyFavoritesApi, removeFavoriteApi } from "@/services/productApi";
import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import { getMediaUrl, handleError } from "@/lib/utils";
import { toast } from "sonner";

export default function FavoritesPage() {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyFavoritesApi();
      setProducts(res.data.data.content || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách sản phẩm yêu thích");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    try {
      await removeFavoriteApi(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      handleError(error, "Không thể xóa sản phẩm khỏi danh sách yêu thích");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="bg-white border-2 border-[#1A4331]/20 p-6 sm:p-8 relative overflow-hidden h-full min-h-[600px]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#1A4331]/10">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4331] pixel-text mb-2">
            Sản Phẩm Yêu Thích
          </h2>
          <p className="text-[#8A9A7A] text-sm font-medium">
            Những món uống tuyệt vời bạn đã lưu lại
          </p>
        </div>
        <div className="bg-[#F8F5F0] p-3 rounded-full border border-[#1A4331]/20">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#8A9A7A]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white border-2 border-[#1A4331]/15 p-3 flex flex-col relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(26,67,49,0.1)]"
            >
              {/* Favorite Button */}
              <button
                onClick={(e) => handleRemoveFavorite(e, product.id)}
                className="absolute top-5 right-5 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-[#1A4331]/10 hover:bg-red-50 hover:border-red-200 transition-all group/heart"
              >
                <Heart className="w-4 h-4 transition-all duration-300 fill-red-500 text-red-500 scale-110" />
              </button>

              {/* Image */}
              <Link to={`/shop/products/${product.id}`}>
                <div className="aspect-square bg-[#F8F5F0] border border-[#1A4331]/10 mb-3 relative overflow-hidden">
                  <img
                    src={product.imageUrl ? getMediaUrl(product.imageUrl) : "/placeholder.svg"}
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
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle add to cart (mock)
                      }}
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
      ) : (
        <div className="text-center py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#1A4331]/20 bg-[#F8F5F0] min-h-[300px]">
          <Heart className="w-16 h-16 text-[#8A9A7A] mb-4 stroke-1" />
          <h3 className="text-xl font-bold text-[#1A4331] mb-2">
            Chưa Có Sản Phẩm Yêu Thích
          </h3>
          <p className="text-[#8A9A7A] text-sm max-w-sm mb-6">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Khám phá menu và lưu lại những thức uống bạn thích nhé!
          </p>
          <Link to="/shop">
            <Button className="bg-[#1A4331] text-white hover:bg-[#8A9A7A] font-bold rounded-none h-11 px-8">
              Khám Phá Menu
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
