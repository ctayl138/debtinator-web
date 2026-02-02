import { act, renderHook } from '@testing-library/react';
import { usePayoffFormStore } from './usePayoffFormStore';

describe('usePayoffFormStore', () => {
  beforeEach(() => {
    usePayoffFormStore.setState({ method: 'snowball', monthlyPayment: '' });
  });

  it('starts with default method and empty payment', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    expect(result.current.method).toBe('snowball');
    expect(result.current.monthlyPayment).toBe('');
  });

  it('setMethod updates the method', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMethod('avalanche');
    });
    expect(result.current.method).toBe('avalanche');
  });

  it('setMonthlyPayment updates the monthly payment', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMonthlyPayment('250');
    });
    expect(result.current.monthlyPayment).toBe('250');
  });
});
