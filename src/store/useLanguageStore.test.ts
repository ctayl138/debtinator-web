import { act, renderHook } from '@testing-library/react';
import { useLanguageStore } from './useLanguageStore';

describe('useLanguageStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('starts with English', () => {
    const { result } = renderHook(() => useLanguageStore());
    expect(result.current.language).toBe('en');
  });

  it('setLanguage updates to Spanish', () => {
    const { result } = renderHook(() => useLanguageStore());
    act(() => {
      result.current.setLanguage('es');
    });
    expect(result.current.language).toBe('es');
  });

  it('setLanguage updates back to English', () => {
    const { result } = renderHook(() => useLanguageStore());
    act(() => {
      result.current.setLanguage('es');
    });
    act(() => {
      result.current.setLanguage('en');
    });
    expect(result.current.language).toBe('en');
  });

  it('persist.clearStorage removes persisted data', async () => {
    const removeSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
    const { result } = renderHook(() => useLanguageStore());
    act(() => {
      result.current.setLanguage('es');
    });
    await act(async () => {
      await useLanguageStore.persist.clearStorage();
    });
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });
});
