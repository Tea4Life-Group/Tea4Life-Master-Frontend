import React from "react";
import { ShieldCheck } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-emerald-600" />
        Quản lý quyền hạn
      </h1>
      <p className="text-sm text-slate-500">
        Danh sách các quyền truy cập hệ thống dành cho người dùng và nhân viên.
      </p>
    </div>
  );
};

export default HeaderSection;
