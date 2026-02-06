import { renderHook, act } from '@testing-library/react';
import { useImportDialog } from './useImportDialog';

describe('useImportDialog', () => {
  it('initializes with closed state and empty text', () => {
    const { result } = renderHook(() => useImportDialog());
    expect(result.current.importOpen).toBe(false);
    expect(result.current.importText).toBe('');
    expect(result.current.importResult).toBeNull();
  });

  it('has a file input ref', () => {
    const { result } = renderHook(() => useImportDialog());
    expect(result.current.fileInputRef).toBeDefined();
    expect(result.current.fileInputRef.current).toBeNull();
  });

  it('opens dialog with openImport', () => {
    const { result } = renderHook(() => useImportDialog());

    act(() => {
      result.current.openImport();
    });

    expect(result.current.importOpen).toBe(true);
  });

  it('closes dialog and resets all state with closeImport', () => {
    const { result } = renderHook(() => useImportDialog());

    // Set some state
    act(() => {
      result.current.openImport();
      result.current.setImportText('some text');
    });

    expect(result.current.importOpen).toBe(true);
    expect(result.current.importText).toBe('some text');

    // Close and verify all state is reset
    act(() => {
      result.current.closeImport();
    });

    expect(result.current.importOpen).toBe(false);
    expect(result.current.importText).toBe('');
    expect(result.current.importResult).toBeNull();
  });

  it('updates import text with setImportText', () => {
    const { result } = renderHook(() => useImportDialog());

    act(() => {
      result.current.setImportText('new text');
    });

    expect(result.current.importText).toBe('new text');
  });

  it('updates import text multiple times', () => {
    const { result } = renderHook(() => useImportDialog());

    act(() => {
      result.current.setImportText('first');
    });
    expect(result.current.importText).toBe('first');

    act(() => {
      result.current.setImportText('second');
    });
    expect(result.current.importText).toBe('second');
  });

  it('preserves import text when opening and closing', () => {
    const { result } = renderHook(() => useImportDialog());

    act(() => {
      result.current.setImportText('important data');
      result.current.openImport();
    });

    expect(result.current.importText).toBe('important data');

    act(() => {
      result.current.closeImport();
    });

    // Text is cleared on close
    expect(result.current.importText).toBe('');
  });

  it('provides handlers for preview and file change', () => {
    const { result } = renderHook(() => useImportDialog());

    // Handlers should be functions
    expect(typeof result.current.handleImportPreview).toBe('function');
    expect(typeof result.current.handleImportFile).toBe('function');
    expect(typeof result.current.openImport).toBe('function');
    expect(typeof result.current.closeImport).toBe('function');
  });

  it('can call preview handler', () => {
    const { result } = renderHook(() => useImportDialog());

    act(() => {
      result.current.setImportText('');
      result.current.handleImportPreview();
    });

    // Empty text should result in null import result
    expect(result.current.importResult).toBeNull();
  });

  it('can call handleImportFile handler', async () => {
    const { result } = renderHook(() => useImportDialog());

    act(() => {
      result.current.setImportText('pasted text');
    });

    const mockEvent = {
      target: {
        files: null,
        value: '',
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImportFile(mockEvent);
    });

    // No file selected, so result should be unchanged
    expect(result.current.importResult).toBeNull();
  });

  it('state is independent across hook instances', () => {
    const { result: result1 } = renderHook(() => useImportDialog());
    const { result: result2 } = renderHook(() => useImportDialog());

    act(() => {
      result1.current.openImport();
      result1.current.setImportText('text1');
    });

    act(() => {
      result2.current.setImportText('text2');
    });

    expect(result1.current.importText).toBe('text1');
    expect(result2.current.importText).toBe('text2');
    expect(result1.current.importOpen).toBe(true);
    expect(result2.current.importOpen).toBe(false);
  });

  it('returns object with all expected properties', () => {
    const { result } = renderHook(() => useImportDialog());

    expect(result.current).toHaveProperty('importOpen');
    expect(result.current).toHaveProperty('importText');
    expect(result.current).toHaveProperty('importResult');
    expect(result.current).toHaveProperty('fileInputRef');
    expect(result.current).toHaveProperty('setImportText');
    expect(result.current).toHaveProperty('handleImportPreview');
    expect(result.current).toHaveProperty('handleImportFile');
    expect(result.current).toHaveProperty('openImport');
    expect(result.current).toHaveProperty('closeImport');
  });
});
