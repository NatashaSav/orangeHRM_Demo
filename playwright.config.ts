import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { APP_BASE_URL } from './data/constants';

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
    baseURL: APP_BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
