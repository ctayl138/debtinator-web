import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

let mockMode = 'light';
const mockSetMode = jest.fn();
jest.mock('@/store/useThemeStore', () => ({
  useThemeStore: (selector: (s: { mode: string; setMode: jest.Mock }) => unknown) =>
    selector({ mode: mockMode, setMode: mockSetMode }),
}));

let mockMonthlyIncome = 0;
const mockSetMonthlyIncome = jest.fn();
jest.mock('@/store/useIncomeStore', () => ({
  useIncomeStore: (selector: (s: { monthlyIncome: number; setMonthlyIncome: jest.Mock }) => unknown) =>
    selector({ monthlyIncome: mockMonthlyIncome, setMonthlyIncome: mockSetMonthlyIncome }),
}));

let mockDebts: { id: string; name: string; type: string; balance: number; interestRate: number; minimumPayment: number; createdAt: string }[] = [];
jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

let mockMonthlyPayment = '200';
import Settings, { getExportStartIcon, isExportDisabled } from './Settings';
jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: 'snowball',
    monthlyPayment: mockMonthlyPayment,
  }),
}));

const mockCreateExportWorkbook = jest.fn(() => ({ SheetNames: [] }));
const mockDownloadWorkbook = jest.fn();
jest.mock('@/utils/exportToExcel', () => ({
  createExportWorkbook: (...args: unknown[]) => mockCreateExportWorkbook(...args),
  downloadWorkbook: (...args: unknown[]) => mockDownloadWorkbook(...args),
}));

describe('Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMode = 'light';
    mockMonthlyIncome = 0;
    mockDebts = [];
    mockMonthlyPayment = '200';
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

  it('renders income input when Income is expanded', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /income/i }));
    expect(screen.getByTestId('income-input')).toBeInTheDocument();
  });

  it('calls setMonthlyIncome on blur with valid value', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /income/i }));
    const input = screen.getByTestId('income-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5000' } });
    fireEvent.blur(input);
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(5000);
  });

  it('clears income input when value is invalid', () => {
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /income/i }));
    const input = screen.getByTestId('income-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);
    expect(mockSetMonthlyIncome).toHaveBeenCalledWith(0);
    expect(input.value).toBe('');
  });

  it('syncs income input from store when monthlyIncome > 0', () => {
    mockMonthlyIncome = 5000;
    renderWithProviders(<Settings />);
    fireEvent.click(screen.getByRole('button', { name: /income/i }));
    const input = screen.getByTestId('income-input') as HTMLInputElement;
    expect(input.value).toBe('5000');
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
});
