import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HelpIcon from '@mui/icons-material/Help';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { Link } from 'react-router-dom';
import { useThemeStore } from '@/store/useThemeStore';
import { useIncomeStore } from '@/store/useIncomeStore';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { createExportWorkbook, downloadWorkbook } from '@/utils/exportToExcel';
import type { ThemeMode } from '@/theme/tokens';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <LightModeIcon /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeIcon /> },
  { value: 'system', label: 'System (match device)', icon: <SettingsBrightnessIcon /> },
];

export function getExportStartIcon(isExporting: boolean): React.ReactNode {
  return isExporting ? <CircularProgress size={16} /> : <FileDownloadIcon />;
}

export function isExportDisabled(isExporting: boolean): boolean {
  return isExporting;
}

export default function Settings() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const monthlyIncome = useIncomeStore((s) => s.monthlyIncome);
  const setMonthlyIncome = useIncomeStore((s) => s.setMonthlyIncome);
  const debts = useDebts();
  const { method: payoffMethod, monthlyPayment } = usePayoffFormStore();
  const [incomeInput, setIncomeInput] = useState(
    monthlyIncome > 0 ? monthlyIncome.toString() : ''
  );
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIncomeInput(monthlyIncome > 0 ? monthlyIncome.toString() : '');
  }, [monthlyIncome]);

  const handleIncomeBlur = () => {
    const parsed = parseFloat(incomeInput);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setMonthlyIncome(value);
    setIncomeInput(value > 0 ? value.toString() : '');
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const wb = createExportWorkbook({
        debts,
        monthlyIncome,
        payoffMethod,
        monthlyPayment: parseFloat(String(monthlyPayment)) || 0,
      });
      const filename = `debtinator-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      downloadWorkbook(wb, filename);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <PaletteIcon color="action" />
            <Typography>Appearance</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense disablePadding>
            {THEME_OPTIONS.map((opt) => (
              <ListItemButton
                key={opt.value}
                onClick={() => setMode(opt.value)}
                selected={mode === opt.value}
              >
                <ListItemIcon>{opt.icon}</ListItemIcon>
                <ListItemText primary={opt.label} />
              </ListItemButton>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <AttachMoneyIcon color="action" />
            <Typography>Income</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Monthly Income (optional)"
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
            onBlur={handleIncomeBlur}
            type="number"
            inputProps={{ inputMode: 'decimal', min: 0, 'data-testid': 'income-input' }}
            InputProps={{ startAdornment: '$' }}
            placeholder="0.00"
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <FileDownloadIcon color="action" />
            <Typography>Export Data</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Download your debt data as Excel for counseling or analysis. Data stays on your device.
          </Typography>
          <Button
            variant="outlined"
            startIcon={getExportStartIcon(isExporting)}
            onClick={handleExportExcel}
            disabled={isExportDisabled(isExporting)}
            data-testid="export-excel-button"
          >
            Export to Excel
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <HelpIcon color="action" />
            <Typography>Help</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Button component={Link} to="/documentation" startIcon={<HelpIcon />} data-testid="help-documentation-link">
            Features Guide
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
