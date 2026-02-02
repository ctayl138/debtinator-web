import { test, expect } from '../fixtures';

test.describe('Navigation', () => {
  test('can navigate between tabs', async ({ debtsPage, payoffPage }) => {
    await debtsPage.goto();
    await expect(debtsPage.emptyState.or(debtsPage.summary).first()).toBeVisible();

    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible();

    await payoffPage.navigateToTab(/debts/i);
    await debtsPage.waitForReady();
    await expect(debtsPage.emptyState.or(debtsPage.summary).first()).toBeVisible();
  });

  test('can navigate back from settings', async ({
    debtsPage,
    payoffPage,
    settingsPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    await payoffPage.openSettings();
    await settingsPage.waitForReady();
    await settingsPage.assertAppearanceVisible();

    await settingsPage.goBack();
    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can navigate back from charts', async ({
    debtsPage,
    payoffPage,
    chartsPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Nav Chart Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('100');

    await payoffPage.openCharts();
    await chartsPage.waitForReady();

    await chartsPage.goBack();
    await payoffPage.waitForReady();
  });

  test('can navigate to Help & Documentation from menu', async ({
    debtsPage,
    payoffPage,
    documentationPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    await payoffPage.openHelp();
    await documentationPage.waitForReady();
    await documentationPage.assertContentVisible();
  });

  test('can navigate back from documentation', async ({
    debtsPage,
    payoffPage,
    documentationPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.openHelp();
    await documentationPage.waitForReady();

    await documentationPage.goBack();
    await expect(
      payoffPage.emptyState.or(payoffPage.methodCard).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can navigate back from timeline', async ({
    debtsPage,
    payoffPage,
    timelinePage,
  }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Timeline Nav Test',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('60');
    await payoffPage.openTimeline();
    await timelinePage.waitForReady();

    await timelinePage.goBack();
    await payoffPage.waitForReady();
  });
});
