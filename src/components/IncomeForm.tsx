import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Income, IncomeType } from '@/types';

interface IncomeFormProps {
  open: boolean;
  income?: Income;
  onSubmit: (data: Omit<Income, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const INCOME_TYPES: IncomeType[] = ['salary', 'side_gig', 'investment', 'other'];

export default function IncomeForm({
  open,
  income,
  onSubmit,
  onCancel,
  onDelete,
}: IncomeFormProps) {
  const { t } = useTranslation('income');
  const { t: tc } = useTranslation('common');
  const [name, setName] = useState(income?.name ?? '');
  const [type, setType] = useState<IncomeType>(income?.type ?? 'salary');
  const [amount, setAmount] = useState(income?.amount.toString() ?? '');

  useEffect(() => {
    if (open) {
      setName(income?.name ?? '');
      setType(income?.type ?? 'salary');
      setAmount(income?.amount.toString() ?? '');
    }
  }, [open, income]);

  const handleSubmit = () => {
    const num = parseFloat(amount);
    const value = isNaN(num) || num < 0 ? 0 : num;
    onSubmit({
      name: name.trim() || t('defaultName'),
      type,
      amount: value,
    });
  };

  const numAmount = parseFloat(amount);
  const isValid = (name.trim().length > 0 || true) && !isNaN(numAmount) && numAmount > 0;

  const typeLabelKey: Record<IncomeType, string> = {
    salary: 'typeSalary',
    side_gig: 'typeSideGig',
    investment: 'typeInvestment',
    other: 'typeOther',
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{income ? t('formTitleEdit') : t('formTitleAdd')}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label={t('fieldName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('fieldNamePlaceholder')}
            fullWidth
            inputProps={{ 'data-testid': 'income-form-name' }}
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">{t('fieldType')}</FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(_, v) => setType(v as IncomeType)}
            >
              {INCOME_TYPES.map((tipo) => (
                <FormControlLabel
                  key={tipo}
                  value={tipo}
                  control={<Radio />}
                  label={t(typeLabelKey[tipo])}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <TextField
            label={t('fieldAmount')}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01, 'data-testid': 'income-form-amount' }}
            InputProps={{ startAdornment: '$' }}
          />

          {income && onDelete && (
            <Button
              variant="outlined"
              color="error"
              onClick={onDelete}
              startIcon={<span aria-hidden>🗑</span>}
            >
              {t('deleteIncome')}
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{tc('cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid} data-testid="income-form-submit">
          {income ? t('submitUpdate') : t('submitAdd')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
