import { useState, useRef, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import type { CreateProductCategoryRequest } from "@/types/product-category/CreateProductCategoryRequest";
import { handleUpload } from "@/services/storageApi";
import { getMediaUrl } from "@/lib/utils";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductCategoryRequest, id?: string) => Promise<void>;
  loading: boolean;
  initialData: ProductCategoryResponse | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  initialData,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || "");
        setIconPreview(
          initialData.iconUrl ? getMediaUrl(initialData.iconUrl) : null,
        );
        setIconFile(null);
      } else {
        setName("");
        setDescription("");
        setIconPreview(null);
        setIconFile(null);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

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
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleClearImage = () => {
    setIconFile(null);
    setIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ten danh mục không được để trống.");
      return;
    }

    try {
      let finalIconKey: string | undefined = undefined;

      // Handle Image Upload if selected
      if (iconFile) {
        setUploadingImage(true);
        const uploadedKey = await handleUpload(iconFile);
        if (uploadedKey) {
          finalIconKey = uploadedKey;
        } else {
          setError("Tải ảnh thất bại, vui lòng thử lại.");
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      } else if (initialData && initialData.iconUrl && !iconPreview) {
        // user clear image when update
        finalIconKey = "";
      }

      await onSubmit(
        {
          name: name.trim(),
          description: description.trim(),
          iconKey: finalIconKey,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
        <DialogHeader className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <DialogTitle className="text-xl font-bold text-emerald-900">
            {initialData ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitForm}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* Icon Picker */}
            <div className="space-y-3">
              <Label className="text-emerald-900 font-semibold text-sm">
                Icon Danh Mục (Tùy chọn)
              </Label>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex items-center justify-center relative overflow-hidden group">
                  {iconPreview ? (
                    <>
                      <img
                        src={iconPreview}
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
                    <ImageIcon className="h-8 w-8 text-emerald-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải Ảnh Lên
                  </Button>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    JPG, PNG hoặc WebP. Kích thước tối đa 2MB. Khuyên dùng ảnh
                    vuông nền trong suốt.
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

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-emerald-900 font-semibold text-sm"
              >
                Tên Danh Mục <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trà Sữa"
                className="border-emerald-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                disabled={loading || uploadingImage}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="desc"
                className="text-emerald-900 font-semibold text-sm"
              >
                Mô tả (Tùy chọn)
              </Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả ngắn gọn..."
                className="resize-none h-24 border-emerald-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                disabled={loading || uploadingImage}
              />
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
