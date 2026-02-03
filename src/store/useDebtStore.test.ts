import { act, renderHook } from '@testing-library/react';
import {
  useDebtStore,
  useDebts,
  useDebtActions,
  migrateDebts,
} from './useDebtStore';
import type { Debt, DebtType } from '../types';

const sampleDebtData = (
  overrides: Partial<Omit<Debt, 'id' | 'createdAt'>> = {}
): Omit<Debt, 'id' | 'createdAt'> => ({
  name: 'Test Debt',
  type: 'credit_card',
  balance: 1000,
  interestRate: 18,
  minimumPayment: 50,
  ...overrides,
});

describe('useDebtStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useDebtStore.setState({ debts: [], isLoading: false });
  });

  it('starts with empty debts', () => {
    const { result } = renderHook(() => useDebts());
    expect(result.current).toEqual([]);
  });

  it('addDebt appends a debt with id and createdAt', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData());
    });
    const debts = useDebtStore.getState().debts;
    expect(debts).toHaveLength(1);
    expect(debts[0].name).toBe('Test Debt');
    expect(debts[0].type).toBe('credit_card');
    expect(debts[0].balance).toBe(1000);
    expect(debts[0].interestRate).toBe(18);
    expect(debts[0].minimumPayment).toBe(50);
    expect(debts[0].id).toBeDefined();
    expect(typeof debts[0].id).toBe('string');
    expect(debts[0].createdAt).toBeDefined();
  });

  it('addDebt defaults type to other when not provided', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(
        sampleDebtData({ type: undefined as unknown as DebtType })
      );
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].type).toBe('other');
  });

  it('updateDebt updates existing debt by id', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'Original' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    act(() => {
      result.current.updateDebt(id, sampleDebtData({ name: 'Updated', balance: 800 }));
    });
    const debts = useDebtStore.getState().debts;
    expect(debts).toHaveLength(1);
    expect(debts[0].name).toBe('Updated');
    expect(debts[0].balance).toBe(800);
    expect(debts[0].id).toBe(id);
  });

  it('updateDebt leaves other debts unchanged', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'A' }));
      result.current.addDebt(sampleDebtData({ name: 'B' }));
    });
    const ids = useDebtStore.getState().debts.map((d) => d.id);
    act(() => {
      result.current.updateDebt(ids[0], sampleDebtData({ name: 'A Updated' }));
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].name).toBe('A Updated');
    expect(debts[1].name).toBe('B');
  });

  it('deleteDebt removes debt by id', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'To Delete' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    act(() => {
      result.current.deleteDebt(id);
    });
    expect(useDebtStore.getState().debts).toHaveLength(0);
  });

  it('getDebtById returns debt when found', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'Find Me' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    const found = useDebtStore.getState().getDebtById(id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Find Me');
  });

  it('getDebtById returns undefined when not found', () => {
    const found = useDebtStore.getState().getDebtById('nonexistent');
    expect(found).toBeUndefined();
  });

  it('useDebts returns current debts', () => {
    const { result } = renderHook(() => useDebts());
    expect(result.current).toEqual([]);
    const { result: actions } = renderHook(() => useDebtActions());
    act(() => {
      actions.current.addDebt(sampleDebtData());
    });
    const { result: debtsResult } = renderHook(() => useDebts());
    expect(debtsResult.current).toHaveLength(1);
    expect(debtsResult.current[0].name).toBe('Test Debt');
  });

  it('updateDebt preserves type when not provided in update data', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ type: 'personal_loan' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    act(() => {
      result.current.updateDebt(
        id,
        sampleDebtData({ type: undefined as unknown as DebtType, name: 'Updated' })
      );
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].type).toBe('personal_loan');
    expect(debts[0].name).toBe('Updated');
  });

  it('updateDebt defaults to other when neither update nor existing has type', () => {
    useDebtStore.setState({
      debts: [{
        id: 'legacy-id',
        name: 'Legacy Debt',
        type: undefined as unknown as DebtType,
        balance: 500,
        interestRate: 10,
        minimumPayment: 25,
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
      isLoading: false,
    });
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.updateDebt(
        'legacy-id',
        sampleDebtData({ type: undefined as unknown as DebtType, name: 'Updated' })
      );
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].type).toBe('other');
  });

  it('persist.clearStorage removes persisted data', async () => {
    const removeSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData());
    });
    await act(async () => {
      await useDebtStore.persist.clearStorage();
    });
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });

  it('persist.rehydrate can be called', async () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'Before Rehydrate' }));
    });
    await act(async () => {
      await useDebtStore.persist.rehydrate();
    });
    expect(useDebtStore.getState().debts).toHaveLength(1);
  });
});

