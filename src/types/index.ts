export type DebtType = 'credit_card' | 'personal_loan' | 'other';

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: string;
}

export type PayoffMethod = 'snowball' | 'avalanche' | 'custom';

export interface PayoffPlan {
  method: PayoffMethod;
  monthlyPayment: number;
  debts: Debt[];
  customOrder?: string[];
}

export interface PayoffStep {
  debtId: string;
  debtName: string;
  month: number;
  payment: number;
  remainingBalance: number;
  interestPaid: number;
}

export interface PayoffSchedule {
  steps: PayoffStep[][];
  totalMonths: number;
  totalInterest: number;
  totalPayments: number;
}
