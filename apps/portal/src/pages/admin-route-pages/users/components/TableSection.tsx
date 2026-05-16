import React from "react";
import { Eye, Ban, ShieldCheck, KeyRound, MapPin } from "lucide-react";
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
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";
import { getMediaUrl } from "@/lib/utils";

interface TableSectionProps {
  loading: boolean;
  data: UserSummaryResponse[];
  totalElements: number;
  onDetail: (user: UserSummaryResponse) => void;
  onBan: (user: UserSummaryResponse) => void;
  onAssignRole: (user: UserSummaryResponse) => void;
  onResetPassword: (user: UserSummaryResponse) => void;
  onAddressMenu: (user: UserSummaryResponse) => void;
}

const TableSection: React.FC<TableSectionProps> = ({
  loading,
  data,
  totalElements,
  onDetail,
  onBan,
  onAssignRole,
  onResetPassword,
  onAddressMenu,
}) => {
  return (
    <div className="space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Danh sách người dùng {totalElements > 0 && `(${totalElements})`}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý tài khoản và phân quyền người dùng
          </p>
        </div>
      </div>

      {/* Main Table Container */}
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
              description="Hiện tại chưa có người dùng nào trong hệ thống."
              className="border-none shadow-none bg-white"
            />
          </div>
        ) : (
          <div className="flex-1">
            <Table>
              <TableHeader className="bg-emerald-50/50 transition-colors">
                <TableRow className="hover:bg-transparent border-emerald-200">
                  <TableHead className="w-[80px] font-black text-slate-700 pl-8 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left">
                    Avatar
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Họ và tên
                  </TableHead>
                  <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-left pl-6">
                    Email
                  </TableHead>
                  <TableHead className="pr-8 font-black text-slate-700 uppercase text-[11px] tracking-wider text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-emerald-50/40 border-emerald-200 transition-colors h-20"
                  >
                    <TableCell className="pl-8 border-r border-emerald-100/50">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={getMediaUrl(user.avatarUrl)}
                            alt={user.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-emerald-600 font-bold text-sm">
                            {user.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[14px] font-bold text-slate-700 border-r border-emerald-100/50 text-left pl-6">
                      {user.fullName || "—"}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-slate-500 border-r border-emerald-100/50 text-left pl-6">
                      {user.email}
                    </TableCell>
                    <TableCell className="pr-8 text-center bg-slate-50/30">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-2xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 group/btn"
                          onClick={() => onDetail(user)}
                          title="Chi tiết"
                        >
                          <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-2xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-95 group/btn"
                          onClick={() => onAssignRole(user)}
                          title="Gán quyền"
                        >
                          <ShieldCheck className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-2xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 group/btn"
                          onClick={() => onAddressMenu(user)}
                          title="Quản lý địa chỉ"
                        >
                          <MapPin className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-2xl text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-all active:scale-95 group/btn"
                          onClick={() => onResetPassword(user)}
                          title="Đặt lại mật khẩu"
                        >
                          <KeyRound className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group/btn"
                          onClick={() => onBan(user)}
                          title="Cấm"
                        >
                          <Ban className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
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
