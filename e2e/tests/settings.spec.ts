import { test, expect } from '../fixtures';

test.describe('Settings', () => {
  test.beforeEach(async ({ debtsPage, payoffPage, settingsPage }) => {
    await debtsPage.goto();
    await debtsPage.navigateToTab(/payoff/i);
    await payoffPage.waitForReady();
    await payoffPage.openSettings();
    await settingsPage.waitForReady();
  });

  test('shows appearance settings', async ({ settingsPage }) => {
    await settingsPage.assertAppearanceVisible();
  });

  test('shows theme options in accordion', async ({ settingsPage }) => {
    await settingsPage.assertThemeOptionsVisible();
  });

  test('can select light theme', async ({ settingsPage }) => {
    await settingsPage.selectLightTheme();
    await settingsPage.assertAppearanceVisible();
  });

  test('can select dark theme', async ({ settingsPage }) => {
    await settingsPage.selectDarkTheme();
    await settingsPage.assertAppearanceVisible();
  });

  test('can select system theme', async ({ settingsPage }) => {
    await settingsPage.selectSystemTheme();
    await settingsPage.assertAppearanceVisible();
  });

  test('can collapse and expand accordion', async ({ settingsPage }) => {
    await settingsPage.assertThemeOptionsVisible();

    await settingsPage.toggleAppearanceAccordion();
    await settingsPage.assertThemeOptionsHidden();

    await settingsPage.toggleAppearanceAccordion();
    await settingsPage.assertThemeOptionsVisible();
  });

  test('Income page allows adding income', async ({ incomePage }) => {
    await incomePage.goto();
    await incomePage.addIncome({ amount: '5000' });
    await expect(incomePage.getByTestId('income-summary')).toBeVisible({ timeout: 5000 });
    await expect(incomePage.getByTestId('income-summary').getByText(/\$5,000\.00/)).toBeVisible();
  });

  test('Export Data section shows export button', async ({ settingsPage }) => {
    await settingsPage.expandExportData();
    await expect(settingsPage.getByTestId('export-excel-button')).toBeVisible();
    await expect(settingsPage.getByText('Export to Excel')).toBeVisible();
  });

  test('export triggers download on web', async ({ settingsPage, page }) => {
    await settingsPage.expandExportData();

    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await settingsPage.triggerExport();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(
      /^debtinator-export-\d{4}-\d{2}-\d{2}\.xlsx$/
    );
  });

  test('Help section has Features Guide link', async ({ settingsPage }) => {
    await settingsPage.assertHelpSectionVisible();
    await expect(settingsPage.getByTestId('help-documentation-link')).toBeVisible();
  });

  test('Features Guide navigates to documentation', async ({
    settingsPage,
    documentationPage,
  }) => {
    await settingsPage.expandHelpAndOpenFeaturesGuide();
    await documentationPage.waitForReady();
    await documentationPage.assertContentVisible();
  });

  test('Feedback section shows form with title, description, and submit', async ({
    settingsPage,
  }) => {
    await settingsPage.expandFeedback();
    await settingsPage.assertFeedbackFormVisible();
  });
});
