import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import Payoff from './Payoff';
import { renderWithProviders } from '@/test-utils';
import type { Debt } from '@/types';

let mockDebts: Debt[] = [];
let mockMethod: 'snowball' | 'avalanche' | 'custom' = 'snowball';
let mockMonthlyPayment = '';
const mockSetMethod = jest.fn();
const mockSetMonthlyPayment = jest.fn();
let mockMonthlyIncome = 0;

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: mockMethod,
    monthlyPayment: mockMonthlyPayment,
    setMethod: mockSetMethod,
    setMonthlyPayment: mockSetMonthlyPayment,
  }),
}));

jest.mock('@/store/useIncomeStore', () => ({
  useIncomeStore: (selector: (s: { monthlyIncome: number }) => number) =>
    selector({ monthlyIncome: mockMonthlyIncome }),
}));

const mockSchedule = {
  totalMonths: 12,
  totalInterest: 500,
  totalPayments: 6500,
  steps: [[{ debtId: '1', debtName: 'Card', payment: 100, remainingBalance: 0, interestPaid: 0, month: 1 }]],
};
jest.mock('@/utils/payoffCalculations', () => ({
  calculatePayoffSchedule: () => mockSchedule,
}));

describe('Payoff', () => {
  beforeEach(() => {
    mockDebts = [];
    mockMethod = 'snowball';
    mockMonthlyPayment = '';
    mockMonthlyIncome = 0;
    jest.clearAllMocks();
  });

  it('renders empty state when no debts', () => {
    renderWithProviders(<Payoff />);
    expect(screen.getByTestId('payoff-empty')).toBeInTheDocument();
    expect(screen.getByText('No Debts to Plan')).toBeInTheDocument();
  });

  it('renders method and monthly payment sections when debts exist', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    renderWithProviders(<Payoff />);
    expect(screen.getByText('Payoff Method')).toBeInTheDocument();
    expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Avalanche'));
    expect(mockSetMethod).toHaveBeenCalledWith('avalanche');
  });

  it('shows method helper text for snowball, avalanche, and custom', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMethod = 'snowball';
    renderWithProviders(<Payoff />);
    expect(screen.getByText(/Pay off smallest balances first/)).toBeInTheDocument();
    cleanup();
    mockMethod = 'avalanche';
    renderWithProviders(<Payoff />);
    expect(screen.getByText(/Pay off highest interest rates first/)).toBeInTheDocument();
    cleanup();
    mockMethod = 'custom';
    renderWithProviders(<Payoff />);
    expect(screen.getByText(/Choose your own payoff order/)).toBeInTheDocument();
  });

  it('calls setMonthlyPayment when input changes', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    renderWithProviders(<Payoff />);
    fireEvent.change(screen.getByTestId('monthly-payment-input'), { target: { value: '250' } });
    expect(mockSetMonthlyPayment).toHaveBeenCalledWith('250');
  });

  it('shows income hint when monthly income is 0', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyIncome = 0;
    renderWithProviders(<Payoff />);
    expect(screen.getByText(/Add your income in Settings/)).toBeInTheDocument();
  });

  it('shows income insights when monthly income is set', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyIncome = 5000;
    renderWithProviders(<Payoff />);
    expect(screen.getByTestId('income-insights-card')).toBeInTheDocument();
  });

  it('shows payment ratio when monthly payment is set', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyIncome = 5000;
    mockMonthlyPayment = '100';
    renderWithProviders(<Payoff />);
    expect(screen.getByText('Your payment:')).toBeInTheDocument();
  });

  it('shows payoff summary when schedule exists', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    renderWithProviders(<Payoff />);
    expect(screen.getByText('Payoff Summary')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Charts')).toBeInTheDocument();
  });

  it('does not show payoff summary when payment below minimums', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' }];
    mockMonthlyPayment = '10';
    renderWithProviders(<Payoff />);
    expect(screen.queryByText('Payoff Summary')).not.toBeInTheDocument();
  });
});
