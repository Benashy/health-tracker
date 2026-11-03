const { test, expect } = require("@playwright/test");

async function installSyntheticAccount(page, profileId) {
  await page.route("https://**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === "https://benashy.github.io") return route.continue();
    if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/@supabase/supabase-js")) {
      return route.fulfill({ contentType: "application/javascript", body: "window.supabase = { createClient: () => window.HEALTH_TRACKER_SUPABASE_CLIENT };" });
    }
    return route.abort();
  });
  await page.addInitScript(({ profileId }) => {
    const user = {
      id: profileId === "ben" ? "11111111-1111-4111-8111-111111111111" : "22222222-2222-4222-8222-222222222222",
      email: profileId === "ben" ? "ben_ashurst@me.com" : "angelika_kleczka@hotmail.com",
    };
    const session = { user, access_token: "synthetic-test-session" };
    let row = {
      updated_at: "2026-11-01T12:00:00.000Z",
      data: {
        data_version: 2,
        profiles: [{ id: profileId, name: `Demo ${profileId}`, date_of_birth: "1980-01-01", height_cm: 175 }],
        measurements: [], reference_ranges: {}, schedule_state: { snoozes: {} },
        settings: { active_profile_id: profileId, telegram: { chat_id: "10001", linked_at: "2026-10-01T09:00:00.000Z", enabled: true } },
      },
    };
    window.syntheticCloudWrites = [];
    window.HEALTH_TRACKER_SUPABASE_CLIENT = {
      auth: {
        getSession: async () => ({ data: { session }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      },
      from(table) {
        if (table !== "health_dashboard_data") throw new Error("Unexpected synthetic table");
        let update = null;
        const filters = {};
        const query = {
          select() { return query; },
          eq(key, value) { filters[key] = value; return query; },
          update(value) { update = value; return query; },
          async maybeSingle() {
            if (filters.user_id !== user.id) throw new Error("Unexpected synthetic account");
            if (update) {
              if (filters.updated_at !== row.updated_at) return { data: null, error: null };
              row = structuredClone(update);
              window.syntheticCloudWrites.push(structuredClone(row.data));
            }
            return { data: structuredClone(row), error: null };
          },
        };
        return query;
      },
    };
  }, { profileId });
}

for (const profileId of ["ben", "angelika"]) {
  test(`${profileId} can opt in privately without opening Telegram automatically`, async ({ page, context }, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await installSyntheticAccount(page, profileId);
    await page.goto("./index.html?v=0.84", { waitUntil: "networkidle" });
    await expect(page.locator("body")).toHaveClass(/signed-in/);
    await expect(page.locator("#telegramModal")).toBeHidden();

    if (testInfo.project.name === "iphone") {
      await page.locator('[data-mobile-action="menu"]').click();
      await page.locator('[data-menu-action="telegram"]').click();
    } else await page.locator("#telegramOpenButton").click();

    const entry = page.locator("#telegramEntryInput");
    await expect(page.locator("#telegramModal")).toBeVisible();
    await expect(entry).toBeVisible();
    await expect(entry).not.toBeChecked();
    await entry.check();
    await expect(page.locator("#telegramStatus")).toHaveText("Telegram entry enabled.");
    expect(await page.evaluate(() => window.syntheticCloudWrites.at(-1).settings.telegram.measurement_entry_enabled)).toBe(true);
    expect(await page.evaluate(() => window.syntheticCloudWrites.at(-1).profiles.map((profile) => profile.id))).toEqual([profileId]);
    await entry.uncheck();
    await expect(page.locator("#telegramStatus")).toHaveText("Telegram entry disabled.");
    expect(await page.evaluate(() => window.syntheticCloudWrites.at(-1).settings.telegram.measurement_entry_enabled)).toBe(false);

    const overflow = await page.locator("#telegramPanel").evaluate((panel) => panel.scrollWidth - panel.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("telegram-settings.png") });
    await context.setOffline(true);
    await expect(entry).toBeDisabled();
    await context.setOffline(false);
    expect(errors).toEqual([]);
  });
}
