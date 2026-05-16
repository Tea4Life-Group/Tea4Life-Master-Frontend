import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { ProductOptionResponse } from "@/types/product-option/ProductOptionResponse";
import type { CreateProductOptionRequest } from "@/types/product-option/CreateProductOptionRequest";

interface ProductOptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductOptionRequest, id?: string) => Promise<void>;
  loading: boolean;
  initialData: ProductOptionResponse | null;
}

export default function ProductOptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  initialData,
}: ProductOptionFormModalProps) {
  const [name, setName] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(initialData.name);
        setIsRequired(initialData.isRequired);
        setIsMultiSelect(initialData.isMultiSelect);
        setSortOrder(initialData.sortOrder);
      } else {
        setName("");
        setIsRequired(false);
        setIsMultiSelect(false);
        setSortOrder(0);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên tùy chọn không được để trống.");
      return;
    }
    if (sortOrder < 0) {
      setError("Thứ tự không thể nhỏ hơn 0.");
      return;
    }

    try {
      await onSubmit(
        {
          name: name.trim(),
          isRequired,
          isMultiSelect,
          sortOrder,
        },
        initialData?.id,
      );
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
        <DialogHeader className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <DialogTitle className="text-xl font-bold text-emerald-900">
            {initialData ? "Chỉnh Sửa Tùy Chọn" : "Thêm Tùy Chọn Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitForm}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-emerald-900 font-semibold text-sm"
              >
                Tên Tùy Chọn <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Kích cỡ, Mức đường, Topping..."
                className="border-emerald-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <Label className="text-slate-700 font-medium text-sm flex items-center justify-between">
                  Bắt buộc
                  <Switch
                    checked={isRequired}
                    onCheckedChange={setIsRequired}
                    disabled={loading}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </Label>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Khách hàng bắt buộc phải chọn giá trị (VD: Size).
                </p>
              </div>

              <div className="flex flex-col space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <Label className="text-slate-700 font-medium text-sm flex items-center justify-between">
                  Chọn nhiều
                  <Switch
                    checked={isMultiSelect}
                    onCheckedChange={setIsMultiSelect}
                    disabled={loading}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </Label>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cho phép khách chọn nhiều giá trị cùng lúc (VD: Topping).
                </p>
              </div>
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
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-lg font-medium min-w-[120px]"
            >
              {loading ? (
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
