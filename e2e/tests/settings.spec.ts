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

  test('Income section allows setting monthly income', async ({ settingsPage }) => {
    await settingsPage.expandIncome();
    await settingsPage.setMonthlyIncome('5000');
    await expect(settingsPage.getByTestId('income-input')).toHaveValue('5000');
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
    await expect(settingsPage.getByText('Features Guide')).toBeVisible();
  });

  test('Features Guide navigates to documentation', async ({
    settingsPage,
    documentationPage,
  }) => {
    await settingsPage.expandHelpAndOpenFeaturesGuide();
    await documentationPage.waitForReady();
    await documentationPage.assertContentVisible();
  });
});
