import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

let mockMode = 'light';
const mockSetMode = jest.fn();
jest.mock('@/store/useThemeStore', () => ({
  useThemeStore: Object.assign(
    (selector: (s: { mode: string; setMode: jest.Mock }) => unknown) =>
      selector({ mode: mockMode, setMode: mockSetMode }),
    {
      getState: () => ({ mode: mockMode, setMode: mockSetMode }),
    }
  ),
}));

let mockMonthlyIncome = 0;
const mockSetMonthlyIncome = jest.fn();
jest.mock('@/store/useIncomeStore', () => {
  const actual = jest.requireActual<typeof import('@/store/useIncomeStore')>('@/store/useIncomeStore');
  const getMockState = () => ({
    incomes: mockMonthlyIncome > 0 ? [{ id: '1', name: 'Test', type: 'other' as const, amount: mockMonthlyIncome, createdAt: '' }] : [],
    addIncome: jest.fn(),
    updateIncome: jest.fn(),
    deleteIncome: jest.fn(),
    setMonthlyIncome: mockSetMonthlyIncome,
  });
  return {
    ...actual,
    useIncomeStore: Object.assign(
      (selector: (s: unknown) => unknown) => selector(getMockState()),
      { getState: getMockState }
    ),
  };
});

let mockDebts: { id: string; name: string; type: string; balance: number; interestRate: number; minimumPayment: number; createdAt: string }[] = [];
const mockSetState = jest.fn();
jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
  useDebtStore: {
    getState: () => ({ debts: mockDebts }),
    setState: mockSetState,
  },
  migrateDebts: (debts: unknown[]) => debts,
}));

let mockLanguage = 'en';
const mockSetLanguage = jest.fn();
jest.mock('@/store/useLanguageStore', () => ({
  useLanguageStore: Object.assign(
    (selector: (s: { language: string; setLanguage: jest.Mock }) => unknown) =>
      selector({ language: mockLanguage, setLanguage: mockSetLanguage }),
    {
      getState: () => ({ language: mockLanguage, setLanguage: mockSetLanguage }),
    }
  ),
}));

let mockMonthlyPayment = '200';
const mockSetMethod = jest.fn();
const mockSetPayoffMonthlyPayment = jest.fn();
const mockSetCustomOrder = jest.fn();
const mockSetStartDate = jest.fn();
import Settings, { getExportStartIcon, isExportDisabled } from './Settings';
jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: Object.assign(
    () => ({
      method: 'snowball',
      monthlyPayment: mockMonthlyPayment,
      customOrder: [],
    }),
    {
      getState: () => ({
        method: 'snowball',
        monthlyPayment: mockMonthlyPayment,
        customOrder: [],
        startDate: '',
        setMethod: mockSetMethod,
        setMonthlyPayment: mockSetPayoffMonthlyPayment,
        setCustomOrder: mockSetCustomOrder,
        setStartDate: mockSetStartDate,
      }),
    }
  ),
}));

const mockCreateExportWorkbook = jest.fn(() => ({ SheetNames: [] }));
const mockDownloadWorkbook = jest.fn();
jest.mock('@/utils/exportToExcel', () => ({
  createExportWorkbook: (...args: unknown[]) => mockCreateExportWorkbook(...args),
  downloadWorkbook: (...args: unknown[]) => mockDownloadWorkbook(...args),
}));

const mockPrintExportAsPdf = jest.fn();
jest.mock('@/utils/exportToPdf', () => ({
  printExportAsPdf: (...args: unknown[]) => mockPrintExportAsPdf(...args),
}));

