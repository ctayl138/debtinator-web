import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page class for Debtinator Web E2E.
 * Web app uses React Router links for nav (no tab role).
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  abstract goto(): Promise<void>;
  abstract waitForReady(): Promise<void>;

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  getByLabel(text: string | RegExp): Locator {
    return this.page.getByLabel(text);
  }

  async waitForVisible(locator: Locator, timeout = 5000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async isVisible(locator: Locator, timeout = 1000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  /**
   * Navigate to a bottom nav link (Debts or Payoff).
   */
  async navigateToTab(tabName: string | RegExp): Promise<void> {
    await this.page.getByRole('link', { name: tabName }).first().click();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Returns true if the viewport is mobile (<900px), false if desktop (≥900px).
   */
  async isMobileViewport(): Promise<boolean> {
    const width = this.page.viewportSize()?.width ?? 0;
    return width < 900;
  }

  /**
   * Open menu and navigate to a link (sidebar for desktop, hamburger drawer for mobile).
   * Works on both mobile and desktop viewports.
   */
  async navigateViaMenu(linkName: string | RegExp): Promise<void> {
    const isMobile = await this.isMobileViewport();

    if (isMobile) {
      // Mobile: open hamburger menu first
      await this.page.getByLabel(/open menu/i).first().click();
    }

    // Click the link (visible in sidebar on desktop or drawer on mobile)
    // Use .first() to get the nav link, not other elements with the same text
    const link = this.page.getByRole('link', { name: linkName }).first();
    await expect(link).toBeVisible({ timeout: 5000 });
    await link.click();
  }
}
