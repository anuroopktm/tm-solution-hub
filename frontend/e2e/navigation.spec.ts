import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/mock-data";

test.describe("App Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("renders brand logo, sidebar links, and user menu", async ({ page }) => {
    await page.goto("/dashboard");

    // Brand header
    await expect(page.getByText("Conforge").first()).toBeVisible();

    // Nav links inside sidebar
    await expect(page.locator("[data-sidebar='content']").getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.locator("[data-sidebar='content']").getByRole("link", { name: /all categories/i })).toBeVisible();

    // Dynamic category links in sidebar
    await expect(page.getByRole("link", { name: "Cloud Architecture" })).toBeVisible();
    await expect(page.getByRole("link", { name: "AI & Machine Learning" })).toBeVisible();
  });

  test("navigates cleanly to categories without broken routes", async ({ page }) => {
    await page.goto("/dashboard");
    await page.locator("[data-sidebar='content']").getByRole("link", { name: /all categories/i }).click();
    await expect(page).toHaveURL(/.*\/categories/);

    // Verify page header
    await expect(page.getByText("Solution Categories")).toBeVisible();
  });
});
