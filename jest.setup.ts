import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

if (!('ResizeObserver' in globalThis)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserver;
}

if (typeof HTMLElement !== 'undefined') {
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
  }
}

if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock');
  }

  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = jest.fn();
  }
}

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
