import { act, renderHook } from '@testing-library/react';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useThemeStore.setState({ mode: 'system' });
  });

  it('starts with system mode', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.mode).toBe('system');
  });

  it('setMode updates mode to dark', () => {
    const { result } = renderHook(() => useThemeStore());
    act(() => {
      result.current.setMode('dark');
    });
    expect(result.current.mode).toBe('dark');
  });

  it('setMode updates mode to light', () => {
    const { result } = renderHook(() => useThemeStore());
    act(() => {
      result.current.setMode('dark');
    });
    act(() => {
      result.current.setMode('light');
    });
    expect(result.current.mode).toBe('light');
  });

  it('setMode updates mode to system', () => {
    const { result } = renderHook(() => useThemeStore());
    act(() => {
      result.current.setMode('system');
    });
    expect(result.current.mode).toBe('system');
  });

  it('persist.clearStorage removes persisted data', async () => {
    const removeSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
    const { result } = renderHook(() => useThemeStore());
    act(() => {
      result.current.setMode('light');
    });
    await act(async () => {
      await useThemeStore.persist.clearStorage();
    });
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });
});
