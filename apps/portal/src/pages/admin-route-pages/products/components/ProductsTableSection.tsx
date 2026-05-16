import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Image as ImageIcon,
  Plus,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Star,
} from "lucide-react";
import type { ProductResponse } from "@/types/product/ProductResponse";
import { getMediaUrl } from "@/lib/utils";
import EmptyState from "@/components/custom/EmptyState";

function formatPrice(v: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v);
}

interface ProductsTableSectionProps {
  loading: boolean;
  filtered: ProductResponse[];
  openCreate: () => void;
  openEdit: (item: ProductResponse) => void;
  openDelete: (item: ProductResponse) => void;
}

export default function ProductsTableSection({
  loading,
  filtered,
  openCreate,
  openEdit,
  openDelete,
}: ProductsTableSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Danh sách sản phẩm {filtered.length > 0 && `(${filtered.length})`}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý các sản phẩm hiển thị trên trang bán hàng
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200/50 gap-2 px-8 h-12 font-bold transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Tạo sản phẩm mới
        </Button>
      </div>

      <div className="overflow-hidden border border-emerald-200 rounded-[2rem] bg-white shadow-sm min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-slate-500 mt-4 font-bold italic tracking-wide">
              Đang chuẩn bị dữ liệu...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="Chưa có dữ liệu"
              description="Hiện tại chưa có sản phẩm nào phù hợp."
              actionLabel="Bắt đầu tạo mới"
              onAction={openCreate}
              className="border-none shadow-none bg-white"
            />
          </div>
        ) : (
          <div className="flex-1">
            <Table>
              <TableHeader className="bg-emerald-50/50 transition-colors">
                <TableRow className="hover:bg-transparent border-emerald-200">
                  <TableHead className="w-[100px] font-black text-slate-700 pl-8 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left">
                    Ảnh
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Tên sản phẩm
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Danh mục
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Giá bán
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-center px-4 w-[160px]">
                    Tương Tác / Phổ Biến
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Tuỳ chọn
                  </TableHead>
                  <TableHead className="pr-8 font-black text-slate-700 uppercase text-[11px] tracking-wider text-center w-[120px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="group hover:bg-emerald-50/40 border-emerald-200 transition-colors h-20"
                  >
                    <TableCell className="pl-8 border-r border-emerald-100/50">
                      <div className="h-12 w-12 rounded-lg border border-emerald-100 bg-emerald-50 overflow-hidden flex items-center justify-center shrink-0">
                        {p.imageUrl ? (
                          <img
                            src={getMediaUrl(p.imageUrl)}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-emerald-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[14px] font-bold text-slate-700 border-r border-emerald-100/50 text-left pl-6">
                      <div className="font-semibold text-emerald-900">
                        {p.name}
                      </div>
                      <div className="text-slate-400 font-mono text-xs mt-0.5 font-normal">
                        Mã: {p.id.slice(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-500 border-r border-emerald-100/50 text-left pl-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {p.productCategoryName}
                      </span>
                    </TableCell>
                    <TableCell className="text-[14px] font-bold text-emerald-600 border-r border-emerald-100/50 text-left pl-6">
                      {formatPrice(p.basePrice)}
                    </TableCell>
                    <TableCell className="border-r border-emerald-100/50 p-2 align-middle">
                      <div className="flex flex-col gap-2 w-max mx-auto text-xs">
                        <div className="flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200/60 px-2 py-1 rounded-md font-bold shadow-sm shadow-rose-100/50">
                          <Star className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                          <span>{p.popularity?.totalScore ?? 0} Điểm</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-1 text-slate-500 font-medium bg-slate-50/50 py-1 rounded-md border border-slate-100 justify-center">
                          <div
                            className="flex items-center gap-1 tooltip-trigger"
                            title="Lượt hiển thị"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-400" />
                            {p.popularity?.viewCount ?? 0}
                          </div>
                          <div className="w-px h-3 bg-slate-200"></div>
                          <div
                            className="flex items-center gap-1 tooltip-trigger"
                            title="Lượt click"
                          >
                            <MousePointerClick className="h-3 w-3 text-amber-500" />
                            {p.popularity?.clickCount ?? 0}
                          </div>
                          <div className="w-px h-3 bg-slate-200"></div>
                          <div
                            className="flex items-center gap-1 tooltip-trigger"
                            title="Lượt mua"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-600 font-semibold">
                              {p.popularity?.orderCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-500 border-r border-emerald-100/50 text-left pl-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {p.productOptionIds?.length || 0} tuỳ chọn
                      </span>
                    </TableCell>
                    <TableCell className="pr-8 text-center bg-slate-50/30">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          className="h-10 w-10 rounded-2xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 group"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(p)}
                          className="h-10 w-10 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group"
                          title="Xóa"
                        >
                          <Trash2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Empty Spacer Rows */}
                {Array.from({ length: Math.max(0, 5 - filtered.length) }).map(
                  (_, index) => (
                    <TableRow
                      key={`empty-${index}`}
                      className="h-20 border-emerald-100/30 hover:bg-transparent"
                    >
                      <TableCell className="border-r border-emerald-100/20" />
                      <TableCell className="border-r border-emerald-100/20" />
                      <TableCell className="border-r border-emerald-100/20" />
                      <TableCell className="border-r border-emerald-100/20" />
                      <TableCell className="border-r border-emerald-100/20" />
                      <TableCell className="border-r border-emerald-100/20" />
                      <TableCell className="bg-slate-50/10" />
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
