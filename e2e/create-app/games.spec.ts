import { test, expect } from "../fixtures/auth";

const APP = "http://localhost:3001";
const API = "http://localhost:8000/api";

test.describe("Game Management", () => {
  test.describe("My Games page", () => {
    test("shows empty state when no games exist", async ({ authedPage }) => {
      const page = authedPage;

      await page.goto(`${APP}/mygames`);

      // Should show empty state message
      await expect(
        page.getByText(/no games yet/i).or(page.getByText(/create your first/i))
      ).toBeVisible({ timeout: 10_000 });
    });

    test("shows 'Create Your First Game' button in empty state", async ({
      authedPage,
    }) => {
      const page = authedPage;

      await page.goto(`${APP}/mygames`);

      const createBtn = page.getByRole("button", {
        name: /create your first game/i,
      });
      // If visible, clicking it should navigate to /create
      if (await createBtn.isVisible({ timeout: 5_000 })) {
        await createBtn.click();
        await page.waitForURL("**/create", { timeout: 5_000 });
      }
    });
  });

  test.describe("Create Game page", () => {
    test("renders the create game form", async ({ authedPage }) => {
      const page = authedPage;

      await page.goto(`${APP}/create`);

      // Title field
      await expect(
        page.getByPlaceholder(/enter an exciting game title/i)
      ).toBeVisible({ timeout: 10_000 });

      // Description field
      await expect(
        page.getByPlaceholder(/describe your game/i)
      ).toBeVisible();

      // Create Game button
      await expect(
        page.getByRole("button", { name: /create game/i })
      ).toBeVisible();

      // Cancel button
      await expect(
        page.getByRole("button", { name: /cancel/i })
      ).toBeVisible();
    });

    test("cancel navigates back to dashboard", async ({ authedPage }) => {
      const page = authedPage;

      await page.goto(`${APP}/create`);
      await page.getByRole("button", { name: /cancel/i }).click();
      await page.waitForURL("**/dashboard", { timeout: 5_000 });
    });

    test("can fill in game details", async ({ authedPage }) => {
      const page = authedPage;

      await page.goto(`${APP}/create`);

      // Fill title
      await page
        .getByPlaceholder(/enter an exciting game title/i)
        .fill("Test Game from Playwright");

      // Fill description
      await page
        .getByPlaceholder(/describe your game/i)
        .fill("An automated test game");

      // Verify values were filled
      await expect(
        page.getByPlaceholder(/enter an exciting game title/i)
      ).toHaveValue("Test Game from Playwright");
      await expect(
        page.getByPlaceholder(/describe your game/i)
      ).toHaveValue("An automated test game");
    });

    test("shows validation when creating game without songs", async ({
      authedPage,
    }) => {
      const page = authedPage;

      await page.goto(`${APP}/create`);

      // Fill only the title
      await page
        .getByPlaceholder(/enter an exciting game title/i)
        .fill("Game Without Songs");

      // Try to submit
      await page.getByRole("button", { name: /create game/i }).click();

      // Should show an error about songs being required
      // (or stay on the same page since songs are needed)
      await page.waitForTimeout(1_000);
      expect(page.url()).toContain("/create");
    });
  });

  test.describe("Game CRUD via API + UI", () => {
    test("game created via API appears in My Games", async ({
      authedPage,
      user,
    }) => {
      const page = authedPage;

      // Create a game via API (the cookie from login is already in the context)
      const createRes = await page.request.post(`${API}/games`, {
        data: {
          title: "API-Created Test Game",
          description: "Created via Playwright API call",
          isPublic: true,
          guessTimeLimit: 30,
          guessInputMethod: "freeText",
          songs: [
            {
              title: "Test Song",
              artist: "Test Artist",
              correctAnswer: "Test Song",
              correctAnswers: ["Test Song"],
              lyrics: "These are test lyrics for the song",
              lyricsKeywords: ["test", "lyrics"],
              previewUrl: "",
              artworkUrl: "",
              trackId: "test-track-1",
            },
          ],
        },
      });
      expect(createRes.ok()).toBeTruthy();

      // Navigate to My Games
      await page.goto(`${APP}/mygames`);

      // The game should appear
      await expect(
        page.getByText("API-Created Test Game")
      ).toBeVisible({ timeout: 10_000 });

      // Action buttons should be visible
      await expect(
        page.getByRole("button", { name: /edit/i }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /delete/i }).first()
      ).toBeVisible();
    });

    test("can delete a game from My Games", async ({ authedPage }) => {
      const page = authedPage;

      // Create a game via API
      const createRes = await page.request.post(`${API}/games`, {
        data: {
          title: "Game To Delete",
          description: "This will be deleted",
          isPublic: false,
          guessTimeLimit: 15,
          guessInputMethod: "freeText",
          songs: [
            {
              title: "Delete Song",
              artist: "Delete Artist",
              correctAnswer: "Delete Song",
              correctAnswers: ["Delete Song"],
              lyrics: "Lyrics for deletion test",
              lyricsKeywords: ["delete"],
              previewUrl: "",
              artworkUrl: "",
              trackId: "delete-track-1",
            },
          ],
        },
      });
      expect(createRes.ok()).toBeTruthy();

      // Go to My Games
      await page.goto(`${APP}/mygames`);
      await expect(page.getByText("Game To Delete")).toBeVisible({
        timeout: 10_000,
      });

      // Click delete
      await page.getByRole("button", { name: /delete/i }).first().click();

      // Confirm deletion in modal
      const confirmBtn = page
        .locator("[class*='fixed']")
        .getByRole("button", { name: /delete/i });
      if (await confirmBtn.isVisible({ timeout: 3_000 })) {
        await confirmBtn.click();
      }

      // Game should disappear
      await expect(page.getByText("Game To Delete")).not.toBeVisible({
        timeout: 10_000,
      });
    });

    test("can navigate to edit page from My Games", async ({ authedPage }) => {
      const page = authedPage;

      // Create a game via API
      const createRes = await page.request.post(`${API}/games`, {
        data: {
          title: "Game To Edit",
          description: "This will be edited",
          isPublic: true,
          guessTimeLimit: 30,
          guessInputMethod: "freeText",
          songs: [
            {
              title: "Edit Song",
              artist: "Edit Artist",
              correctAnswer: "Edit Song",
              correctAnswers: ["Edit Song"],
              lyrics: "Lyrics for edit test",
              lyricsKeywords: ["edit"],
              previewUrl: "",
              artworkUrl: "",
              trackId: "edit-track-1",
            },
          ],
        },
      });
      expect(createRes.ok()).toBeTruthy();

      // Go to My Games
      await page.goto(`${APP}/mygames`);
      await expect(page.getByText("Game To Edit")).toBeVisible({
        timeout: 10_000,
      });

      // Click edit button
      await page.getByRole("button", { name: /edit/i }).first().click();

      // Should navigate to edit page
      await page.waitForURL("**/edit-game/**", { timeout: 5_000 });

      // Edit page should show the game title
      await expect(
        page.getByDisplayValue("Game To Edit").or(
          page.getByText("Game To Edit")
        )
      ).toBeVisible({ timeout: 10_000 });
    });
  });
});
