import { test, expect } from "../fixtures/auth";

const APP = "http://localhost:3001";

test.describe("Dashboard", () => {
  test("displays dashboard with navigation cards", async ({ authedPage }) => {
    const page = authedPage;

    // Should be on dashboard after auth fixture login
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard should have the three main action cards
    await expect(page.getByText(/create new game/i).first()).toBeVisible();
    await expect(page.getByText(/my games/i).first()).toBeVisible();
    await expect(page.getByText(/analytics/i).first()).toBeVisible();
  });

  test("navigates to Create Game page", async ({ authedPage }) => {
    const page = authedPage;

    await page.getByText(/create new game/i).first().click();
    await page.waitForURL("**/create", { timeout: 5_000 });
  });

  test("navigates to My Games page", async ({ authedPage }) => {
    const page = authedPage;

    await page.getByText(/my games/i).first().click();
    await page.waitForURL("**/mygames", { timeout: 5_000 });
  });

  test("navigates to Analytics page", async ({ authedPage }) => {
    const page = authedPage;

    await page.getByText(/analytics/i).first().click();
    await page.waitForURL("**/analytics", { timeout: 5_000 });
  });
});
