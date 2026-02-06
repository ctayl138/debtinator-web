import { act, renderHook } from '@testing-library/react';
import { usePayoffFormStore } from './usePayoffFormStore';

describe('usePayoffFormStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePayoffFormStore.setState({ method: 'snowball', monthlyPayment: '', customOrder: [], startDate: '' });
  });

  it('starts with default method, empty payment, custom order, and start date', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    expect(result.current.method).toBe('snowball');
    expect(result.current.monthlyPayment).toBe('');
    expect(result.current.customOrder).toEqual([]);
    expect(result.current.startDate).toBe('');
  });

  it('setMethod updates the method to avalanche', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMethod('avalanche');
    });
    expect(result.current.method).toBe('avalanche');
  });

  it('setMethod updates the method to custom', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMethod('custom');
    });
    expect(result.current.method).toBe('custom');
  });

  it('setMonthlyPayment updates the monthly payment', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMonthlyPayment('250');
    });
    expect(result.current.monthlyPayment).toBe('250');
  });

  it('setCustomOrder updates the custom payoff order', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setCustomOrder(['id-a', 'id-b']);
    });
    expect(result.current.customOrder).toEqual(['id-a', 'id-b']);
  });

  it('setStartDate updates the first payment date', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setStartDate('2027-03-01');
    });
    expect(result.current.startDate).toBe('2027-03-01');
  });

  it('persist.clearStorage removes persisted data', async () => {
    const removeSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMonthlyPayment('300');
    });
    await act(async () => {
      await usePayoffFormStore.persist.clearStorage();
    });
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });
});
