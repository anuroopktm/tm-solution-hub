import { test, expect } from "@playwright/test";
import { MOCK_USER, MOCK_CATEGORIES } from "./fixtures/mock-data";

test.describe("Authentication Flows", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);

    // Verify login form elements are visible
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();
  });

  test("shows client-side validation errors when submitting empty form", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    // Field level validation messages
    await expect(page.getByText(/invalid email|required|at least/i).first()).toBeVisible();
  });

  test("allows successful login and redirects to dashboard", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          token_type: "bearer",
        }),
      });
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_CATEGORIES),
      });
    });

    await page.route("**/api/dashboard/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "OK",
          data: {
            totals: { solutions: 5, categories: 3, recent: 2 },
            categories_distribution: [],
          },
        }),
      });
    });

    await page.route("**/api/solutions/recent", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ detail: "OK", data: [] }),
      });
    });

    await page.goto("/login");
    await page.locator("#email").fill("admin@thoughtminds.io");
    await page.locator("#password").fill("Password123!");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
