import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PayoffPage extends BasePage {
  readonly emptyState: Locator;
  readonly methodCard: Locator;
  readonly monthlyPaymentInput: Locator;
  readonly menuButton: Locator;

  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
    this.emptyState = this.getByTestId('payoff-empty');
    this.methodCard = this.getByTestId('payoff-method-card');
    this.monthlyPaymentInput = this.getByTestId('monthly-payment-input');
    this.menuButton = this.getByLabel(/open menu/i).first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.navigateToTab(/payoff/i);
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(
      this.emptyState
        .or(this.methodCard)
        .or(this.getByText(/payoff method|no debts yet/i))
        .first()
    ).toBeVisible({ timeout: 10000 });
  }

  async hasDebts(): Promise<boolean> {
    return this.isVisible(this.methodCard, 2000);
  }

  async selectMethod(method: 'snowball' | 'avalanche' | 'custom'): Promise<void> {
    const methodText = method.charAt(0).toUpperCase() + method.slice(1);
    await this.getByRole('button', { name: methodText }).click();
  }

  async setMonthlyPayment(amount: string): Promise<void> {
    await this.monthlyPaymentInput.fill(amount);
  }

  async openSettings(): Promise<void> {
    await this.menuButton.click();
    await this.page.getByRole('link', { name: 'Settings' }).click();
  }

  /** Navigate to Charts (link on Payoff page when plan is valid, or via URL). */
  async openCharts(): Promise<void> {
    const chartsLink = this.page.getByRole('link', { name: 'Charts' }).first();
    await expect(chartsLink).toBeVisible({ timeout: 5000 });
    await chartsLink.click();
  }

  async openTimeline(): Promise<void> {
    const timelineLink = this.page.getByRole('link', { name: 'Timeline' }).first();
    await expect(timelineLink).toBeVisible({ timeout: 5000 });
    await timelineLink.click();
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.getByText(/no debts yet/i)).toBeVisible();
  }

  async assertMethodSelectorVisible(): Promise<void> {
    await expect(this.methodCard).toBeVisible({ timeout: 5000 });
    await expect(this.getByText('Payoff Method')).toBeVisible();
    await expect(this.getByText('Snowball')).toBeVisible();
    await expect(this.getByText('Avalanche')).toBeVisible();
    await expect(this.getByText('Custom')).toBeVisible();
  }

  async assertMethodDescription(method: 'snowball' | 'avalanche' | 'custom'): Promise<void> {
    const descriptions: Record<string, RegExp> = {
      snowball: /smallest balances first/i,
      avalanche: /highest interest rates first/i,
      custom: /set the order/i,
    };
    await expect(this.getByText(descriptions[method])).toBeVisible();
  }

  async assertMonthlyPaymentSectionVisible(): Promise<void> {
    await expect(this.getByText('Monthly Payment', { exact: true })).toBeVisible();
    await expect(this.monthlyPaymentInput).toBeVisible();
    await expect(this.getByText(/minimum payments total/i)).toBeVisible();
  }

  async assertSummaryVisible(): Promise<void> {
    await expect(this.getByText('Payoff Summary')).toBeVisible({ timeout: 5000 });
    await expect(this.getByText(/time to payoff:/i)).toBeVisible();
    await expect(this.getByText(/total interest:/i)).toBeVisible();
  }

  async assertMenuButtonVisible(): Promise<void> {
    await expect(this.menuButton).toBeVisible({ timeout: 5000 });
  }

  async assertChartsButtonVisible(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'Charts' }).first()).toBeVisible({
      timeout: 5000,
    });
  }

  async assertTimelineButtonVisible(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'Timeline' }).first()).toBeVisible({
      timeout: 5000,
    });
  }

  async assertMonthlyPaymentValue(value: string): Promise<void> {
    await expect(this.monthlyPaymentInput).toHaveValue(value);
  }

  /** Open menu and click Features Guide link. */
  async openHelp(): Promise<void> {
    await this.menuButton.click();
    await this.page.getByRole('link', { name: 'Features Guide' }).click();
  }

  async assertIncomeInsightsVisible(): Promise<void> {
    const incomeCard = this.getByTestId('income-insights-card');
    await expect(incomeCard).toBeVisible({ timeout: 5000 });
    await expect(incomeCard.getByText('Income Insights')).toBeVisible();
  }
}
