import { formatCurrency, formatYAxisLabel, getMonthYearLabel } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('formats amounts under 1000', () => {
      expect(formatCurrency(1)).toBe('$1.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(500)).toBe('$500.00');
    });

    it('formats negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('rounds to 2 decimal places', () => {
      expect(formatCurrency(1234.567)).toBe('$1,234.57');
      expect(formatCurrency(1234.564)).toBe('$1,234.56');
    });

    it('formats large numbers with commas', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000.00');
    });
  });

  describe('formatYAxisLabel', () => {
    it('formats zero', () => {
      expect(formatYAxisLabel(0)).toBe('$0');
    });

    it('formats values under 1000', () => {
      expect(formatYAxisLabel(1)).toBe('$1');
      expect(formatYAxisLabel(500)).toBe('$500');
      expect(formatYAxisLabel(999)).toBe('$999');
    });

    it('formats thousands with k suffix', () => {
      expect(formatYAxisLabel(1000)).toBe('$1.0k');
      expect(formatYAxisLabel(5500)).toBe('$5.5k');
      expect(formatYAxisLabel(10000)).toBe('$10.0k');
      expect(formatYAxisLabel(999999)).toBe('$1000.0k');
    });

    it('formats millions with M suffix', () => {
      expect(formatYAxisLabel(1000000)).toBe('$1.0M');
      expect(formatYAxisLabel(2500000)).toBe('$2.5M');
      expect(formatYAxisLabel(1000000000)).toBe('$1000.0M');
    });

    it('handles negative values', () => {
      expect(formatYAxisLabel(-500)).toBe('$-500');
      expect(formatYAxisLabel(-5000)).toBe('$-5.0k');
      expect(formatYAxisLabel(-1000000)).toBe('$-1.0M');
    });

    it('rounds to 1 decimal place for k and M', () => {
      expect(formatYAxisLabel(1234)).toBe('$1.2k');
      expect(formatYAxisLabel(1250)).toBe('$1.3k');
      expect(formatYAxisLabel(1234567)).toBe('$1.2M');
    });
  });

  describe('getMonthYearLabel', () => {
    it('returns formatted month and year for current month', () => {
      const result = getMonthYearLabel(0);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
    });

    it('handles future months', () => {
      const result = getMonthYearLabel(12);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
    });

    it('handles past months', () => {
      const result = getMonthYearLabel(-1);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
    });

    it('returns correct month name for current month', () => {
      const now = new Date();
      const result = getMonthYearLabel(0);
      const expectedMonth = now.toLocaleDateString('en-US', { month: 'short' });
      expect(result).toContain(expectedMonth);
    });

    it('increments year correctly after December', () => {
      const now = new Date();
      const currentYear = now.getFullYear();

      // Go forward 13 months to cross year boundary
      const result = getMonthYearLabel(13);
      expect(result).toContain(String(currentYear + 1));
    });

    it('handles large month offsets', () => {
      const result = getMonthYearLabel(120);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
      // Should be 10 years in future
      const now = new Date();
      const expectedYear = now.getFullYear() + 10;
      expect(result).toContain(String(expectedYear));
    });
  });
});
