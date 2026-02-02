import { test } from '../fixtures';

test.describe('Form Validation', () => {
  test.beforeEach(async ({ debtsPage }) => {
    await debtsPage.goto();
  });

  test('add debt button is disabled with empty name', async ({ debtsPage }) => {
    await debtsPage.openAddForm();

    const numericInputs = debtsPage.debtForm.numericInputs;
    await numericInputs.nth(0).fill('15');
    await numericInputs.nth(1).fill('1000');
    await numericInputs.nth(2).fill('30');

    await debtsPage.debtForm.assertSubmitDisabled();
  });

  test('add debt button is disabled with zero balance', async ({ debtsPage }) => {
    await debtsPage.openAddForm();

    await debtsPage.debtForm.nameInput.fill('Test Debt');

    const numericInputs = debtsPage.debtForm.numericInputs;
    await numericInputs.nth(0).fill('15');
    await numericInputs.nth(1).fill('0');
    await numericInputs.nth(2).fill('30');

    await debtsPage.debtForm.assertSubmitDisabled();
  });

  test('add debt button is enabled with valid data', async ({ debtsPage }) => {
    await debtsPage.openAddForm();

    await debtsPage.debtForm.nameInput.fill('Valid Test Debt');

    const numericInputs = debtsPage.debtForm.numericInputs;
    await numericInputs.nth(0).fill('15');
    await numericInputs.nth(1).fill('1000');
    await numericInputs.nth(2).fill('30');

    await debtsPage.debtForm.assertSubmitEnabled();
  });
});
