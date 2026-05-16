import { useEffect, useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, ShoppingCart, Info } from "lucide-react";
import { getProductByIdApi } from "@/services/productApi";
import type { ProductDetailResponse } from "@/types/product/ProductDetailResponse";
import { getMediaUrl, handleError } from "@/lib/utils";
import { addCartItemApi } from "@/services/cartApi";
import type { CartItemOptionSelectionRequest } from "@/types/cart/CartItemOptionSelectionRequest";
import { toast } from "sonner";
import { useAppDispatch } from "@/features/store";
import { fetchCart, setLastAction } from "@/features/cart/cartSlice";

interface QuickOrderModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickOrderModal({ productId, isOpen, onClose }: QuickOrderModalProps) {
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  
  const dispatch = useAppDispatch();

  const fetchProductDetail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await getProductByIdApi(id);
      const productData = res.data.data;
      setProduct(productData);

      const initialSelections: Record<string, string[]> = {};
      productData.productOptions?.forEach((opt) => {
        if (opt.isRequired && !opt.isMultiSelect && opt.productOptionValues?.length > 0) {
          const sortedValues = [...opt.productOptionValues].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          initialSelections[opt.id] = [sortedValues[0].id];
        } else {
          initialSelections[opt.id] = [];
        }
      });
      setSelectedOptions(initialSelections);
    } catch (error) {
      handleError(error, "Không thể tải chi tiết sản phẩm.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail(productId);
    } else {
      // Reset state on close
      setProduct(null);
      setQuantity(1);
      setSelectedOptions({});
    }
  }, [isOpen, productId, fetchProductDetail]);

  const handleOptionToggle = (optionId: string, valueId: string, isMultiSelect: boolean) => {
    setSelectedOptions((prev) => {
      const currentSelected = prev[optionId] || [];
      if (isMultiSelect) {
        if (currentSelected.includes(valueId)) {
          return { ...prev, [optionId]: currentSelected.filter((id) => id !== valueId) };
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
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
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
      setLoading(true);
      await addCartItemApi({
        productId: String(product.id),
        productName: product.name,
        productImageUrl: product.imageUrl,
        selectedOptions: optionsPayload,
        unitPrice: product.basePrice,
        quantity: quantity
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-[90vw] sm:!max-w-[90vw] md:!max-w-4xl lg:!max-w-5xl p-0 overflow-hidden bg-[#F8F5F0] border-none rounded-3xl" showCloseButton={true}>
        <DialogHeader className="sr-only">
          <DialogTitle>Đặt món nhanh</DialogTitle>
          <DialogDescription>Chọn tuỳ chọn</DialogDescription>
        </DialogHeader>

        {loading && !product ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1A4331]" />
          </div>
        ) : product ? (
          <div className="flex flex-col md:flex-row h-[85vh] sm:h-[80vh] max-h-[800px]">
             {/* Left Image Column */}
            <div className="relative w-full md:w-2/5 lg:w-1/2 h-48 md:h-full shrink-0 bg-white border-b md:border-b-0 md:border-r border-[#1A4331]/10">
              <img 
                src={product.imageUrl ? getMediaUrl(product.imageUrl) : "/placeholder.svg"} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 md:p-8">
                <h2 className="text-2xl md:text-4xl font-bold font-sans text-white leading-tight drop-shadow-md pr-4">{product.name}</h2>
                <p className="text-emerald-300 font-bold text-lg md:text-xl mt-2 drop-shadow-md">{formatPrice(product.basePrice)}</p>
              </div>
            </div>

            {/* Right Scrollable Content Column */}
            <div className="flex flex-col flex-1 min-w-0 bg-[#F8F5F0]">
              {/* Scrollable Options */}
              <div className="overflow-y-auto p-5 shrink md:p-8 customized-scrollbar flex-1">
               {product.description && (
                  <div className="mb-6 flex gap-3 text-sm text-[#5c4033]/80 bg-white p-4 rounded-2xl shadow-sm border border-[#1A4331]/5">
                    <Info className="w-5 h-5 shrink-0 text-[#8A9A7A]" />
                    <p className="font-medium leading-relaxed">{product.description}</p>
                  </div>
               )}

              {/* Options */}
              <div className="space-y-5">
                {product.productOptions?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((option) => (
                  <div key={option.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#1A4331]/5">
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
                     <div className="flex flex-col gap-2">
                        {option.productOptionValues?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((val) => {
                          const isSelected = (selectedOptions[option.id] || []).includes(val.id);
                          return (
                            <label
                              key={val.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#1A4331]/5 border-[#1A4331] shadow-sm"
                                  : "bg-white border-[#1A4331]/10 hover:border-[#8A9A7A]"
                              }`}
                            >
                               <div className="flex items-center gap-3">
                                  {/* Radio/Checkbox visual */}
                                  <div className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-full border border-solid ${isSelected ? 'border-[#1A4331]' : 'border-gray-300'} ${!option.isMultiSelect && isSelected ? 'border-[5px]' : ''}`}>
                                    {option.isMultiSelect && isSelected && (
                                       <div className="w-2.5 h-2.5 bg-[#1A4331] rounded-sm"></div>
                                    )}
                                  </div>
                                  
                                  {/* Thumbnail */}
                                  {val.imageUrl && (
                                    <img
                                      src={getMediaUrl(val.imageUrl)}
                                      alt={val.valueName}
                                      className={`w-10 h-10 object-cover rounded-xl shrink-0 transition-all ${isSelected ? "border-2 border-[#1A4331]/30 shadow-sm scale-110" : "opacity-80 grayscale hover:grayscale-0"}`}
                                    />
                                  )}

                                  <span className={`text-sm font-semibold ${isSelected ? 'text-[#1A4331]' : 'text-[#5c4033]'}`}>{val.valueName}</span>
                               </div>
                               {val.extraPrice > 0 && (
                                 <span className="text-xs font-bold text-[#8A9A7A]">
                                   +{formatPrice(val.extraPrice)}
                                 </span>
                               )}
                               {/* Hidden actual input */}
                               <input 
                                 type={option.isMultiSelect ? "checkbox" : "radio"}
                                 name={`opt-${option.id}`}
                                 checked={isSelected}
                                 onChange={() => handleOptionToggle(option.id, val.id, option.isMultiSelect)}
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
            <div className="p-5 md:px-8 md:py-6 border-t border-[#1A4331]/10 bg-white shrink-0 flex items-center gap-4">
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
                className="flex-1 bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] h-12 md:h-14 rounded-full font-bold text-sm md:text-base transition-all shadow-md"
              >
                {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />}
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
