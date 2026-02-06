import type { Debt, PayoffPlan, PayoffSchedule, PayoffStep } from '../types';
import { MAX_PAYOFF_MONTHS } from './constants';

function getMonthlyInterestRate(apr: number): number {
  return apr / 100 / 12;
}

function applyPayment(
  balance: number,
  payment: number
): { newBalance: number; principalPaid: number } {
  const principalPaid = Math.min(payment, balance);
  const newBalance = balance - principalPaid;
  return {
    newBalance: Math.max(0, newBalance),
    principalPaid,
  };
}

function sortBySnowball(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

function sortByAvalanche(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

function sortByCustom(debts: Debt[], customOrder: string[]): Debt[] {
  const debtMap = new Map(debts.map((d) => [d.id, d]));
  const remaining = new Set(debts.map((d) => d.id));
  const ordered: Debt[] = [];
  for (const id of customOrder) {
    if (debtMap.has(id) && remaining.has(id)) {
      ordered.push(debtMap.get(id)!);
      remaining.delete(id);
    }
  }
  for (const id of remaining) {
    ordered.push(debtMap.get(id)!);
  }
  return ordered;
}

/**
 * Calculate the complete payoff schedule for a debt payoff plan.
 * Uses the avalanche method (highest interest first), snowball method (smallest balance first),
 * or a custom order specified by the user.
 *
 * Algorithm:
 * 1. Sort debts by chosen method (avalanche, snowball, or custom order)
 * 2. For each month:
 *    - Accrue interest on all remaining balances
 *    - Pay minimum on each debt
 *    - Apply extra payment to priority debt (first in sorted order)
 * 3. Continue until all debts are paid or MAX_PAYOFF_MONTHS reached (prevents infinite loops)
 *
 * @param plan - The payoff plan configuration (method, monthly payment, debts, custom order)
 * @returns Complete payoff schedule with month-by-month breakdown, total months, total interest, and total payments
 */
export function calculatePayoffSchedule(plan: PayoffPlan): PayoffSchedule {
  const { method, monthlyPayment, debts, customOrder } = plan;

  let orderedDebts: Debt[];
  switch (method) {
    case 'snowball':
      orderedDebts = sortBySnowball(debts);
      break;
    case 'avalanche':
      orderedDebts = sortByAvalanche(debts);
      break;
    case 'custom':
      orderedDebts = customOrder ? sortByCustom(debts, customOrder) : [...debts];
      break;
    default:
      orderedDebts = [...debts];
  }

  const workingDebts = orderedDebts.map((debt) => ({
    ...debt,
    balance: debt.balance,
  }));

  const steps: PayoffStep[][] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPayments = 0;

  while (workingDebts.some((d) => d.balance > 0)) {
    month++;
    const monthlySteps: PayoffStep[] = [];
    let remainingPayment = monthlyPayment;

    const interestAccrued = new Map<string, number>();
    for (const debt of workingDebts) {
      if (debt.balance <= 0) continue;
      const monthlyRate = getMonthlyInterestRate(debt.interestRate);
      const interest = debt.balance * monthlyRate;
      interestAccrued.set(debt.id, interest);
      debt.balance += interest;
      totalInterest += interest;
    }

    for (const debt of workingDebts) {
      if (debt.balance <= 0) continue;
      const minPayment = Math.min(debt.minimumPayment, debt.balance);
      const payment = Math.min(minPayment, remainingPayment);
      if (payment > 0) {
        const result = applyPayment(debt.balance, payment);
        debt.balance = result.newBalance;
        totalPayments += payment;
        remainingPayment -= payment;
        monthlySteps.push({
          debtId: debt.id,
          debtName: debt.name,
          month,
          payment,
          remainingBalance: debt.balance,
          interestPaid: interestAccrued.get(debt.id) || 0,
        });
      }
    }

    if (remainingPayment > 0) {
      const priorityDebt = workingDebts.find((d) => d.balance > 0);
      if (priorityDebt) {
        const result = applyPayment(priorityDebt.balance, remainingPayment);
        const payment = result.principalPaid;
        priorityDebt.balance = result.newBalance;
        totalPayments += payment;
        const existingStep = monthlySteps.find((s) => s.debtId === priorityDebt.id);
        if (existingStep) {
          existingStep.payment += payment;
          existingStep.remainingBalance = priorityDebt.balance;
        } else {
          monthlySteps.push({
            debtId: priorityDebt.id,
            debtName: priorityDebt.name,
            month,
            payment,
            remainingBalance: priorityDebt.balance,
            interestPaid: interestAccrued.get(priorityDebt.id) || 0,
          });
        }
      }
    }

    steps.push(monthlySteps);
    if (month >= MAX_PAYOFF_MONTHS) break;
  }

  return {
    steps,
    totalMonths: month,
    totalInterest,
    totalPayments,
  };
}

export function getDebtSummary(debts: Debt[]) {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );
  const weightedInterestRate =
    debts.reduce((sum, debt) => sum + debt.balance * debt.interestRate, 0) /
    totalBalance;
  return {
    totalBalance,
    totalMinimumPayments,
    weightedInterestRate: isNaN(weightedInterestRate) ? 0 : weightedInterestRate,
    count: debts.length,
  };
}
