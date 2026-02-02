import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '@/theme/muiTheme';

interface RenderOptions {
  route?: string;
}

export function renderWithProviders(ui: React.ReactElement, options: RenderOptions = {}) {
  const { route = '/' } = options;
  return render(
    <MuiThemeProvider theme={getAppTheme('light')}>
      <CssBaseline />
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MuiThemeProvider>
  );
}
