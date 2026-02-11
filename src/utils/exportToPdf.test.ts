import { printExportAsPdf } from './exportToPdf';
import type { ExportData } from './exportToExcel';

const sampleDebt = {
  id: '1',
  name: 'Test Card',
  type: 'credit_card' as const,
  balance: 5000,
  interestRate: 18,
  minimumPayment: 150,
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('exportToPdf', () => {
  describe('printExportAsPdf', () => {
    let mockWin: {
      document: {
        write: jest.Mock;
        close: jest.Mock;
      };
      focus: jest.Mock;
      print: jest.Mock;
      close: jest.Mock;
    };
    let openSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      mockWin = {
        document: {
          write: jest.fn(),
          close: jest.fn(),
        },
        focus: jest.fn(),
        print: jest.fn(),
        close: jest.fn(),
      };
      openSpy = jest.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window);
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      openSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      jest.useRealTimers();
    });

    it('opens a new window with print-friendly HTML', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      expect(openSpy).toHaveBeenCalledWith('', '_blank');
      expect(mockWin.document.write).toHaveBeenCalled();
      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Debtinator');
      expect(htmlContent).toContain('Test Card');
      expect(htmlContent).toContain('Credit Card');
    });

    it('includes summary information', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'avalanche',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Total Debt');
      expect(htmlContent).toContain('$5,000.00');
      expect(htmlContent).toContain('Monthly Income');
      expect(htmlContent).toContain('Avalanche');
    });

    it('includes payoff schedule when plan is valid', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Time to Payoff');
      expect(htmlContent).toContain('Total Interest');
      expect(htmlContent).toContain('Total Payments');
    });

    it('omits payoff schedule when payment is below minimum', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 50,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).not.toContain('Time to Payoff');
    });

    it('omits payoff schedule when no debts', () => {
      const data: ExportData = {
        debts: [],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).not.toContain('Time to Payoff');
    });

    it('triggers print after delay', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      expect(mockWin.print).not.toHaveBeenCalled();
      jest.advanceTimersByTime(250);
      expect(mockWin.focus).toHaveBeenCalled();
      expect(mockWin.print).toHaveBeenCalled();
      expect(mockWin.close).toHaveBeenCalled();
    });

    it('warns when popup is blocked', () => {
      openSpy.mockReturnValue(null);
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Popup blocked'));
      alertSpy.mockRestore();
    });

    it('escapes HTML in debt names', () => {
      const debtWithHtml = {
        ...sampleDebt,
        name: '<script>alert("xss")</script>',
      };
      const data: ExportData = {
        debts: [debtWithHtml],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).not.toContain('<script>');
      expect(htmlContent).toContain('&lt;script&gt;');
    });

    it('escapes ampersands in debt names', () => {
      const debtWithAmp = {
        ...sampleDebt,
        name: 'Cards & Loans',
      };
      const data: ExportData = {
        debts: [debtWithAmp],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Cards &amp; Loans');
    });

    it('escapes quotes in debt names', () => {
      const debtWithQuotes = {
        ...sampleDebt,
        name: 'Card "Primary"',
      };
      const data: ExportData = {
        debts: [debtWithQuotes],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Card &quot;Primary&quot;');
    });

    it('handles custom payoff method', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'custom',
        monthlyPayment: 200,
        customOrder: [sampleDebt.id],
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Custom');
    });

    it('displays personal loan type correctly', () => {
      const loanDebt = {
        ...sampleDebt,
        type: 'personal_loan' as const,
      };
      const data: ExportData = {
        debts: [loanDebt],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Personal Loan');
    });

    it('displays other type correctly', () => {
      const otherDebt = {
        ...sampleDebt,
        type: 'other' as const,
      };
      const data: ExportData = {
        debts: [otherDebt],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('>Other</td>');
    });

    it('handles unknown payoff method gracefully', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 0,
        payoffMethod: 'unknown' as 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('unknown');
    });

    it('handles unknown debt type gracefully', () => {
      const unknownTypeDebt = {
        ...sampleDebt,
        type: 'medical' as 'other',
      };
      const data: ExportData = {
        debts: [unknownTypeDebt],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('medical');
    });

    it('handles string monthlyPayment', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: '200' as unknown as number,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('$200.00');
    });

    it('handles NaN monthlyPayment', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: NaN,
      };

      printExportAsPdf(data);

      const htmlContent = mockWin.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('$0.00');
    });

    it('handles error when writing to print window', () => {
      mockWin.document.write.mockImplementation(() => {
        throw new Error('Write failed');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to write to print window:', expect.any(Error));
      expect(mockWin.close).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('handles error when printing', () => {
      mockWin.print.mockImplementation(() => {
        throw new Error('Print failed');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };

      printExportAsPdf(data);
      jest.advanceTimersByTime(250);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to print:', expect.any(Error));
      expect(mockWin.close).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
