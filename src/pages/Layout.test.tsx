import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
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

  describe('Desktop Sidebar Collapse', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // Desktop
      localStorage.clear();
    });

    it('renders sidebar toggle button on desktop', () => {
      renderLayout('/');
      expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    });

    it('collapses sidebar when toggle is clicked', () => {
      renderLayout('/');
      const toggle = screen.getByTestId('sidebar-toggle');

      // Sidebar should be expanded initially
      expect(screen.getByText('Debts')).toBeInTheDocument();

      fireEvent.click(toggle);

      // Sidebar content should be hidden
      expect(screen.queryByText('Debts')).not.toBeInTheDocument();
    });

    it('persists collapsed state to localStorage', () => {
      renderLayout('/');
      const toggle = screen.getByTestId('sidebar-toggle');

      fireEvent.click(toggle);

      expect(localStorage.getItem('sidebar-collapsed')).toBe('true');
    });

    it('loads collapsed state from localStorage', () => {
      localStorage.setItem('sidebar-collapsed', 'true');

      renderLayout('/');

      // Sidebar should be collapsed on load
      expect(screen.queryByText('Debts')).not.toBeInTheDocument();
    });

    it('expands sidebar when toggle is clicked while collapsed', () => {
      localStorage.setItem('sidebar-collapsed', 'true');
      renderLayout('/');

      const toggle = screen.getByTestId('sidebar-toggle');
      fireEvent.click(toggle);

      expect(screen.getByText('Debts')).toBeInTheDocument();
      expect(localStorage.getItem('sidebar-collapsed')).toBe('false');
    });

    it('hides toggle button on mobile', () => {
      mockUseMediaQuery.mockReturnValue(false); // Mobile
      renderLayout('/');
      expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
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
