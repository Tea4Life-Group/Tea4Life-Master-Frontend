import React from "react";
import { BarChart3 } from "lucide-react";

const HeaderSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-emerald-600" />
        Báo cáo doanh thu
      </h1>
      <p className="text-sm text-slate-500">
        Xem và phân tích hiệu quả kinh doanh.
      </p>
    </div>
  );
};

export default HeaderSection;
