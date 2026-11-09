import { Navigate, Outlet } from "react-router-dom";

import { useCurrentUser } from "@/hooks/use-current-user";

export function PublicRoute() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
