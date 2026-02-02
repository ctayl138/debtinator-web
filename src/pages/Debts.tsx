import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Fab,
  List,
  ListSubheader,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDebts, useDebtActions } from '@/store/useDebtStore';
import DebtForm from '@/components/DebtForm';
import type { Debt, DebtType } from '@/types';

const DEBT_TYPE_ORDER: DebtType[] = ['credit_card', 'personal_loan', 'other'];
const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  credit_card: 'Credit Cards',
  personal_loan: 'Personal Loans',
  other: 'Other',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function Debts() {
  const debts = useDebts();
  const { addDebt, updateDebt, deleteDebt } = useDebtActions();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();
  const [deletingDebt, setDeletingDebt] = useState<Debt | undefined>();

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
      title: DEBT_TYPE_LABELS[type],
      data: debts.filter((d) => (d.type || 'other') === type),
    })).filter((s) => s.data.length > 0);
  }, [debts]);

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
        <Typography variant="h6">No Debts Yet</Typography>
        <Typography color="text.secondary">Add your first debt to get started</Typography>
        <Fab color="primary" onClick={() => setShowForm(true)} aria-label="Add debt" data-testid="add-debt-fab">
          <AddIcon />
        </Fab>
      </Box>
    );
  }

  return (
    <>
      {debts.length > 0 && (
        <Card sx={{ mb: 2 }} data-testid="debts-summary">
          <CardContent>
            <Typography color="text.secondary" variant="subtitle1">
              Total Debt
            </Typography>
            <Typography variant="h5">{formatCurrency(summary.totalBalance)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.count} {summary.count === 1 ? 'debt' : 'debts'} · Min payment:{' '}
              {formatCurrency(summary.totalMinimumPayments)} · Avg APR:{' '}
              {summary.weightedInterestRate.toFixed(2)}%
            </Typography>
          </CardContent>
        </Card>
      )}

      <List>
        {sections.map(({ type, title, data }) => (
          <Box key={type} component="div">
            <ListSubheader component="div" sx={{ bgcolor: 'background.paper' }}>
              {title} — {data.length} {data.length === 1 ? 'debt' : 'debts'}
            </ListSubheader>
            {data.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ mb: 1 }}>
                <ListItemButton
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
                    primary={item.name}
                    secondary={
                      <>
                        {formatCurrency(item.balance)} · {item.interestRate.toFixed(2)}% APR · Min{' '}
                        {formatCurrency(item.minimumPayment)}
                      </>
                    }
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </Card>
            ))}
          </Box>
        ))}
      </List>

      <Fab
        color="primary"
        sx={{ position: 'fixed', right: 16, bottom: 72, zIndex: 1100 }}
        onClick={() => {
          setEditingDebt(undefined);
          setShowForm(true);
        }}
        aria-label="Add debt"
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

      <Dialog open={!!deletingDebt} onClose={() => setDeletingDebt(undefined)} data-testid="delete-debt-dialog">
        <DialogTitle>Delete Debt</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deletingDebt?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingDebt(undefined)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
