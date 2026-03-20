import { test as base, expect, type Page } from "@playwright/test";

const API_URL = "http://localhost:8000/api";

/** Unique test user credentials (regenerated per test worker). */
function testUser() {
  const id = `pw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    firstName: "Test",
    lastName: "User",
    email: `${id}@test.guessify.com`,
    password: "TestPassword123!",
  };
}

/** Register a user via the API and return credentials. */
export async function registerUser(
  request: Page["request"] | ReturnType<typeof base["request"]>
) {
  const user = testUser();
  const res = await (request as any).post(`${API_URL}/users/register`, {
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
    },
  });
  return { ...user, response: res };
}

/** Login via UI and wait for redirect to dashboard. */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("http://localhost:3001/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}

/** Login via API and inject cookie so subsequent page visits are authed. */
export async function loginViaAPI(page: Page, email: string, password: string) {
  const res = await page.request.post(`${API_URL}/users/login`, {
    data: { email, password },
  });
  expect(res.ok()).toBeTruthy();
  // The server sets an httpOnly cookie — the browser context already has it
  // because page.request shares the browser context's cookie jar.
}

/**
 * Extended test fixture that provides a pre-registered & logged-in user.
 *
 * Usage:
 *   import { test, expect } from "../fixtures/auth";
 *   test("my test", async ({ authedPage, user }) => { ... });
 */
export const test = base.extend<{
  user: ReturnType<typeof testUser>;
  authedPage: Page;
}>({
  user: async ({ page }, use) => {
    const user = testUser();
    // Register via API
    const res = await page.request.post(`${API_URL}/users/register`, {
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
      },
    });
    expect(res.ok()).toBeTruthy();
    await use(user);
  },

  authedPage: async ({ page, user }, use) => {
    // Login via API
    await loginViaAPI(page, user.email, user.password);
    // Set localStorage so Redux picks up the user
    await page.goto("http://localhost:3001/login");
    await page.locator("#email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await use(page);
  },
});

export { expect } from "@playwright/test";
