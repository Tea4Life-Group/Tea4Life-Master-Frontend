import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Settings } from "lucide-react";
import ProductOptionsTab from "./components/ProductOptionsTab";
import ProductOptionValuesTab from "./components/ProductOptionValuesTab";

export default function AdminProductOptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={Settings}
        title="Tùy chọn sản phẩm"
        description="Quản lý các tùy chọn và giá trị tùy chọn cho sản phẩm."
        searchPlaceholder="Tìm kiếm tùy chọn..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Tabs Section */}
      <Tabs defaultValue="options" className="w-full">
        <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto">
          <TabsTrigger
            value="options"
            className="rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            Tùy Chọn
          </TabsTrigger>
          <TabsTrigger
            value="values"
            className="rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            Giá Trị Tùy Chọn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="mt-6">
          <ProductOptionsTab />
        </TabsContent>

        <TabsContent value="values" className="mt-6">
          <ProductOptionValuesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
