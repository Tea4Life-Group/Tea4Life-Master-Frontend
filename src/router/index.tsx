/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingScreen from "@/components/custom/LoadingScreen";

// ========================================
// LAYOUTS — import trực tiếp
// ========================================
import RootLayout from "@/layouts/RootLayout";
import AdminLayout from "@/layouts/AdminLayout";
import DriverLayout from "@/layouts/DriverLayout";
import StoreLayout from "@/layouts/StoreLayout";

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

// ========================================
// ADMIN PAGES — lazy load theo cụm (admin ít khi dùng, tách chunk riêng)
// ========================================
const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

import AdminDashboard from "@/pages/admin-route-pages/dashboard";
import AdminProductsPage from "@/pages/admin-route-pages/products";
import AdminOrdersPage from "@/pages/admin-route-pages/orders";
import AdminUsersPage from "@/pages/admin-route-pages/users";
import AdminReportsPage from "@/pages/admin-route-pages/reports";
import AdminCategoriesPage from "@/pages/admin-route-pages/categories";
import AdminProductOptionsPage from "@/pages/admin-route-pages/product-options";
import AdminPermissionsPage from "@/pages/admin-route-pages/permissions";
import AdminRolesPage from "@/pages/admin-route-pages/roles";
import AdminRoleCreatePage from "@/pages/admin-route-pages/roles/create";
import AdminVouchersPage from "@/pages/admin-route-pages/vouchers";
import AdminStoresPage from "@/pages/admin-route-pages/stores";
import AdminNewsPage from "@/pages/admin-route-pages/news";
import AdminNewsEditorPage from "@/pages/admin-route-pages/news/editor";
import AdminNewsCategoriesPage from "@/pages/admin-route-pages/news-categories";
import AdminDriversPage from "@/pages/admin-route-pages/drivers";

// ========================================
// DRIVER PAGES — lazy load theo cụm
// ========================================
const DriverDashboard = Loadable(
  lazy(() => import("@/pages/driver-route-pages/dashboard")),
);
const DriverOrders = Loadable(
  lazy(() => import("@/pages/driver-route-pages/orders")),
);
const DriverOrderDetail = Loadable(
  lazy(() => import("@/pages/driver-route-pages/order-details")),
);
const AdminAuditLogsPage = Loadable(
  lazy(() => import("@/pages/admin-route-pages/audit-log")),
);

// ========================================
// STORE STAFF PAGES — lazy load
// ========================================
const StoreDashboard = Loadable(
  lazy(() => import("@/pages/store-route-pages/dashboard")),
);
const StoreOrders = Loadable(
  lazy(() => import("@/pages/store-route-pages/orders")),
);

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
  { path: "news", element: <LandingPage /> },
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

// --- 3. NHÓM ROUTE QUẢN TRỊ (ADMIN) ---
const adminRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "products", element: <AdminProductsPage /> },
  { path: "orders", element: <AdminOrdersPage /> },
  { path: "categories", element: <AdminCategoriesPage /> },
  { path: "product-options", element: <AdminProductOptionsPage /> },
  { path: "users", element: <AdminUsersPage /> },
  { path: "reports", element: <AdminReportsPage /> },
  { path: "permissions", element: <AdminPermissionsPage /> },
  { path: "roles", element: <AdminRolesPage /> },
  { path: "roles/create", element: <AdminRoleCreatePage /> },
  { path: "roles/edit/:id", element: <AdminRoleCreatePage /> },
  { path: "vouchers", element: <AdminVouchersPage /> },
  { path: "audit-logs", element: <AdminAuditLogsPage /> },
  { path: "stores", element: <AdminStoresPage /> },
  { path: "news", element: <AdminNewsPage /> },
  { path: "news/create", element: <AdminNewsEditorPage /> },
  { path: "news/edit/:id", element: <AdminNewsEditorPage /> },
  { path: "news-categories", element: <AdminNewsCategoriesPage /> },
  { path: "drivers", element: <AdminDriversPage /> },
];

// --- 4. NHÓM ROUTE TÀI XẾ (DRIVER) ---
const driverRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <DriverDashboard /> },
  { path: "orders", element: <DriverOrders /> },
  { path: "orders/:id", element: <DriverOrderDetail /> },
];

// --- 5. NHÓM ROUTE CỬA HÀNG (STORE STAFF) ---
const storeRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <StoreDashboard /> },
  { path: "orders", element: <StoreOrders /> },
];

// --- CẤU TRÌNH ROUTER CHÍNH ---
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [...publicRoutes, ...customerRoutes],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: adminRoutes,
  },
  {
    path: "/driver",
    element: <DriverLayout />,
    children: driverRoutes,
  },
  {
    path: "/stores",
    element: <StoreLayout />,
    children: storeRoutes,
  },
]);
