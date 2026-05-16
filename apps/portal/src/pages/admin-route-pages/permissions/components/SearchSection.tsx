import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="flex bg-white p-4 rounded-3xl border border-emerald-50 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc nhóm quyền hạn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 border-slate-100 focus-visible:ring-emerald-500 rounded-2xl bg-slate-50 border-none shadow-inner h-12 text-base"
        />
      </div>
    </div>
  );
};

export default SearchSection;
