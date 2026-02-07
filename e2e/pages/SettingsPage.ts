import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  readonly appearanceHeader: Locator;
  readonly lightThemeOption: Locator;
  readonly darkThemeOption: Locator;
  readonly systemThemeOption: Locator;

  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
    this.appearanceHeader = this.getByText('Appearance');
    this.lightThemeOption = this.getByText('Light');
    this.darkThemeOption = this.getByText('Dark');
    this.systemThemeOption = this.getByText('System (match device)');
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await this.waitForDrawerClosed();
    await expect(this.appearanceHeader).toBeVisible({ timeout: 5000 });
  }

  async selectLightTheme(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.lightThemeOption.click({ force: true });
  }

  async selectDarkTheme(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.darkThemeOption.click({ force: true });
  }

  async selectSystemTheme(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.systemThemeOption.click({ force: true });
  }

  async toggleAppearanceAccordion(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.page.getByRole('button', { name: /appearance/i }).first().click({ force: true });
  }

  async assertAppearanceVisible(): Promise<void> {
    await expect(this.appearanceHeader).toBeVisible({ timeout: 5000 });
  }

  async assertThemeOptionsVisible(): Promise<void> {
    await expect(this.lightThemeOption).toBeVisible({ timeout: 5000 });
    await expect(this.darkThemeOption).toBeVisible();
    await expect(this.systemThemeOption).toBeVisible();
  }

  async assertThemeOptionsHidden(): Promise<void> {
    await expect(this.lightThemeOption).not.toBeVisible({ timeout: 2000 });
  }

  async expandIncome(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.page.getByRole('button', { name: /income/i }).first().click({ force: true });
    await expect(this.getByTestId('income-input')).toBeVisible({ timeout: 3000 });
  }

  async setMonthlyIncome(amount: string): Promise<void> {
    await this.getByTestId('income-input').fill(amount);
    await this.getByTestId('income-input').blur();
  }

  async expandExportData(): Promise<void> {
    await this.waitForDrawerClosed();
    const exportHeader = this.page.getByRole('button', { name: /export data/i }).first();
    await exportHeader.scrollIntoViewIfNeeded();
    await exportHeader.click({ force: true });
    await expect(exportHeader).toHaveAttribute('aria-expanded', 'true', { timeout: 5000 });
    const exportBtn = this.getByTestId('export-excel-button');
    await exportBtn.scrollIntoViewIfNeeded();
    await expect(exportBtn).toBeVisible({ timeout: 5000 });
  }

  async triggerExport(): Promise<void> {
    await this.getByTestId('export-excel-button').click();
  }

  /** Wait for nav drawer backdrop to close so Settings content is clickable (avoids Firefox/headed intercept). */
  private async waitForDrawerClosed(): Promise<void> {
    const backdrop = this.page.locator('.MuiModal-backdrop');
    await backdrop.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  async expandHelpAndOpenFeaturesGuide(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.page.getByRole('button', { name: /^help$/i }).first().click({ force: true });
    const link = this.getByTestId('help-documentation-link');
    await link.waitFor({ state: 'visible', timeout: 5000 });
    // SPA navigation: use normal click so React Router Link fires; then poll for URL (no full page load)
    await link.click();
    // Wait for navigation to complete
    await this.page.waitForURL(/\/documentation/, { timeout: 10000 });
  }

  async assertHelpSectionVisible(): Promise<void> {
    await this.waitForDrawerClosed();
    await this.page.getByRole('button', { name: /^help$/i }).first().click({ force: true });
    await expect(
      this.getByTestId('help-documentation-link')
    ).toBeVisible({ timeout: 3000 });
  }
}
