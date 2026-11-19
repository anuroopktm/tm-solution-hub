export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  CHAT_CONVERSATION: "/chat/:conversationId",
  CATEGORIES: "/categories",
  CATEGORY_SOLUTIONS: "/categories/:categoryId",
  SOLUTION_DETAIL: "/solutions/:solutionId",
  SOLUTION_CREATE: "/solutions/new",
  CATEGORY_CREATE: "/categories/new",
  USERS: "/users",
  HOME: "/",
} as const;
