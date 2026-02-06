/**
 * Formatting utilities for consistent display across the application.
 */

/**
 * Format a number as US currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format Y-axis labels for charts with abbreviated units
 * @param value - The numeric value to format
 * @returns Abbreviated currency string (e.g., "$1.2M", "$5.0k")
 */
export function formatYAxisLabel(value: number): string {
  if (value === 0) return '$0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

/**
 * Get a formatted month-year label for a given month offset
 * @param monthIndex - Months from current date (0 = current month)
 * @returns Formatted date string (e.g., "Jan 2027")
 */
export function getMonthYearLabel(monthIndex: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthIndex);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
