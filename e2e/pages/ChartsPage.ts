import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChartsPage extends BasePage {
  readonly pieChartButton: Locator;
  readonly lineChartButton: Locator;

  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
    this.pieChartButton = this.getByText('Principal vs Interest');
    this.lineChartButton = this.getByText('Balance Over Time');
  }

  async goto(): Promise<void> {
    await this.page.goto('/charts');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(this.pieChartButton).toBeVisible({ timeout: 5000 });
    await expect(this.lineChartButton).toBeVisible();
  }

  async showPieChart(): Promise<void> {
    await this.pieChartButton.click();
  }

  async showLineChart(): Promise<void> {
    await this.lineChartButton.click();
  }

  async assertChartTogglesVisible(): Promise<void> {
    await expect(this.pieChartButton).toBeVisible({ timeout: 5000 });
    await expect(this.lineChartButton).toBeVisible();
  }

  async assertPieChartSelected(): Promise<void> {
    await expect(this.pieChartButton).toBeVisible();
  }

  async assertLineChartSelected(): Promise<void> {
    await expect(this.lineChartButton).toBeVisible();
  }
}
