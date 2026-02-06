import { getAppTheme } from './muiTheme';

describe('theme/muiTheme', () => {
  it('creates light theme with expected palette', () => {
    const theme = getAppTheme('light');
    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.primary.main).toBe('#4E7BA5');
    expect(theme.palette.background.default).toBe('#F5F3F0');
  });

  it('creates dark theme with expected palette', () => {
    const theme = getAppTheme('dark');
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.primary.main).toBe('#d0bcff');
    expect(theme.palette.background.default).toBe('#1c1b1f');
  });

  it('applies component overrides', () => {
    const theme = getAppTheme('light');
    const buttonOverride = theme.components?.MuiButton?.styleOverrides?.root;
    expect(buttonOverride).toEqual({ textTransform: 'none' });
  });

  it('applies MuiDialog paper overrides', () => {
    const theme = getAppTheme('light');
    const dialogPaperOverride = theme.components?.MuiDialog?.styleOverrides?.paper;
    expect(dialogPaperOverride).toEqual({ maxWidth: 'sm', width: '100%' });
  });
});
