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
      <DialogTitle>{debt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label="Debt Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Credit Card, Car Loan"
            fullWidth
            inputProps={{ 'data-testid': 'debt-form-name' }}
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">Debt Type</FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(_, v) => setType(v as DebtType)}
            >
              <FormControlLabel value="credit_card" control={<Radio />} label="Credit Card" />
              <FormControlLabel value="personal_loan" control={<Radio />} label="Personal Loan" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>

          <TextField
            label={type === 'credit_card' ? 'Interest Rate (APR %)' : 'Interest Rate (%)'}
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01 }}
          />

          <TextField
            label="Current Balance"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01, 'data-testid': 'debt-form-balance' }}
            InputProps={{ startAdornment: '$' }}
          />

          <TextField
            label="Minimum Payment"
            type="number"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal', min: 0, step: 0.01 }}
            InputProps={{ startAdornment: '$' }}
          />

          <TextField
            label="Tag (optional)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., medical, cards"
            fullWidth
            inputProps={{ 'data-testid': 'debt-form-tag' }}
          />

          <TextField
            label="Due day of month (optional)"
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
              Delete Debt
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid} data-testid="debt-form-submit">
          {debt ? 'Update' : 'Add'} Debt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
