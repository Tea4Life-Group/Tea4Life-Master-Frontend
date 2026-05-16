import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { handleUpload } from "@/services/storageApi";
import { getMediaUrl } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductOptionValueResponse } from "@/types/product-option/ProductOptionValueResponse";
import type { CreateProductOptionValueRequest } from "@/types/product-option/CreateProductOptionValueRequest";
import type { ProductOptionResponse } from "@/types/product-option/ProductOptionResponse";

interface ProductOptionValueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    optionId: string,
    data: CreateProductOptionValueRequest,
    id?: string,
  ) => Promise<void>;
  loading: boolean;
  initialData: ProductOptionValueResponse | null;
  options: ProductOptionResponse[];
  initialOptionId: string | null;
}

export default function ProductOptionValueFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  initialData,
  options,
  initialOptionId,
}: ProductOptionValueFormModalProps) {
  const [optionId, setOptionId] = useState("");
  const [valueName, setValueName] = useState("");
  const [extraPrice, setExtraPrice] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValueName(initialData ? initialData.valueName : "");
      setExtraPrice(initialData ? initialData.extraPrice : 0);
      setSortOrder(initialData ? initialData.sortOrder : 0);
      setOptionId(
        initialData
          ? initialData.productOptionId || initialOptionId || ""
          : initialOptionId || (options.length > 0 ? options[0].id : ""),
      );
      setImagePreview(
        initialData?.imageUrl ? getMediaUrl(initialData.imageUrl) : null,
      );
      setImageFile(null);
      setError(null);
    }
  }, [isOpen, initialData, initialOptionId, options]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionId) {
      setError("Vui lòng chọn Tùy chọn cha.");
      return;
    }
    if (!valueName.trim()) {
      setError("Tên giá trị không được để trống.");
      return;
    }
    if (sortOrder < 0) {
      setError("Thứ tự không thể nhỏ hơn 0.");
      return;
    }

    try {
      let finalImageKey: string | undefined = undefined;

      if (imageFile) {
        setUploadingImage(true);
        const uploadedKey = await handleUpload(imageFile);
        if (uploadedKey) {
          finalImageKey = uploadedKey;
        } else {
          setError("Tải ảnh thất bại, vui lòng thử lại.");
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      } else if (initialData && initialData.imageUrl && !imagePreview) {
        finalImageKey = ""; // Tức là clear ảnh
      }

      await onSubmit(
        optionId,
        {
          productOptionId: optionId,
          valueName: valueName.trim(),
          extraPrice: Number(extraPrice),
          sortOrder: Number(sortOrder),
          imageKey: finalImageKey,
        },
        initialData?.id,
      );
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file hình ảnh hợp lệ.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Kích thước hình ảnh tối đa 2MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
        <DialogHeader className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <DialogTitle className="text-xl font-bold text-emerald-900">
            {initialData ? "Chỉnh Sửa Giá Trị" : "Thêm Giá Trị Mới"}
          </DialogTitle>
          <p className="text-sm text-emerald-700 mt-1">
            Điền thông tin và chọn Tùy chọn cha tương ứng
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmitForm}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-emerald-900 font-semibold text-sm">
                Thuộc Tùy Chọn <span className="text-red-500">*</span>
              </Label>
              <Select
                value={optionId}
                onValueChange={setOptionId}
                disabled={loading}
              >
                <SelectTrigger className="w-full border-emerald-200 focus:ring-emerald-500 rounded-xl">
                  <SelectValue placeholder="Chọn Tùy chọn" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="valueName"
                className="text-emerald-900 font-semibold text-sm"
              >
                Tên Giá Trị <span className="text-red-500">*</span>
              </Label>
              <Input
                id="valueName"
                value={valueName}
                onChange={(e) => setValueName(e.target.value)}
                placeholder="VD: Size S, 50% Đường, Trân Châu Trắng..."
                className="border-emerald-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="extraPrice"
                className="text-emerald-900 font-semibold text-sm"
              >
                Giá Tiền Thêm (VND)
              </Label>
              <Input
                id="extraPrice"
                type="number"
                value={extraPrice}
                onChange={(e) => setExtraPrice(Number(e.target.value))}
                placeholder="VD: 5000, 10000, 0, -5000..."
                className="border-emerald-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                disabled={loading}
              />
              <p className="text-[11px] text-slate-500">
                Có thể nhập số âm (giảm giá) hoặc 0.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="sortOrder"
                className="text-emerald-900 font-semibold text-sm"
              >
                Thứ Tự Hiển Thị
              </Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="border-emerald-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                disabled={loading || uploadingImage}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-emerald-900 font-semibold text-sm">
                Ảnh minh họa (Tuỳ chọn)
              </Label>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center relative overflow-hidden group shrink-0">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa ảnh"
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 text-sm text-slate-700 hover:bg-slate-100"
                    disabled={loading || uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải Ảnh Lên
                  </Button>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    JPG, PNG hoặc WebP. Tối đa 2MB. Tỉ lệ 1:1.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading || uploadingImage}
              className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingImage}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-lg font-medium min-w-[120px]"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang Lưu
                </>
              ) : (
                "Lưu Quyết Định"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
