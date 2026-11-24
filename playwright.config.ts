import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['critical.spec.ts', 'security.spec.ts'],
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
