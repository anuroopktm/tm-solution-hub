export interface CategoryDistributionItem {
  id: string;
  name: string;
  total: number;
  recent: number;
}

export interface DashboardTotals {
  solutions: number;
  categories: number;
  recent: number;
}

export interface DashboardStats {
  totals: DashboardTotals;
  categories_distribution: CategoryDistributionItem[];
}
