import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PayoffTimeline, { getNextVisibleMonths } from './PayoffTimeline';
import { renderWithProviders } from '@/test-utils';
import type { Debt } from '@/types';

let mockDebts: Debt[] = [];
let mockMethod: 'snowball' | 'avalanche' | 'custom' = 'snowball';
let mockMonthlyPayment = '';

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

let mockStartDate = '';
jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: mockMethod,
    monthlyPayment: mockMonthlyPayment,
    customOrder: [],
    startDate: mockStartDate,
  }),
}));

let mockSchedule = {
  totalMonths: 13,
  totalInterest: 200,
  totalPayments: 6200,
  steps: Array(13)
    .fill(null)
    .map((_, i) => [
      {
        debtId: '1',
        debtName: 'Card',
        month: i + 1,
        payment: 100,
        remainingBalance: Math.max(0, 1000 - i * 50),
        interestPaid: 5,
      },
    ]),
};

jest.mock('@/utils/payoffCalculations', () => ({
  calculatePayoffSchedule: () => mockSchedule,
}));

describe('PayoffTimeline', () => {
  beforeEach(() => {
    mockDebts = [];
    mockMethod = 'snowball';
    mockMonthlyPayment = '';
    mockStartDate = '';
    mockSchedule = {
      totalMonths: 13,
      totalInterest: 200,
      totalPayments: 6200,
      steps: Array(13)
        .fill(null)
        .map((_, i) => [
          {
            debtId: '1',
            debtName: 'Card',
            month: i + 1,
            payment: 100,
            remainingBalance: Math.max(0, 1000 - i * 50),
            interestPaid: 5,
          },
        ]),
    };
  });

  it('renders empty state when no debts', () => {
    renderWithProviders(<PayoffTimeline />);
    expect(screen.getByText(/Add debts on the Debts tab, then set a monthly payment on the Payoff tab to see your timeline/)).toBeInTheDocument();
  });

  it('renders set payment message when payment too low', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' }];
    mockMonthlyPayment = '30';
    renderWithProviders(<PayoffTimeline />);
    expect(screen.getByText(/Enter a monthly payment.*Payoff tab to see your month-by-month schedule/)).toBeInTheDocument();
  });

  it('renders timeline and load more button when schedule exists', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    renderWithProviders(<PayoffTimeline />);
    expect(screen.getByTestId('payoff-timeline')).toBeInTheDocument();
    expect(screen.getAllByText(/Month 1/).length).toBeGreaterThan(0);
    expect(screen.getByText('Load more months')).toBeInTheDocument();
  });

  it('loads more months when Load more months is clicked', async () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    renderWithProviders(<PayoffTimeline />);
    await userEvent.click(screen.getByRole('button', { name: 'Load more months' }));
    expect(screen.getByText(/Month 13/)).toBeInTheDocument();
    expect(screen.getByText(/You're debt-free in 13 months/)).toBeInTheDocument();
  });

  it('uses startDate for month labels when set', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    mockStartDate = '2027-03-01';
    renderWithProviders(<PayoffTimeline />);
    expect(screen.getByTestId('payoff-timeline')).toBeInTheDocument();
    expect(screen.getByText(/March 2027/)).toBeInTheDocument();
  });

  it('shows debt-free message when all months are visible', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    mockSchedule = {
      totalMonths: 3,
      totalInterest: 10,
      totalPayments: 1010,
      steps: Array(3)
        .fill(null)
        .map((_, i) => [
          {
            debtId: '1',
            debtName: 'Card',
            month: i + 1,
            payment: 100,
            remainingBalance: Math.max(0, 300 - i * 100),
            interestPaid: 1,
          },
        ]),
    };
    renderWithProviders(<PayoffTimeline />);
    expect(screen.queryByText('Load more months')).not.toBeInTheDocument();
    expect(screen.getByText(/You're debt-free in 3 months/)).toBeInTheDocument();
  });
});

describe('getNextVisibleMonths', () => {
  it('returns current when schedule is null', () => {
    expect(getNextVisibleMonths(12, null)).toBe(12);
  });

  it('caps at schedule length', () => {
    const schedule = {
      totalMonths: 3,
      totalInterest: 0,
      totalPayments: 0,
      steps: Array(3).fill([]),
    };
    expect(getNextVisibleMonths(12, schedule)).toBe(3);
  });
});
