import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { DebtFormComponent, type DebtFormData } from './components/DebtFormComponent';

export class DebtsPage extends BasePage {
  readonly emptyState: Locator;
  readonly summary: Locator;
  readonly addButton: Locator;
  readonly debtForm: DebtFormComponent;

  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
    this.emptyState = this.getByTestId('debts-empty');
    this.summary = this.getByTestId('debts-summary');
    this.addButton = this.getByTestId('add-debt-fab').first();
    this.debtForm = new DebtFormComponent(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(
      this.emptyState
        .or(this.summary)
        .or(this.getByText(/no debts yet|total debt/i))
        .first()
    ).toBeVisible({ timeout: 15000 });
  }

  async hasDebts(): Promise<boolean> {
    return this.isVisible(this.summary, 1000);
  }

  async openAddForm(): Promise<void> {
    await this.addButton.click({ force: true });
    await this.debtForm.waitForOpen();
  }

  async addDebt(data: DebtFormData): Promise<void> {
    await this.openAddForm();
    await this.debtForm.fillAndSubmit(data);
  }

  async openDebtForEdit(debtName: string): Promise<void> {
    await this.getByText(debtName).first().click();
    await expect(this.page.getByText('Edit Debt')).toBeVisible({ timeout: 3000 });
  }

  async editDebt(debtName: string, newData: Partial<DebtFormData>): Promise<void> {
    await this.openDebtForEdit(debtName);
    if (newData.name) {
      await this.debtForm.clearName();
      await this.debtForm.nameInput.fill(newData.name);
    }
    await this.debtForm.submit();
  }

  async deleteDebt(debtName: string): Promise<void> {
    await this.openDebtForEdit(debtName);
    await this.debtForm.delete();
  }

  /**
   * On web: right-click debt card to open delete confirmation dialog.
   */
  async deleteDebtViaLongPress(debtName: string): Promise<void> {
    await this.getByText(debtName).first().click({ button: 'right' });
    await expect(this.getByTestId('delete-debt-dialog')).toBeVisible({ timeout: 3000 });
    await this.getByRole('button', { name: 'Delete', exact: true }).click();
  }

  async assertDebtVisible(debtName: string): Promise<void> {
    await expect(this.getByText(debtName).first()).toBeVisible({ timeout: 5000 });
  }

  async assertDebtNotVisible(debtName: string): Promise<void> {
    await expect(this.getByText(debtName)).not.toBeVisible({ timeout: 5000 });
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.getByText(/no debts yet/i)).toBeVisible();
    await expect(this.getByText(/add your first debt/i)).toBeVisible();
  }

  async assertSummaryVisible(): Promise<void> {
    await expect(this.summary).toBeVisible({ timeout: 5000 });
    await expect(this.getByText(/total debt/i).first()).toBeVisible();
  }

  async assertDebtBalance(balance: string): Promise<void> {
    await expect(this.getByText(balance).first()).toBeVisible();
  }

  async assertDebtAPR(apr: string): Promise<void> {
    await expect(this.getByText(new RegExp(`${apr}.*APR`, 'i'))).toBeVisible();
  }

  async assertSectionHeaders(headers: string[]): Promise<void> {
    for (const header of headers) {
      await expect(this.getByText(header)).toBeVisible({ timeout: 5000 });
    }
  }

  /** Bottom nav: Debts and Payoff links. */
  async assertTabsVisible(): Promise<void> {
    await expect(this.getByRole('link', { name: /debts/i }).first()).toBeVisible();
    await expect(this.getByRole('link', { name: /payoff/i }).first()).toBeVisible();
  }
}
