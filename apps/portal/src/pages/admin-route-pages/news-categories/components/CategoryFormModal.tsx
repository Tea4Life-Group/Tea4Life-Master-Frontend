import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import type { NewsCategoryRequest } from "@/types/news/NewsRequest";
import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  initialData: NewsCategoryResponse | null;
  onSubmit: (data: NewsCategoryRequest, id?: string) => Promise<void>;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  loading,
  initialData,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setName(initialData?.name || "");
    setError(null);
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    try {
      await onSubmit({ name: name.trim() }, initialData?.id);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Có lỗi xảy ra"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? "Cập nhật danh mục" : "Tạo danh mục mới"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Tên danh mục</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="rounded-lg focus-visible:ring-emerald-500"
              placeholder="VD: Khuyến mãi, Trà sữa mới..."
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-200 min-w-[100px]"
            >
              {loading ? (
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
