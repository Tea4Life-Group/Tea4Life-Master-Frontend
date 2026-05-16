/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserRouter, Navigate } from "react-router-dom";

// ========================================
// LAYOUTS — import trực tiếp
// ========================================
import RootLayout from "@/layouts/RootLayout";

// ========================================
// PUBLIC PAGES — import trực tiếp (không lazy, chuyển trang tức thì)
// ========================================
import LandingPage from "@/pages/public-route-pages/landing";
import ShopPage from "@/pages/public-route-pages/shop";
import ProductDetail from "@/pages/public-route-pages/product-details/index.tsx";
import BrandsListPage from "@/pages/public-route-pages/brands";
import CategoriesPage from "@/pages/public-route-pages/categories";
import NewsPage from "@/pages/public-route-pages/news";
import NewsDetailPage from "@/pages/public-route-pages/news/detail";
import StoresPage from "@/pages/public-route-pages/stores";

// ========================================
// CUSTOMER PAGES — import trực tiếp (không lazy)
// ========================================
import ProfileLayout from "@/pages/customer-route-pages/profile/layout";
import OrderPage from "@/pages/customer-route-pages/orders";
import OrderDetailPage from "@/pages/customer-route-pages/order-details";
import CartPage from "@/pages/customer-route-pages/cart";
import CheckoutPage from "@/pages/customer-route-pages/checkout";
import GeneralPage from "@/pages/customer-route-pages/profile/general";
import AddressPage from "@/pages/customer-route-pages/profile/address";
import CreateAddressPage from "@/pages/customer-route-pages/profile/address/create";
import EditAddressPage from "@/pages/customer-route-pages/profile/address/edit";
import SecurityPage from "@/pages/customer-route-pages/profile/security";



// --- 1. NHÓM ROUTE CÔNG KHAI (PUBLIC) ---
const publicRoutes = [
  { index: true, element: <LandingPage /> },
  { path: "shop", element: <ShopPage /> },
  { path: "shop/products/:id", element: <ProductDetail /> },
  { path: "brands", element: <BrandsListPage /> },
  { path: "categories", element: <CategoriesPage /> },
  { path: "news", element: <NewsPage /> },
  { path: "news/category/:categorySlug", element: <NewsPage /> },
  { path: "news/:slug", element: <NewsDetailPage /> },
  { path: "places", element: <StoresPage /> },
];

// --- 2. NHÓM ROUTE KHÁCH HÀNG (CUSTOMER) ---
const customerRoutes = [
  { path: "cart", element: <CartPage /> },
  { path: "order", element: <OrderPage /> },
  { path: "order/:id", element: <OrderDetailPage /> },
  { path: "checkout", element: <CheckoutPage /> },
  {
    path: "profile",
    element: <ProfileLayout />,
    children: [
      { index: true, element: <Navigate to="general" replace /> },
      { path: "general", element: <GeneralPage /> },
      { path: "address", element: <AddressPage /> },
      { path: "address/create", element: <CreateAddressPage /> },
      { path: "address/edit/:id", element: <EditAddressPage /> },
      { path: "security", element: <SecurityPage /> },
    ],
  },
];


// --- CẤU TRÌNH ROUTER CHÍNH ---
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [...publicRoutes, ...customerRoutes],
  },
]);
