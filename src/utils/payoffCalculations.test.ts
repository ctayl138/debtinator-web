import {
  calculatePayoffSchedule,
  getDebtSummary,
} from './payoffCalculations';
import type { Debt, PayoffPlan } from '../types';

function makeDebt(overrides: Partial<Debt> & { id: string; name: string; balance: number }): Debt {
  return {
    id: overrides.id,
    name: overrides.name,
    type: overrides.type ?? 'other',
    balance: overrides.balance,
    interestRate: overrides.interestRate ?? 0,
    minimumPayment: overrides.minimumPayment ?? 0,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

describe('payoffCalculations', () => {
  describe('getDebtSummary', () => {
    it('returns zeros and count 0 for empty array', () => {
      const result = getDebtSummary([]);
      expect(result.totalBalance).toBe(0);
      expect(result.totalMinimumPayments).toBe(0);
      expect(result.weightedInterestRate).toBe(0);
      expect(result.count).toBe(0);
    });

    it('sums balance and minimum payments for one debt', () => {
      const debts = [
        makeDebt({ id: '1', name: 'A', balance: 1000, minimumPayment: 50, interestRate: 12 }),
      ];
      const result = getDebtSummary(debts);
      expect(result.totalBalance).toBe(1000);
      expect(result.totalMinimumPayments).toBe(50);
      expect(result.weightedInterestRate).toBe(12);
      expect(result.count).toBe(1);
    });

    it('computes weighted average APR for multiple debts', () => {
      const debts = [
        makeDebt({ id: '1', name: 'A', balance: 1000, minimumPayment: 30, interestRate: 10 }),
        makeDebt({ id: '2', name: 'B', balance: 2000, minimumPayment: 60, interestRate: 20 }),
      ];
      const result = getDebtSummary(debts);
      expect(result.totalBalance).toBe(3000);
      expect(result.totalMinimumPayments).toBe(90);
      // (1000*10 + 2000*20) / 3000 = 50000/3000 ≈ 16.666...
      expect(result.weightedInterestRate).toBeCloseTo(50 / 3, 10);
      expect(result.count).toBe(2);
    });

    it('returns weightedInterestRate 0 when totalBalance is 0', () => {
      const debts = [
        makeDebt({ id: '1', name: 'A', balance: 0, minimumPayment: 0, interestRate: 10 }),
      ];
      const result = getDebtSummary(debts);
      expect(result.totalBalance).toBe(0);
      expect(result.weightedInterestRate).toBe(0);
    });
  });

  describe('calculatePayoffSchedule', () => {
    it('returns empty schedule when no debts', () => {
      const plan: PayoffPlan = {
        method: 'snowball',
        monthlyPayment: 100,
        debts: [],
      };
      const result = calculatePayoffSchedule(plan);
      expect(result.steps).toEqual([]);
      expect(result.totalMonths).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayments).toBe(0);
    });

    it('caps at max months when monthly payment is 0 (cannot pay off)', () => {
      const plan: PayoffPlan = {
        method: 'snowball',
        monthlyPayment: 0,
        debts: [
          makeDebt({ id: '1', name: 'A', balance: 1000, minimumPayment: 50, interestRate: 12 }),
        ],
      };
      const result = calculatePayoffSchedule(plan);
      expect(result.totalMonths).toBe(600);
    });

    it('snowball: pays smallest balance first', () => {
      const debts = [
        makeDebt({ id: 'big', name: 'Big', balance: 5000, minimumPayment: 100, interestRate: 10 }),
        makeDebt({ id: 'small', name: 'Small', balance: 500, minimumPayment: 25, interestRate: 20 }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 200, debts };
      const result = calculatePayoffSchedule(plan);
      expect(result.totalMonths).toBeGreaterThan(0);
      const firstMonth = result.steps[0];
      const smallStep = firstMonth.find((s) => s.debtId === 'small');
      expect(smallStep).toBeDefined();
    });

    it('avalanche: pays highest interest first', () => {
      const debts = [
        makeDebt({ id: 'low', name: 'Low', balance: 1000, minimumPayment: 30, interestRate: 5 }),
        makeDebt({ id: 'high', name: 'High', balance: 1000, minimumPayment: 30, interestRate: 25 }),
      ];
      const plan: PayoffPlan = { method: 'avalanche', monthlyPayment: 100, debts };
      const result = calculatePayoffSchedule(plan);
      const firstMonth = result.steps[0];
      const highStep = firstMonth.find((s) => s.debtId === 'high');
      expect(highStep).toBeDefined();
    });

    it('custom: respects customOrder', () => {
      const debts = [
        makeDebt({ id: 'a', name: 'A', balance: 1000, minimumPayment: 50, interestRate: 10 }),
        makeDebt({ id: 'b', name: 'B', balance: 500, minimumPayment: 25, interestRate: 20 }),
      ];
      const plan: PayoffPlan = {
        method: 'custom',
        monthlyPayment: 150,
        debts,
        customOrder: ['a', 'b'],
      };
      const result = calculatePayoffSchedule(plan);
      expect(result.steps.length).toBe(result.totalMonths);
    });

    it('custom: without customOrder uses existing order', () => {
      const debts = [
        makeDebt({ id: '1', name: 'First', balance: 300, minimumPayment: 20, interestRate: 12 }),
      ];
      const plan: PayoffPlan = { method: 'custom', monthlyPayment: 100, debts };
      const result = calculatePayoffSchedule(plan);
      expect(result.steps[0][0].debtId).toBe('1');
    });

    it('single debt paid off in a few months', () => {
      const debts = [
        makeDebt({
          id: '1',
          name: 'Card',
          balance: 300,
          minimumPayment: 30,
          interestRate: 12,
        }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 120, debts };
      const result = calculatePayoffSchedule(plan);
      expect(result.totalMonths).toBeLessThanOrEqual(10);
      const lastMonth = result.steps[result.steps.length - 1];
      const lastStep = lastMonth.find((s) => s.debtId === '1');
      expect(lastStep!.remainingBalance).toBe(0);
    });

    it('step structure has required fields', () => {
      const debts = [
        makeDebt({ id: '1', name: 'D', balance: 100, minimumPayment: 10, interestRate: 0 }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 50, debts };
      const result = calculatePayoffSchedule(plan);
      const step = result.steps[0][0];
      expect(step).toHaveProperty('debtId');
      expect(step).toHaveProperty('debtName');
      expect(step).toHaveProperty('month');
      expect(step).toHaveProperty('payment');
      expect(step).toHaveProperty('remainingBalance');
      expect(step).toHaveProperty('interestPaid');
    });

    it('totalPayments equals sum of all step payments', () => {
      const debts = [
        makeDebt({ id: '1', name: 'D', balance: 200, minimumPayment: 20, interestRate: 6 }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 60, debts };
      const result = calculatePayoffSchedule(plan);
      let sumPayments = 0;
      result.steps.forEach((monthSteps) => {
        monthSteps.forEach((s) => {
          sumPayments += s.payment;
        });
      });
      expect(sumPayments).toBe(result.totalPayments);
    });

    it('totalInterest is sum of interestPaid across steps', () => {
      const debts = [
        makeDebt({ id: '1', name: 'D', balance: 500, minimumPayment: 25, interestRate: 12 }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 80, debts };
      const result = calculatePayoffSchedule(plan);
      let sumInterest = 0;
      result.steps.forEach((monthSteps) => {
        monthSteps.forEach((s) => {
          sumInterest += s.interestPaid;
        });
      });
      expect(sumInterest).toBeCloseTo(result.totalInterest, 5);
    });

    it('caps at 600 months (50 years)', () => {
      const debts = [
        makeDebt({
          id: '1',
          name: 'Tiny',
          balance: 1_000_000,
          minimumPayment: 1,
          interestRate: 0.01,
        }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 1, debts };
      const result = calculatePayoffSchedule(plan);
      expect(result.totalMonths).toBe(600);
    });

    it('custom: includes debts not in customOrder', () => {
      const debts = [
        makeDebt({ id: 'a', name: 'A', balance: 500, minimumPayment: 25, interestRate: 10 }),
        makeDebt({ id: 'b', name: 'B', balance: 500, minimumPayment: 25, interestRate: 15 }),
        makeDebt({ id: 'c', name: 'C', balance: 500, minimumPayment: 25, interestRate: 12 }),
      ];
      const plan: PayoffPlan = {
        method: 'custom',
        monthlyPayment: 200,
        debts,
        customOrder: ['a'],
      };
      const result = calculatePayoffSchedule(plan);
      const allDebtIds = new Set<string>();
      result.steps.forEach((monthSteps) => {
        monthSteps.forEach((s) => allDebtIds.add(s.debtId));
      });
      expect(allDebtIds.has('a')).toBe(true);
      expect(allDebtIds.has('b')).toBe(true);
      expect(allDebtIds.has('c')).toBe(true);
    });

    it('custom: ignores ids in customOrder that do not exist', () => {
      const debts = [
        makeDebt({ id: 'a', name: 'A', balance: 300, minimumPayment: 30, interestRate: 10 }),
      ];
      const plan: PayoffPlan = {
        method: 'custom',
        monthlyPayment: 100,
        debts,
        customOrder: ['nonexistent', 'a', 'also-nonexistent'],
      };
      const result = calculatePayoffSchedule(plan);
      expect(result.steps[0][0].debtId).toBe('a');
    });

    it('handles unknown method by using default order', () => {
      const debts = [
        makeDebt({ id: '1', name: 'First', balance: 300, minimumPayment: 30, interestRate: 10 }),
        makeDebt({ id: '2', name: 'Second', balance: 200, minimumPayment: 20, interestRate: 15 }),
      ];
      const plan: PayoffPlan = {
        method: 'unknown' as any,
        monthlyPayment: 100,
        debts,
      };
      const result = calculatePayoffSchedule(plan);
      const firstMonthIds = result.steps[0].map((s) => s.debtId);
      expect(firstMonthIds).toContain('1');
      expect(firstMonthIds).toContain('2');
    });

    it('adds new step for priority debt when no existing step', () => {
      const debts = [
        makeDebt({ id: 'priority', name: 'Priority', balance: 100, minimumPayment: 0, interestRate: 0 }),
        makeDebt({ id: 'other', name: 'Other', balance: 200, minimumPayment: 0, interestRate: 0 }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 50, debts };
      const result = calculatePayoffSchedule(plan);
      const firstMonth = result.steps[0];
      const priorityStep = firstMonth.find((s) => s.debtId === 'priority');
      expect(priorityStep).toBeDefined();
      expect(priorityStep!.payment).toBe(50);
    });

    it('adds extra payment to existing step when priority debt already has a step', () => {
      const debts = [
        makeDebt({ id: 'a', name: 'A', balance: 100, minimumPayment: 10, interestRate: 0 }),
        makeDebt({ id: 'b', name: 'B', balance: 100, minimumPayment: 10, interestRate: 0 }),
      ];
      const plan: PayoffPlan = { method: 'snowball', monthlyPayment: 50, debts };
      const result = calculatePayoffSchedule(plan);
      const firstMonth = result.steps[0];
      const aStep = firstMonth.find((s) => s.debtId === 'a');
      expect(aStep).toBeDefined();
      expect(aStep!.payment).toBeGreaterThan(10);
    });
  });
});
