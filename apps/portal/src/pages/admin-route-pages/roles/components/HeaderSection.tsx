import React from "react";
import { UserCog } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <UserCog className="h-6 w-6 text-emerald-600" />
        Quản lý chức vụ
      </h1>
      <p className="text-sm text-slate-500">
        Danh sách các chức vụ và phân quyền trong hệ thống.
      </p>
    </div>
  );
};

export default HeaderSection;
