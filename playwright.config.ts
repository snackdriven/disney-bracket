import { defineConfig, devices } from '@playwright/test';

// Visual regression tests (visual.spec.ts) use pixel-diff screenshot comparison
// with tight thresholds. They are sensitive to Chromium/font/runner-image drift,
// so they're excluded from CI runs and should be run locally with
// `npx playwright test e2e/visual.spec.ts` (and re-baselined via --update-snapshots
// after intentional UI changes).
const testIgnore = process.env.CI ? ['**/visual.spec.ts'] : undefined;

export default defineConfig({
  testDir: './e2e',
  testIgnore,
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
