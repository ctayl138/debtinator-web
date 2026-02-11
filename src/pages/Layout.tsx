import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Z_INDEX_BOTTOM_NAV, DRAWER_WIDTH, APPBAR_HEIGHT } from '@/utils/constants';
import ListIcon from '@mui/icons-material/List';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NAV_ICONS: { path: string; labelKey: string; icon: React.ReactNode }[] = [
  { path: '/', labelKey: 'navDebts', icon: <ListIcon /> },
  { path: '/income', labelKey: 'navIncome', icon: <AttachMoneyIcon /> },
  { path: '/payoff', labelKey: 'navPayoff', icon: <TrendingUpIcon /> },
  { path: '/charts', labelKey: 'navCharts', icon: <BarChartIcon /> },
  { path: '/payoff-timeline', labelKey: 'navTimeline', icon: <CalendarMonthIcon /> },
  { path: '/settings', labelKey: 'navSettings', icon: <SettingsIcon /> },
  { path: '/documentation', labelKey: 'navDocs', icon: <DescriptionIcon /> },
];

const SHORTCUT_KEYS = [
  { key: '?', descriptionKey: 'shortcutHelp' },
  { key: 'N', descriptionKey: 'shortcutNewDebt' },
];

export default function Layout() {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
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

  const sidebarWidth = isDesktop ? DRAWER_WIDTH : 0;

  const primaryNavItems = NAV_ICONS.slice(0, 2); // Debts, Income
  const currentNav = primaryNavItems.find((item) => item.path === location.pathname)?.path ?? primaryNavItems[0].path;

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }} role="presentation">
      <List>
        {NAV_ICONS.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => !isDesktop && setDrawerOpen(false)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.labelKey)} />
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
              aria-label={t('openMenu')}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component="span"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                borderRadius: 1.5,
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src="/debtinator-logo.png"
                alt=""
                sx={{ height: 36, width: 'auto', display: 'block', verticalAlign: 'middle' }}
              />
            </Box>
            <Typography variant="h6" component="span">
              {t('appName')}
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={(e) => setLanguageAnchor(e.currentTarget)}
            aria-label={t('language')}
            data-testid="language-menu-button"
          >
            <LanguageIcon />
          </IconButton>
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={() => setLanguageAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => { setLanguage('en'); setLanguageAnchor(null); }}
              selected={language === 'en'}
              data-testid="language-en-btn"
            >
              {t('languageEnglish')}
            </MenuItem>
            <MenuItem
              onClick={() => { setLanguage('es'); setLanguageAnchor(null); }}
              selected={language === 'es'}
              data-testid="language-es-btn"
            >
              {t('languageSpanish')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        {isDesktop && (
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
              label={t(item.labelKey)}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}

      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} maxWidth="xs" fullWidth data-testid="shortcuts-dialog">
        <DialogTitle>{t('keyboardShortcuts')}</DialogTitle>
        <DialogContent>
          <List dense disablePadding>
            {SHORTCUT_KEYS.map((s) => (
              <ListItemButton key={s.key} disableRipple>
                <ListItemText primary={t(s.descriptionKey)} secondary={<kbd style={{ fontFamily: 'inherit' }}>{s.key}</kbd>} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
