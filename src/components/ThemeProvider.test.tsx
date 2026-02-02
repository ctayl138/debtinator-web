import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';

let mockThemeMode = 'light';
let mockPrefersDark = false;

jest.mock('@/store/useThemeStore', () => ({
  useThemeStore: (selector: (s: { mode: string }) => string) => selector({ mode: mockThemeMode }),
}));

const ModeReporter = () => {
  const theme = useTheme();
  return <div data-testid="mode">{theme.palette.mode}</div>;
};

import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockThemeMode = 'light';
    mockPrefersDark = false;
    window.matchMedia = jest.fn().mockReturnValue({
      matches: mockPrefersDark,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as unknown as typeof window.matchMedia;
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses light theme when mode is light', () => {
    mockThemeMode = 'light';
    render(
      <ThemeProvider>
        <ModeReporter />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('uses dark theme when mode is dark', () => {
    mockThemeMode = 'dark';
    render(
      <ThemeProvider>
        <ModeReporter />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('uses system dark theme when mode is system and prefers dark', () => {
    mockThemeMode = 'system';
    mockPrefersDark = true;
    window.matchMedia = jest.fn().mockReturnValue({
      matches: mockPrefersDark,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as unknown as typeof window.matchMedia;
    render(
      <ThemeProvider>
        <ModeReporter />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('uses system light theme when mode is system and prefers light', () => {
    mockThemeMode = 'system';
    mockPrefersDark = false;
    render(
      <ThemeProvider>
        <ModeReporter />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('defaults to light when matchMedia is unavailable', () => {
    mockThemeMode = 'system';
    const originalMatchMedia = window.matchMedia;
    // @ts-expect-error simulate missing matchMedia
    delete (window as any).matchMedia;
    render(
      <ThemeProvider>
        <ModeReporter />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    window.matchMedia = originalMatchMedia;
  });
});
