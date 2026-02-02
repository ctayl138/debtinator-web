import { test } from '../fixtures';

test.describe('Payoff Timeline', () => {
  test.beforeEach(async ({ debtsPage, payoffPage }) => {
    await debtsPage.goto();
    await debtsPage.addDebt({
      name: 'Timeline Test Debt',
      balance: '1000',
      interestRate: '10',
      minimumPayment: '30',
    });
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.setMonthlyPayment('60');
  });

  test('timeline icon appears when payoff configured', async ({ payoffPage }) => {
    await payoffPage.assertTimelineButtonVisible();
  });

  test('can navigate to timeline page', async ({ payoffPage, timelinePage }) => {
    await payoffPage.openTimeline();
    await timelinePage.waitForReady();
    await timelinePage.assertTimelineVisible();
  });

  test('shows month headers with correct format', async ({
    payoffPage,
    timelinePage,
  }) => {
    await payoffPage.openTimeline();
    await timelinePage.waitForReady();
    await timelinePage.assertMonthHeaderVisible(1);
  });
});
