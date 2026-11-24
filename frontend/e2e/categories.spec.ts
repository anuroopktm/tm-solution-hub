import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/mock-data";

test.describe("Category Management & Browsing", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("renders all category cards and solution counts", async ({ page }) => {
    await page.goto("/categories");

    await expect(page.getByText("Cloud Architecture").first()).toBeVisible();
    await expect(page.getByText("AI & Machine Learning").first()).toBeVisible();
    await expect(page.getByText("Data Platform").first()).toBeVisible();
  });
});
