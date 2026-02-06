import { createTheme, type PaletteMode } from '@mui/material/styles';

const lightPalette = {
  primary: { main: '#4E7BA5' },
  secondary: { main: '#6B8F71' },
  background: { default: '#F5F3F0', paper: '#FFFFFF' },
  text: { primary: '#2D2D2A', secondary: '#5C5A57' },
  error: { main: '#B85450' },
};

const darkPalette = {
  primary: { main: '#d0bcff' },
  secondary: { main: '#ccc2dc' },
  background: { default: '#1c1b1f', paper: '#2b2930' },
  text: { primary: '#e6e1e5', secondary: '#cac4d0' },
  error: { main: '#f2b8b5' },
};

export function getAppTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { maxWidth: 'sm', width: '100%' },
        },
      },
    },
  });
}
