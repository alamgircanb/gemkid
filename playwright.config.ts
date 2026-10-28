import { defineConfig, devices } from '@playwright/test';

// By default the tests build and serve the production bundle under /kidgem/ (the
// GitHub Pages path). Set PW_BASE_URL to test an already-running server instead.
const external = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: 0,
  workers: process.env.CI ? 4 : undefined,
  // The github reporter turns failures into annotations visible on the workflow run.
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: external ?? 'http://127.0.0.1:4173/kidgem/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: external
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --host 127.0.0.1',
        url: 'http://127.0.0.1:4173/kidgem/',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
