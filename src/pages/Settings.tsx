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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HelpIcon from '@mui/icons-material/Help';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/useThemeStore';
import { useIncomeStore, selectMonthlyIncome } from '@/store/useIncomeStore';
import { useDebtStore, useDebts, migrateDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { createExportWorkbook, downloadWorkbook } from '@/utils/exportToExcel';
import { printExportAsPdf } from '@/utils/exportToPdf';
import type { ThemeMode } from '@/theme/tokens';

export function getExportStartIcon(isExporting: boolean): React.ReactNode {
  return isExporting ? <CircularProgress size={16} /> : <FileDownloadIcon />;
}

export function isExportDisabled(isExporting: boolean): boolean {
  return isExporting;
}

export default function Settings() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const monthlyIncome = useIncomeStore(selectMonthlyIncome);
  const debts = useDebts();
  const { method: payoffMethod, monthlyPayment, customOrder } = usePayoffFormStore();
  const [isExporting, setIsExporting] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('themeLight'), icon: <LightModeIcon /> },
    { value: 'dark', label: t('themeDark'), icon: <DarkModeIcon /> },
    { value: 'system', label: t('themeSystem'), icon: <SettingsBrightnessIcon /> },
  ];

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
      monthlyIncome: selectMonthlyIncome(useIncomeStore.getState()),
      theme: useThemeStore.getState().mode,
      language: useLanguageStore.getState().language,
      incomes: useIncomeStore.getState().incomes,
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
      if (data.incomes && Array.isArray(data.incomes)) {
        useIncomeStore.setState({ incomes: data.incomes });
      } else if (typeof data.monthlyIncome === 'number' && data.monthlyIncome > 0) {
        useIncomeStore.getState().setMonthlyIncome(data.monthlyIncome);
      }
      if (data.theme && ['light', 'dark', 'system'].includes(data.theme)) {
        useThemeStore.getState().setMode(data.theme);
      }
      if (data.language && ['en', 'es'].includes(data.language)) {
        useLanguageStore.getState().setLanguage(data.language);
      }
      if (data.payoffForm) {
        const pf = data.payoffForm;
        if (pf.method) usePayoffFormStore.getState().setMethod(pf.method);
        if (pf.monthlyPayment != null) usePayoffFormStore.getState().setMonthlyPayment(pf.monthlyPayment);
        if (pf.customOrder) usePayoffFormStore.getState().setCustomOrder(pf.customOrder);
        if (pf.startDate) usePayoffFormStore.getState().setStartDate(pf.startDate);
      }
    } catch {
      setRestoreError(t('invalidBackupFile'));
    }
    e.target.value = '';
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <PaletteIcon color="action" />
            <Typography>{t('appearance')}</Typography>
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
            <FileDownloadIcon color="action" />
            <Typography>{t('exportData')}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('exportDescription')}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Button
              variant="outlined"
              startIcon={getExportStartIcon(isExporting)}
              onClick={handleExportExcel}
              disabled={isExportDisabled(isExporting)}
              data-testid="export-excel-button"
            >
              {t('exportExcel')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportPdf}
              data-testid="export-pdf-button"
            >
              {t('exportPdf')}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <BackupIcon color="action" />
            <Typography>{t('backupRestore')}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('backupDescription')}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
            <Button variant="outlined" startIcon={<BackupIcon />} onClick={handleBackup} data-testid="backup-button">
              {t('downloadBackup')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={() => restoreInputRef.current?.click()}
              data-testid="restore-button"
            >
              {t('restoreFromFile')}
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
            <Typography>{t('help')}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Button component={Link} to="/documentation" startIcon={<HelpIcon />} data-testid="help-documentation-link">
            {t('featuresGuide')}
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
