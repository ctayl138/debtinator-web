import { act, renderHook } from '@testing-library/react';
import { useIncomeStore, selectMonthlyIncome } from './useIncomeStore';

describe('useIncomeStore', () => {
  beforeEach(() => {
    useIncomeStore.setState({ incomes: [] });
  });

  it('starts with empty incomes and monthlyIncome 0', () => {
    const { result } = renderHook(() => useIncomeStore((s) => s.incomes));
    expect(result.current).toEqual([]);
    expect(selectMonthlyIncome(useIncomeStore.getState())).toBe(0);
  });

  it('addIncome adds an item and selectMonthlyIncome returns sum', () => {
    const { result } = renderHook(() => useIncomeStore());
    act(() => {
      result.current.addIncome({
        name: 'Job',
        type: 'salary',
        amount: 4500,
      });
    });
    expect(result.current.incomes).toHaveLength(1);
    expect(result.current.incomes[0].name).toBe('Job');
    expect(result.current.incomes[0].amount).toBe(4500);
    expect(selectMonthlyIncome(useIncomeStore.getState())).toBe(4500);
  });

  it('setMonthlyIncome (legacy) sets one other income', () => {
    const { result } = renderHook(() => useIncomeStore());
    act(() => {
      result.current.setMonthlyIncome(3200);
    });
    expect(result.current.incomes).toHaveLength(1);
    expect(result.current.incomes[0].type).toBe('other');
    expect(result.current.incomes[0].amount).toBe(3200);
    expect(selectMonthlyIncome(useIncomeStore.getState())).toBe(3200);
  });

  it('setMonthlyIncome(0) clears incomes', () => {
    const { result } = renderHook(() => useIncomeStore());
    act(() => {
      result.current.addIncome({ name: 'A', type: 'salary', amount: 100 });
    });
    act(() => {
      result.current.setMonthlyIncome(0);
    });
    expect(result.current.incomes).toHaveLength(0);
  });
});
