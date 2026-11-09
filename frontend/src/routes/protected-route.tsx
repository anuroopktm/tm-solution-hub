import { Navigate, Outlet } from "react-router-dom";

import { useCurrentUser } from "@/hooks/use-current-user";

export function ProtectedRoute() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
