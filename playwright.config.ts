import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:5173/disney-bracket/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1920, height: 1080 },
    // Deterministic font rendering for visual regression tests.
    // Without these, headless Chromium on Linux uses subpixel LCD text and
    // subpixel font positioning that varies 1–5% between runs. These flags
    // make text rendering fully deterministic so visual baselines are stable
    // with a tight 2% threshold instead of the 6% needed without them.
    launchOptions: {
      args: [
        '--disable-lcd-text',
        '--disable-font-subpixel-positioning',
        '--force-color-profile=srgb',
      ],
    },
  },
  tsconfig: './e2e/tsconfig.json',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/disney-bracket/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
