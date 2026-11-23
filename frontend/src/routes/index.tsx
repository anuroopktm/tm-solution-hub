import { createBrowserRouter, Navigate } from "react-router-dom";

import { ROUTES } from "./paths";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { RouteErrorBoundary } from "@/app/route-error-boundary";
import {
  CategorySolutionsBreadcrumb,
  SolutionDetailBreadcrumb,
} from "@/components/navigation/global-breadcrumbs";
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
            handle: {
              breadcrumb: "Dashboard",
            },
          },
          {
            path: ROUTES.CHAT,
            element: <ChatPage />,
            handle: {
              hideHeader: true,
            },
          },
          {
            path: ROUTES.CHAT_CONVERSATION,
            element: <ChatPage />,
            handle: {
              hideHeader: true,
            },
          },
          {
            path: ROUTES.CATEGORIES,
            element: <CategoriesPage />,
            handle: {
              breadcrumb: "Categories",
            },
          },
          {
            path: ROUTES.CATEGORY_SOLUTIONS,
            element: <CategorySolutionsPage />,
            handle: {
              breadcrumb: (params: { categoryId?: string }) => (
                <CategorySolutionsBreadcrumb categoryId={params.categoryId} />
              ),
            },
          },
          {
            path: ROUTES.SOLUTION_DETAIL,
            element: <SolutionDetailPage />,
            handle: {
              breadcrumb: (params: { solutionId?: string }) => (
                <SolutionDetailBreadcrumb solutionId={params.solutionId} />
              ),
            },
          },
          {
            path: ROUTES.SOLUTION_CREATE,
            element: <CreateSolutionPage />,
            handle: {
              breadcrumb: [
                { label: "Dashboard", to: ROUTES.DASHBOARD },
                { label: "Create Solution" },
              ],
            },
          },
          {
            path: ROUTES.CATEGORY_CREATE,
            element: <ManageCategoriesPage />,
            handle: {
              breadcrumb: [
                { label: "Categories", to: ROUTES.CATEGORIES },
                { label: "Manage Categories" },
              ],
            },
          },
          {
            path: ROUTES.USERS,
            element: <UsersPage />,
            handle: {
              breadcrumb: "User Management",
            },
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
