import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Charts, { formatYAxisLabel } from './Charts';
import { renderWithProviders } from '@/test-utils';
import type { Debt } from '@/types';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, label }: { children: React.ReactNode; label?: ({ name, value }: { name: string; value: number }) => string }) => {
    if (label) {
      label({ name: 'Principal', value: 100 });
    }
    return <div>{children}</div>;
  },
  Cell: () => <div />,
  Legend: () => <div />,
  Tooltip: ({ formatter }: { formatter?: (v: number) => string }) => {
    if (formatter) formatter(100);
    return <div />;
  },
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => {
    if (tickFormatter) tickFormatter(1000);
    return <div />;
  },
  CartesianGrid: () => <div />,
}));

let mockDebts: Debt[] = [];
let mockMethod: 'snowball' | 'avalanche' | 'custom' = 'snowball';
let mockMonthlyPayment = '';

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
}));

let mockCustomOrder: string[] | undefined = [];
jest.mock('@/store/usePayoffFormStore', () => ({
  usePayoffFormStore: () => ({
    method: mockMethod,
    monthlyPayment: mockMonthlyPayment,
    customOrder: mockCustomOrder,
  }),
}));

let mockSchedule = {
  totalMonths: 12,
  totalInterest: 500,
  totalPayments: 6500,
  steps: [[{ debtId: '1', debtName: 'Card', payment: 100, remainingBalance: 0, interestPaid: 0, month: 1 }]],
};
jest.mock('@/utils/payoffCalculations', () => ({
  calculatePayoffSchedule: () => mockSchedule,
}));

describe('Charts', () => {
  beforeEach(() => {
    mockDebts = [];
    mockMethod = 'snowball';
    mockMonthlyPayment = '';
    mockCustomOrder = [];
    mockSchedule = {
      totalMonths: 12,
      totalInterest: 500,
      totalPayments: 6500,
      steps: [[{ debtId: '1', debtName: 'Card', payment: 100, remainingBalance: 0, interestPaid: 0, month: 1 }]],
    };
  });

  it('renders empty state when no debts', () => {
    renderWithProviders(<Charts />);
    expect(screen.getByText(/Add debts on the Debts tab, then create a payoff plan to see/)).toBeInTheDocument();
  });

  it('renders set payment message when payment too low', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' }];
    mockMonthlyPayment = '30';
    renderWithProviders(<Charts />);
    expect(screen.getByText(/Enter a monthly payment of at least/)).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
  });

  it('renders pie chart by default when schedule exists', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    renderWithProviders(<Charts />);
    expect(screen.getByText('Principal vs Interest')).toBeInTheDocument();
    expect(screen.getByText('Balance Over Time')).toBeInTheDocument();
    expect(screen.getByText('Freed Up Income')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('switches to line chart when Balance Over Time is clicked', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    renderWithProviders(<Charts />);
    fireEvent.click(screen.getByText('Balance Over Time'));
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('switches to freed up income chart when Freed Up Income is clicked', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    renderWithProviders(<Charts />);
    fireEvent.click(screen.getByText('Freed Up Income'));
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('does not render pie chart when principal and interest are 0', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 0, interestRate: 0, minimumPayment: 0, createdAt: '' }];
    mockMonthlyPayment = '0';
    mockSchedule = {
      totalMonths: 1,
      totalInterest: 0,
      totalPayments: 0,
      steps: [[{ debtId: '1', debtName: 'Card', payment: 0, remainingBalance: 0, interestPaid: 0, month: 1 }]],
    };
    renderWithProviders(<Charts />);
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('does not render line chart when schedule has no steps', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockMonthlyPayment = '100';
    mockSchedule = {
      totalMonths: 0,
      totalInterest: 0,
      totalPayments: 0,
      steps: [],
    };
    renderWithProviders(<Charts />);
    fireEvent.click(screen.getByText('Balance Over Time'));
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('uses customOrder when method is custom', () => {
    mockDebts = [
      { id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' },
      { id: '2', name: 'Loan', type: 'personal_loan', balance: 500, interestRate: 10, minimumPayment: 25, createdAt: '' },
    ];
    mockMethod = 'custom';
    mockCustomOrder = ['2', '1'];
    mockMonthlyPayment = '100';
    renderWithProviders(<Charts />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('handles null customOrder with fallback to sorted by balance', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 30, createdAt: '' }];
    mockCustomOrder = undefined;
    mockMonthlyPayment = '100';
    renderWithProviders(<Charts />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});

describe('formatYAxisLabel', () => {
  it('returns $0 for value 0', () => {
    expect(formatYAxisLabel(0)).toBe('$0');
  });

  it('returns millions format for values >= 1M', () => {
    expect(formatYAxisLabel(1_000_000)).toBe('$1.0M');
    expect(formatYAxisLabel(2_500_000)).toBe('$2.5M');
  });

  it('returns thousands format for values >= 1k and < 1M', () => {
    expect(formatYAxisLabel(1_000)).toBe('$1.0k');
    expect(formatYAxisLabel(50_000)).toBe('$50.0k');
    expect(formatYAxisLabel(999_999)).toBe('$1000.0k');
  });

  it('returns rounded dollar format for values < 1k', () => {
    expect(formatYAxisLabel(500)).toBe('$500');
    expect(formatYAxisLabel(99)).toBe('$99');
    expect(formatYAxisLabel(1.5)).toBe('$2');
  });
});
