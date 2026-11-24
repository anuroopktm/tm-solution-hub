import type { Page } from "@playwright/test";

export const MOCK_USER = {
  id: "user-12345",
  email: "admin@thoughtminds.io",
  username: "AdminUser",
  role: "admin",
  is_active: true,
};

export const MOCK_CATEGORIES = [
  {
    id: "cat-cloud-1",
    name: "Cloud Architecture",
    description: "Cloud-native services, microservices and serverless blueprints",
    icon: "Cloud",
    solutions_count: 5,
  },
  {
    id: "cat-ai-2",
    name: "AI & Machine Learning",
    description: "Generative AI, LangGraph multi-agent systems and analytics",
    icon: "Brain",
    solutions_count: 8,
  },
  {
    id: "cat-data-3",
    name: "Data Platform",
    description: "Data lakes, streaming ETL pipelines and lakehouse architectures",
    icon: "Database",
    solutions_count: 3,
  },
];

export const MOCK_SOLUTIONS = [
  {
    id: "sol-1",
    title: "Enterprise Multi-Agent Assistant",
    description: "Orchestrated multi-agent system powered by LangGraph, FastAPI, and PostgreSQL.",
    thumbnail_url: null,
    repository_url: "https://github.com/thoughtminds/multi-agent",
    tech_stack: ["Python", "FastAPI", "LangGraph", "React"],
    categories: [MOCK_CATEGORIES[1]],
    is_active: true,
    created_at: "2026-11-20T10:00:00Z",
  },
  {
    id: "sol-2",
    title: "Cloud Infrastructure Accelerator",
    description: "Terraform modules for multi-region AWS and Kubernetes deployment.",
    thumbnail_url: null,
    repository_url: "https://github.com/thoughtminds/cloud-infra",
    tech_stack: ["Terraform", "AWS", "Kubernetes"],
    categories: [MOCK_CATEGORIES[0]],
    is_active: true,
    created_at: "2026-11-22T12:00:00Z",
  },
];

export const MOCK_DASHBOARD_STATS = {
  totals: {
    solutions: 16,
    categories: 3,
    recent: 5,
  },
  categories_distribution: [
    { id: "cat-cloud-1", name: "Cloud Architecture", total: 5, recent: 2 },
    { id: "cat-ai-2", name: "AI & Machine Learning", total: 8, recent: 3 },
    { id: "cat-data-3", name: "Data Platform", total: 3, recent: 0 },
  ],
};

export async function setupApiMocks(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "mock-access-token");
    localStorage.setItem("refresh_token", "mock-refresh-token");
  });

  const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "*",
  };

  // Only intercept backend API endpoints (http://localhost:8000/api/**)
  // Never intercept frontend static assets or Vite code modules!
  await page.route(/http:\/\/localhost:8000\/api\/.*/, async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }

    if (url.includes("/api/auth/me")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    }

    if (url.includes("/api/categories")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ detail: "OK", data: MOCK_CATEGORIES }),
      });
    }

    if (url.includes("/api/dashboard/stats")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ detail: "OK", data: MOCK_DASHBOARD_STATS }),
      });
    }

    if (url.includes("/api/solutions/recent")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ detail: "OK", data: MOCK_SOLUTIONS }),
      });
    }

    if (url.includes("/api/solutions")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SOLUTIONS),
      });
    }

    if (url.includes("/api/conversations")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ detail: "OK", data: [] }),
      });
    }

    if (url.includes("/api/users")) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify([MOCK_USER]),
      });
    }

    return route.fulfill({
      status: 200,
      headers: corsHeaders,
      contentType: "application/json",
      body: JSON.stringify({ detail: "OK", data: [] }),
    });
  });
}
