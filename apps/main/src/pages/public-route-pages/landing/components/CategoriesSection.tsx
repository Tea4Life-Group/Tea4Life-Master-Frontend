import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getProductCategoriesApi } from "@/services/productApi";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import { handleError, getMediaUrl } from "@/lib/utils";

// Lớp màu nền tạo hiệu ứng đan xen mềm mại
const bgClasses = [
  "bg-[#e0c4a4]",
  "bg-[#d4b998]",
  "bg-[#c9ad8c]",
  "bg-[#be9f7f]",
];

export function CategoriesSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getProductCategoriesApi();
      // Chúng ta sẽ lấy tối đa 4 danh mục cho landing page để bố cục đẹp nhất
      setCategories((res.data.data || []).slice(0, 4));
    } catch (error) {
      handleError(error, "Không thể tải danh mục sản phẩm");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#5c4033]/20 pb-6 gap-4">
        <div>
          <p className="text-[#d97743] font-bold text-lg mb-2 flex items-center gap-2">
            <Leaf className="w-5 h-5" /> KHÁM PHÁ THIÊN NHIÊN
          </p>
          <h3 className="text-4xl md:text-5xl font-bold font-sans text-[#5c4033]">
            Thực Đơn Của Chúng Tôi
          </h3>
        </div>
        <Link
          to="/categories"
          className="text-lg font-semibold bg-[#5c4033] text-[#F8F5F0] px-6 py-2.5 rounded-full hover:bg-[#d97743] flex items-center gap-2 w-fit transition-colors shadow-sm hover:shadow-md"
        >
          Xem Tất Cả <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/shop?categoryId=${cat.id}`)}
            className="pixel-border bg-white rounded-3xl flex flex-col items-center p-8 cursor-pointer group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background sliding effect */}
            <div
              className={`absolute inset-0 ${bgClasses[i % bgClasses.length]} translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out opacity-90`}
            />

            <div className="w-24 h-24 mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 z-10 drop-shadow-md flex items-center justify-center bg-[#F8F5F0] rounded-full border border-[#5c4033]/10 overflow-hidden shrink-0">
              {cat.iconUrl ? (
                <img
                  src={getMediaUrl(cat.iconUrl)}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Leaf className="w-10 h-10 text-[#d97743]" />
              )}
            </div>

            <span className="font-semibold tracking-wide text-center w-full bg-[#5c4033] text-[#F8F5F0] py-2.5 rounded-2xl group-hover:bg-[#d97743] shadow-sm text-[16px] z-10 transition-all px-4">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
