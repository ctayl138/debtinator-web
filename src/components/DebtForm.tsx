import { useState } from 'react';
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
import type { Debt, DebtType } from '@/types';

interface DebtFormProps {
  open: boolean;
  debt?: Debt;
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function DebtForm({
  open,
  debt,
  onSubmit,
  onCancel,
  onDelete,
}: DebtFormProps) {
  const { t } = useTranslation('debts');
  const { t: tc } = useTranslation('common');
  const [name, setName] = useState(debt?.name ?? '');
  const [type, setType] = useState<DebtType>(debt?.type ?? 'other');
  const [balance, setBalance] = useState(debt?.balance.toString() ?? '');
  const [interestRate, setInterestRate] = useState(
    debt?.interestRate.toString() ?? ''
  );
  const [minimumPayment, setMinimumPayment] = useState(
    debt?.minimumPayment.toString() ?? ''
  );
  const [tag, setTag] = useState(debt?.tag ?? '');
  const [dueDay, setDueDay] = useState(debt?.dueDay?.toString() ?? '');

  const handleSubmit = () => {
    const dueDayNum = dueDay.trim() ? parseInt(dueDay, 10) : undefined;
    const validDueDay =
      dueDayNum != null && !isNaN(dueDayNum) && dueDayNum >= 1 && dueDayNum <= 31
        ? dueDayNum
        : undefined;
    onSubmit({
      name: name.trim(),
      type,
      balance: parseFloat(balance),
      interestRate: parseFloat(interestRate),
      minimumPayment: parseFloat(minimumPayment),
      ...(tag.trim() && { tag: tag.trim() }),
      ...(validDueDay !== undefined && { dueDay: validDueDay }),
    });
  };

  const isValid =
    name.trim().length > 0 &&
    parseFloat(balance) > 0 &&
    parseFloat(interestRate) >= 0 &&
    parseFloat(minimumPayment) > 0;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{debt ? t('formTitleEdit') : t('formTitleAdd')}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label={t('fieldName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('fieldNamePlaceholder')}
            fullWidth
            inputProps={{ 'data-testid': 'debt-form-name' }}
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">{t('fieldType')}</FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(_, v) => setType(v as DebtType)}
            >
              <FormControlLabel value="credit_card" control={<Radio />} label={tc('debtTypeCredit')} />
              <FormControlLabel value="personal_loan" control={<Radio />} label={tc('debtTypePersonal')} />
              <FormControlLabel value="other" control={<Radio />} label={tc('debtTypeOther')} />
            </RadioGroup>
          </FormControl>

          <TextField
            label={type === 'credit_card' ? t('fieldInterestRateApr') : t('fieldInterestRate')}
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01 }}
          />

          <TextField
            label={t('fieldBalance')}
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01, 'data-testid': 'debt-form-balance' }}
            InputProps={{ startAdornment: '$' }}
          />

          <TextField
            label={t('fieldMinPayment')}
            type="number"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01 }}
            InputProps={{ startAdornment: '$' }}
          />

          <TextField
            label={t('fieldTag')}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder={t('fieldTagPlaceholder')}
            fullWidth
            inputProps={{ 'data-testid': 'debt-form-tag' }}
          />

          <TextField
            label={t('fieldDueDay')}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="1-31"
            fullWidth
            type="number"
            inputProps={{ min: 1, max: 31, 'data-testid': 'debt-form-due-day' }}
          />

          {debt && onDelete && (
            <Button
              variant="outlined"
              color="error"
              onClick={onDelete}
              startIcon={<span aria-hidden>🗑</span>}
            >
              {t('deleteDebt')}
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{tc('cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid} data-testid="debt-form-submit">
          {debt ? t('submitUpdate') : t('submitAdd')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
