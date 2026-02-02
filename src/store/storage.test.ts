import { localStorageAdapter } from './storage';

describe('localStorageAdapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('gets, sets, and removes items', () => {
    localStorageAdapter.setItem('key', 'value');
    expect(localStorageAdapter.getItem('key')).toBe('value');
    localStorageAdapter.removeItem('key');
    expect(localStorageAdapter.getItem('key')).toBeNull();
  });

  it('swallows errors from localStorage', () => {
    const getSpy = jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => {
      throw new Error('fail');
    });
    const setSpy = jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('fail');
    });
    const removeSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(localStorageAdapter.getItem('key')).toBeNull();
    localStorageAdapter.setItem('key', 'value');
    localStorageAdapter.removeItem('key');
    getSpy.mockRestore();
    setSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
