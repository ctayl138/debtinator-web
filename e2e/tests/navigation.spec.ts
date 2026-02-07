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
    settingsPage,
    documentationPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    // Navigate to Settings and open Help
    await payoffPage.openSettings();
    await settingsPage.waitForReady();
    await settingsPage.expandHelpAndOpenFeaturesGuide();
    await documentationPage.waitForReady();
    await documentationPage.assertContentVisible();
  });

  test('can navigate back from documentation', async ({
    debtsPage,
    payoffPage,
    settingsPage,
    documentationPage,
  }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    // Navigate to Settings and open Help
    await payoffPage.openSettings();
    await settingsPage.waitForReady();
    await settingsPage.expandHelpAndOpenFeaturesGuide();
    await documentationPage.waitForReady();

    await documentationPage.goBack();
    await expect(
      settingsPage.appearanceHeader
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

  test('can collapse and expand desktop sidebar', async ({ page, debtsPage }) => {
    // Desktop only - sidebar toggle appears on larger viewports
    // Skip on mobile viewports
    const width = page.viewportSize()?.width ?? 0;
    if (width < 900) {
      test.skip();
    }

    await debtsPage.goto();

    // Sidebar should be visible initially
    const sidebarNav = page.getByText('Charts');
    await expect(sidebarNav).toBeVisible();

    // Click toggle button to collapse
    const toggleButton = page.getByTestId('sidebar-toggle');
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();

    // Sidebar should be hidden
    await expect(sidebarNav).not.toBeVisible();

    // Click toggle again to expand
    await toggleButton.click();

    // Sidebar should be visible again
    await expect(sidebarNav).toBeVisible();
  });

  test('sidebar collapsed state persists across navigation', async ({
    page,
    debtsPage,
    payoffPage,
  }) => {
    // Desktop only - sidebar toggle appears on larger viewports
    // Skip on mobile viewports
    const width = page.viewportSize()?.width ?? 0;
    if (width < 900) {
      test.skip();
    }

    await debtsPage.goto();

    // Collapse the sidebar
    const toggleButton = page.getByTestId('sidebar-toggle');
    await toggleButton.click();
    await expect(page.getByText('Charts')).not.toBeVisible();

    // Expand to navigate
    await toggleButton.click();
    await expect(page.getByText('Charts')).toBeVisible();

    // Navigate to another page
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();

    // Collapse the sidebar
    await toggleButton.click();
    await expect(page.getByText('Charts')).not.toBeVisible();

    // Expand it
    await toggleButton.click();
    await expect(page.getByText('Charts')).toBeVisible();

    // Sidebar should still be expanded when navigating back
    await payoffPage.navigateToTab(/debts/i);
    await debtsPage.waitForReady();

    // Sidebar should still be expanded
    await expect(page.getByText('Charts')).toBeVisible();
  });
});
