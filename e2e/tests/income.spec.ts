import { test, expect } from '../fixtures';

test.describe('Income - List and Summary', () => {
  test.beforeEach(async ({ incomePage }) => {
    await incomePage.goto();
  });

  test('shows empty state when no incomes exist', async ({ incomePage }) => {
    const hasIncomes = await incomePage.hasIncomes();
    if (!hasIncomes) {
      await incomePage.assertEmptyState();
    }
  });

  test('can navigate to Income from menu', async ({ page, incomePage }) => {
    await page.goto('/');
    await incomePage.navigateViaMenu('Income');
    await incomePage.waitForReady();
    await expect(incomePage.getByTestId('income-page').or(incomePage.getByTestId('income-summary')).first()).toBeVisible();
  });

  test('shows summary with total income when incomes exist', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'Main job', amount: '4000' });
    await incomePage.assertSummaryVisible();
    await incomePage.assertIncomeVisible('Main job');
  });

  test('groups incomes by type with section headers', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'Main job', amount: '5000', typeLabel: 'Salary' });
    await incomePage.addIncome({ name: 'Freelance', amount: '1000', typeLabel: 'Side gig' });
    await incomePage.assertSummaryVisible();
    await expect(incomePage.getByText(/salary/i).first()).toBeVisible({ timeout: 5000 });
    await expect(incomePage.getByText(/side gig/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Income - Add Form', () => {
  test.beforeEach(async ({ incomePage }) => {
    await incomePage.goto();
  });

  test('opens add income form when FAB is clicked', async ({ incomePage }) => {
    await incomePage.openAddForm();
    await expect(incomePage.getByTestId('income-form-name')).toBeVisible();
    await expect(incomePage.getByTestId('income-form-amount')).toBeVisible();
    await expect(incomePage.getByTestId('income-form-submit')).toBeVisible();
    await incomePage.cancelForm();
  });

  test('can cancel add income form', async ({ incomePage }) => {
    await incomePage.openAddForm();
    await incomePage.cancelForm();
    await incomePage.assertEmptyState();
  });

  test('can add income with name and amount', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'Side hustle', amount: '1500' });
    await incomePage.assertIncomeVisible('Side hustle');
    await expect(incomePage.getByTestId('income-summary').getByText(/\$1,500\.00/)).toBeVisible();
  });

  test('can add second income and see total in summary', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'Job A', amount: '3000' });
    await incomePage.addIncome({ name: 'Job B', amount: '2000' });
    await incomePage.assertSummaryVisible();
    await expect(incomePage.getByTestId('income-summary').getByText(/\$5,000\.00/)).toBeVisible();
  });
});

test.describe('Income - Edit and Delete', () => {
  test.beforeEach(async ({ incomePage }) => {
    await incomePage.goto();
  });

  test('can edit an existing income', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'Editable income', amount: '2500' });
    await incomePage.assertIncomeVisible('Editable income');
    await incomePage.openIncomeForEdit('Editable income');
    await incomePage.editIncomeName('Updated income name');
    await incomePage.assertIncomeVisible('Updated income name');
    await incomePage.assertIncomeNotVisible('Editable income');
  });

  test('edit form shows delete button', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'To check delete button', amount: '1000' });
    await incomePage.openIncomeForEdit('To check delete button');
    await expect(incomePage.getByRole('button', { name: /delete income/i })).toBeVisible();
    await incomePage.cancelForm();
  });

  test('can delete income from edit form', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'To delete from form', amount: '800' });
    await incomePage.assertIncomeVisible('To delete from form');
    await incomePage.openIncomeForEdit('To delete from form');
    await incomePage.deleteIncomeFromForm();
    await incomePage.assertIncomeNotVisible('To delete from form');
  });

  test('can delete income via right-click context menu', async ({ incomePage }) => {
    await incomePage.addIncome({ name: 'Right-click delete me', amount: '600' });
    await incomePage.assertIncomeVisible('Right-click delete me');
    await incomePage.deleteIncomeViaContextMenu('Right-click delete me');
    await incomePage.assertIncomeNotVisible('Right-click delete me');
  });
});
