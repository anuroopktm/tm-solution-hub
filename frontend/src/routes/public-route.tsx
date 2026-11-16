import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-current-user";
import { RouteLoading } from "./route-loading";

export function PublicRoute() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Outlet />
    </Suspense>
  );
}
