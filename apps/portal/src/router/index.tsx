/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingScreen from "@/components/custom/LoadingScreen";

// ========================================
// LAYOUTS — import trực tiếp
// ========================================
import AdminLayout from "@/layouts/AdminLayout";
import DriverLayout from "@/layouts/DriverLayout";
import StoreLayout from "@/layouts/StoreLayout";
import AuthGuard from "@/components/custom/AuthGuard";
import AppHubPage from "@/pages/app-hub";



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
import AdminAiChatPage from "@/pages/admin-route-pages/ai-chat";

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
  { path: "ai-chat", element: <AdminAiChatPage /> },
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
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/app",
    element: <AuthGuard><AppHubPage /></AuthGuard>,
  },
  {
    path: "/app/admin",
    element: <AuthGuard allowedRoles={["ADMIN"]}><AdminLayout /></AuthGuard>,
    children: adminRoutes,
  },
  {
    path: "/app/drivers",
    element: <AuthGuard allowedRoles={["ADMIN", "DRIVER"]}><DriverLayout /></AuthGuard>,
    children: driverRoutes,
  },
  {
    path: "/app/stores",
    element: <AuthGuard allowedRoles={["ADMIN", "STORE"]}><StoreLayout /></AuthGuard>,
    children: storeRoutes,
  },
]);
