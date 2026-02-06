import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Debt, DebtType } from '../types';
import { localStorageAdapter } from './storage';

interface DebtState {
  debts: Debt[];
  isLoading: boolean;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  getDebtById: (id: string) => Debt | undefined;
}

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

const VALID_DEBT_TYPES: DebtType[] = ['credit_card', 'personal_loan', 'other'];

function isDebtType(x: unknown): x is DebtType {
  return typeof x === 'string' && VALID_DEBT_TYPES.includes(x as DebtType);
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function parseDebtFromPersisted(value: unknown): Debt | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const o = value;
  const type = isDebtType(o.type) ? o.type : 'other';
  const id = typeof o.id === 'string' ? o.id : generateId();
  const name = typeof o.name === 'string' ? o.name : 'Unknown';
  const balance = typeof o.balance === 'number' && o.balance >= 0 ? o.balance : 0;
  const interestRate =
    typeof o.interestRate === 'number' && o.interestRate >= 0 ? o.interestRate : 0;
  const minimumPayment =
    typeof o.minimumPayment === 'number' && o.minimumPayment >= 0
      ? o.minimumPayment
      : 0;
  const createdAt =
    typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString();

  const tag = typeof o.tag === 'string' && o.tag.trim() ? o.tag.trim() : undefined;
  const dueDayRaw = o.dueDay;
  const dueDay =
    typeof dueDayRaw === 'number' && dueDayRaw >= 1 && dueDayRaw <= 31
      ? Math.floor(dueDayRaw)
      : undefined;
  return {
    id,
    name,
    type,
    balance,
    interestRate,
    minimumPayment,
    createdAt,
    ...(tag !== undefined && { tag }),
    ...(dueDay !== undefined && { dueDay }),
  };
}

export const migrateDebts = (debts: unknown[]): Debt[] => {
  if (!Array.isArray(debts)) return [];
  return debts
    .map(parseDebtFromPersisted)
    .filter((d): d is Debt => d !== null);
};

export const useDebtStore = create<DebtState>()(
  persist(
    (set, get) => ({
      debts: [],
      isLoading: false,

      addDebt: (debtData) => {
        const newDebt: Debt = {
          ...debtData,
          type: debtData.type || 'other',
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...(debtData.tag !== undefined && { tag: debtData.tag }),
          ...(debtData.dueDay !== undefined && { dueDay: debtData.dueDay }),
        };
        set((state) => ({ debts: [...state.debts, newDebt] }));
      },

      updateDebt: (id, debtData) => {
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id
              ? {
                  ...debtData,
                  type: debtData.type || debt.type || 'other',
                  id,
                  createdAt: debt.createdAt,
                  ...(debtData.tag !== undefined && { tag: debtData.tag }),
                  ...(debtData.dueDay !== undefined && { dueDay: debtData.dueDay }),
                }
              : debt
          ),
        }));
      },

      deleteDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        }));
      },

      getDebtById: (id) => get().debts.find((debt) => debt.id === id),
    }),
    {
      name: 'debtinator-debt-storage',
      storage: createJSONStorage(() => localStorageAdapter),
      migrate: (persistedState: unknown, _version: number) => {
        const state = persistedState as { debts?: Debt[] };
        if (state?.debts) {
          state.debts = migrateDebts(state.debts);
        }
        return state as DebtState;
      },
    }
  )
);

export const useDebts = () => useDebtStore((state) => state.debts);
export const useDebtActions = () =>
  useDebtStore(
    useShallow((state) => ({
      addDebt: state.addDebt,
      updateDebt: state.updateDebt,
      deleteDebt: state.deleteDebt,
    }))
  );
