import { createBrowserRouter, Navigate } from "react-router-dom";

import { ROUTES } from "./paths";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { RouteErrorBoundary } from "@/app/route-error-boundary";
import {
  LoginPage,
  DashboardPage,
  ChatPage,
  CategoriesPage,
  CategorySolutionsPage,
  SolutionDetailPage,
  CreateSolutionPage,
  ManageCategoriesPage,
  UsersPage,
} from "./lazy-components";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.CHAT,
            element: <ChatPage />,
          },
          {
            path: ROUTES.CHAT_CONVERSATION,
            element: <ChatPage />,
          },
          {
            path: ROUTES.CATEGORIES,
            element: <CategoriesPage />,
          },
          {
            path: ROUTES.CATEGORY_SOLUTIONS,
            element: <CategorySolutionsPage />,
          },
          {
            path: ROUTES.SOLUTION_DETAIL,
            element: <SolutionDetailPage />,
          },
          {
            path: ROUTES.SOLUTION_CREATE,
            element: <CreateSolutionPage />,
          },
          {
            path: ROUTES.CATEGORY_CREATE,
            element: <ManageCategoriesPage />,
          },
          {
            path: ROUTES.USERS,
            element: <UsersPage />,
          },
        ],
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
