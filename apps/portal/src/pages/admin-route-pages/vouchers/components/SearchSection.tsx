import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  keyword: string;
  setKeyword: (val: string) => void;
}

export default function SearchSection({
  keyword,
  setKeyword,
}: SearchSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 px-4">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        <input
          type="text"
          placeholder="Tìm kiếm phiếu giảm giá..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-2xl border-none outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white placeholder:text-slate-400 text-slate-700 shadow-sm transition-all"
        />
      </div>
      <Button
        variant="outline"
        className="h-12 px-6 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 font-medium whitespace-nowrap hidden sm:flex"
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Bộ lọc
      </Button>
    </div>
  );
}
