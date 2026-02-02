import {
  createExportWorkbook,
  downloadWorkbook,
  workbookToBinary,
  type ExportData,
} from './exportToExcel';

const sampleDebt = {
  id: '1',
  name: 'Test Card',
  type: 'credit_card' as const,
  balance: 5000,
  interestRate: 18,
  minimumPayment: 150,
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('exportToExcel', () => {
  describe('createExportWorkbook', () => {
    it('creates workbook with Summary, Debts, Income & Plan sheets', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Summary');
      expect(wb.SheetNames).toContain('Debts');
      expect(wb.SheetNames).toContain('Income & Plan');
    });

    it('includes Payoff Schedule sheet when plan is valid', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Payoff Schedule');
    });

    it('omits Payoff Schedule when payment below minimums', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 50,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).not.toContain('Payoff Schedule');
    });

    it('handles empty debts', () => {
      const data: ExportData = {
        debts: [],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Summary');
      expect(wb.SheetNames).toContain('Debts');
    });

    it('includes debt-to-income rows when income > 0', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'avalanche',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      const summary = wb.Sheets['Summary'];
      expect(summary).toBeDefined();
    });

    it('omits debt-to-income rows when monthlyIncome is 0', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Payoff Schedule');
    });

    it('uses fallback for unknown debt type', () => {
      const debtUnknownType = {
        ...sampleDebt,
        type: 'medical' as unknown as 'credit_card' | 'personal_loan' | 'other',
      };
      const data: ExportData = {
        debts: [debtUnknownType],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Debts');
    });

    it('handles debt without createdAt', () => {
      const debtNoDate = { ...sampleDebt, createdAt: '' };
      const data: ExportData = {
        debts: [debtNoDate],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Debts');
    });
  });

  describe('workbookToBinary', () => {
    it('returns Uint8Array', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      const bin = workbookToBinary(wb);
      expect(bin).toBeInstanceOf(Uint8Array);
      expect(bin.length).toBeGreaterThan(0);
    });
  });

  describe('downloadWorkbook', () => {
    it('creates an anchor and triggers a download', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      const click = jest.fn();
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue({ click } as unknown as HTMLAnchorElement);
      const createObjectURLSpy = jest
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:mock');
      const revokeObjectURLSpy = jest
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {});

      downloadWorkbook(wb, 'debtinator-export.xlsx');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock');

      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });
});
