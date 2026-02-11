import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Fab,
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import { useDebts, useDebtActions } from '@/store/useDebtStore';
import DebtForm from '@/components/DebtForm';
import ImportDialog from '@/components/ImportDialog';
import { useImportDialog } from '@/hooks/useImportDialog';
import { useLocale } from '@/hooks/useLocale';
import type { Debt, DebtType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Z_INDEX_FAB } from '@/utils/constants';

const DEBT_TYPE_ORDER: DebtType[] = ['credit_card', 'personal_loan', 'other'];

export default function Debts() {
  const { t } = useTranslation('debts');
  const { t: tc } = useTranslation('common');
  const locale = useLocale();
  const debts = useDebts();
  const { addDebt, updateDebt, deleteDebt } = useDebtActions();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();
  const [deletingDebt, setDeletingDebt] = useState<Debt | undefined>();

  // Import dialog state management
  const {
    importOpen,
    importText,
    importResult,
    fileInputRef,
    setImportText,
    handleImportPreview,
    handleImportFile,
    openImport,
    closeImport,
  } = useImportDialog();

  const DEBT_TYPE_LABEL_MAP: Record<string, string> = useMemo(() => ({
    credit_card: tc('debtTypeCredit'),
    personal_loan: tc('debtTypePersonal'),
    other: tc('debtTypeOther'),
  }), [tc]);

  const summary = useMemo(() => {
    const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const weightedInterestRate =
      debts.length > 0
        ? debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0) / totalBalance
        : 0;
    return {
      totalBalance,
      totalMinimumPayments,
      weightedInterestRate: isNaN(weightedInterestRate) ? 0 : weightedInterestRate,
      count: debts.length,
    };
  }, [debts]);

  const sections = useMemo(() => {
    return DEBT_TYPE_ORDER.map((type) => ({
      type,
      title: DEBT_TYPE_LABEL_MAP[type] ?? type,
      data: debts.filter((d) => (d.type || 'other') === type),
    })).filter((s) => s.data.length > 0);
  }, [debts, DEBT_TYPE_LABEL_MAP]);

  const handleFormSubmit = (debtData: Omit<Debt, 'id' | 'createdAt'>) => {
    if (editingDebt) {
      updateDebt(editingDebt.id, debtData);
    } else {
      addDebt(debtData);
    }
    setShowForm(false);
    setEditingDebt(undefined);
  };

  const confirmDelete = () => {
    if (deletingDebt) {
      deleteDebt(deletingDebt.id);
      setDeletingDebt(undefined);
    }
  };

  const handleImportConfirm = () => {
    if (importResult?.rows.length) {
      importResult.rows.forEach((row) =>
        addDebt({
          name: row.name,
          type: row.type,
          balance: row.balance,
          interestRate: row.interestRate,
          minimumPayment: row.minimumPayment,
          ...(row.tag && { tag: row.tag }),
        })
      );
      closeImport();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!inInput) {
        e.preventDefault();
        setEditingDebt(undefined);
        setShowForm(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (debts.length === 0 && !showForm) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={300}
        gap={2}
        data-testid="debts-empty"
      >
        <Typography variant="h6">{tc('noDebtsYet')}</Typography>
        <Typography color="text.secondary" textAlign="center">
          {t('emptyStateMessage')}
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={openImport} data-testid="import-debts-btn">
            {t('importFromCsv')}
          </Button>
          <Fab color="primary" onClick={() => setShowForm(true)} aria-label={tc('addDebt')} data-testid="add-debt-fab">
            <AddIcon />
          </Fab>
        </Box>
        <ImportDialog
          open={importOpen}
          onClose={closeImport}
          importText={importText}
          setImportText={setImportText}
          importResult={importResult}
          onPreview={handleImportPreview}
          onFileChange={handleImportFile}
          onConfirm={handleImportConfirm}
          fileInputRef={fileInputRef}
        />
      </Box>
    );
  }

  return (
    <>
      {debts.length > 0 && (
        <Card sx={{ mb: 2 }} data-testid="debts-summary">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
              <Box>
                <Typography color="text.secondary" variant="subtitle1">
                  {t('totalDebt')}
                </Typography>
                <Typography variant="h5">{formatCurrency(summary.totalBalance, locale)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('summaryCount', { count: summary.count })} · {t('minPayment')}{' '}
                  {formatCurrency(summary.totalMinimumPayments, locale)} · {t('avgApr')}{' '}
                  {summary.weightedInterestRate.toFixed(2)}%
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={openImport}
                data-testid="import-debts-btn"
              >
                {tc('import')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <List>
        {sections.map(({ type, title, data }) => (
          <Box key={type} component="div">
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, pt: 2, pb: 0.5 }}>
              {t('sectionHeader', { type: title, count: data.length })}
            </Typography>
            <Divider sx={{ mx: 2 }} />
            {data.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => {
                  setEditingDebt(item);
                  setShowForm(true);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setDeletingDebt(item);
                }}
              >
                <ListItemText
                  primary={
                    <>
                      {item.name}
                      {item.tag && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          · {item.tag}
                        </Typography>
                      )}
                    </>
                  }
                  secondary={
                    <>
                      {formatCurrency(item.balance, locale)} · {item.interestRate.toFixed(2)}% APR · Min{' '}
                      {formatCurrency(item.minimumPayment, locale)}
                      {item.dueDay != null && (
                        <Typography component="span" variant="caption" color="text.secondary" display="block">
                          {t('dueDay', { day: item.dueDay })}
                        </Typography>
                      )}
                    </>
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </List>

      <Fab
        color="primary"
        sx={{ position: 'fixed', right: 16, bottom: 72, zIndex: Z_INDEX_FAB }}
        onClick={() => {
          setEditingDebt(undefined);
          setShowForm(true);
        }}
        aria-label={tc('addDebt')}
        data-testid="add-debt-fab"
      >
        <AddIcon />
      </Fab>

      <DebtForm
        key={editingDebt?.id ?? 'new'}
        open={showForm}
        debt={editingDebt}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDebt(undefined);
        }}
        onDelete={
          editingDebt
            ? () => {
                deleteDebt(editingDebt.id);
                setShowForm(false);
                setEditingDebt(undefined);
              }
            : undefined
        }
      />

      <ImportDialog
        open={importOpen}
        onClose={closeImport}
        importText={importText}
        setImportText={setImportText}
        importResult={importResult}
        onPreview={handleImportPreview}
        onFileChange={handleImportFile}
        onConfirm={handleImportConfirm}
        fileInputRef={fileInputRef}
      />

      <Dialog open={!!deletingDebt} onClose={() => setDeletingDebt(undefined)} data-testid="delete-debt-dialog">
        <DialogTitle>{t('deleteDebtTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('deleteDebtConfirm', { name: deletingDebt?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingDebt(undefined)}>{tc('cancel')}</Button>
          <Button onClick={confirmDelete} color="error">
            {tc('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
