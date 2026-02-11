import { renderHook, act } from '@testing-library/react';
import { useLocale } from './useLocale';
import { useLanguageStore } from '@/store/useLanguageStore';

describe('useLocale', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLanguageStore.setState({ language: 'en' });
  });

  it('returns en-US for English', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current).toBe('en-US');
  });

  it('returns es-US for Spanish', () => {
    act(() => {
      useLanguageStore.setState({ language: 'es' });
    });
    const { result } = renderHook(() => useLocale());
    expect(result.current).toBe('es-US');
  });

  it('updates when language changes', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current).toBe('en-US');
    act(() => {
      useLanguageStore.setState({ language: 'es' });
    });
    expect(result.current).toBe('es-US');
  });
});
