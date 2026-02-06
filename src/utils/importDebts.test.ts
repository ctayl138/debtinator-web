import { parseCsvText, parseCsvFile, type ImportResult } from './importDebts';

describe('importDebts', () => {
  describe('parseCsvText', () => {
    it('returns error for empty string', () => {
      const result = parseCsvText('');
      expect(result.rows).toEqual([]);
      expect(result.errors).toEqual(['No lines to parse']);
    });

    it('returns error for whitespace-only string', () => {
      const result = parseCsvText('   \n  \n  ');
      expect(result.rows).toEqual([]);
      expect(result.errors).toEqual(['No lines to parse']);
    });

    it('parses comma-separated data without header', () => {
      const csv = 'My Card,5000,18.5,150';
      const result = parseCsvText(csv);
      expect(result.errors).toEqual([]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({
        name: 'My Card',
        balance: 5000,
        interestRate: 18.5,
        minimumPayment: 150,
        type: 'other',
      });
    });

    it('parses tab-separated data', () => {
      const csv = 'My Loan\t10000\t6.5\t300';
      const result = parseCsvText(csv);
      expect(result.errors).toEqual([]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('My Loan');
      expect(result.rows[0].balance).toBe(10000);
    });

    it('skips header row when detected (name)', () => {
      const csv = 'Name,Balance,APR,Payment\nCard One,5000,18,150';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('Card One');
    });

    it('skips header row when detected (balance)', () => {
      const csv = 'Debt,Balance,Rate,Min\nLoan,10000,5,200';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('Loan');
    });

    it('skips header row when detected (interest)', () => {
      const csv = 'Account,Amount,Interest,Due\nCC,3000,21,100';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].interestRate).toBe(21);
    });

    it('skips header row when detected (apr)', () => {
      const csv = 'Item,Sum,APR,Pay\nDebt,2000,15,80';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(1);
    });

    it('skips header row when detected (payment)', () => {
      const csv = 'Type,Total,Rate,Payment\nOther,1000,10,50';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(1);
    });

    it('uses comma delimiter when header-only line has no tab (sampleLine fallback)', () => {
      const csv = 'Name,Balance,APR,Payment';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(0);
      expect(result.errors).toEqual([]);
    });

    it('normalizes type: credit card variations', () => {
      const csv1 = parseCsvText('CC,1000,10,50,credit card');
      expect(csv1.rows[0].type).toBe('credit_card');

      const csv2 = parseCsvText('CC,1000,10,50,credit_card');
      expect(csv2.rows[0].type).toBe('credit_card');

      const csv3 = parseCsvText('CC,1000,10,50,card');
      expect(csv3.rows[0].type).toBe('credit_card');

      const csv4 = parseCsvText('CC,1000,10,50,CREDIT CARD');
      expect(csv4.rows[0].type).toBe('credit_card');
    });

    it('normalizes type: personal loan variations', () => {
      const csv1 = parseCsvText('Loan,1000,10,50,personal loan');
      expect(csv1.rows[0].type).toBe('personal_loan');

      const csv2 = parseCsvText('Loan,1000,10,50,personal_loan');
      expect(csv2.rows[0].type).toBe('personal_loan');

      const csv3 = parseCsvText('Loan,1000,10,50,loan');
      expect(csv3.rows[0].type).toBe('personal_loan');
    });

    it('defaults unknown type to other', () => {
      const result = parseCsvText('Medical,1000,10,50,medical');
      expect(result.rows[0].type).toBe('other');
    });

    it('defaults missing type column to other', () => {
      const result = parseCsvText('Debt,1000,10,50');
      expect(result.rows[0].type).toBe('other');
    });

    it('parses tag from 6th column', () => {
      const result = parseCsvText('Card,1000,10,50,credit_card,Family');
      expect(result.rows[0].tag).toBe('Family');
    });

    it('ignores empty tag', () => {
      const result = parseCsvText('Card,1000,10,50,other,');
      expect(result.rows[0].tag).toBeUndefined();
    });

    it('trims whitespace from tag', () => {
      const result = parseCsvText('Card,1000,10,50,other,  My Tag  ');
      expect(result.rows[0].tag).toBe('My Tag');
    });

    it('handles currency symbols and commas in numbers', () => {
      // Use tab delimiter so commas can appear inside numeric fields
      const result = parseCsvText('Card\t$5,000\t18.5%\t$150');
      expect(result.rows[0].balance).toBe(5000);
      expect(result.rows[0].interestRate).toBe(18.5);
      expect(result.rows[0].minimumPayment).toBe(150);
    });

    it('returns error for lines with fewer than 4 columns', () => {
      const result = parseCsvText('Card,5000,18');
      expect(result.rows).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('need at least 4 columns');
    });

    it('returns error for invalid balance', () => {
      const result = parseCsvText('Card,invalid,18,150');
      expect(result.rows).toHaveLength(0);
      expect(result.errors[0]).toContain('invalid balance');
    });

    it('returns error for negative balance', () => {
      const result = parseCsvText('Card,-5000,18,150');
      expect(result.rows).toHaveLength(0);
      expect(result.errors[0]).toContain('invalid balance');
    });

    it('returns error for invalid interest rate', () => {
      const result = parseCsvText('Card,5000,abc,150');
      expect(result.rows).toHaveLength(0);
      expect(result.errors[0]).toContain('invalid interest rate');
    });

    it('returns error for negative interest rate', () => {
      const result = parseCsvText('Card,5000,-5,150');
      expect(result.rows).toHaveLength(0);
      expect(result.errors[0]).toContain('invalid interest rate');
    });

    it('returns error for invalid minimum payment', () => {
      const result = parseCsvText('Card,5000,18,xyz');
      expect(result.rows).toHaveLength(0);
      expect(result.errors[0]).toContain('invalid minimum payment');
    });

    it('returns error for negative minimum payment', () => {
      const result = parseCsvText('Card,5000,18,-100');
      expect(result.rows).toHaveLength(0);
      expect(result.errors[0]).toContain('invalid minimum payment');
    });

    it('uses Unknown for empty name', () => {
      const result = parseCsvText(',5000,18,150');
      expect(result.rows[0].name).toBe('Unknown');
    });

    it('parses multiple lines', () => {
      const csv = 'Card One,5000,18,150\nCard Two,3000,22,100';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].name).toBe('Card One');
      expect(result.rows[1].name).toBe('Card Two');
    });

    it('handles CRLF line endings', () => {
      const csv = 'Card One,5000,18,150\r\nCard Two,3000,22,100';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(2);
    });

    it('skips blank lines', () => {
      const csv = 'Card One,5000,18,150\n\nCard Two,3000,22,100\n';
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(2);
    });

    it('includes line number in error messages', () => {
      const csv = 'Valid,5000,18,150\nInvalid,abc,18,150';
      const result = parseCsvText(csv);
      expect(result.errors[0]).toContain('Line 2');
    });

    it('allows zero values for balance, rate, payment', () => {
      const result = parseCsvText('Paid Off,0,0,0');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].balance).toBe(0);
      expect(result.rows[0].interestRate).toBe(0);
      expect(result.rows[0].minimumPayment).toBe(0);
    });
  });

  describe('parseCsvFile', () => {
    it('parses file content and returns import result', async () => {
      const file = new File(['My Card,5000,18,150'], 'debts.csv', { type: 'text/csv' });
      const result = await parseCsvFile(file);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('My Card');
    });

    it('returns error on file read failure', async () => {
      const file = new File([], 'empty.csv', { type: 'text/csv' });
      const originalFileReader = window.FileReader;
      const mockFileReader = jest.fn().mockImplementation(function (this: { onerror?: () => void; readAsText: jest.Mock }) {
        this.readAsText = jest.fn(() => {
          queueMicrotask(() => this.onerror?.());
        });
        return this;
      });
      window.FileReader = mockFileReader as unknown as typeof FileReader;

      const result = await parseCsvFile(file);
      expect(result.rows).toEqual([]);
      expect(result.errors).toEqual(['Failed to read file']);

      window.FileReader = originalFileReader;
    });

    it('handles non-string result from FileReader', async () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const originalFileReader = window.FileReader;
      const mockFileReader = jest.fn().mockImplementation(function (this: { onload?: () => void; result: ArrayBuffer | string; readAsText: jest.Mock }) {
        this.result = new ArrayBuffer(0);
        this.readAsText = jest.fn(() => {
          queueMicrotask(() => this.onload?.());
        });
        return this;
      });
      window.FileReader = mockFileReader as unknown as typeof FileReader;

      const result = await parseCsvFile(file);
      expect(result.rows).toEqual([]);
      expect(result.errors).toEqual(['No lines to parse']);

      window.FileReader = originalFileReader;
    });
  });
});
