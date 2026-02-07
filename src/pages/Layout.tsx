import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Z_INDEX_BOTTOM_NAV, DRAWER_WIDTH, APPBAR_HEIGHT } from '@/utils/constants';
import ListIcon from '@mui/icons-material/List';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState, useEffect } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

const getSidebarCollapsed = (): boolean => {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
};

const setSidebarCollapsed = (collapsed: boolean): void => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // Ignore storage errors
  }
};

const allNavItems = [
  { path: '/', label: 'Debts', icon: <ListIcon /> },
  { path: '/payoff', label: 'Payoff', icon: <TrendingUpIcon /> },
  { path: '/charts', label: 'Charts', icon: <BarChartIcon /> },
  { path: '/payoff-timeline', label: 'Timeline', icon: <CalendarMonthIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

const SHORTCUTS = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'N', description: 'Add new debt (on Debts page)' },
];

export default function Layout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => getSidebarCollapsed());
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '?') return;
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!inInput) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reset drawer state when transitioning to desktop
  useEffect(() => {
    if (isDesktop && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [isDesktop, drawerOpen]);

  // Sync sidebar collapsed state to localStorage
  useEffect(() => {
    setSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsedState(!sidebarCollapsed);
  };

  const sidebarWidth = isDesktop && !sidebarCollapsed ? DRAWER_WIDTH : 0;

  const primaryNavItems = allNavItems.slice(0, 2); // Debts, Payoff
  const currentNav = primaryNavItems.find((item) => item.path === location.pathname)?.path ?? primaryNavItems[0].path;

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }} role="presentation">
      <List>
        {allNavItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => !isDesktop && setDrawerOpen(false)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: isDesktop ? 0 : 7 }}>
      <AppBar position="static">
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            Debtinator
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        {isDesktop && !sidebarCollapsed && (
          <Box
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              position: 'fixed',
              left: 0,
              top: APPBAR_HEIGHT,
              height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
              overflow: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme.transitions.create(['width'], {
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            {drawerContent}
          </Box>
        )}

        {isDesktop && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              left: sidebarCollapsed ? 8 : DRAWER_WIDTH - 48,
              top: APPBAR_HEIGHT + 8,
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              transition: theme.transitions.create(['left'], {
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            data-testid="sidebar-toggle"
            size="small"
          >
            {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}

        {!isDesktop && (
          <Drawer
            variant="temporary"
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            p: 2,
            ml: isDesktop ? `${sidebarWidth}px` : 0,
            transition: theme.transitions.create(['margin-left'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {!isDesktop && (
        <BottomNavigation
          value={currentNav}
          showLabels
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: Z_INDEX_BOTTOM_NAV }}
        >
          {primaryNavItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              component={Link}
              to={item.path}
              value={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}

      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} maxWidth="xs" fullWidth data-testid="shortcuts-dialog">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogContent>
          <List dense disablePadding>
            {SHORTCUTS.map((s) => (
              <ListItemButton key={s.key} disableRipple>
                <ListItemText primary={s.description} secondary={<kbd style={{ fontFamily: 'inherit' }}>{s.key}</kbd>} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
