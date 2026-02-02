import { test, testDebts, createMultiDebtScenario } from '../fixtures';

test.describe('Debts - List and Summary', () => {
  test.beforeEach(async ({ debtsPage }) => {
    await debtsPage.goto();
  });

  test('shows empty state when no debts exist', async ({ debtsPage }) => {
    const hasDebts = await debtsPage.hasDebts();
    if (!hasDebts) {
      await debtsPage.assertEmptyState();
    }
  });

  test('displays both tabs in tab bar', async ({ debtsPage }) => {
    await debtsPage.assertTabsVisible();
  });

  test('shows summary with total debt, count, and avg APR when debts exist', async ({
    debtsPage,
  }) => {
    await debtsPage.addDebt({
      name: 'Summary Test Debt',
      balance: '1000',
      interestRate: '12',
      minimumPayment: '25',
    });
    await debtsPage.assertSummaryVisible();
  });

  test('groups debts by type with section headers', async ({ debtsPage }) => {
    const [creditCard, personalLoan] = createMultiDebtScenario();
    await debtsPage.addDebt(creditCard);
    await debtsPage.addDebt(personalLoan);
    await debtsPage.assertSectionHeaders(['Credit Cards', 'Personal Loans']);
  });
});

test.describe('Debts - Add Debt Form', () => {
  test.beforeEach(async ({ debtsPage }) => {
    await debtsPage.goto();
  });

  test('opens add debt form when FAB is clicked', async ({ debtsPage }) => {
    await debtsPage.openAddForm();
    await debtsPage.debtForm.assertFormElements();
  });

  test('can cancel add debt form', async ({ debtsPage }) => {
    await debtsPage.openAddForm();
    await debtsPage.debtForm.cancel();
  });

  test('can add a new credit card debt', async ({ debtsPage }) => {
    await debtsPage.addDebt(testDebts.creditCard);
    await debtsPage.assertDebtVisible('Test Credit Card');
    await debtsPage.assertDebtBalance('$5,000.00');
    await debtsPage.assertDebtAPR('18.99');
    await debtsPage.assertSummaryVisible();
  });

  test('can add a personal loan', async ({ debtsPage }) => {
    await debtsPage.addDebt(testDebts.personalLoan);
    await debtsPage.assertDebtVisible('Car Loan');
    await debtsPage.assertDebtBalance('$15,000.00');
  });

  test('can add debt with type Other', async ({ debtsPage }) => {
    await debtsPage.addDebt(testDebts.other);
    await debtsPage.assertDebtVisible('Medical Bill');
    await debtsPage.assertDebtBalance('$2,500.00');
  });
});

test.describe('Debts - Edit and Delete', () => {
  test.beforeEach(async ({ debtsPage }) => {
    await debtsPage.goto();
  });

  test('can edit an existing debt', async ({ debtsPage }) => {
    await debtsPage.addDebt({
      name: 'Editable Debt',
      balance: '500',
      interestRate: '10',
      minimumPayment: '20',
    });
    await debtsPage.assertDebtVisible('Editable Debt');
    await debtsPage.openDebtForEdit('Editable Debt');
    await debtsPage.debtForm.assertValues({ name: 'Editable Debt' });
    await debtsPage.debtForm.clearName();
    await debtsPage.debtForm.nameInput.fill('Updated Debt Name');
    await debtsPage.debtForm.submit();
    await debtsPage.assertDebtVisible('Updated Debt Name');
  });

  test('edit form shows delete button', async ({ debtsPage }) => {
    await debtsPage.addDebt({
      name: 'Deletable Debt',
      balance: '300',
      interestRate: '8',
      minimumPayment: '15',
    });
    await debtsPage.assertDebtVisible('Deletable Debt');
    await debtsPage.openDebtForEdit('Deletable Debt');
    await debtsPage.debtForm.assertDeleteVisible();
  });

  test('can delete debt from edit form', async ({ debtsPage }) => {
    await debtsPage.addDebt({
      name: 'To Be Deleted',
      balance: '100',
      interestRate: '5',
      minimumPayment: '10',
    });
    await debtsPage.assertDebtVisible('To Be Deleted');
    await debtsPage.deleteDebt('To Be Deleted');
    await debtsPage.assertDebtNotVisible('To Be Deleted');
  });

  test('can delete debt via right-click context menu', async ({ debtsPage }) => {
    await debtsPage.addDebt({
      name: 'Right Click Delete Test',
      balance: '200',
      interestRate: '8',
      minimumPayment: '15',
    });
    await debtsPage.assertDebtVisible('Right Click Delete Test');
    await debtsPage.deleteDebtViaLongPress('Right Click Delete Test');
    await debtsPage.assertDebtNotVisible('Right Click Delete Test');
  });
});
