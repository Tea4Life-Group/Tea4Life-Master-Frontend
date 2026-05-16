// Filter options
export const brands = [
  { value: "all", label: "Tất cả" },
  { value: "tea4life", label: "Tea4Life" },
  { value: "gong-cha", label: "Gong Cha" },
  { value: "phuc-long", label: "Phúc Long" },
  { value: "tocotoco", label: "TocoToco" },
];

export const regions = [
  { value: "all", label: "Tất cả" },
  { value: "tra-sua", label: "Trà sữa" },
  { value: "tra-trai-cay", label: "Trà trái cây" },
  { value: "macchiato", label: "Macchiato" },
  { value: "sua-tuoi", label: "Sữa tươi" },
  { value: "ca-phe", label: "Cà phê" },
];

export const sizes = [
  { value: "all", label: "Tất cả" },
  { value: "S", label: "Size S" },
  { value: "M", label: "Size M" },
  { value: "L", label: "Size L" },
];

export const priceRanges = [
  { value: "all", label: "Tất cả mức giá", min: null, max: null },
  { value: "under-50", label: "Dưới 50.000đ", min: 0, max: 49999 },
  { value: "50-100", label: "50.000đ - 100.000đ", min: 50000, max: 100000 },
  { value: "over-100", label: "Trên 100.000đ", min: 100001, max: null },
];

export const categories = [
  {
    value: "tra-sua",
    label: "Trà Sữa",
    description: "Ngọt ngào béo ngậy, thức uống vạn người mê.",
    icon: "Coffee",
  },
  {
    value: "tra-trai-cay",
    label: "Trà Trái Cây",
    description: "Thanh mát giải nhiệt, đánh tan cơn khát.",
    icon: "Sprout",
  },
  {
    value: "sua-tuoi",
    label: "Sữa Tươi",
    description: "Dòng sữa thanh trùng tươi mới mỗi ngày.",
    icon: "Flower2",
  },
  {
    value: "macchiato",
    label: "Macchiato",
    description: "Lớp kem mặn ngọt hòa quyện cùng cốt trà.",
    icon: "Leaf",
  },
];

// Mock products data
export const allProducts = [
  {
    id: 1,
    name: "Trà Sữa Trân Châu Koko",
    price: 45000,
    size: "M",
    brand: "tea4life",
    region: "tra-sua",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1625865297834-e1cf4dd74b2a?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Hồng Trà Macchiato",
    price: 55000,
    size: "L",
    brand: "tea4life",
    region: "macchiato",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Trà Đào Cam Sả",
    price: 50000,
    size: "M",
    brand: "tea4life",
    region: "tra-trai-cay",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Sữa Tươi Trân Châu Đường Đen",
    price: 60000,
    size: "L",
    brand: "gong-cha",
    region: "sua-tuoi",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1541696490-8744a5dc0228?w=400&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Trà Xanh Sữa",
    price: 40000,
    size: "M",
    brand: "phuc-long",
    region: "tra-sua",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop",
  },
  {
    id: 6,
    name: "Trà Vải Nhiệt Đới",
    price: 45000,
    size: "L",
    brand: "tocotoco",
    region: "tra-trai-cay",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&h=400&fit=crop",
  },
  {
    id: 7,
    name: "Trà Sữa Khoai Môn",
    price: 50000,
    size: "M",
    brand: "gong-cha",
    region: "tra-sua",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=400&fit=crop",
  },
  {
    id: 8,
    name: "Lục Trà Macchiato",
    price: 45000,
    size: "M",
    brand: "tea4life",
    region: "macchiato",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop",
  },
];
