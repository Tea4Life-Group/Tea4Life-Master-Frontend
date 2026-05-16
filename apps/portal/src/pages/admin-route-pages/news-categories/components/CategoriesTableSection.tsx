import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";
import EmptyState from "@/components/custom/EmptyState";

interface CategoriesTableSectionProps {
  loading: boolean;
  filtered: NewsCategoryResponse[];
  openCreate: () => void;
  openEdit: (item: NewsCategoryResponse) => void;
  openDelete: (item: NewsCategoryResponse) => void;
}

export default function CategoriesTableSection({
  loading,
  filtered,
  openCreate,
  openEdit,
  openDelete,
}: CategoriesTableSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Danh sách danh mục{" "}
            {filtered.length > 0 && `(${filtered.length})`}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Phân loại bài viết tin tức
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200/50 gap-2 px-8 h-12 font-bold transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Thêm danh mục
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
              description="Hiện tại chưa có danh mục tin tức nào."
              actionLabel="Tạo mới"
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
                    ID
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Tên Danh Mục
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Slug
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
                    className="group hover:bg-emerald-50/40 border-emerald-200 transition-colors h-16"
                  >
                    <TableCell className="pl-8 border-r border-emerald-100/50 font-mono text-sm">
                      #{v.id}
                    </TableCell>
                    <TableCell className="text-[14px] font-bold text-slate-700 border-r border-emerald-100/50 text-left pl-6">
                      <div className="font-semibold text-emerald-900">
                        {v.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] font-medium text-slate-500 border-r border-emerald-100/50 text-left pl-6">
                      {v.slug}
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
                {Array.from({ length: Math.max(0, 5 - filtered.length) }).map(
                  (_, index) => (
                    <TableRow
                      key={`empty-${index}`}
                      className="h-16 border-emerald-100/30 hover:bg-transparent"
                    >
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
