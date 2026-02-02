import { create } from 'zustand';
import type { PayoffMethod } from '../types';

interface PayoffFormState {
  method: PayoffMethod;
  monthlyPayment: string;
  setMethod: (method: PayoffMethod) => void;
  setMonthlyPayment: (value: string) => void;
}

export const usePayoffFormStore = create<PayoffFormState>((set) => ({
  method: 'snowball',
  monthlyPayment: '',
  setMethod: (method) => set({ method }),
  setMonthlyPayment: (monthlyPayment) => set({ monthlyPayment }),
}));
