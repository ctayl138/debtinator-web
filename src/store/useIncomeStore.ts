import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { localStorageAdapter } from './storage';
import type { Income } from '@/types';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export interface IncomeState {
  incomes: Income[];
  addIncome: (data: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (id: string, data: Omit<Income, 'id' | 'createdAt'>) => void;
  deleteIncome: (id: string) => void;
  /** Legacy: set from backup when backup has old monthlyIncome number. */
  setMonthlyIncome: (amount: number) => void;
}

function migrateFromLegacy(persisted: unknown): { incomes: Income[] } {
  const state = persisted as Record<string, unknown> | undefined;
  if (!state || typeof state !== 'object') return { incomes: [] };
  if (Array.isArray(state.incomes)) {
    const valid = (state.incomes as unknown[]).filter(
      (x): x is Income =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as Income).id === 'string' &&
        typeof (x as Income).name === 'string' &&
        ['salary', 'side_gig', 'investment', 'other'].includes((x as Income).type) &&
        typeof (x as Income).amount === 'number' &&
        typeof (x as Income).createdAt === 'string'
    );
    return { incomes: valid };
  }
  const legacy = typeof state.monthlyIncome === 'number' ? state.monthlyIncome : 0;
  if (legacy <= 0) return { incomes: [] };
  return {
    incomes: [
      {
        id: generateId(),
        name: 'Income',
        type: 'other',
        amount: legacy,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set) => ({
      incomes: [],

      addIncome: (data) => {
        set((s) => ({
          incomes: [
            ...s.incomes,
            {
              id: generateId(),
              name: data.name.trim() || 'Income',
              type: data.type,
              amount: data.amount,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateIncome: (id, data) => {
        set((s) => ({
          incomes: s.incomes.map((i) =>
            i.id === id
              ? {
                  ...i,
                  name: data.name.trim() || i.name,
                  type: data.type,
                  amount: data.amount,
                }
              : i
          ),
        }));
      },

      deleteIncome: (id) => {
        set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) }));
      },

      setMonthlyIncome: (amount) => {
        if (amount <= 0) {
          set({ incomes: [] });
          return;
        }
        set({
          incomes: [
            {
              id: generateId(),
              name: 'Income',
              type: 'other',
              amount,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },
    }),
    {
      name: 'debtinator-income-storage',
      storage: createJSONStorage(() => localStorageAdapter),
      migrate: migrateFromLegacy,
      version: 1,
      partialize: (s) => ({ incomes: s.incomes }),
    }
  )
);

/** Total monthly income (sum of all income amounts). Use for payoff/export. */
export function selectMonthlyIncome(state: IncomeState): number {
  return state.incomes.reduce((sum, i) => sum + i.amount, 0);
}
