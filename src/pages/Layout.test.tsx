import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '@/theme/muiTheme';
import Layout from './Layout';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Drawer: ({ open, onClose, children, ...rest }: any) => (
      <div data-testid="drawer" data-open={String(open)} onClick={() => onClose?.({}, 'backdropClick')} {...rest}>
        {children}
      </div>
    ),
  };
});

describe('Layout', () => {
  it('renders app bar and bottom navigation', () => {
    renderLayout('/');
    expect(screen.getByText('Debtinator')).toBeInTheDocument();
    expect(screen.getByText('Debts')).toBeInTheDocument();
    expect(screen.getByText('Payoff')).toBeInTheDocument();
  });

  it('opens drawer and shows menu items', () => {
    renderLayout('/');
    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByText('Charts')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Features Guide')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Charts'));
  });

  it('closes drawer on escape', () => {
    renderLayout('/');
    fireEvent.click(screen.getByLabelText('Open menu'));
    fireEvent.click(screen.getByTestId('drawer'));
    expect(screen.getByText('Debts')).toBeInTheDocument();
  });

  it('defaults bottom navigation when path is unknown', () => {
    renderLayout('/unknown');
    expect(screen.getByText('Debts')).toBeInTheDocument();
    expect(screen.getByText('Payoff')).toBeInTheDocument();
  });
});

function renderLayout(route: string) {
  return renderWithTheme(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Home</div>} />
        </Route>
        <Route path="/payoff" element={<Layout />}>
          <Route index element={<div>Payoff</div>} />
        </Route>
        <Route path="*" element={<Layout />}>
          <Route index element={<div>Fallback</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <MuiThemeProvider theme={getAppTheme('light')}>
      <CssBaseline />
      {ui}
    </MuiThemeProvider>
  );
}
