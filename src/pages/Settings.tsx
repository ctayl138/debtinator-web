import { useState, useEffect, useRef } from 'react';
import {
  Box,
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
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import { Link } from 'react-router-dom';
import { useThemeStore } from '@/store/useThemeStore';
import { useIncomeStore } from '@/store/useIncomeStore';
import { useDebtStore, useDebts, migrateDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { createExportWorkbook, downloadWorkbook } from '@/utils/exportToExcel';
import { printExportAsPdf } from '@/utils/exportToPdf';
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
  const { method: payoffMethod, monthlyPayment, customOrder } = usePayoffFormStore();
  const [incomeInput, setIncomeInput] = useState(
    monthlyIncome > 0 ? monthlyIncome.toString() : ''
  );
  const [isExporting, setIsExporting] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIncomeInput(monthlyIncome > 0 ? monthlyIncome.toString() : '');
  }, [monthlyIncome]);

  const handleIncomeBlur = () => {
    const parsed = parseFloat(incomeInput);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setMonthlyIncome(value);
    setIncomeInput(value > 0 ? value.toString() : '');
  };

  const paymentNum = parseFloat(String(monthlyPayment)) || 0;
  const exportPayload = {
    debts,
    monthlyIncome,
    payoffMethod,
    monthlyPayment: paymentNum,
    customOrder,
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const wb = createExportWorkbook(exportPayload);
      const filename = `debtinator-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      downloadWorkbook(wb, filename);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = () => {
    printExportAsPdf(exportPayload);
  };

  const handleBackup = () => {
    const backup = {
      debts: useDebtStore.getState().debts,
      monthlyIncome: useIncomeStore.getState().monthlyIncome,
      theme: useThemeStore.getState().mode,
      payoffForm: {
        method: usePayoffFormStore.getState().method,
        monthlyPayment: usePayoffFormStore.getState().monthlyPayment,
        customOrder: usePayoffFormStore.getState().customOrder,
        startDate: usePayoffFormStore.getState().startDate,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debtinator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.debts && Array.isArray(data.debts)) {
        const migrated = migrateDebts(data.debts);
        useDebtStore.setState({ debts: migrated });
      }
      if (typeof data.monthlyIncome === 'number') {
        useIncomeStore.getState().setMonthlyIncome(data.monthlyIncome);
      }
      if (data.theme && ['light', 'dark', 'system'].includes(data.theme)) {
        useThemeStore.getState().setMode(data.theme);
      }
      if (data.payoffForm) {
        const pf = data.payoffForm;
        if (pf.method) usePayoffFormStore.getState().setMethod(pf.method);
        if (pf.monthlyPayment != null) usePayoffFormStore.getState().setMonthlyPayment(pf.monthlyPayment);
        if (pf.customOrder) usePayoffFormStore.getState().setCustomOrder(pf.customOrder);
        if (pf.startDate) usePayoffFormStore.getState().setStartDate(pf.startDate);
      }
    } catch {
      setRestoreError('Invalid backup file');
    }
    e.target.value = '';
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
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Button
              variant="outlined"
              startIcon={getExportStartIcon(isExporting)}
              onClick={handleExportExcel}
              disabled={isExportDisabled(isExporting)}
              data-testid="export-excel-button"
            >
              Export to Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportPdf}
              data-testid="export-pdf-button"
            >
              Export to PDF
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <BackupIcon color="action" />
            <Typography>Backup &amp; Restore</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Download a JSON backup of all your data, or restore from a previous backup. Data stays on your device.
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
            <Button variant="outlined" startIcon={<BackupIcon />} onClick={handleBackup} data-testid="backup-button">
              Download backup
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={() => restoreInputRef.current?.click()}
              data-testid="restore-button"
            >
              Restore from file
            </Button>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleRestore}
              style={{ display: 'none' }}
              data-testid="restore-file-input"
            />
          </Box>
          {restoreError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {restoreError}
            </Typography>
          )}
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
