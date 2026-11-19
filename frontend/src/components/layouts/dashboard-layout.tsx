import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RouteLoading } from "@/routes/route-loading";
import { ContentErrorBoundary } from "@/components/common/content-error-boundary";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <ContentErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </ContentErrorBoundary>
      </SidebarInset>
    </SidebarProvider>
  );
}
