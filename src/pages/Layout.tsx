import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link as RouterLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Debts', icon: <ListIcon /> },
  { path: '/payoff', label: 'Payoff', icon: <TrendingUpIcon /> },
];

const menuItems = [
  { path: '/charts', label: 'Charts', icon: <BarChartIcon /> },
  { path: '/payoff-timeline', label: 'Timeline', icon: <CalendarMonthIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  { path: '/documentation', label: 'Features Guide', icon: <DescriptionIcon /> },
];

export default function Layout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentNav = navItems.find((item) => item.path === location.pathname)?.path ?? navItems[0].path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: 7 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            Debtinator
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 2 }}>
        <Outlet />
      </Box>

      <BottomNavigation
        value={currentNav}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1050 }}
      >
        {navItems.map((item) => (
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
    </Box>
  );
}
