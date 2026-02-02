import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DocumentationPage extends BasePage {
  readonly documentationContainer: Locator;

  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
    this.documentationContainer = this.getByTestId('documentation-page');
  }

  async goto(): Promise<void> {
    await this.page.goto('/documentation');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(this.documentationContainer).toBeVisible({ timeout: 10000 });
    await expect(
      this.documentationContainer.getByRole('heading', { name: 'Features Guide' })
    ).toBeVisible();
  }

  async assertContentVisible(): Promise<void> {
    await expect(this.documentationContainer).toBeVisible();
    await expect(this.documentationContainer.getByRole('heading', { name: 'Debts' })).toBeVisible();
  }
}
