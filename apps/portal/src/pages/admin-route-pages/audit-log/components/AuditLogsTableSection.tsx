import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/custom/EmptyState";
import PaginationComponent from "@/components/custom/PaginationComponent"; // Import component phân trang bạn đã viết
import type { AuditLog } from "@/types/audit-log/AuditLog";

interface AuditLogsTableSectionProps {
  loading: boolean;
  items: AuditLog[];
  totalElements: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

// Hàm format ngày tháng từ timestamp
const formatDate = (dateString: string | number) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

export default function AuditLogsTableSection({
  loading,
  items,
  totalElements,
  pageSize,
  currentPage,
  onPageChange,
  onSizeChange,
}: AuditLogsTableSectionProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden border border-emerald-200 rounded-[2rem] bg-white shadow-sm flex flex-col">
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-slate-500 mt-4 font-bold italic tracking-wide">
              Đang tải nhật ký...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <EmptyState
              title="Chưa có dữ liệu"
              description="Hệ thống chưa ghi nhận hoạt động nào."
              className="border-none shadow-none bg-white"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 transition-colors">
                <TableRow className="hover:bg-transparent border-emerald-100">
                  <TableHead className="w-[80px] font-black text-slate-700 pl-6 border-r border-emerald-100 uppercase text-[11px] tracking-wider text-left">
                    Hành động
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-100 uppercase text-[11px] tracking-wider text-left pl-4">
                    Thực thể
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-100 uppercase text-[11px] tracking-wider text-left pl-4">
                    ID Thực thể
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-100 uppercase text-[11px] tracking-wider text-left pl-4">
                    Người thực hiện
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-100 uppercase text-[11px] tracking-wider text-left pl-4">
                    Thời gian
                  </TableHead>
                  <TableHead className="font-black text-slate-700 pr-6 uppercase text-[11px] tracking-wider text-left pl-4">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((log) => (
                  <TableRow
                    key={log.id}
                    className="group hover:bg-slate-50/50 border-emerald-100 transition-colors"
                  >
                    <TableCell className="pl-6 border-r border-emerald-50/50 font-bold text-[13px]">
                      {/* Có thể đổi màu chữ dựa vào action: CREATE (xanh), DELETE (đỏ) */}
                      <span
                        className={`px-2 py-1 rounded-md ${
                          log.action === "CREATE"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.action === "DELETE"
                              ? "bg-red-100 text-red-700"
                              : log.action === "UPDATE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-[14px] font-semibold text-slate-700 border-r border-emerald-50/50 text-left pl-4">
                      {log.entityType}
                    </TableCell>
                    <TableCell className="text-[13px] font-mono text-slate-500 border-r border-emerald-50/50 text-left pl-4">
                      {log.entityId}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-700 border-r border-emerald-50/50 text-left pl-4">
                      {log.performedBy}
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-500 border-r border-emerald-50/50 text-left pl-4">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-[14px] text-slate-600 text-left pr-6 pl-4 line-clamp-2">
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Tích hợp Pagination Component cực kỳ mượt mà vào đây */}
      {!loading && items.length > 0 && (
        <PaginationComponent
          totalCount={totalElements}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
          showItemsPerPageSelect={true}
        />
      )}
    </div>
  );
}
