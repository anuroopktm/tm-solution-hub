import { lazy } from "react";

// Lazy-loaded route components for code splitting
export const LoginPage = lazy(() => import("@/app/login"));
export const DashboardPage = lazy(() => import("@/app/dashboard"));
export const ChatPage = lazy(() => import("@/app/chat"));
export const CategoriesPage = lazy(() => import("@/app/categories"));
export const CategorySolutionsPage = lazy(
  () => import("@/app/category-solutions"),
);
export const SolutionDetailPage = lazy(() => import("@/app/solution-detail"));
export const CreateSolutionPage = lazy(() => import("@/app/create-solution"));
export const ManageCategoriesPage = lazy(
  () => import("@/app/manage-categories"),
);
export const UsersPage = lazy(() => import("@/app/users"));
