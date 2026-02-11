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
import { useTranslation } from 'react-i18next';
import { useIncomeStore, selectMonthlyIncome } from '@/store/useIncomeStore';
import IncomeForm from '@/components/IncomeForm';
import { useLocale } from '@/hooks/useLocale';
import type { Income, IncomeType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Z_INDEX_FAB } from '@/utils/constants';

const INCOME_TYPE_ORDER: IncomeType[] = ['salary', 'side_gig', 'investment', 'other'];

export default function Income() {
  const { t } = useTranslation('income');
  const { t: tc } = useTranslation('common');
  const locale = useLocale();
  const incomes = useIncomeStore((s) => s.incomes);
  const monthlyIncome = useIncomeStore(selectMonthlyIncome);
  const addIncome = useIncomeStore((s) => s.addIncome);
  const updateIncome = useIncomeStore((s) => s.updateIncome);
  const deleteIncome = useIncomeStore((s) => s.deleteIncome);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();
  const [deletingIncome, setDeletingIncome] = useState<Income | undefined>();

  const TYPE_LABEL_MAP: Record<IncomeType, string> = useMemo(
    () => ({
      salary: t('typeSalary'),
      side_gig: t('typeSideGig'),
      investment: t('typeInvestment'),
      other: t('typeOther'),
    }),
    [t]
  );

  const summary = useMemo(
    () => ({
      total: monthlyIncome,
      count: incomes.length,
    }),
    [monthlyIncome, incomes.length]
  );

  const sections = useMemo(
    () =>
      INCOME_TYPE_ORDER.map((type) => ({
        type,
        title: TYPE_LABEL_MAP[type],
        data: incomes.filter((i) => i.type === type),
      })).filter((s) => s.data.length > 0),
    [incomes, TYPE_LABEL_MAP]
  );

  const handleFormSubmit = (data: Omit<Income, 'id' | 'createdAt'>) => {
    if (editingIncome) {
      updateIncome(editingIncome.id, data);
    } else {
      addIncome(data);
    }
    setShowForm(false);
    setEditingIncome(undefined);
  };

  const confirmDelete = () => {
    if (deletingIncome) {
      deleteIncome(deletingIncome.id);
      setDeletingIncome(undefined);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!inInput) {
        e.preventDefault();
        setEditingIncome(undefined);
        setShowForm(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (incomes.length === 0 && !showForm) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={300}
        gap={2}
        data-testid="income-page"
      >
        <Typography variant="h6">{t('title')}</Typography>
        <Typography color="text.secondary" textAlign="center">
          {t('emptyStateMessage')}
        </Typography>
        <Fab
          color="primary"
          onClick={() => setShowForm(true)}
          aria-label={t('formTitleAdd')}
          data-testid="add-income-fab"
        >
          <AddIcon />
        </Fab>
        <IncomeForm
          key="new"
          open={showForm}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Box>
    );
  }

  return (
    <>
      {incomes.length > 0 && (
        <Card sx={{ mb: 2 }} data-testid="income-summary">
          <CardContent>
            <Typography color="text.secondary" variant="subtitle1">
              {t('totalIncome')}
            </Typography>
            <Typography variant="h5">{formatCurrency(summary.total, locale)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('summaryCount', { count: summary.count })}
            </Typography>
          </CardContent>
        </Card>
      )}

      <List data-testid="income-page">
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
                  setEditingIncome(item);
                  setShowForm(true);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setDeletingIncome(item);
                }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={formatCurrency(item.amount, locale)}
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
          setEditingIncome(undefined);
          setShowForm(true);
        }}
        aria-label={t('formTitleAdd')}
        data-testid="add-income-fab"
      >
        <AddIcon />
      </Fab>

      <IncomeForm
        key={editingIncome?.id ?? 'new'}
        open={showForm}
        income={editingIncome}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingIncome(undefined);
        }}
        onDelete={
          editingIncome
            ? () => {
                deleteIncome(editingIncome.id);
                setShowForm(false);
                setEditingIncome(undefined);
              }
            : undefined
        }
      />

      <Dialog
        open={!!deletingIncome}
        onClose={() => setDeletingIncome(undefined)}
        data-testid="delete-income-dialog"
      >
        <DialogTitle>{t('deleteIncomeTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('deleteIncomeConfirm', { name: deletingIncome?.name })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingIncome(undefined)}>{tc('cancel')}</Button>
          <Button onClick={confirmDelete} color="error">
            {tc('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
