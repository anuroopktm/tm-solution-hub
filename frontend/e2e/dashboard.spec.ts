import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/mock-data";

test.describe("Dashboard Metrics & Solutions Overview", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("displays summary metric cards and values", async ({ page }) => {
    await page.goto("/dashboard");

    // Check metric totals
    await expect(page.getByText(/total solutions/i).first()).toBeVisible();
    await expect(page.getByText("16").first()).toBeVisible();

    await expect(page.getByText("Categories").first()).toBeVisible();
    await expect(page.getByText("3").first()).toBeVisible();
  });

  test("renders recent technical solutions cards", async ({ page }) => {
    await page.goto("/dashboard");

    // Solution cards
    await expect(page.getByText("Enterprise Multi-Agent Assistant").first()).toBeVisible();
    await expect(page.getByText("Cloud Infrastructure Accelerator").first()).toBeVisible();

    // Verify tag chips
    await expect(page.getByText("FastAPI").first()).toBeVisible();
    await expect(page.getByText("LangGraph").first()).toBeVisible();
  });
});
