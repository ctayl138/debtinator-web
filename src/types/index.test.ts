import type {
  Debt,
  DebtType,
  PayoffMethod,
  PayoffPlan,
  PayoffStep,
  PayoffSchedule,
} from './index';

describe('types/index', () => {
  it('exports DebtType union values', () => {
    const validTypes: DebtType[] = ['credit_card', 'personal_loan', 'other'];
    expect(validTypes).toHaveLength(3);
    expect(validTypes).toContain('credit_card');
    expect(validTypes).toContain('other');
  });

  it('exports PayoffMethod union values', () => {
    const validMethods: PayoffMethod[] = ['snowball', 'avalanche', 'custom'];
    expect(validMethods).toHaveLength(3);
    expect(validMethods).toContain('snowball');
  });

  it('Debt-like object has required fields', () => {
    const debt: Debt = {
      id: '1',
      name: 'Test',
      type: 'credit_card',
      balance: 1000,
      interestRate: 18,
      minimumPayment: 50,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    expect(debt.id).toBe('1');
    expect(debt.name).toBe('Test');
    expect(debt.type).toBe('credit_card');
    expect(debt.balance).toBe(1000);
    expect(debt.interestRate).toBe(18);
    expect(debt.minimumPayment).toBe(50);
    expect(debt.createdAt).toBeDefined();
  });

  it('PayoffPlan-like object has required fields', () => {
    const plan: PayoffPlan = {
      method: 'snowball',
      monthlyPayment: 200,
      debts: [],
    };
    expect(plan.method).toBe('snowball');
    expect(plan.monthlyPayment).toBe(200);
    expect(Array.isArray(plan.debts)).toBe(true);
  });

  it('PayoffStep-like object has required fields', () => {
    const step: PayoffStep = {
      debtId: '1',
      debtName: 'Card',
      month: 1,
      payment: 100,
      remainingBalance: 900,
      interestPaid: 15,
    };
    expect(step.debtId).toBe('1');
    expect(step.month).toBe(1);
    expect(step.payment).toBe(100);
  });

  it('PayoffSchedule-like object has required fields', () => {
    const schedule: PayoffSchedule = {
      steps: [],
      totalMonths: 0,
      totalInterest: 0,
      totalPayments: 0,
    };
    expect(Array.isArray(schedule.steps)).toBe(true);
    expect(schedule.totalMonths).toBe(0);
    expect(schedule.totalInterest).toBe(0);
    expect(schedule.totalPayments).toBe(0);
  });
});
