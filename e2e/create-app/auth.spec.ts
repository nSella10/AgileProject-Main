import { test, expect } from "@playwright/test";

const APP = "http://localhost:3001";
const API = "http://localhost:8000/api";

/** Generate unique credentials per test run. */
function uniqueUser() {
  const id = `pw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    firstName: "Test",
    lastName: "User",
    email: `${id}@test.guessify.com`,
    password: "SecurePass123!",
  };
}

test.describe("Authentication", () => {
  test.describe("Login page", () => {
    test("renders login form with all fields", async ({ page }) => {
      await page.goto(`${APP}/login`);

      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in/i })
      ).toBeVisible();
      await expect(page.getByText(/create one here/i)).toBeVisible();
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.goto(`${APP}/login`);

      await page.locator("#email").fill("nonexistent@test.com");
      await page.locator("#password").fill("wrongpassword");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show error message and stay on login page
      await expect(page.locator("text=Invalid")).toBeVisible({
        timeout: 5_000,
      });
    });

    test("shows error for empty submission", async ({ page }) => {
      await page.goto(`${APP}/login`);

      // Click sign in without filling fields — HTML5 validation should block,
      // but if it doesn't, we should see an error state
      await page.locator("#email").fill("");
      await page.locator("#password").fill("");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should remain on login page
      expect(page.url()).toContain("/login");
    });

    test("navigates to register page", async ({ page }) => {
      await page.goto(`${APP}/login`);

      await page.getByText(/create one here/i).click();
      await page.waitForURL("**/register");
      await expect(page.locator("#firstName")).toBeVisible();
    });
  });

  test.describe("Registration page", () => {
    test("renders registration form with all fields", async ({ page }) => {
      await page.goto(`${APP}/register`);

      await expect(page.locator("#firstName")).toBeVisible();
      await expect(page.locator("#lastName")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#confirmEmail")).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.locator("#confirmPassword")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /create my account/i })
      ).toBeVisible();
    });

    test("successfully registers a new user", async ({ page }) => {
      const user = uniqueUser();
      await page.goto(`${APP}/register`);

      await page.locator("#firstName").fill(user.firstName);
      await page.locator("#lastName").fill(user.lastName);
      await page.locator("#email").fill(user.email);
      await page.locator("#confirmEmail").fill(user.email);
      await page.locator("#password").fill(user.password);
      await page.locator("#confirmPassword").fill(user.password);
      await page.getByRole("button", { name: /create my account/i }).click();

      // Should show success message
      await expect(page.getByText(/welcome to guessify/i)).toBeVisible({
        timeout: 10_000,
      });
    });

    test("shows error for mismatched emails", async ({ page }) => {
      await page.goto(`${APP}/register`);

      await page.locator("#firstName").fill("Test");
      await page.locator("#lastName").fill("User");
      await page.locator("#email").fill("test@test.com");
      await page.locator("#confirmEmail").fill("different@test.com");
      await page.locator("#password").fill("password123");
      await page.locator("#confirmPassword").fill("password123");
      await page.getByRole("button", { name: /create my account/i }).click();

      // Should show error and remain on register page
      await expect(page.getByText(/match/i)).toBeVisible({ timeout: 5_000 });
    });

    test("navigates to login page", async ({ page }) => {
      await page.goto(`${APP}/register`);

      await page.getByText(/sign in here/i).click();
      await page.waitForURL("**/login");
      await expect(page.locator("#email")).toBeVisible();
    });
  });

  test.describe("Login and redirect", () => {
    test("successful login redirects to dashboard", async ({ page }) => {
      // First register a user
      const user = uniqueUser();
      const res = await page.request.post(`${API}/users/register`, {
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          confirmPassword: user.password,
        },
      });
      expect(res.ok()).toBeTruthy();

      // Now login via UI
      await page.goto(`${APP}/login`);
      await page.locator("#email").fill(user.email);
      await page.locator("#password").fill(user.password);
      await page.getByRole("button", { name: /sign in/i }).click();

      await page.waitForURL("**/dashboard", { timeout: 10_000 });
      // Dashboard should show welcome content
      await expect(page.getByText(/guessify/i).first()).toBeVisible();
    });
  });

  test.describe("Auth guards", () => {
    test("unauthenticated user is redirected from protected routes", async ({
      page,
    }) => {
      // Try accessing dashboard without login
      await page.goto(`${APP}/dashboard`);
      await page.waitForURL("**/login", { timeout: 5_000 });

      // Try accessing create page
      await page.goto(`${APP}/create`);
      await page.waitForURL("**/login", { timeout: 5_000 });

      // Try accessing my games
      await page.goto(`${APP}/mygames`);
      await page.waitForURL("**/login", { timeout: 5_000 });
    });

    test("authenticated user is redirected from login to dashboard", async ({
      page,
    }) => {
      // Register and login
      const user = uniqueUser();
      await page.request.post(`${API}/users/register`, {
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          confirmPassword: user.password,
        },
      });

      await page.goto(`${APP}/login`);
      await page.locator("#email").fill(user.email);
      await page.locator("#password").fill(user.password);
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForURL("**/dashboard", { timeout: 10_000 });

      // Now try to go back to login — should redirect to dashboard
      await page.goto(`${APP}/login`);
      await page.waitForURL("**/dashboard", { timeout: 5_000 });
    });
  });
});
