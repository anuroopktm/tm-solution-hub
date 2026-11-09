import { createBrowserRouter, Navigate } from "react-router-dom";

import { ROUTES } from "./paths";

import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";

import LoginPage from "@/app/login";
import DashboardPage from "@/app/dashboard";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);
