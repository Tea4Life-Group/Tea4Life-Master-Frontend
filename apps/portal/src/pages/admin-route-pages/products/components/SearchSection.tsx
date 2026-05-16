import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchSectionProps {
  keyword: string;
  setKeyword: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  keyword,
  setKeyword,
}) => {
  return (
    <div className="bg-white p-1 rounded-2xl shadow-sm border border-emerald-100/50 flex items-center pr-1 w-full max-w-md">
      <div className="pl-4 text-slate-400">
        <Search className="h-5 w-5" />
      </div>
      <Input
        placeholder="Tìm kiếm sản phẩm / danh mục..."
        className="border-none shadow-none focus-visible:ring-0 text-slate-600 placeholder:text-slate-400 h-11"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
    </div>
  );
};

export default SearchSection;