describe('migrateDebts', () => {
  it('adds type field to debts without type', () => {
    const legacyDebts = [
      { id: '1', name: 'Card', balance: 1000, interestRate: 18, minimumPayment: 50 },
    ];
    const result = migrateDebts(legacyDebts);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('other');
  });

  it('preserves existing type field (credit_card)', () => {
    const debts = [
      { id: '1', name: 'Card', type: 'credit_card', balance: 500, interestRate: 15, minimumPayment: 25 },
    ];
    const result = migrateDebts(debts);
    expect(result[0].type).toBe('credit_card');
  });

  it('preserves personal_loan type', () => {
    const debts = [
      { id: '1', name: 'Loan', type: 'personal_loan', balance: 500, interestRate: 10, minimumPayment: 25, createdAt: '2026-01-01' },
    ];
    const result = migrateDebts(debts);
    expect(result[0].type).toBe('personal_loan');
  });

  it('defaults invalid type to other', () => {
    const debts = [
      { id: '1', name: 'X', type: 'invalid', balance: 0, interestRate: 0, minimumPayment: 0 },
    ];
    const result = migrateDebts(debts);
    expect(result[0].type).toBe('other');
  });

  it('handles empty array', () => {
    const result = migrateDebts([]);
    expect(result).toEqual([]);
  });

  it('returns empty array when input is not an array', () => {
    expect(migrateDebts(null as unknown as unknown[])).toEqual([]);
    expect(migrateDebts(undefined as unknown as unknown[])).toEqual([]);
    expect(migrateDebts('not-array' as unknown as unknown[])).toEqual([]);
  });

  it('filters out null and non-object entries', () => {
    const mixed = [
      { id: '1', name: 'Valid', type: 'credit_card', balance: 100, interestRate: 0, minimumPayment: 10, createdAt: '2026-01-01' },
      null,
      42,
      'string',
    ];
    const result = migrateDebts(mixed);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Valid');
  });

  it('uses defaults for missing id, name, createdAt', () => {
    const legacy = [{ balance: 500, interestRate: 5, minimumPayment: 25 }];
    const result = migrateDebts(legacy);
    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('string');
    expect(result[0].id.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Unknown');
    expect(typeof result[0].createdAt).toBe('string');
    expect(result[0].balance).toBe(500);
  });

  it('uses defaults for invalid or negative numbers', () => {
    const legacy = [
      {
        id: '1',
        name: 'X',
        balance: -100,
        interestRate: 'bad',
        minimumPayment: -50,
        createdAt: '2026-01-01',
      },
    ];
    const result = migrateDebts(legacy);
    expect(result).toHaveLength(1);
    expect(result[0].balance).toBe(0);
    expect(result[0].interestRate).toBe(0);
    expect(result[0].minimumPayment).toBe(0);
  });

  it('preserves valid createdAt when present', () => {
    const legacy = [
      { id: '1', name: 'X', balance: 0, interestRate: 0, minimumPayment: 0, createdAt: '2025-06-15T12:00:00.000Z' },
    ];
    const result = migrateDebts(legacy);
    expect(result[0].createdAt).toBe('2025-06-15T12:00:00.000Z');
  });

  it('filters out array entries (plain object check)', () => {
    const withArray = [[1, 2, 3]]; // array is not a plain object
    const result = migrateDebts(withArray);
    expect(result).toEqual([]);
  });
});

describe('persist migration callback', () => {
  it('migrates persisted state with debts', () => {
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;

    if (migrate) {
      const legacyState = {
        debts: [
          { id: '1', name: 'Legacy', balance: 100 },
        ],
        isLoading: false,
      };
      const migratedState = migrate(legacyState, 0);
      expect(migratedState.debts[0].type).toBe('other');
    }
  });

  it('handles persisted state without debts', () => {
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;

    if (migrate) {
      const emptyState = { isLoading: false };
      const migratedState = migrate(emptyState, 0);
      expect(migratedState).toEqual({ isLoading: false });
    }
  });

  it('handles null/undefined persisted state', () => {
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;

    if (migrate) {
      const nullResult = migrate(null, 0);
      expect(nullResult).toBeNull();

      const undefinedResult = migrate(undefined, 0);
      expect(undefinedResult).toBeUndefined();
    }
  });

  it('migrates state when debts is not an array (replaces with empty array)', () => {
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;

    if (migrate) {
      const state = { debts: 'invalid' as unknown as Debt[], isLoading: false };
      const migratedState = migrate(state, 0) as { debts: Debt[] };
      expect(Array.isArray(migratedState.debts)).toBe(true);
      expect(migratedState.debts).toHaveLength(0);
    }
  });
});
