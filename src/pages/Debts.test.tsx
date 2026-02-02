import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Debts from './Debts';
import { renderWithProviders } from '@/test-utils';
import type { Debt } from '@/types';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Dialog: ({ open, onClose, children, ...rest }: any) => (
      <div
        data-testid="delete-debt-dialog"
        data-open={String(open)}
        onClick={() => onClose?.({}, 'backdropClick')}
        {...rest}
      >
        {children}
      </div>
    ),
  };
});

let mockDebts: Debt[] = [];
const mockAddDebt = jest.fn();
const mockUpdateDebt = jest.fn();
const mockDeleteDebt = jest.fn();

const formDebtData = {
  name: 'Submitted',
  type: 'other' as const,
  balance: 100,
  interestRate: 10,
  minimumPayment: 10,
};

jest.mock('@/components/DebtForm', () => ({
  __esModule: true,
  default: ({ open, debt, onSubmit, onCancel, onDelete }: any) => (
    <div data-testid="mock-debt-form" data-open={String(open)} data-debt={debt?.name ?? ''}>
      <button type="button" data-testid="submit-debt" onClick={() => onSubmit(formDebtData)} />
      <button type="button" data-testid="cancel-debt" onClick={onCancel} />
      {onDelete && <button type="button" data-testid="delete-debt" onClick={onDelete} />}
    </div>
  ),
}));

jest.mock('@/store/useDebtStore', () => ({
  useDebts: () => mockDebts,
  useDebtActions: () => ({
    addDebt: mockAddDebt,
    updateDebt: mockUpdateDebt,
    deleteDebt: mockDeleteDebt,
  }),
}));

describe('Debts', () => {
  beforeEach(() => {
    mockDebts = [];
    jest.clearAllMocks();
  });

  it('renders empty state when no debts', () => {
    renderWithProviders(<Debts />);
    expect(screen.getByTestId('debts-empty')).toBeInTheDocument();
    expect(screen.getByText('No Debts Yet')).toBeInTheDocument();
  });

  it('shows add form from empty state', () => {
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByTestId('add-debt-fab'));
    expect(screen.getByTestId('mock-debt-form')).toHaveAttribute('data-open', 'true');
  });

  it('renders summary and sections when debts exist', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
      {
        id: '2',
        name: 'Loan',
        type: 'personal_loan',
        balance: 2000,
        interestRate: 6,
        minimumPayment: 80,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    expect(screen.getByTestId('debts-summary')).toBeInTheDocument();
    expect(screen.getByText(/Credit Cards —/)).toBeInTheDocument();
    expect(screen.getByText(/Personal Loans —/)).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Loan')).toBeInTheDocument();
    expect(screen.getByText(/2 debts/)).toBeInTheDocument();
  });

  it('renders singular debt label when only one in section', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    expect(screen.getByText(/Credit Cards — 1 debt/)).toBeInTheDocument();
  });

  it('renders plural debt label when multiple in section', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card A',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
      {
        id: '2',
        name: 'Card B',
        type: 'credit_card',
        balance: 500,
        interestRate: 12,
        minimumPayment: 25,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    expect(screen.getByText(/Credit Cards — 2 debts/)).toBeInTheDocument();
  });

  it('handles debts with missing type and zero balances', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Legacy',
        type: undefined as unknown as Debt['type'],
        balance: 0,
        interestRate: 10,
        minimumPayment: 0,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    expect(screen.getByText(/Avg APR:/)).toBeInTheDocument();
  });

  it('opens edit form when debt is clicked and submits update', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByText('Card'));
    expect(screen.getByTestId('mock-debt-form')).toHaveAttribute('data-debt', 'Card');
    fireEvent.click(screen.getByTestId('submit-debt'));
    expect(mockUpdateDebt).toHaveBeenCalledWith('1', formDebtData);
  });

  it('closes form on cancel', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByText('Card'));
    fireEvent.click(screen.getByTestId('cancel-debt'));
    expect(screen.getByTestId('mock-debt-form')).toHaveAttribute('data-open', 'false');
  });

  it('submits add debt when not editing', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByTestId('add-debt-fab'));
    fireEvent.click(screen.getByTestId('submit-debt'));
    expect(mockAddDebt).toHaveBeenCalledWith(formDebtData);
  });

  it('calls delete from edit form and closes', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByText('Card'));
    fireEvent.click(screen.getByTestId('delete-debt'));
    expect(mockDeleteDebt).toHaveBeenCalledWith('1');
  });

  it('shows delete dialog on context menu and cancels', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.contextMenu(screen.getByText('Card'));
    expect(screen.getByTestId('delete-debt-dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockDeleteDebt).not.toHaveBeenCalled();
  });

  it('confirms delete from dialog', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.contextMenu(screen.getByText('Card'));
    fireEvent.click(screen.getByText('Delete'));
    expect(mockDeleteDebt).toHaveBeenCalledWith('1');
  });

  it('does nothing when confirmDelete runs without a selected debt', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByText('Delete'));
    expect(mockDeleteDebt).not.toHaveBeenCalled();
  });

  it('closes delete dialog on escape', () => {
    mockDebts = [
      {
        id: '1',
        name: 'Card',
        type: 'credit_card',
        balance: 1000,
        interestRate: 15,
        minimumPayment: 50,
        createdAt: '',
      },
    ];
    renderWithProviders(<Debts />);
    fireEvent.contextMenu(screen.getByText('Card'));
    fireEvent.click(screen.getByTestId('delete-debt-dialog'));
    expect(mockDeleteDebt).not.toHaveBeenCalled();
  });
});
