import React from 'react';

const renderMock = jest.fn();
const createRootMock = jest.fn(() => ({ render: renderMock }));

jest.mock('react-dom/client', () => ({
  createRoot: (...args: unknown[]) => createRootMock(...args),
}));

jest.mock('./App', () => ({
  __esModule: true,
  default: () => <div data-testid="app" />,
}));

jest.mock('@/components/ThemeProvider', () => ({
  __esModule: true,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('main', () => {
  beforeEach(() => {
    renderMock.mockClear();
    createRootMock.mockClear();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('creates root and renders app', () => {
    jest.isolateModules(() => {
      require('./main');
    });
    const rootEl = document.getElementById('root');
    expect(createRootMock).toHaveBeenCalledWith(rootEl);
    expect(renderMock).toHaveBeenCalled();
  });
});
