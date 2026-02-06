import * as XLSX from 'xlsx';
import type { Debt, PayoffMethod, PayoffSchedule, PayoffStep } from '../types';
import { calculatePayoffSchedule, getDebtSummary } from './payoffCalculations';
import { DEBT_TYPE_LABELS, PAYOFF_METHOD_LABELS_EXTENDED as PAYOFF_METHOD_LABELS } from './constants';

export interface ExportData {
  debts: Debt[];
  monthlyIncome: number;
  payoffMethod: PayoffMethod;
  monthlyPayment: number;
  customOrder?: string[];
}

export function createExportWorkbook(data: ExportData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { debts, monthlyIncome, payoffMethod, monthlyPayment, customOrder } = data;

  const totalMinimumPayments = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const payment = parseFloat(String(monthlyPayment)) || 0;
  const hasValidPlan = debts.length > 0 && payment >= totalMinimumPayments;

  const schedule: PayoffSchedule | null = hasValidPlan
    ? calculatePayoffSchedule({
        method: payoffMethod,
        monthlyPayment: payment,
        debts,
        customOrder,
      })
    : null;

  const summary = getDebtSummary(debts);

  const summaryRows = [
    ['Debt Counseling Export – Summary'],
    ['Generated', new Date().toISOString()],
    [],
    ['Total Debt', summary.totalBalance],
    ['Total Minimum Monthly Payments', summary.totalMinimumPayments],
    ['Weighted Average Interest Rate (%)', summary.weightedInterestRate.toFixed(2)],
    ['Debt Count', summary.count],
    [],
    ['Monthly Income', monthlyIncome],
    ['Payoff Method', PAYOFF_METHOD_LABELS[payoffMethod]],
    ['Monthly Payment (planned)', payment],
    [],
    ...(schedule
      ? [
          ['Time to Payoff (months)', schedule.totalMonths],
          ['Time to Payoff (years)', (schedule.totalMonths / 12).toFixed(1)],
          ['Total Interest to Pay', schedule.totalInterest],
          ['Total Payments (Principal + Interest)', schedule.totalPayments],
          ...(monthlyIncome > 0
            ? [
                [],
                ['Debt-to-Income (minimums)', `${((summary.totalMinimumPayments / monthlyIncome) * 100).toFixed(1)}%`],
                ['Debt-to-Income (planned payment)', `${((payment / monthlyIncome) * 100).toFixed(1)}%`],
              ]
            : []),
        ]
      : [['Note', 'Set a valid monthly payment on the Payoff tab to see schedule.']]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const debtRows = [
    ['Name', 'Type', 'Balance', 'Interest Rate (%)', 'Minimum Payment', 'Date Added'],
    ...debts.map((d) => [
      d.name,
      DEBT_TYPE_LABELS[d.type] ?? d.type,
      d.balance,
      d.interestRate,
      d.minimumPayment,
      d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '',
    ]),
  ];
  const wsDebts = XLSX.utils.aoa_to_sheet(debtRows);
  XLSX.utils.book_append_sheet(wb, wsDebts, 'Debts');

  const incomePlanRows = [
    ['Income & Payoff Plan'],
    [],
    ['Monthly Income', monthlyIncome],
    ['Payoff Method', PAYOFF_METHOD_LABELS[payoffMethod]],
    ['Planned Monthly Payment', payment],
  ];
  const wsIncome = XLSX.utils.aoa_to_sheet(incomePlanRows);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Income & Plan');

  if (schedule && schedule.steps.length > 0) {
    const scheduleRows: (string | number)[][] = [
      ['Month', 'Debt Name', 'Payment', 'Remaining Balance', 'Interest Paid'],
    ];
    schedule.steps.forEach((monthSteps, idx) => {
      const month = idx + 1;
      monthSteps.forEach((step: PayoffStep) => {
        scheduleRows.push([
          month,
          step.debtName,
          step.payment,
          step.remainingBalance,
          step.interestPaid,
        ]);
      });
    });
    const wsSchedule = XLSX.utils.aoa_to_sheet(scheduleRows);
    XLSX.utils.book_append_sheet(wb, wsSchedule, 'Payoff Schedule');
  }

  return wb;
}

export function workbookToBinary(wb: XLSX.WorkBook): Uint8Array {
  const bin = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(bin);
}

/**
 * Trigger browser download of Excel file (client-side only; no data sent to server).
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  const bin = workbookToBinary(wb);
  const blob = new Blob([bin], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
