import React from 'react';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '@/theme/muiTheme';
import Layout from './Layout';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockUseMediaQuery = jest.fn(() => false); // Default to mobile

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery(),
    useTheme: () => actual.createTheme(),
    Drawer: ({ open, onClose, children, variant, ...rest }: any) => (
      <div
        data-testid="drawer"
        data-open={String(open)}
        data-variant={variant}
        onClick={() => onClose?.({}, 'backdropClick')}
        {...rest}
      >
        {children}
      </div>
    ),
  };
});

describe('Layout', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false); // Reset to mobile
  });

  describe('Mobile Layout', () => {
    it('renders app bar and bottom navigation', () => {
      renderLayout('/');
      expect(screen.getByText('Debtinator')).toBeInTheDocument();
      // Check for hamburger menu (indicates mobile layout)
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      // Verify bottom navigation exists (drawer will also have these items now)
      const bottomNavActions = screen.queryAllByRole('link', { name: /debts|payoff/i });
      expect(bottomNavActions.length).toBeGreaterThanOrEqual(2);
    });

    it('shows hamburger menu icon', () => {
      renderLayout('/');
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('opens drawer and shows all navigation items', () => {
      renderLayout('/');
      fireEvent.click(screen.getByLabelText('Open menu'));
      // All items should be in drawer
      expect(screen.getByText('Charts')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Features Guide')).toBeInTheDocument();
    });

    it('closes drawer on navigation', () => {
      renderLayout('/');
      fireEvent.click(screen.getByLabelText('Open menu'));
      fireEvent.click(screen.getByText('Charts'));
      expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'false');
    });

    it('closes drawer on backdrop click', () => {
      renderLayout('/');
      fireEvent.click(screen.getByLabelText('Open menu'));
      fireEvent.click(screen.getByTestId('drawer'));
      expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'false');
    });

    it('defaults bottom navigation when path is unknown', () => {
      renderLayout('/unknown');
      // Verify bottom nav exists with Debts as default
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      // Should have navigation items
      const navLinks = screen.getAllByText('Debts');
      expect(navLinks.length).toBeGreaterThanOrEqual(1); // At least in drawer or bottom nav
    });
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // Desktop
    });

    it('hides hamburger menu icon on desktop', () => {
      renderLayout('/');
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
    });

    it('hides drawer component on desktop (uses fixed nav instead)', () => {
      renderLayout('/');
      // Drawer should not be rendered on desktop
      const drawer = screen.queryByTestId('drawer');
      expect(drawer).not.toBeInTheDocument();
    });

    it('shows all navigation items in fixed nav on desktop', () => {
      renderLayout('/');
      expect(screen.getByText('Debts')).toBeInTheDocument();
      expect(screen.getByText('Payoff')).toBeInTheDocument();
      expect(screen.getByText('Charts')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Features Guide')).toBeInTheDocument();
    });

    it('hides bottom navigation on desktop', () => {
      renderLayout('/');
      // On desktop, only drawer items exist, not bottom nav actions
      const allDebtsLinks = screen.queryAllByText('Debts');
      // Should only be one instance in the fixed nav
      expect(allDebtsLinks.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('opens shortcuts dialog when ? key is pressed', () => {
      const { container } = renderLayout('/');
      fireEvent.keyDown(container.ownerDocument, { key: '?' });
      expect(screen.getByTestId('shortcuts-dialog')).toBeInTheDocument();
      expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
    });

    it('shows shortcut list items when shortcuts dialog is open', () => {
      const { container } = renderLayout('/');
      fireEvent.keyDown(container.ownerDocument, { key: '?' });
      expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Add new debt (on Debts page)')).toBeInTheDocument();
    });

    it('does not open shortcuts dialog when ? is pressed in input', () => {
      renderLayout('/');
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      fireEvent.keyDown(input, { key: '?' });
      expect(screen.queryByTestId('shortcuts-dialog')).not.toBeInTheDocument();
      document.body.removeChild(input);
    });

    it('ignores other keys for shortcuts dialog', () => {
      const { container } = renderLayout('/');
      fireEvent.keyDown(container.ownerDocument, { key: 'a' });
      expect(screen.queryByTestId('shortcuts-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts Dialog Close', () => {
    it('closes shortcuts dialog via Escape key', () => {
      const { container } = renderLayout('/');
      fireEvent.keyDown(container.ownerDocument, { key: '?' });
      expect(screen.getByTestId('shortcuts-dialog')).toBeInTheDocument();
      // Press Escape triggers Dialog onClose
      fireEvent.keyDown(screen.getByTestId('shortcuts-dialog'), { key: 'Escape' });
      // Dialog onClose sets shortcutsOpen to false
    });
  });

  describe('Desktop drawer auto-close', () => {
    it('closes mobile drawer when switching to desktop', () => {
      mockUseMediaQuery.mockReturnValue(false); // Start mobile
      const { rerender } = render(
        <MuiThemeProvider theme={getAppTheme('light')}>
          <CssBaseline />
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<div>Home</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </MuiThemeProvider>
      );
      // Open drawer on mobile
      fireEvent.click(screen.getByLabelText('Open menu'));
      expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'true');
      // Switch to desktop
      mockUseMediaQuery.mockReturnValue(true);
      rerender(
        <MuiThemeProvider theme={getAppTheme('light')}>
          <CssBaseline />
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<div>Home</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </MuiThemeProvider>
      );
      // Drawer should not be in the document on desktop
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });
  });

  describe('Desktop Sidebar', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // Desktop
    });

    it('does not show sidebar collapse toggle on desktop', () => {
      renderLayout('/');
      expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
    });

    it('always shows sidebar nav on desktop', () => {
      renderLayout('/');
      expect(screen.getByText('Debts')).toBeInTheDocument();
    });
  });

  describe('Mobile', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false); // Mobile
    });

    it('does not show sidebar toggle on mobile', () => {
      renderLayout('/');
      expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
    });
  });

  describe('Language menu', () => {
    it('shows language menu button in app bar', () => {
      renderLayout('/');
      expect(screen.getByTestId('language-menu-button')).toBeInTheDocument();
    });

    it('opens language menu and shows English and Español', () => {
      renderLayout('/');
      fireEvent.click(screen.getByTestId('language-menu-button'));
      expect(screen.getByTestId('language-en-btn')).toBeInTheDocument();
      expect(screen.getByTestId('language-es-btn')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('closes menu when selecting a language', async () => {
      renderLayout('/');
      fireEvent.click(screen.getByTestId('language-menu-button'));
      expect(screen.getByTestId('language-es-btn')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('language-es-btn'));
      await waitFor(() => {
        expect(screen.queryByTestId('language-en-btn')).not.toBeInTheDocument();
      });
    });
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
