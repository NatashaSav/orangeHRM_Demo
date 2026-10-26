import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  workers: 1,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 2 : 0,

  reporter: 'html',

  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
