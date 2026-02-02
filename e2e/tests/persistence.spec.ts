import { test, createUniqueDebtName } from '../fixtures';

test.describe('Data Persistence', () => {
  test('debts persist after page reload', async ({ debtsPage }) => {
    await debtsPage.goto();

    const uniqueName = createUniqueDebtName('Persist Test');
    await debtsPage.addDebt({
      name: uniqueName,
      balance: '999',
      interestRate: '7',
      minimumPayment: '20',
    });

    await debtsPage.assertDebtVisible(uniqueName);

    await debtsPage.reload();
    await debtsPage.waitForReady();

    await debtsPage.assertDebtVisible(uniqueName);
  });

  test('payoff settings persist after tab switch', async ({
    debtsPage,
    payoffPage,
  }) => {
    await debtsPage.goto();

    await debtsPage.addDebt({
      name: 'Persist Settings Test',
      balance: '1500',
      interestRate: '14',
      minimumPayment: '40',
    });

    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    await payoffPage.setMonthlyPayment('75');
    await payoffPage.selectMethod('avalanche');

    await payoffPage.navigateToTab(/debts/i);
    await debtsPage.waitForReady();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    await payoffPage.assertMonthlyPaymentValue('75');
    await payoffPage.assertMethodDescription('avalanche');
  });

  test('theme selection persists after page reload', async ({
    debtsPage,
    payoffPage,
    settingsPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.openSettings();
    await settingsPage.waitForReady();

    await settingsPage.selectDarkTheme();

    await debtsPage.page.goto('/');
    await debtsPage.waitForReady();
    await debtsPage.page.reload();
    await debtsPage.waitForReady();

    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.openSettings();
    await settingsPage.waitForReady();

    await settingsPage.assertThemeOptionsVisible();
  });
});
