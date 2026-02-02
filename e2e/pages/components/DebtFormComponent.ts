import { Page, Locator, expect } from '@playwright/test';

export interface DebtFormData {
  name: string;
  type?: 'credit_card' | 'personal_loan' | 'other';
  balance: string;
  interestRate: string;
  minimumPayment: string;
}

/**
 * Debt Form (MUI Dialog). Web form uses labels and data-testid.
 */
export class DebtFormComponent {
  readonly page: Page;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly balanceInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByRole('dialog');
    this.nameInput = page.getByTestId('debt-form-name');
    this.balanceInput = page.getByTestId('debt-form-balance');
    this.submitButton = page.getByTestId('debt-form-submit');
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.deleteButton = page.getByRole('button', { name: /delete debt/i });
  }

  /** Numeric inputs: interest rate, balance, minimum payment (by label). */
  get interestRateInput(): Locator {
    return this.form.getByLabel(/interest rate/i);
  }

  get minimumPaymentInput(): Locator {
    return this.form.getByLabel(/minimum payment/i);
  }

  /** All three numeric fields in order for validation tests. */
  get numericInputs(): Locator {
    return this.form.locator('input[inputmode="decimal"]');
  }

  getTypeRadio(type: DebtFormData['type']): Locator {
    const labels: Record<NonNullable<DebtFormData['type']>, string> = {
      credit_card: 'Credit Card',
      personal_loan: 'Personal Loan',
      other: 'Other',
    };
    return this.form.getByRole('radio', { name: labels[type!] });
  }

  async waitForOpen(): Promise<void> {
    await expect(this.nameInput).toBeVisible({ timeout: 5000 });
  }

  async waitForClose(): Promise<void> {
    await expect(this.nameInput).not.toBeVisible({ timeout: 5000 });
  }

  async fill(data: DebtFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.type) {
      await this.getTypeRadio(data.type).click();
    }
    await this.interestRateInput.fill(data.interestRate);
    await this.balanceInput.fill(data.balance);
    await this.minimumPaymentInput.fill(data.minimumPayment);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.waitForClose();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForClose();
  }

  async delete(): Promise<void> {
    await this.deleteButton.click();
    await this.waitForClose();
  }

  async fillAndSubmit(data: DebtFormData): Promise<void> {
    await this.fill(data);
    await this.submit();
  }

  async assertValues(expected: Partial<DebtFormData>): Promise<void> {
    if (expected.name) {
      await expect(this.nameInput).toHaveValue(expected.name);
    }
  }

  async clearName(): Promise<void> {
    await this.nameInput.clear();
  }

  async assertSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async assertSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async assertDeleteVisible(): Promise<void> {
    await expect(this.deleteButton).toBeVisible({ timeout: 3000 });
  }

  async assertFormElements(): Promise<void> {
    await expect(this.form.getByText('Debt Type')).toBeVisible();
    await expect(this.getTypeRadio('credit_card')).toBeVisible();
    await expect(this.getTypeRadio('personal_loan')).toBeVisible();
    await expect(this.getTypeRadio('other')).toBeVisible();
    await expect(this.balanceInput).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }
}
