import { test as base } from '@playwright/test';
import {
  DebtsPage,
  PayoffPage,
  ChartsPage,
  IncomePage,
  SettingsPage,
  TimelinePage,
  DocumentationPage,
} from '../pages';

/**
 * Custom Playwright fixtures for Debtinator Web E2E tests.
 */
export const test = base.extend<{
  debtsPage: DebtsPage;
  payoffPage: PayoffPage;
  chartsPage: ChartsPage;
  incomePage: IncomePage;
  settingsPage: SettingsPage;
  timelinePage: TimelinePage;
  documentationPage: DocumentationPage;
}>({
  debtsPage: async ({ page }, use) => {
    await use(new DebtsPage(page));
  },
  payoffPage: async ({ page }, use) => {
    await use(new PayoffPage(page));
  },
  chartsPage: async ({ page }, use) => {
    await use(new ChartsPage(page));
  },
  incomePage: async ({ page }, use) => {
    await use(new IncomePage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  timelinePage: async ({ page }, use) => {
    await use(new TimelinePage(page));
  },
  documentationPage: async ({ page }, use) => {
    await use(new DocumentationPage(page));
  },
});

export { expect } from '@playwright/test';
