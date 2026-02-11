import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface IncomeFormData {
  name?: string;
  amount: string;
  /** Optional: label of type radio (e.g. "Salary", "Side gig") to select. */
  typeLabel?: string;
}

export class IncomePage extends BasePage {
  constructor(page: Parameters<typeof BasePage>[0]) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/income');
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(
      this.getByTestId('income-page').or(this.getByTestId('income-summary')).first()
    ).toBeVisible({ timeout: 10000 });
  }

  async hasIncomes(): Promise<boolean> {
    return this.getByTestId('income-summary').isVisible().catch(() => false);
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.getByTestId('income-page')).toBeVisible();
    await expect(this.getByText(/add income sources|debt-to-income insights/i)).toBeVisible();
  }

  async assertSummaryVisible(): Promise<void> {
    await expect(this.getByTestId('income-summary')).toBeVisible({ timeout: 5000 });
    await expect(this.getByText(/total income/i)).toBeVisible();
  }

  async assertIncomeVisible(name: string): Promise<void> {
    await expect(this.getByText(name).first()).toBeVisible({ timeout: 5000 });
  }

  async assertIncomeNotVisible(name: string): Promise<void> {
    await expect(this.getByText(name)).not.toBeVisible({ timeout: 3000 });
  }

  async openAddForm(): Promise<void> {
    await this.getByTestId('add-income-fab').first().click();
    await expect(this.getByTestId('income-form-amount')).toBeVisible({ timeout: 3000 });
  }

  async addIncome(data: IncomeFormData): Promise<void> {
    await this.openAddForm();
    if (data.typeLabel !== undefined) {
      await this.getByRole('radio', { name: data.typeLabel }).click();
    }
    if (data.name !== undefined) {
      await this.getByTestId('income-form-name').fill(data.name);
    }
    await this.getByTestId('income-form-amount').fill(data.amount);
    await this.getByTestId('income-form-submit').click();
    await expect(this.getByTestId('income-form-submit')).not.toBeVisible({ timeout: 3000 });
  }

  async cancelForm(): Promise<void> {
    await this.getByRole('button', { name: /cancel/i }).click();
    await expect(this.getByTestId('income-form-amount')).not.toBeVisible({ timeout: 2000 });
  }

  async openIncomeForEdit(incomeName: string): Promise<void> {
    await this.getByText(incomeName).first().click();
    await expect(this.getByTestId('income-form-amount')).toBeVisible({ timeout: 3000 });
  }

  async editIncomeName(newName: string): Promise<void> {
    await this.getByTestId('income-form-name').fill(newName);
    await this.getByTestId('income-form-submit').click();
    await expect(this.getByTestId('income-form-submit')).not.toBeVisible({ timeout: 3000 });
  }

  async deleteIncomeFromForm(): Promise<void> {
    await this.getByRole('button', { name: /delete income/i }).click();
    await expect(this.getByTestId('income-form-amount')).not.toBeVisible({ timeout: 2000 });
  }

  async deleteIncomeViaContextMenu(incomeName: string): Promise<void> {
    await this.getByText(incomeName).first().click({ button: 'right' });
    await expect(this.getByTestId('delete-income-dialog')).toBeVisible({ timeout: 3000 });
    await this.getByRole('button', { name: /^delete$/i }).click();
    await expect(this.getByTestId('delete-income-dialog')).not.toBeVisible({ timeout: 2000 });
  }
}
