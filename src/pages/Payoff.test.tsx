import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import Payoff from './Payoff';
import { renderWithProviders } from '@/test-utils';
import type { Debt } from '@/types';

let mockDebts: Debt[] = [];
let mockMethod: 'snowball' | 'avalanche' | 'custom' = 'snowball';
let mockMonthlyPayment = '';
let mockCustomOrder: string[] = [];
let mockStartDate = '';
const mockSetMethod = jest.fn();
const mockSetMonthlyPayment = jest.fn();
const mockSetCustomOrder = jest.fn();
const mockSetStartDate = jest.fn();
let mockMonthlyIncome = 0;

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: mockMethod,
    monthlyPayment: mockMonthlyPayment,
    customOrder: mockCustomOrder,
    startDate: mockStartDate,
    setMethod: mockSetMethod,
    setMonthlyPayment: mockSetMonthlyPayment,
    setCustomOrder: mockSetCustomOrder,
    setStartDate: mockSetStartDate,
  }),
}));

jest.mock('@/store/useIncomeStore', () => {
  const actual = jest.requireActual<typeof import('@/store/useIncomeStore')>('@/store/useIncomeStore');
  const getMockState = () => ({
    incomes: mockMonthlyIncome > 0 ? [{ id: '1', name: 'Test', type: 'other' as const, amount: mockMonthlyIncome, createdAt: '' }] : [],
    addIncome: jest.fn(),
    updateIncome: jest.fn(),
    deleteIncome: jest.fn(),
    setMonthlyIncome: jest.fn(),
  });
  return {
    ...actual,
    useIncomeStore: (selector: (s: unknown) => unknown) => selector(getMockState()),
  };
});

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
    mockCustomOrder = [];
    mockStartDate = '';
    mockMonthlyIncome = 0;
    jest.clearAllMocks();
  });

  it('renders empty state when no debts', () => {
    renderWithProviders(<Payoff />);
    expect(screen.getByTestId('payoff-empty')).toBeInTheDocument();
    expect(screen.getByText('No debts yet')).toBeInTheDocument();
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
    expect(screen.getByText(/Drag or use arrows to set the order/)).toBeInTheDocument();
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
    expect(screen.getByText(/Add your income to see/)).toBeInTheDocument();
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

  it('calls setStartDate when first payment date is changed', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    renderWithProviders(<Payoff />);
    fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2027-06-15' } });
    expect(mockSetStartDate).toHaveBeenCalledWith('2027-06-15');
  });

  it('moves custom order up when move up is clicked', () => {
    mockDebts = [
      { id: '1', name: 'First', type: 'credit_card', balance: 500, interestRate: 10, minimumPayment: 25, createdAt: '' },
      { id: '2', name: 'Second', type: 'credit_card', balance: 300, interestRate: 15, minimumPayment: 20, createdAt: '' },
    ];
    mockMethod = 'custom';
    mockCustomOrder = ['1', '2'];
    renderWithProviders(<Payoff />);
    const moveUpButtons = screen.getAllByLabelText(/Move .* up/);
    fireEvent.click(moveUpButtons[1]);
    expect(mockSetCustomOrder).toHaveBeenCalled();
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

  it('shows custom order list with up/down buttons when method is custom', () => {
    mockDebts = [
      { id: '1', name: 'Card A', type: 'credit_card', balance: 500, interestRate: 15, minimumPayment: 25, createdAt: '' },
      { id: '2', name: 'Card B', type: 'credit_card', balance: 1000, interestRate: 18, minimumPayment: 40, createdAt: '' },
    ];
    mockMethod = 'custom';
    mockCustomOrder = ['1', '2'];
    renderWithProviders(<Payoff />);
    expect(screen.getByTestId('custom-order-list')).toBeInTheDocument();
    expect(screen.getByText('1. Card A')).toBeInTheDocument();
    expect(screen.getByText('2. Card B')).toBeInTheDocument();
    const upButtons = screen.getAllByLabelText(/Move .* up/);
    const downButtons = screen.getAllByLabelText(/Move .* down/);
    expect(upButtons).toHaveLength(2);
    expect(downButtons).toHaveLength(2);
    fireEvent.click(downButtons[0]);
    expect(mockSetCustomOrder).toHaveBeenCalledWith(['2', '1']);
  });
});
