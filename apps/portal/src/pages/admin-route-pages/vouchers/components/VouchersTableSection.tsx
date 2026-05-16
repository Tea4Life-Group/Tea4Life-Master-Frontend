import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon, Plus } from "lucide-react";
import type { VoucherResponse } from "@/types/voucher/VoucherResponse";
import { getMediaUrl } from "@/lib/utils";
import EmptyState from "@/components/custom/EmptyState";

function formatPrice(v: string | number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(v));
}

interface VouchersTableSectionProps {
  loading: boolean;
  filtered: VoucherResponse[];
  openCreate: () => void;
  openEdit: (item: VoucherResponse) => void;
  openDelete: (item: VoucherResponse) => void;
}

export default function VouchersTableSection({
  loading,
  filtered,
  openCreate,
  openEdit,
  openDelete,
}: VouchersTableSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Danh sách phiếu giảm giá{" "}
            {filtered.length > 0 && `(${filtered.length})`}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý các voucher hiển thị trên hệ thống
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200/50 gap-2 px-8 h-12 font-bold transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Tạo voucher mới
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
              description="Hiện tại chưa có phiếu giảm giá nào phù hợp."
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
                    Mô tả
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-center">
                    Giảm giá
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-right pr-6">
                    Đơn tối thiểu
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-right pr-6">
                    Giảm tối đa
                  </TableHead>
                  <TableHead className="pr-8 font-black text-slate-700 uppercase text-[11px] tracking-wider text-center w-[120px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow
                    key={v.id}
                    className="group hover:bg-emerald-50/40 border-emerald-200 transition-colors h-20"
                  >
                    <TableCell className="pl-8 border-r border-emerald-100/50">
                      <div className="h-12 w-12 rounded-lg border border-emerald-100 bg-emerald-50 overflow-hidden flex items-center justify-center shrink-0">
                        {v.imgUrl ? (
                          <img
                            src={getMediaUrl(v.imgUrl)}
                            alt="voucher"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-emerald-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[14px] font-bold text-slate-700 border-r border-emerald-100/50 text-left pl-6">
                      <div className="font-semibold text-emerald-900 line-clamp-2">
                        {v.description}
                      </div>
                      <div className="text-slate-400 font-mono text-xs mt-0.5 font-normal">
                        Mã: {v.id.slice(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell className="text-[15px] font-bold text-emerald-600 border-r border-emerald-100/50 text-center">
                      {v.discountPercentage}%
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-600 border-r border-emerald-100/50 text-right pr-6">
                      {formatPrice(v.minOrderAmount)}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-600 border-r border-emerald-100/50 text-right pr-6">
                      {formatPrice(v.maxDiscountAmount)}
                    </TableCell>
                    <TableCell className="pr-8 text-center bg-slate-50/30">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(v)}
                          className="h-10 w-10 rounded-2xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 group"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(v)}
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
