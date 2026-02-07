import { test, expect } from '../fixtures';

test.describe('Payoff - Empty State', () => {
  test.beforeEach(async ({ debtsPage, payoffPage }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
  });

  test('can navigate to Payoff tab', async ({ payoffPage }) => {
    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible();
  });

  test('shows empty state when no debts', async ({ payoffPage }) => {
    const hasDebts = await payoffPage.hasDebts();
    if (!hasDebts) {
      await payoffPage.assertEmptyState();
    }
  });
});

test.describe('Payoff - Method Selection', () => {
  test.beforeEach(async ({ debtsPage, payoffPage }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Payoff Test Debt',
      balance: '2000',
      interestRate: '18',
      minimumPayment: '50',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
  });

  test('shows payoff method selector when debts exist', async ({ payoffPage }) => {
    await payoffPage.assertMethodSelectorVisible();
  });

  test('can switch between payoff methods', async ({ payoffPage }) => {
    await payoffPage.selectMethod('avalanche');
    await payoffPage.assertMethodDescription('avalanche');

    await payoffPage.selectMethod('snowball');
    await payoffPage.assertMethodDescription('snowball');

    await payoffPage.selectMethod('custom');
    await payoffPage.assertMethodDescription('custom');
  });
});

test.describe('Payoff - Monthly Payment', () => {
  test.beforeEach(async ({ debtsPage, payoffPage }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Payment Input Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
  });

  test('shows monthly payment input section', async ({ payoffPage }) => {
    await payoffPage.assertMonthlyPaymentSectionVisible();
  });

  test('shows payoff summary when valid payment entered', async ({ payoffPage }) => {
    await payoffPage.setMonthlyPayment('100');
    await payoffPage.assertSummaryVisible();
  });
});

test.describe('Payoff - Navigation Icons', () => {
  test.beforeEach(async ({ debtsPage, payoffPage }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Icon Test Debt',
      balance: '2000',
      interestRate: '15',
      minimumPayment: '50',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('100');
  });

  test('shows chart icon when payoff plan is configured', async ({ payoffPage }) => {
    await payoffPage.assertChartsButtonVisible();
  });

  test('shows timeline icon when payoff plan is configured', async ({ payoffPage }) => {
    await payoffPage.assertTimelineButtonVisible();
  });

  test('can navigate to settings', async ({ payoffPage, settingsPage }) => {
    await payoffPage.openSettings();
    await settingsPage.waitForReady();
    await settingsPage.assertAppearanceVisible();
  });
});

test.describe('Payoff - Income Insights', () => {
  test('shows income insights when income is set in settings', async ({
    debtsPage,
    payoffPage,
    settingsPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Income Insights Test',
      balance: '2000',
      interestRate: '15',
      minimumPayment: '50',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    await payoffPage.openSettings();
    await settingsPage.waitForReady();
    await settingsPage.expandIncome();
    await settingsPage.setMonthlyIncome('5000');

    await settingsPage.goBack();
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('100');

    await payoffPage.assertIncomeInsightsVisible();
  });
});
