import React from 'react';
import { screen, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('@/pages/Layout', () => {
  const React = require('react');
  const { Outlet } = require('react-router-dom');
  return {
    __esModule: true,
    default: () => (
      <div>
        <div>Layout</div>
        <Outlet />
      </div>
    ),
  };
});

jest.mock('@/pages/Debts', () => ({
  __esModule: true,
  default: () => <div>DebtsPage</div>,
}));

jest.mock('@/pages/Payoff', () => ({
  __esModule: true,
  default: () => <div>PayoffPage</div>,
}));

jest.mock('@/pages/Charts', () => ({
  __esModule: true,
  default: () => <div>ChartsPage</div>,
}));

jest.mock('@/pages/PayoffTimeline', () => ({
  __esModule: true,
  default: () => <div>TimelinePage</div>,
}));

jest.mock('@/pages/Income', () => ({
  __esModule: true,
  default: () => <div>IncomePage</div>,
}));

jest.mock('@/pages/Settings', () => ({
  __esModule: true,
  default: () => <div>SettingsPage</div>,
}));

jest.mock('@/pages/Documentation', () => ({
  __esModule: true,
  default: () => <div>DocumentationPage</div>,
}));

describe('App', () => {
  it('routes to debts by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('DebtsPage')).toBeInTheDocument();
  });

  it('routes to payoff', () => {
    render(
      <MemoryRouter initialEntries={['/payoff']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('PayoffPage')).toBeInTheDocument();
  });

  it('routes to charts', () => {
    render(
      <MemoryRouter initialEntries={['/charts']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('ChartsPage')).toBeInTheDocument();
  });

  it('routes to timeline', () => {
    render(
      <MemoryRouter initialEntries={['/payoff-timeline']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('TimelinePage')).toBeInTheDocument();
  });

  it('routes to income', () => {
    render(
      <MemoryRouter initialEntries={['/income']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('IncomePage')).toBeInTheDocument();
  });

  it('routes to settings', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('SettingsPage')).toBeInTheDocument();
  });

  it('routes to documentation', () => {
    render(
      <MemoryRouter initialEntries={['/documentation']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('DocumentationPage')).toBeInTheDocument();
  });

  it('redirects unknown routes to debts', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('DebtsPage')).toBeInTheDocument();
  });
});
