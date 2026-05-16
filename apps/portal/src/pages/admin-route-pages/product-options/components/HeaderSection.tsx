import React from "react";
import { Settings2 } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-emerald-600" />
        Quản lý Tùy Chọn Sản Phẩm
      </h1>
      <p className="text-sm text-slate-500">
        Quản lý các tùy chọn (size, đường, đá, topping...) và giá trị tương ứng.
      </p>
    </div>
  );
};

export default HeaderSection;
