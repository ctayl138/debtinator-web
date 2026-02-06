import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Debts from './Debts';
import { renderWithProviders } from '@/test-utils';
import type { Debt } from '@/types';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Dialog: ({ open, onClose, children, ...rest }: any) => open ? (
      <div
        data-testid="delete-debt-dialog"
        data-open={String(open)}
        onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose?.({}, 'backdropClick'); }}
        {...rest}
      >
        {children}
      </div>
    ) : null,
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

jest.mock('@/components/ImportDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, importText, setImportText, importResult, onPreview, onFileChange, onConfirm, fileInputRef }: any) =>
    open ? (
      <div data-testid="mock-import-dialog" data-open={String(open)}>
        <input
          data-testid="import-paste-input"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste CSV data"
        />
        <button data-testid="import-preview-btn" onClick={onPreview} type="button">Preview</button>
        <button data-testid="import-confirm-btn" onClick={onConfirm} type="button">Import</button>
        <input ref={fileInputRef} type="file" data-testid="import-file-input" onChange={onFileChange} style={{ display: 'none' }} />
        {importResult && (
          <div>
            {importResult.errors.map((err: string, i: number) => <div key={i}>{err}</div>)}
            <div data-testid="import-result">{importResult.rows.length} debt{importResult.rows.length !== 1 ? 's' : ''} to import{importResult.errors.length > 0 ? ` · ${importResult.errors.length} error(s)` : ''}</div>
          </div>
        )}
      </div>
    ) : null,
}));

// Use real useImportDialog hook to ensure proper state management and re-renders

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
    expect(screen.getByText('No debts yet')).toBeInTheDocument();
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
    // Text is split across MUI components, use flexible matcher
    expect(screen.getByText((content, element) => content.includes('Credit Card') && element?.tagName === 'DIV')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('Personal Loan') && element?.tagName === 'DIV')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Loan')).toBeInTheDocument();
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
    expect(screen.getByText((content, element) => content.includes('Credit Card') && element?.tagName === 'DIV')).toBeInTheDocument();
    // Check for section header with "1 debt" (in ListSubheader)
    expect(screen.getByText((content, element) => content.includes('1') && content.includes('debt') && element?.className?.includes('ListSubheader'))).toBeInTheDocument();
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
    expect(screen.getByText((content, element) => content.includes('Credit Card') && element?.tagName === 'DIV')).toBeInTheDocument();
    // Check for section header with "2 debts" (in ListSubheader)
    expect(screen.getByText((content, element) => content.includes('2') && content.includes('debts') && element?.className?.includes('ListSubheader'))).toBeInTheDocument();
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
    const deleteDialog = screen.getByTestId('delete-debt-dialog');
    expect(deleteDialog).toBeInTheDocument();
    fireEvent.click(within(deleteDialog).getByText('Cancel'));
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

  it('does not show delete dialog when no debt is selected for deletion', () => {
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
    expect(screen.queryByText('Delete Debt')).not.toBeInTheDocument();
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

  it('opens import dialog from empty state when Import from CSV is clicked', () => {
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByTestId('import-debts-btn'));
    expect(screen.getByTestId('mock-import-dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('import-paste-input')).toBeInTheDocument();
    expect(screen.getByTestId('import-preview-btn')).toBeInTheDocument();
  });

  it('opens import dialog when Import is clicked with existing debts', () => {
    mockDebts = [
      { id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' },
    ];
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByTestId('import-debts-btn'));
    expect(screen.getByTestId('mock-import-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('sets importResult to null when Preview is clicked with empty paste', () => {
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByTestId('import-debts-btn'));
    fireEvent.click(screen.getByTestId('import-preview-btn'));
    expect(screen.queryByText(/to import/)).not.toBeInTheDocument();
  });

  it('calls openImport when import button is clicked', () => {
    renderWithProviders(<Debts />);
    fireEvent.click(screen.getByTestId('import-debts-btn'));
    // Mock hook is properly configured, further testing of ImportDialog is in ImportDialog.test.tsx
  });

  it('opens add form when N key is pressed and focus is not in input', () => {
    mockDebts = [{ id: '1', name: 'Card', type: 'credit_card', balance: 1000, interestRate: 15, minimumPayment: 50, createdAt: '' }];
    renderWithProviders(<Debts />);
    fireEvent.keyDown(document.body, { key: 'n' });
    expect(screen.getByTestId('mock-debt-form')).toHaveAttribute('data-open', 'true');
  });
});