describe('Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMode = 'light';
    mockLanguage = 'en';
    mockMonthlyIncome = 0;
    mockDebts = [];
    mockMonthlyPayment = '200';
    mockSetState.mockClear();
    mockSetMethod.mockClear();
    mockSetPayoffMonthlyPayment.mockClear();
    mockSetCustomOrder.mockClear();
    mockSetStartDate.mockClear();
    mockPrintExportAsPdf.mockClear();
  });

  it('renders Appearance accordion and theme options', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System (match device)')).toBeInTheDocument();
  });

  it('calls setMode when theme option clicked', () => {
    mockMode = 'dark';
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByText('Light'));
    expect(mockSetMode).toHaveBeenCalledWith('light');
  });

  it('renders Help accordion and Features Guide link', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    expect(screen.getByText('Features Guide')).toBeInTheDocument();
    expect(screen.getByTestId('help-documentation-link')).toBeInTheDocument();
  });

  it('shows export button when Export Data is expanded', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /export data/i }));
    expect(screen.getByTestId('export-excel-button')).toBeInTheDocument();
  });

  it('triggers download when Export to Excel is clicked', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /export data/i }));
    fireEvent.click(screen.getByTestId('export-excel-button'));
    expect(mockCreateExportWorkbook).toHaveBeenCalled();
    expect(mockDownloadWorkbook).toHaveBeenCalled();
  });

  it('uses 0 monthlyPayment when value is empty', () => {
    mockMonthlyPayment = '';
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /export data/i }));
    fireEvent.click(screen.getByTestId('export-excel-button'));
    const args = mockCreateExportWorkbook.mock.calls[0][0];
    expect(args.monthlyPayment).toBe(0);
  });

  it('logs an error when export fails', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCreateExportWorkbook.mockImplementationOnce(() => {
      throw new Error('Export failed');
    });
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /export data/i }));
    fireEvent.click(screen.getByTestId('export-excel-button'));
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('exposes export button state helpers', () => {
    expect(isExportDisabled(true)).toBe(true);
    expect(isExportDisabled(false)).toBe(false);
    const loadingIcon = getExportStartIcon(true) as React.ReactElement;
    const idleIcon = getExportStartIcon(false) as React.ReactElement;
    expect(React.isValidElement(loadingIcon)).toBe(true);
    expect(React.isValidElement(idleIcon)).toBe(true);
  });

  it('shows PDF export button when Export Data is expanded', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /export data/i }));
    expect(screen.getByTestId('export-pdf-button')).toBeInTheDocument();
  });

  it('triggers PDF export when Export to PDF is clicked', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /export data/i }));
    fireEvent.click(screen.getByTestId('export-pdf-button'));
    expect(mockPrintExportAsPdf).toHaveBeenCalled();
  });

  it('shows Backup & Restore accordion', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText(/Backup\s*&\s*Restore/)).toBeInTheDocument();
  });

  it('shows backup button when Backup & Restore is expanded', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    expect(screen.getByTestId('backup-button')).toBeInTheDocument();
  });

  it('shows restore button when Backup & Restore is expanded', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    expect(screen.getByTestId('restore-button')).toBeInTheDocument();
  });

  it('restores from valid backup file and applies debts, income, theme, payoff form', async () => {
    const backup = JSON.stringify({
      debts: [{ id: '1', name: 'Restored', type: 'credit_card', balance: 500, interestRate: 10, minimumPayment: 25, createdAt: '2026-01-01' }],
      monthlyIncome: 4000,
      theme: 'dark',
      payoffForm: { method: 'avalanche', monthlyPayment: '300', customOrder: ['1'], startDate: '2027-06-01' },
    });
    const file = new File([backup], 'backup.json', { type: 'application/json' });
    file.text = () => Promise.resolve(backup);
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    const restoreInput = screen.getByTestId('restore-file-input');
    fireEvent.change(restoreInput, { target: { files: [file] } });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(mockSetState).toHaveBeenCalled();
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(4000);
    expect(mockSetMode).toHaveBeenCalledWith('dark');
    expect(mockSetMethod).toHaveBeenCalledWith('avalanche');
    expect(mockSetPayoffMonthlyPayment).toHaveBeenCalledWith('300');
    expect(mockSetCustomOrder).toHaveBeenCalledWith(['1']);
    expect(mockSetStartDate).toHaveBeenCalledWith('2027-06-01');
  });

  it('sets restore error when backup file is invalid', async () => {
    const file = new File(['not json'], 'backup.json', { type: 'application/json' });
    file.text = () => Promise.resolve('not json');
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    const restoreInput = screen.getByTestId('restore-file-input');
    fireEvent.change(restoreInput, { target: { files: [file] } });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(screen.getByText('Invalid backup file')).toBeInTheDocument();
  });

  it('restore button triggers file input click', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    const restoreBtn = screen.getByTestId('restore-button');
    const input = screen.getByTestId('restore-file-input') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');
    fireEvent.click(restoreBtn);
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('restores language from backup file', async () => {
    const backup = JSON.stringify({
      debts: [],
      monthlyIncome: 0,
      theme: 'light',
      language: 'es',
      payoffForm: { method: 'snowball', monthlyPayment: '200', customOrder: [], startDate: '' },
    });
    const file = new File([backup], 'backup.json', { type: 'application/json' });
    file.text = () => Promise.resolve(backup);
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    const restoreInput = screen.getByTestId('restore-file-input');
    fireEvent.change(restoreInput, { target: { files: [file] } });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
  });

  it('triggers download when backup button is clicked', () => {
    const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const clickSpy = jest.spyOn(anchor, 'click');
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'a') return anchor;
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    });

    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /backup\s*[&]\s*restore/i }));
    fireEvent.click(screen.getByTestId('backup-button'));

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock');

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
