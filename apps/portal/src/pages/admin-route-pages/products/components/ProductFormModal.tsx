import { useEffect, useMemo, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { handleUpload } from "@/services/storageApi";
import { getMediaUrl } from "@/lib/utils";
import type { CreateProductRequest } from "@/types/product/CreateProductRequest";
import type { ProductResponse } from "@/types/product/ProductResponse";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import type { ProductOptionResponse } from "@/types/product-option/ProductOptionResponse";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  initialData: ProductResponse | null;
  categories: ProductCategoryResponse[];
  options: ProductOptionResponse[];
  onSubmit: (data: CreateProductRequest, id?: string) => Promise<void>;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  loading,
  initialData,
  categories,
  options,
  onSubmit,
}: ProductFormModalProps) {
  const [productCategoryId, setProductCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setImageFile(null);
      return;
    }

    setProductCategoryId(
      initialData?.productCategoryId || (categories[0]?.id ?? ""),
    );
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setBasePrice(initialData?.basePrice || 0);
    setSelectedOptionIds(initialData?.productOptionIds || []);
    setImagePreview(
      initialData?.imageUrl ? getMediaUrl(initialData.imageUrl) : null,
    );
    setImageFile(null);
    setError(null);
  }, [isOpen, initialData, categories]);

  const selectedOptionSet = useMemo(
    () => new Set(selectedOptionIds),
    [selectedOptionIds],
  );

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productCategoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }
    if (!name.trim()) {
      setError("Tên sản phẩm không được để trống.");
      return;
    }
    if (basePrice <= 0) {
      setError("Giá bán phải lớn hơn 0.");
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
        {
          productCategoryId,
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: Number(basePrice),
          imageKey: finalImageKey,
          productOptionIds: selectedOptionIds,
        },
        initialData?.id,
      );
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(err?.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Danh mục</Label>
            <select
              value={productCategoryId}
              onChange={(e) => setProductCategoryId(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Tên sản phẩm</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="rounded-lg focus-visible:ring-emerald-500"
              placeholder="Ví dụ: Trà sữa Ô long..."
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Mô tả</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
              className="rounded-lg focus-visible:ring-emerald-500"
              placeholder="Thông tin chi tiết về sản phẩm..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 font-medium">
                Giá bán (VNĐ)
              </Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                disabled={loading || uploadingImage}
                className="rounded-lg focus-visible:ring-emerald-500"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 font-medium">
                Ảnh sản phẩm (Tuỳ chọn)
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

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">
              Tuỳ chọn áp dụng (size, đường, đá, topping...)
            </Label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              {options.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Không có tuỳ chọn nào.
                </p>
              ) : (
                options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-3 text-sm cursor-pointer group"
                  >
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={selectedOptionSet.has(opt.id)}
                        onChange={() => toggleOption(opt.id)}
                        disabled={loading}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-2 transition-all cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {opt.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {opt.isRequired ? "Bắt buộc • " : "Không bắt buộc • "}
                        {opt.isMultiSelect ? "Chọn nhiều" : "Chọn một"}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || uploadingImage}
              className="rounded-lg"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingImage}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-200 min-w-[100px]"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
