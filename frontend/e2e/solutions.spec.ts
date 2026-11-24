import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/mock-data";

test.describe("Solutions & Create Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("allows navigating the multi-step solution creation wizard", async ({ page }) => {
    await page.goto("/solutions/new");

    // Verify Step 1: General Info
    await expect(page.getByText(/general information/i).first()).toBeVisible();
    await expect(page.getByLabel(/title/i).first()).toBeVisible();

    // Fill Title
    await page.getByLabel(/title/i).first().fill("New Cloud Telemetry Service");
  });
});
