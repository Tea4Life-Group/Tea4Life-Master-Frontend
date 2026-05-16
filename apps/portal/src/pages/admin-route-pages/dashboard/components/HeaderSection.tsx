import React from "react";
import { LayoutDashboard } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-emerald-600" />
        Tổng quan hệ thống
      </h1>
      <p className="text-sm text-slate-500">
        Số liệu cập nhật tính đến ngày hôm nay.
      </p>
    </div>
  );
};

export default HeaderSection;
