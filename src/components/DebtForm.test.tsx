import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '@/theme/muiTheme';
import DebtForm from './DebtForm';
import type { Debt } from '@/types';

function wrap(children: React.ReactNode) {
  return (
    <MuiThemeProvider theme={getAppTheme('light')}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

describe('DebtForm', () => {
  it('renders add form when no debt provided', () => {
    render(
      wrap(
        <DebtForm
          open
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      )
    );
    expect(screen.getByText('Add New Debt')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Credit Card, Car Loan/)).toBeInTheDocument();
    expect(screen.getByText('Add Debt')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders edit form when debt provided', () => {
    const debt: Debt = {
      id: '1',
      name: 'My Card',
      type: 'credit_card',
      balance: 500,
      interestRate: 15,
      minimumPayment: 25,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    render(
      wrap(
        <DebtForm
          open
          debt={debt}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      )
    );
    expect(screen.getByDisplayValue('My Card')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    expect(screen.getByText('Update Debt')).toBeInTheDocument();
  });

  it('shows Delete Debt button when debt and onDelete provided', () => {
    const debt: Debt = {
      id: '1',
      name: 'Card',
      type: 'credit_card',
      balance: 100,
      interestRate: 10,
      minimumPayment: 10,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const onDelete = jest.fn();
    render(
      wrap(
        <DebtForm
          open
          debt={debt}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          onDelete={onDelete}
        />
      )
    );
    const deleteBtn = screen.getByText('Delete Debt');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not show Delete Debt when no debt', () => {
    render(
      wrap(
        <DebtForm open onSubmit={jest.fn()} onCancel={jest.fn()} onDelete={jest.fn()} />
      )
    );
    expect(screen.queryByText('Delete Debt')).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = jest.fn();
    render(wrap(<DebtForm open onSubmit={jest.fn()} onCancel={onCancel} />));
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('submit button is disabled when name empty', () => {
    render(wrap(<DebtForm open onSubmit={jest.fn()} onCancel={jest.fn()} />));
    fireEvent.change(screen.getByTestId('debt-form-balance'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Interest Rate/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/Minimum Payment/i), { target: { value: '50' } });
    expect(screen.getByTestId('debt-form-submit')).toBeDisabled();
  });

  it('submit button is disabled when balance is zero', () => {
    render(wrap(<DebtForm open onSubmit={jest.fn()} onCancel={jest.fn()} />));
    fireEvent.change(screen.getByTestId('debt-form-name'), { target: { value: 'Card' } });
    fireEvent.change(screen.getByTestId('debt-form-balance'), { target: { value: '0' } });
    expect(screen.getByTestId('debt-form-submit')).toBeDisabled();
  });

  it('calls onSubmit with trimmed data when valid', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm open onSubmit={onSubmit} onCancel={jest.fn()} />));
    fireEvent.change(screen.getByTestId('debt-form-name'), { target: { value: '  Test Card  ' } });
    fireEvent.change(screen.getByTestId('debt-form-balance'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Interest Rate/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/Minimum Payment/i), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Add Debt'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Card',
        type: 'other',
        balance: 1000,
        interestRate: 18,
        minimumPayment: 50,
      })
    );
  });

  it('allows changing debt type via radio buttons', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm open onSubmit={onSubmit} onCancel={jest.fn()} />));
    fireEvent.change(screen.getByTestId('debt-form-name'), { target: { value: 'Test Debt' } });
    fireEvent.change(screen.getByTestId('debt-form-balance'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Interest Rate/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/Minimum Payment/i), { target: { value: '50' } });
    fireEvent.click(screen.getByLabelText('Credit Card'));
    fireEvent.click(screen.getByText('Add Debt'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'credit_card',
      })
    );
  });

  it('allows selecting personal loan type', () => {
    const onSubmit = jest.fn();
    render(wrap(<DebtForm open onSubmit={onSubmit} onCancel={jest.fn()} />));
    fireEvent.change(screen.getByTestId('debt-form-name'), { target: { value: 'Test Loan' } });
    fireEvent.change(screen.getByTestId('debt-form-balance'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/Interest Rate/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/Minimum Payment/i), { target: { value: '100' } });
    fireEvent.click(screen.getByLabelText('Personal Loan'));
    fireEvent.click(screen.getByText('Add Debt'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'personal_loan',
      })
    );
  });
});
