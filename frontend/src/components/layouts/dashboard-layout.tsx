import { Suspense } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/common/page-header";
import {
  GlobalBreadcrumbs,
  type AppRouteHandle,
} from "@/components/navigation/global-breadcrumbs";
import { RouteLoading } from "@/routes/route-loading";
import { ContentErrorBoundary } from "@/components/common/content-error-boundary";
import { ChatProvider, ChatWidget } from "@/features/chat";

export function DashboardLayout() {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];
  const handle = currentMatch?.handle as AppRouteHandle | undefined;
  const hideHeader = handle?.hideHeader;

  return (
    <SidebarProvider>
      <ChatProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          {!hideHeader && (
            <PageHeader>
              <GlobalBreadcrumbs />
            </PageHeader>
          )}
          <ContentErrorBoundary>
            <Suspense fallback={<RouteLoading />}>
              <Outlet />
            </Suspense>
          </ContentErrorBoundary>
        </SidebarInset>
        <ChatWidget />
      </ChatProvider>
    </SidebarProvider>
  );
}
