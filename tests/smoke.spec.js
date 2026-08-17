const { test, expect } = require("@playwright/test");

test("signed-out dashboard is private, stable and responsive", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/index.html?v=0.81", { waitUntil: "networkidle" });
  await expect(page.locator("body")).not.toHaveClass(/app-booting/);
  await expect(page.getByRole("heading", { name: "Health Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.locator("#appVersion")).toHaveText("v0.81");

  await expect(page.locator(".topbar-actions")).toBeHidden();
  await expect(page.locator("#primaryNavigation")).toBeHidden();
  await expect(page.locator("#contentGrid")).toBeHidden();
  await expect(page.locator("#mobileActionBar")).toBeHidden();
  await expect(page.locator("#importReviewModal")).toBeHidden();
  await expect(page.locator("#telegramModal")).toBeHidden();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});

test("versioned shell assets load", async ({ request }) => {
  for (const path of ["/app.js?v=0.81", "/styles.css?v=0.81", "/app-icon.svg?v=0.81", "/manifest.webmanifest?v=0.81"]) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should load`).toBeTruthy();
  }
});
