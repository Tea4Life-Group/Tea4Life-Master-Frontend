import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/EmptyState";
import type { PermissionResponse } from "@/types/permission/PermissionResponse";

interface TableSectionProps {
  loading: boolean;
  data: PermissionResponse[];
  totalElements: number;
  onCreateOpen: () => void;
  onEdit: (permission: PermissionResponse) => void;
  onDelete: (id: string) => void | Promise<void>;
}

const TableSection: React.FC<TableSectionProps> = ({
  loading,
  data,
  totalElements,
  onCreateOpen,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-6">
      {/* Table Header Controls - Balanced Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Danh sách quyền hạn {totalElements > 0 && `(${totalElements})`}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý và thiết lập các cấp độ truy cập trong hệ thống
          </p>
        </div>

        <Button
          onClick={onCreateOpen}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200/50 gap-2 px-8 h-12 font-bold transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Tạo quyền hạn mới
        </Button>
      </div>

      {/* Main Table Container with Min-Height */}
      <div className="overflow-hidden border border-emerald-200 rounded-[2rem] bg-white shadow-sm min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-slate-500 mt-4 font-bold italic tracking-wide">
              Đang chuẩn bị dữ liệu...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="Chưa có dữ liệu"
              description="Hiện tại chưa có quyền hạn nào được định nghĩa trong hệ thống."
              actionLabel="Bắt đầu tạo mới"
              onAction={onCreateOpen}
              className="border-none shadow-none bg-white"
            />
          </div>
        ) : (
          <div className="flex-1">
            <Table>
              <TableHeader className="bg-emerald-50/50 transition-colors">
                <TableRow className="hover:bg-transparent border-emerald-200">
                  <TableHead className="w-[120px] font-black text-slate-700 pl-8 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left">
                    Mã ID
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Tên quyền hạn
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Nhóm phân loại
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Chi tiết mô tả
                  </TableHead>
                  <TableHead className="pr-8 font-black text-slate-700 uppercase text-[11px] tracking-wider text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-emerald-50/40 border-emerald-200 transition-colors h-20"
                  >
                    <TableCell className="font-mono text-[14px] font-medium text-slate-500 pl-8 border-r border-emerald-100/50 text-left">
                      #{item.id}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-600 border-r border-emerald-100/50 text-left pl-6">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-600 border-r border-emerald-100/50 text-left pl-6">
                      {item.permissionGroup}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-500 border-r border-emerald-100/50 text-left pl-6 max-w-[400px] truncate">
                      {item.description || "—"}
                    </TableCell>
                    <TableCell className="pr-8 text-center bg-slate-50/30">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-2xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 group"
                          onClick={() => onEdit(item)}
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group"
                          onClick={() => onDelete(item.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Empty Spacer Rows */}
                {Array.from({ length: Math.max(0, 5 - data.length) }).map(
                  (_, index) => (
                    <TableRow
                      key={`empty-${index}`}
                      className="h-20 border-emerald-100/30 hover:bg-transparent"
                    >
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
};

export default TableSection;
