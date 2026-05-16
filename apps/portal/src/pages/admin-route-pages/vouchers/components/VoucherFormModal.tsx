import { useEffect, useState, useRef } from "react";
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
import type { CreateVoucherRequest } from "@/types/voucher/CreateVoucherRequest";
import type { VoucherResponse } from "@/types/voucher/VoucherResponse";

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  initialData: VoucherResponse | null;
  onSubmit: (data: CreateVoucherRequest, id?: string) => Promise<void>;
}

export default function VoucherFormModal({
  isOpen,
  onClose,
  loading,
  initialData,
  onSubmit,
}: VoucherFormModalProps) {
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<string>("");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
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

    setDescription(initialData?.description || "");
    setDiscountPercentage(initialData?.discountPercentage?.toString() ?? "");
    setMinOrderAmount(initialData?.minOrderAmount?.toString() ?? "");
    setMaxDiscountAmount(initialData?.maxDiscountAmount?.toString() ?? "");

    setImagePreview(initialData?.imgUrl ? getMediaUrl(initialData.imgUrl) : null);
    setImageFile(null);
    setError(null);
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

    if (!description.trim()) {
      setError("Mô tả không được để trống.");
      return;
    }
    const parsedDiscount = parseInt(discountPercentage, 10);
    const parsedMinOrder = parseInt(minOrderAmount, 10);
    const parsedMaxDiscount = parseInt(maxDiscountAmount, 10);

    if (isNaN(parsedDiscount) || parsedDiscount <= 0 || parsedDiscount > 100) {
      setError("Phần trăm giảm giá phải nằm trong khoảng 1 đến 100.");
      return;
    }
    if (isNaN(parsedMinOrder) || parsedMinOrder < 0) {
      setError("Giá trị đơn tối thiểu không hợp lệ.");
      return;
    }
    if (isNaN(parsedMaxDiscount) || parsedMaxDiscount < 0) {
      setError("Mức giảm tối đa không hợp lệ.");
      return;
    }

    try {
      let finalImageKey = ""; // Must be string based on CreateVoucherRequest type

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
      } else if (initialData && initialData.imgUrl && imagePreview) {
        finalImageKey = initialData.imgUrl;
      }

      await onSubmit(
        {
          id: initialData?.id,
          description: description.trim(),
          discountPercentage: parsedDiscount,
          minOrderAmount: parsedMinOrder,
          maxDiscountAmount: parsedMaxDiscount,
          imgKey: finalImageKey,
        },
        initialData?.id,
      );
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      // BE returns ResponseMessage format or spring DataIntegrityViolation message
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Có lỗi xảy ra",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? "Cập nhật phiếu giảm giá" : "Tạo phiếu giảm giá mới"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Mô tả (Tên Voucher)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={loading}
              className="rounded-lg focus-visible:ring-emerald-500"
              placeholder="VD: Giảm giá 20k cho đơn từ 100k..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 font-medium">Phần trăm giảm (%)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value.replace(/[^0-9]/g, ""))}
                disabled={loading || uploadingImage}
                className="rounded-lg focus-visible:ring-emerald-500"
                placeholder="VD: 10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 font-medium">Đơn tối thiểu (VNĐ)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value.replace(/[^0-9]/g, ""))}
                disabled={loading || uploadingImage}
                className="rounded-lg focus-visible:ring-emerald-500"
                placeholder="VD: 100000"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 font-medium">Giảm tối đa (VNĐ)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value.replace(/[^0-9]/g, ""))}
                disabled={loading || uploadingImage}
                className="rounded-lg focus-visible:ring-emerald-500"
                placeholder="VD: 50000"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Ảnh Voucher (Bắt buộc / Tuỳ chọn)</Label>
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
