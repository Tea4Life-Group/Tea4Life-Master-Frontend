import React from "react";
import { Users } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Users className="h-6 w-6 text-emerald-600" />
        Quản lý người dùng
      </h1>
      <p className="text-sm text-slate-500">
        Danh sách người dùng và quản lý tài khoản trong hệ thống.
      </p>
    </div>
  );
};

export default HeaderSection;
