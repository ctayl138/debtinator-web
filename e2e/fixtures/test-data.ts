import type { DebtFormData } from '../pages';

/**
 * Test data factory for generating test debts.
 */
export const testDebts = {
  creditCard: {
    name: 'Test Credit Card',
    type: 'credit_card' as const,
    balance: '5000',
    interestRate: '18.99',
    minimumPayment: '100',
  },
  personalLoan: {
    name: 'Car Loan',
    type: 'personal_loan' as const,
    balance: '15000',
    interestRate: '6.5',
    minimumPayment: '350',
  },
  other: {
    name: 'Medical Bill',
    type: 'other' as const,
    balance: '2500',
    interestRate: '0',
    minimumPayment: '50',
  },
  highInterest: {
    name: 'High Interest Card',
    type: 'credit_card' as const,
    balance: '3000',
    interestRate: '24.99',
    minimumPayment: '75',
  },
  lowBalance: {
    name: 'Small Debt',
    type: 'other' as const,
    balance: '500',
    interestRate: '10',
    minimumPayment: '20',
  },
} satisfies Record<string, DebtFormData>;

export function createUniqueDebtName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

export function createUniqueDebt(
  baseDebt: DebtFormData,
  namePrefix?: string
): DebtFormData {
  return {
    ...baseDebt,
    name: createUniqueDebtName(namePrefix ?? baseDebt.name),
  };
}

export function createSimpleDebt(overrides: Partial<DebtFormData> = {}): DebtFormData {
  return {
    name: createUniqueDebtName('Test Debt'),
    balance: '1000',
    interestRate: '15',
    minimumPayment: '30',
    ...overrides,
  };
}

export function createMultiDebtScenario(): DebtFormData[] {
  return [
    {
      name: 'Visa Card',
      type: 'credit_card',
      balance: '2000',
      interestRate: '19.99',
      minimumPayment: '50',
    },
    {
      name: 'Student Loan',
      type: 'personal_loan',
      balance: '10000',
      interestRate: '5.5',
      minimumPayment: '200',
    },
  ];
}
