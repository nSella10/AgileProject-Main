import { test, expect } from "@playwright/test";

const SITE = "http://localhost:3000";

test.describe("Marketing website – smoke tests", () => {
  test("home page loads successfully", async ({ page }) => {
    await page.goto(SITE);

    // Page should load without errors
    await expect(page).toHaveTitle(/.+/); // any non-empty title
    // Should contain Guessify branding somewhere
    await expect(
      page.getByText(/guessify/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("about page loads", async ({ page }) => {
    await page.goto(`${SITE}/about`);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    await page.goto(`${SITE}/this-does-not-exist-xyz`);
    // Should either show a 404 component or redirect to home
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
