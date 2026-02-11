import { screen, fireEvent } from '@testing-library/react';
import Income from './Income';
import { renderWithProviders } from '@/test-utils';
import type { Income as IncomeType } from '@/types';

let mockIncomes: IncomeType[] = [];
const mockAddIncome = jest.fn();
const mockUpdateIncome = jest.fn();
const mockDeleteIncome = jest.fn();
const mockSetMonthlyIncome = jest.fn();

jest.mock('@/store/useIncomeStore', () => {
  const actual = jest.requireActual('@/store/useIncomeStore');
  return {
    ...actual,
    useIncomeStore: (selector: (s: unknown) => unknown) => {
      const state = {
        incomes: mockIncomes,
        addIncome: mockAddIncome,
        updateIncome: mockUpdateIncome,
        deleteIncome: mockDeleteIncome,
        setMonthlyIncome: mockSetMonthlyIncome,
      };
      return selector(state);
    },
  };
});

describe('Income', () => {
  beforeEach(() => {
    mockIncomes = [];
    mockAddIncome.mockClear();
    mockUpdateIncome.mockClear();
    mockDeleteIncome.mockClear();
  });

  it('renders empty state with message and add FAB', () => {
    renderWithProviders(<Income />);
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText(/Add income sources to see/)).toBeInTheDocument();
    expect(screen.getByTestId('add-income-fab')).toBeInTheDocument();
  });

  it('opens form when FAB is clicked', () => {
    renderWithProviders(<Income />);
    fireEvent.click(screen.getByTestId('add-income-fab'));
    expect(screen.getByText('Add income')).toBeInTheDocument();
    expect(screen.getByTestId('income-form-name')).toBeInTheDocument();
    expect(screen.getByTestId('income-form-amount')).toBeInTheDocument();
  });

  it('renders summary and list when incomes exist', () => {
    mockIncomes = [
      {
        id: '1',
        name: 'Job',
        type: 'salary',
        amount: 5000,
        createdAt: '',
      },
    ];
    renderWithProviders(<Income />);
    expect(screen.getByTestId('income-summary')).toBeInTheDocument();
    expect(screen.getAllByText('$5,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Job')).toBeInTheDocument();
  });

  it('calls addIncome when form is submitted with valid data', () => {
    renderWithProviders(<Income />);
    fireEvent.click(screen.getByTestId('add-income-fab'));
    fireEvent.change(screen.getByTestId('income-form-name'), { target: { value: 'Side gig' } });
    fireEvent.change(screen.getByTestId('income-form-amount'), { target: { value: '1000' } });
    fireEvent.click(screen.getByTestId('income-form-submit'));
    expect(mockAddIncome).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Side gig', amount: 1000 })
    );
  });
});
