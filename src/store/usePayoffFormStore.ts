import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PayoffMethod } from '../types';
import { localStorageAdapter } from './storage';

interface PayoffFormState {
  method: PayoffMethod;
  monthlyPayment: string;
  /** Debt IDs in payoff order; used when method is 'custom' */
  customOrder: string[];
  /** First payment date (YYYY-MM-DD) for timeline; empty = use current month */
  startDate: string;
  setMethod: (method: PayoffMethod) => void;
  setMonthlyPayment: (value: string) => void;
  setCustomOrder: (order: string[]) => void;
  setStartDate: (date: string) => void;
}

export const usePayoffFormStore = create<PayoffFormState>()(
  persist(
    (set) => ({
      method: 'snowball',
      monthlyPayment: '',
      customOrder: [],
      startDate: '',
      setMethod: (method) => set({ method }),
      setMonthlyPayment: (monthlyPayment) => set({ monthlyPayment }),
      setCustomOrder: (customOrder) => set({ customOrder }),
      setStartDate: (startDate) => set({ startDate }),
    }),
    {
      name: 'debtinator-payoff-form-storage',
      storage: createJSONStorage(() => localStorageAdapter),
    }
  )
);
