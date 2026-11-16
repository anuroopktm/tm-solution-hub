import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ROUTES } from "./paths";
import { RouteLoading } from "./route-loading";

export function ProtectedRoute() {
  const location = useLocation();
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (isError || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
