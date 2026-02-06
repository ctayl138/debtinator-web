import {
  DEBT_TYPE_LABELS,
  PAYOFF_METHOD_LABELS,
  PAYOFF_METHOD_LABELS_EXTENDED,
  PRINT_DIALOG_TIMEOUT,
  MAX_PAYOFF_MONTHS,
  Z_INDEX_FAB,
  Z_INDEX_BOTTOM_NAV,
} from './constants';

describe('constants', () => {
  describe('debt type labels', () => {
    it('has all debt type labels', () => {
      expect(DEBT_TYPE_LABELS.credit_card).toBe('Credit Card');
      expect(DEBT_TYPE_LABELS.personal_loan).toBe('Personal Loan');
      expect(DEBT_TYPE_LABELS.other).toBe('Other');
    });

    it('has exactly 3 debt types', () => {
      expect(Object.keys(DEBT_TYPE_LABELS).length).toBe(3);
    });
  });

  describe('payoff method labels', () => {
    it('has all payoff method labels', () => {
      expect(PAYOFF_METHOD_LABELS.snowball).toBe('Snowball');
      expect(PAYOFF_METHOD_LABELS.avalanche).toBe('Avalanche');
      expect(PAYOFF_METHOD_LABELS.custom).toBe('Custom');
    });

    it('has exactly 3 payoff methods', () => {
      expect(Object.keys(PAYOFF_METHOD_LABELS).length).toBe(3);
    });
  });

  describe('extended payoff method labels', () => {
    it('has all extended labels', () => {
      expect(PAYOFF_METHOD_LABELS_EXTENDED.snowball).toContain('smallest balance');
      expect(PAYOFF_METHOD_LABELS_EXTENDED.avalanche).toContain('highest interest');
      expect(PAYOFF_METHOD_LABELS_EXTENDED.custom).toBe('Custom');
    });

    it('has descriptions in extended labels', () => {
      expect(PAYOFF_METHOD_LABELS_EXTENDED.snowball).toMatch(/\(.*\)/);
      expect(PAYOFF_METHOD_LABELS_EXTENDED.avalanche).toMatch(/\(.*\)/);
    });
  });

  describe('numeric constants', () => {
    it('has valid print dialog timeout', () => {
      expect(PRINT_DIALOG_TIMEOUT).toBe(250);
      expect(typeof PRINT_DIALOG_TIMEOUT).toBe('number');
    });

    it('has valid max payoff months', () => {
      expect(MAX_PAYOFF_MONTHS).toBe(600);
      expect(typeof MAX_PAYOFF_MONTHS).toBe('number');
    });

    it('has valid z-index values', () => {
      expect(Z_INDEX_FAB).toBe(1100);
      expect(Z_INDEX_BOTTOM_NAV).toBe(1050);
      expect(typeof Z_INDEX_FAB).toBe('number');
      expect(typeof Z_INDEX_BOTTOM_NAV).toBe('number');
    });

    it('z-indices are in correct order', () => {
      expect(Z_INDEX_BOTTOM_NAV).toBeLessThan(Z_INDEX_FAB);
    });
  });
});
