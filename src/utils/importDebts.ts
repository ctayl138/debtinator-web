import type { DebtType } from '../types';

export interface ImportRow {
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type: DebtType;
  tag?: string;
}

export interface ImportResult {
  rows: ImportRow[];
  errors: string[];
}

/**
 * Normalize a string to a valid DebtType.
 * Handles common variations like "credit card" vs "credit_card".
 *
 * @param value - Input string to normalize
 * @returns Valid DebtType ('credit_card', 'personal_loan', or 'other')
 */
function normalizeType(value: string): DebtType {
  const v = value.trim().toLowerCase();
  // Credit card variations
  if (v === 'credit card' || v === 'credit_card' || v === 'card' || v === 'cc') return 'credit_card';
  // Personal loan variations
  if (v === 'personal loan' || v === 'personal_loan' || v === 'loan' || v === 'pl') return 'personal_loan';
  // Default to 'other' for any unrecognized type
  return 'other';
}

function parseNumber(value: string): number | null {
  const cleaned = value.trim().replace(/[$,%\s]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse CSV-like text (comma or tab separated) into import rows.
 * Supports optional header row. Columns: name, balance, interest rate, minimum payment, type (optional).
 */
export function parseCsvText(text: string): ImportResult {
  const errors: string[] = [];
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return { rows: [], errors: ['No lines to parse'] };
  }

  const rows: ImportRow[] = [];
  const first = lines[0].toLowerCase();
  const hasHeader =
    first.includes('name') ||
    first.includes('balance') ||
    first.includes('interest') ||
    first.includes('apr') ||
    first.includes('payment');
  const start = hasHeader ? 1 : 0;

  // Use tab as delimiter if any data line contains tab (allows commas inside numbers)
  const sampleLine = lines[start] ?? '';
  const delimiter = sampleLine.includes('\t') ? '\t' : ',';

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(delimiter).map((p) => p.trim());
    if (parts.length < 4) {
      errors.push(`Line ${i + 1}: need at least 4 columns (name, balance, interest rate, minimum payment)`);
      continue;
    }
    const name = parts[0] || 'Unknown';
    const balance = parseNumber(parts[1]);
    const interestRate = parseNumber(parts[2]);
    const minimumPayment = parseNumber(parts[3]);
    const type = parts[4] != null ? normalizeType(parts[4]) : 'other';
    const tag = parts[5] != null && parts[5].trim() ? parts[5].trim() : undefined;

    if (balance == null || balance < 0) {
      errors.push(`Line ${i + 1}: invalid balance "${parts[1]}"`);
      continue;
    }
    if (interestRate == null || interestRate < 0) {
      errors.push(`Line ${i + 1}: invalid interest rate "${parts[2]}"`);
      continue;
    }
    if (minimumPayment == null || minimumPayment < 0) {
      errors.push(`Line ${i + 1}: invalid minimum payment "${parts[3]}"`);
      continue;
    }

    rows.push({
      name,
      balance,
      interestRate,
      minimumPayment,
      type,
      ...(tag !== undefined && { tag }),
    });
  }

  return { rows, errors };
}

/**
 * Parse a File (CSV) and return import rows. Uses parseCsvText on file content.
 */
export function parseCsvFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      resolve(parseCsvText(text));
    };
    reader.onerror = () => resolve({ rows: [], errors: ['Failed to read file'] });
    reader.readAsText(file, 'UTF-8');
  });
}
