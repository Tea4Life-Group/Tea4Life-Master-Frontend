import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, Users, Plus } from "lucide-react";
import type { StoreResponse } from "@/types/store/StoreResponse";
import EmptyState from "@/components/custom/EmptyState";

interface Props {
  loading: boolean;
  items: StoreResponse[];
  onOpenCreate: () => void;
  onOpenEdit: (item: StoreResponse) => void;
  onOpenDelete: (item: StoreResponse) => void;
  onOpenEmployees: (item: StoreResponse) => void;
}

export default function StoresTableSection({
  loading,
  items,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onOpenEmployees,
}: Props) {
  if (loading) {
    return (
      <div className="py-12 text-center text-emerald-600/60 font-medium">
        Đang tải dữ liệu cửa hàng...
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Chưa có cửa hàng nào"
        description="Bắt đầu thêm chi nhánh đầu tiên của bạn quản lý trên hệ thống."
        actionLabel="Thêm cửa hàng"
        onAction={onOpenCreate}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên cửa hàng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Tọa độ</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-sm text-gray-500">
                  {String(item.id).slice(0, 8) || "N/A"}
                </TableCell>
                <TableCell className="font-semibold text-emerald-800">
                  {item.name}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {item.address}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-xs text-gray-500 gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span title={`${item.latitude}, ${item.longitude}`}>
                      {item.latitude ? Number(item.latitude).toFixed(4) : 0},{" "}
                      {item.longitude ? Number(item.longitude).toFixed(4) : 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 font-medium"
                    onClick={() => onOpenEmployees(item)}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {item.employees?.length || 0} người
                    <Plus className="h-3.5 w-3.5 text-emerald-500" />
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenEdit(item)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
