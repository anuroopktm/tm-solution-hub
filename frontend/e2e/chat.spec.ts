import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/mock-data";

test.describe("AI Assistant Chat Workspace", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("loads chat page and renders input workspace", async ({ page }) => {
    await page.goto("/chat");

    // Chat prompt input is visible
    const chatInput = page.getByPlaceholder(/message solution hub/i).first();
    await expect(chatInput).toBeVisible();
  });
});
