import type { ExportData } from './exportToExcel';
import { calculatePayoffSchedule, getDebtSummary } from './payoffCalculations';
import { formatCurrency } from './formatters';
import { DEBT_TYPE_LABELS, PAYOFF_METHOD_LABELS, PRINT_DIALOG_TIMEOUT } from './constants';

/**
 * Build a print-friendly HTML string from export data and open print dialog (user can Save as PDF).
 */
export function printExportAsPdf(data: ExportData): void {
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
  rows.push('<h1>Debtinator – Debt Summary</h1>');
  rows.push(`<p>Generated: ${new Date().toLocaleString()}</p>`);
  rows.push('<h2>Summary</h2><table><tbody>');
  rows.push(`<tr><td>Total Debt</td><td>${formatCurrency(summary.totalBalance)}</td></tr>`);
  rows.push(`<tr><td>Total Minimum Payments</td><td>${formatCurrency(summary.totalMinimumPayments)}</td></tr>`);
  rows.push(`<tr><td>Average APR</td><td>${summary.weightedInterestRate.toFixed(2)}%</td></tr>`);
  rows.push(`<tr><td>Debt Count</td><td>${summary.count}</td></tr>`);
  rows.push(`<tr><td>Monthly Income</td><td>${formatCurrency(monthlyIncome)}</td></tr>`);
  rows.push(`<tr><td>Payoff Method</td><td>${PAYOFF_METHOD_LABELS[payoffMethod] ?? payoffMethod}</td></tr>`);
  rows.push(`<tr><td>Planned Monthly Payment</td><td>${formatCurrency(payment)}</td></tr>`);
  if (schedule) {
    rows.push(`<tr><td>Time to Payoff</td><td>${schedule.totalMonths} months</td></tr>`);
    rows.push(`<tr><td>Total Interest</td><td>${formatCurrency(schedule.totalInterest)}</td></tr>`);
    rows.push(`<tr><td>Total Payments</td><td>${formatCurrency(schedule.totalPayments)}</td></tr>`);
  }
  rows.push('</tbody></table>');

  rows.push('<h2>Debts</h2><table><thead><tr><th>Name</th><th>Type</th><th>Balance</th><th>APR</th><th>Min Payment</th></tr></thead><tbody>');
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
    alert('Please allow popups for this site to export as PDF');
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
