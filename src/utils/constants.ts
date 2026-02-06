/**
 * Application-wide constants including UI configuration, limits, and labels.
 */

/** Timeout for print dialog to allow browser render (milliseconds) */
export const PRINT_DIALOG_TIMEOUT = 250;

/** Maximum months to calculate in payoff schedule to prevent infinite loops */
export const MAX_PAYOFF_MONTHS = 600;

/** Z-index for floating action buttons (above content, below modals) */
export const Z_INDEX_FAB = 1100;

/** Z-index for bottom navigation (above content, below FAB and modals) */
export const Z_INDEX_BOTTOM_NAV = 1050;

/** Debt type display labels */
export const DEBT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  other: 'Other',
} as const;

/** Payoff method display labels */
export const PAYOFF_METHOD_LABELS: Record<string, string> = {
  snowball: 'Snowball',
  avalanche: 'Avalanche',
  custom: 'Custom',
} as const;

/** Extended payoff method labels with descriptions */
export const PAYOFF_METHOD_LABELS_EXTENDED: Record<string, string> = {
  snowball: 'Snowball (smallest balance first)',
  avalanche: 'Avalanche (highest interest first)',
  custom: 'Custom',
} as const;
