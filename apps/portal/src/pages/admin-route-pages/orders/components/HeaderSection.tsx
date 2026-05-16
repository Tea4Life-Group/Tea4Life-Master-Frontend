import React from "react";
import { ShoppingCart } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-emerald-600" />
        Danh sách đơn hàng
      </h1>
      <p className="text-sm text-slate-500">
        Quản lý và theo dõi trạng thái các đơn hàng.
      </p>
    </div>
  );
};

export default HeaderSection;
