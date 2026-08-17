const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    baseURL: "http://127.0.0.1:8791",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "iphone",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: "python3 -m http.server 8791 --bind 127.0.0.1",
    url: "http://127.0.0.1:8791/index.html?v=0.81",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
