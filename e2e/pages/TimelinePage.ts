import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TimelinePage extends BasePage {
  readonly timelineContainer: Locator;

  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
    this.timelineContainer = this.getByTestId('payoff-timeline');
  }

  async goto(): Promise<void> {
    await this.page.goto('/payoff-timeline');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(this.timelineContainer).toBeVisible({ timeout: 5000 });
  }

  async assertTimelineVisible(): Promise<void> {
    await expect(this.timelineContainer).toBeVisible({ timeout: 5000 });
  }

  async assertMonthHeaderVisible(monthNumber: number): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`^Month ${monthNumber} `) })
    ).toBeVisible();
  }
}
