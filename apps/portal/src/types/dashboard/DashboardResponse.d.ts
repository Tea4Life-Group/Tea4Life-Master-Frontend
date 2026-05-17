export interface StatItem {
  value: number;
  change: string;
  trend: "up" | "down";
  description: string;
}

export interface GeneralStats {
  totalRevenue: StatItem;
  totalOrders: StatItem;
  newCustomers: StatItem;
  completionRate: StatItem;
}

export interface RevenueChartSummary {
  totalRevenue7Days: number;
  averagePerDay: number;
  growthFromLastWeek: string;
}

export interface ChartDataPoint {
  day: string;
  value: number;
  orders: number;
}

export interface RevenueChart {
  summary: RevenueChartSummary;
  chartData: ChartDataPoint[];
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  trend: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "Đã giao" | "Đang giao" | "Đang xử lý" | "Đã hủy";
  date: string; // ISO datetime string
}

export interface QuickStats {
  pending: number;
  shipping: number;
  completed: number;
  cancelled: number;
}

export interface DashboardResponse {
  generalStats: GeneralStats;
  revenueChart: RevenueChart;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  quickStats: QuickStats;
}
