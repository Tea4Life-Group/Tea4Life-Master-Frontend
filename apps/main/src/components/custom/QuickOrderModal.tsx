import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, ShoppingCart, Info } from "lucide-react";
import { getProductByIdApi, getRecommendedOptionValuesApi } from "@/services/productApi";
import type { ProductDetailResponse } from "@/types/product/ProductDetailResponse";
import type { RecommendedOptionValueResponse } from "@/types/recommendation/RecommendedOptionValueResponse";
import type { ProductOptionValueResponse } from "@/types/product-option/ProductOptionValueResponse";
import { getMediaUrl, handleError } from "@/lib/utils";
import { addCartItemApi } from "@/services/cartApi";
import type { CartItemOptionSelectionRequest } from "@/types/cart/CartItemOptionSelectionRequest";
import { toast } from "sonner";
import { useAppDispatch } from "@/features/store";
import { fetchCart, setLastAction } from "@/features/cart/cartSlice";

const sortOptionValues = (
  values: ProductOptionValueResponse[],
  recommended: RecommendedOptionValueResponse[],
): ProductOptionValueResponse[] => {
  const recommendedMap = new Map<string, number>();
  recommended.forEach((rec) => {
    if (rec.optionValueId !== undefined && rec.optionValueId !== null) {
      recommendedMap.set(String(rec.optionValueId), rec.score);
    }
  });

  return [...values].sort((a, b) => {
    const scoreA = recommendedMap.get(String(a.id));
    const scoreB = recommendedMap.get(String(b.id));
    const isA = scoreA !== undefined;
    const isB = scoreB !== undefined;

    if (isA && isB) {
      return scoreB - scoreA;
    }
    if (isA) return -1;
    if (isB) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
};

interface QuickOrderModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickOrderModal({
  productId,
  isOpen,
  onClose,
}: QuickOrderModalProps) {
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [recommendedOptionValues, setRecommendedOptionValues] = useState<
    RecommendedOptionValueResponse[]
  >([]);

  const avgScore = useMemo(() => {
    if (recommendedOptionValues.length === 0) return 0;
    const sum = recommendedOptionValues.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return sum / recommendedOptionValues.length;
  }, [recommendedOptionValues]);

  const dispatch = useAppDispatch();

  const fetchProductDetail = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const res = await getProductByIdApi(id);
        const productData = res.data.data;
        setProduct(productData);

        const initialSelections: Record<string, string[]> = {};
        productData.productOptions?.forEach((opt) => {
          if (
            opt.isRequired &&
            !opt.isMultiSelect &&
            opt.productOptionValues?.length > 0
          ) {
            const sortedValues = [...opt.productOptionValues].sort(
              (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
            );
            initialSelections[opt.id] = [sortedValues[0].id];
          } else {
            initialSelections[opt.id] = [];
          }
        });
        setSelectedOptions(initialSelections);

        // Fetch recommended options for modal
        try {
          const recRes = await getRecommendedOptionValuesApi(id, 10);
          setRecommendedOptionValues(recRes.data.data || []);
        } catch (recErr) {
          console.error("Lỗi khi tải topping gợi ý cho modal đặt hàng:", recErr);
          setRecommendedOptionValues([]);
        }
      } catch (error) {
        handleError(error, "Không thể tải chi tiết sản phẩm.");
        onClose();
      } finally {
        setLoading(false);
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen && productId) {
      setTimeout(() => fetchProductDetail(productId), 0);
    } else {
      // Reset state on close
      setTimeout(() => {
        setProduct(null);
        setQuantity(1);
        setSelectedOptions({});
        setRecommendedOptionValues([]);
      }, 0);
    }
  }, [isOpen, productId, fetchProductDetail]);

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
        if (currentSelected.includes(valueId)) return prev;
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

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let unitPrice = product.basePrice || 0;
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
    if (!product) return;

    const optionsPayload: CartItemOptionSelectionRequest[] = [];
    let hasMissingRequired = false;

    product.productOptions?.forEach((opt) => {
      const selectedIds = selectedOptions[opt.id] || [];
      if (opt.isRequired && selectedIds.length === 0) {
        hasMissingRequired = true;
      }

      selectedIds.forEach((valId) => {
        const val = opt.productOptionValues?.find((v) => v.id === valId);
        if (val) {
          optionsPayload.push({
            productOptionId: opt.id,
            productOptionName: opt.name,
            productOptionValueId: val.id,
            productOptionValueName: val.valueName,
            extraPrice: val.extraPrice || 0,
          });
        }
      });
    });

    if (hasMissingRequired) {
      toast.warning("Vui lòng chọn đầy đủ các tùy chọn bắt buộc!");
      return;
    }

    try {
      setLoading(true);
      await addCartItemApi({
        productId: String(product.id),
        productName: product.name,
        productImageUrl: product.imageUrl,
        selectedOptions: optionsPayload,
        unitPrice: product.basePrice,
        quantity: quantity,
      });
      dispatch(setLastAction("add"));
      dispatch(fetchCart());
      toast.success("Đã thêm vào giỏ hàng");
      onClose();
    } catch (error) {
      handleError(error, "Không thể thêm vào giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        className="p-0 border-none rounded-3xl overflow-y-auto bg-[#F8F5F0] max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl gap-0 max-h-[90dvh] customized-scrollbar"
        showCloseButton={true}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Đặt món nhanh</DialogTitle>
          <DialogDescription>Chọn tuỳ chọn</DialogDescription>
        </DialogHeader>

        {loading && !product ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1A4331]" />
          </div>
        ) : product ? (
          <div className="flex flex-col md:flex-row h-auto items-stretch">
            {/* Left Image Column */}
            <div className="relative w-full md:w-2/5 lg:w-1/2 shrink-0 bg-white border-b md:border-b-0 md:border-r border-[#1A4331]/10">
              <div className="md:sticky md:top-0 w-full h-64 md:h-full md:max-h-[90dvh]">
                <img
                  src={
                    product.imageUrl
                      ? getMediaUrl(product.imageUrl)
                      : "/placeholder.svg"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 md:p-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-sans text-white leading-tight drop-shadow-md pr-4">
                    {product.name}
                  </h2>
                  <p className="text-emerald-300 font-bold text-lg md:text-xl mt-2 drop-shadow-md">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Follow Content Column */}
            <div className="flex flex-col flex-1 min-w-0 bg-[#F8F5F0]">
              {/* Options */}
              <div className="p-5 md:p-8">
                {product.description && (
                  <div className="mb-6 flex gap-3 text-sm text-[#5c4033]/80 bg-white p-4 rounded-2xl shadow-sm border border-[#1A4331]/5">
                    <Info className="w-5 h-5 shrink-0 text-[#8A9A7A]" />
                    <p className="font-medium leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-5">
                  {product.productOptions
                    ?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((option) => (
                      <div
                        key={option.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-[#1A4331]/5"
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <label className="text-sm font-bold text-[#5c4033] inline-flex items-center">
                            {option.name}
                          </label>
                          {option.isRequired && (
                            <span className="text-red-500 font-medium text-[10px] bg-red-50 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                              Bắt buộc
                            </span>
                          )}
                          {option.isMultiSelect && (
                            <span className="text-[#8A9A7A] font-medium text-[10px] bg-[#8A9A7A]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                              Chọn nhiều
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                          {sortOptionValues(option.productOptionValues || [], recommendedOptionValues)
                            .map((val) => {
                              const isSelected = (
                                selectedOptions[option.id] || []
                              ).includes(val.id);
                              const rec = recommendedOptionValues.find(
                                (r) => String(r.optionValueId) === String(val.id),
                              );
                              const isRecommended = rec !== undefined && rec.score >= (avgScore - 20);
                              return (
                                <label
                                  key={val.id}
                                  className={`relative flex flex-col items-center justify-between p-3 rounded-[1.25rem] border-2 transition-all cursor-pointer min-h-[135px] ${
                                    isSelected
                                      ? "bg-[#d97743]/10 border-2 border-[#d97743] shadow-sm"
                                      : "bg-white border-[#1A4331]/10 hover:border-[#d97743]"
                                  }`}
                                >
                                  {/* Radio/Checkbox visual */}
                                  <div
                                    className={`absolute top-2 left-2 flex items-center justify-center w-4 h-4 shrink-0 rounded-full border border-solid ${isSelected ? "border-[#d97743]" : "border-gray-300"} ${!option.isMultiSelect && isSelected ? "border-[4px]" : ""}`}
                                  >
                                    {option.isMultiSelect && isSelected && (
                                      <div className="w-2 h-2 bg-[#d97743] rounded-sm"></div>
                                    )}
                                  </div>

                                  <div className="flex flex-col items-center gap-1.5 w-full min-w-0">
                                    {/* Thumbnail */}
                                    {val.imageUrl && (
                                      <img
                                        src={getMediaUrl(val.imageUrl)}
                                        alt={val.valueName}
                                        className={`w-9 h-9 object-cover rounded-full shrink-0 transition-all ${isSelected ? "border-2 border-[#d97743] scale-110 shadow-sm" : ""}`}
                                      />
                                    )}

                                    <span
                                      className={`text-xs text-center font-bold line-clamp-2 ${isSelected ? "text-[#d97743]" : "text-[#5c4033]"}`}
                                    >
                                      {val.valueName}
                                    </span>
                                  </div>

                                  <div className="flex flex-col items-center w-full gap-1.5 mt-1.5 shrink-0">
                                    {val.extraPrice > 0 && (
                                      <span className="text-xs font-bold text-[#8A9A7A] shrink-0 ml-1">
                                        +{formatPrice(val.extraPrice)}
                                      </span>
                                    )}

                                    {isRecommended && (
                                      <span className="relative inline-flex items-center justify-center w-11 h-11 shrink-0 overflow-visible mt-1">
                                        <style>{`
                                          @keyframes rainbow-text-flow {
                                            0% { background-position: 0% center; }
                                            100% { background-position: 200% center; }
                                          }
                                          @keyframes rotate-rainbow {
                                            0% {
                                              transform: translate(-50%, -50%) rotate(0deg);
                                              filter: hue-rotate(0deg) saturate(3) brightness(1.2);
                                            }
                                            100% {
                                              transform: translate(-50%, -50%) rotate(360deg);
                                              filter: hue-rotate(360deg) saturate(3) brightness(1.2);
                                            }
                                          }
                                        `}</style>
                                        <img
                                          src="/common/vector_effect.png"
                                          alt="effect"
                                          className="absolute left-1/2 top-1/2 w-11 h-11 max-w-none object-contain"
                                          style={{
                                            animation: "rotate-rainbow 6s linear infinite",
                                          }}
                                        />
                                        <span className="relative z-10 flex items-center justify-center bg-white/95 border border-slate-200/80 px-2 py-0.5 rounded-full shadow-xs">
                                          <span
                                            className="text-[9.5px] font-black uppercase tracking-tight text-center"
                                            style={{
                                              background: "linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
                                              backgroundSize: "200% auto",
                                              WebkitBackgroundClip: "text",
                                              WebkitTextFillColor: "transparent",
                                              animation: "rainbow-text-flow 3s linear infinite",
                                            }}
                                          >
                                            Gợi ý
                                          </span>
                                        </span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Hidden actual input */}
                                  <input
                                    type={
                                      option.isMultiSelect
                                        ? "checkbox"
                                        : "radio"
                                    }
                                    name={`opt-${option.id}`}
                                    checked={isSelected}
                                    onChange={() =>
                                      handleOptionToggle(
                                        option.id,
                                        val.id,
                                        option.isMultiSelect,
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className="sticky bottom-0 p-4 md:p-6 lg:p-8 border-t border-[#1A4331]/10 bg-white flex items-center justify-between gap-4 z-20 shadow-md">
                <div className="flex items-center bg-[#F8F5F0] border border-[#1A4331]/10 rounded-full overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#5c4033] hover:bg-[#8A9A7A]/20 transition-colors"
                  >
                    <Minus className="h-4 w-4 font-bold" />
                  </button>
                  <span className="w-8 flex items-center justify-center text-sm font-bold text-[#1A4331]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[#5c4033] hover:bg-[#8A9A7A]/20 transition-colors"
                  >
                    <Plus className="h-4 w-4 font-bold" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="flex-1 bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] h-12 rounded-full font-bold text-sm lg:text-base transition-all shadow-md"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  )}
                  Thêm • {formatPrice(totalPrice)}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
