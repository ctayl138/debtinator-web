import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { localStorageAdapter } from './storage';

interface IncomeState {
  monthlyIncome: number;
  setMonthlyIncome: (amount: number) => void;
}

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set) => ({
      monthlyIncome: 0,
      setMonthlyIncome: (monthlyIncome) => set({ monthlyIncome }),
    }),
    {
      name: 'debtinator-income-storage',
      storage: createJSONStorage(() => localStorageAdapter),
    }
  )
);
