import { useNavigate } from "react-router-dom";

import { useDashboardStats } from "@/hooks/use-dashboard";
import { useRecentSolutions } from "@/hooks/use-solutions";
import { CategorySolutionsChart } from "@/features/dashboard/components/category-solutions-chart";
import { RecentSolutionsSection } from "@/features/dashboard/components/recent-solutions-section";

export function DashboardView() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentSolutions = [], isLoading: recentLoading } =
    useRecentSolutions();

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive Overview & Category Chart with Summary Cards */}
      <CategorySolutionsChart stats={stats} isLoading={statsLoading} />

      {/* Recently Added Solutions Carousel */}
      <RecentSolutionsSection
        solutions={recentSolutions}
        isLoading={recentLoading}
        onSelectSolution={(id) => navigate(`/solutions/${id}`)}
      />
    </div>
  );
}
