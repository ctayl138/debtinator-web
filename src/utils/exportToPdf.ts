import type { ExportData } from './exportToExcel';
import { calculatePayoffSchedule, getDebtSummary } from './payoffCalculations';
import { formatCurrency } from './formatters';
import { DEBT_TYPE_LABELS, PAYOFF_METHOD_LABELS, PRINT_DIALOG_TIMEOUT } from './constants';
import i18n from '@/i18n/config';

/**
 * Build a print-friendly HTML string from export data and open print dialog (user can Save as PDF).
 */
export function printExportAsPdf(data: ExportData): void {
  const t = i18n.t.bind(i18n);
  const { debts, monthlyIncome, payoffMethod, monthlyPayment, customOrder } = data;
  const summary = getDebtSummary(debts);
  const payment = parseFloat(String(monthlyPayment)) || 0;
  const totalMinimumPayments = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const hasValidPlan = debts.length > 0 && payment >= totalMinimumPayments;
  const schedule = hasValidPlan
    ? calculatePayoffSchedule({
        method: payoffMethod,
        monthlyPayment: payment,
        debts,
        customOrder,
      })
    : null;

  const rows: string[] = [];
  rows.push(`<h1>${t('export:pdfTitle')}</h1>`);
  rows.push(`<p>${t('export:generated', { date: new Date().toLocaleString() })}</p>`);
  rows.push(`<h2>${t('export:summary')}</h2><table><tbody>`);
  rows.push(`<tr><td>${t('export:totalDebt')}</td><td>${formatCurrency(summary.totalBalance)}</td></tr>`);
  rows.push(`<tr><td>${t('export:totalMinPayments')}</td><td>${formatCurrency(summary.totalMinimumPayments)}</td></tr>`);
  rows.push(`<tr><td>${t('export:averageApr')}</td><td>${summary.weightedInterestRate.toFixed(2)}%</td></tr>`);
  rows.push(`<tr><td>${t('export:debtCount')}</td><td>${summary.count}</td></tr>`);
  rows.push(`<tr><td>${t('export:monthlyIncome')}</td><td>${formatCurrency(monthlyIncome)}</td></tr>`);
  rows.push(`<tr><td>${t('export:payoffMethod')}</td><td>${PAYOFF_METHOD_LABELS[payoffMethod] ?? payoffMethod}</td></tr>`);
  rows.push(`<tr><td>${t('export:plannedPayment')}</td><td>${formatCurrency(payment)}</td></tr>`);
  if (schedule) {
    rows.push(`<tr><td>${t('export:timeToPayoff')}</td><td>${t('export:months', { count: schedule.totalMonths })}</td></tr>`);
    rows.push(`<tr><td>${t('export:totalInterest')}</td><td>${formatCurrency(schedule.totalInterest)}</td></tr>`);
    rows.push(`<tr><td>${t('export:totalPayments')}</td><td>${formatCurrency(schedule.totalPayments)}</td></tr>`);
  }
  rows.push('</tbody></table>');

  rows.push(`<h2>${t('export:debtsTableTitle')}</h2><table><thead><tr><th>${t('export:colName')}</th><th>${t('export:colType')}</th><th>${t('export:colBalance')}</th><th>${t('export:colApr')}</th><th>${t('export:colMinPayment')}</th></tr></thead><tbody>`);
  debts.forEach((d) => {
    rows.push(
      `<tr><td>${escapeHtml(d.name)}</td><td>${DEBT_TYPE_LABELS[d.type] ?? d.type}</td><td>${formatCurrency(d.balance)}</td><td>${d.interestRate.toFixed(2)}%</td><td>${formatCurrency(d.minimumPayment)}</td></tr>`
    );
  });
  rows.push('</tbody></table>');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Debtinator Export</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;max-width:800px;margin:0 auto;} table{border-collapse:collapse;width:100%;margin:1em 0;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f5f5f5;} h1{font-size:1.5em;} h2{font-size:1.2em;margin-top:1.5em;}</style></head><body>${rows.join('')}</body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    console.warn('Popup blocked – allow popups to export as PDF');
    alert(t('export:popupBlocked'));
    return;
  }

  try {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      try {
        win.print();
      } catch (err) {
        console.error('Failed to print:', err);
      } finally {
        win.close();
      }
    }, PRINT_DIALOG_TIMEOUT);
  } catch (err) {
    console.error('Failed to write to print window:', err);
    win.close();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
