import { act, renderHook } from '@testing-library/react';
import { useIncomeStore } from './useIncomeStore';

describe('useIncomeStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useIncomeStore.setState({ monthlyIncome: 0 });
  });

  it('starts with monthlyIncome 0', () => {
    const { result } = renderHook(() => useIncomeStore());
    expect(result.current.monthlyIncome).toBe(0);
  });

  it('setMonthlyIncome updates income', () => {
    const { result } = renderHook(() => useIncomeStore());
    act(() => {
      result.current.setMonthlyIncome(4500);
    });
    expect(result.current.monthlyIncome).toBe(4500);
  });

  it('persist.clearStorage removes persisted data', async () => {
    const removeSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
    const { result } = renderHook(() => useIncomeStore());
    act(() => {
      result.current.setMonthlyIncome(3200);
    });
    await act(async () => {
      await useIncomeStore.persist.clearStorage();
    });
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });
});
