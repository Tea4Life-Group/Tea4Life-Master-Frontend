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
    <div className="bg-white p-1 rounded-2xl shadow-sm border border-emerald-100/50 flex items-center pr-1 w-full max-w-md">
      <div className="pl-4 text-slate-400">
        <Search className="h-5 w-5" />
      </div>
      <Input
        placeholder="Tìm kiếm..."
        className="border-none shadow-none focus-visible:ring-0 text-slate-600 placeholder:text-slate-400 h-11"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchSection;
