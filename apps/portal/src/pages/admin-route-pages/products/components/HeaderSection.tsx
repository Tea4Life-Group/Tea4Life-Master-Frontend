import React from "react";
import { Package } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Package className="h-6 w-6 text-emerald-600" />
        Quản lý sản phẩm
      </h1>
      <p className="text-sm text-slate-500">
        Quản lý các sản phẩm trong hệ thống.
      </p>
    </div>
  );
};

export default HeaderSection;
