/** @jest-environment node */
import { localStorageAdapter } from './storage';

describe('localStorageAdapter (node)', () => {
  it('returns null when window is undefined', () => {
    expect(localStorageAdapter.getItem('missing')).toBeNull();
    localStorageAdapter.setItem('key', 'value');
    localStorageAdapter.removeItem('key');
  });
});
