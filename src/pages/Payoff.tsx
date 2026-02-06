import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { useIncomeStore } from '@/store/useIncomeStore';
import type { Debt, PayoffMethod, PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';
import { formatCurrency } from '@/utils/formatters';

/** Default custom order: snowball (smallest balance first) */
function defaultCustomOrder(debts: Debt[]): string[] {
  return [...debts].sort((a, b) => a.balance - b.balance).map((d) => d.id);
}

export default function Payoff() {
  const debts = useDebts();
  const { method, monthlyPayment, customOrder, startDate, setMethod, setMonthlyPayment, setCustomOrder, setStartDate } =
    usePayoffFormStore();
  const monthlyIncome = useIncomeStore((s) => s.monthlyIncome);

  const totalMinimumPayments = useMemo(
    () => debts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [debts]
  );

  // When switching to custom or when debts change, ensure customOrder matches debt set
  const orderedIds = useMemo(() => {
    const debtIds = new Set(debts.map((d) => d.id));
    const existing = customOrder.filter((id) => debtIds.has(id));
    const added = debts.map((d) => d.id).filter((id) => !customOrder.includes(id));
    return existing.length > 0 || added.length > 0 ? [...existing, ...added] : defaultCustomOrder(debts);
  }, [debts, customOrder]);

  useEffect(() => {
    if (method !== 'custom') return;
    const orderChanged =
      customOrder.length !== orderedIds.length ||
      orderedIds.some((id, i) => customOrder[i] !== id);
    if (orderChanged) setCustomOrder(orderedIds);
  }, [method, debts.length, orderedIds, customOrder, setCustomOrder]);

  const moveCustomOrder = (index: number, direction: 1 | -1) => {
    const next = [...orderedIds];
    const j = index + direction;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setCustomOrder(next);
  };

  const paymentNum = parseFloat(monthlyPayment) || 0;
  const hasValidPayment = debts.length > 0 && paymentNum >= totalMinimumPayments;

  const schedule = useMemo(() => {
    if (!hasValidPayment) return null;
    const plan: PayoffPlan = {
      method,
      monthlyPayment: paymentNum,
      debts,
      customOrder: method === 'custom' ? orderedIds : undefined,
    };
    return calculatePayoffSchedule(plan);
  }, [debts, method, monthlyPayment, totalMinimumPayments, orderedIds, hasValidPayment, paymentNum]);

  const methodComparison = useMemo(() => {
    if (!hasValidPayment) return null;
    const snowball = calculatePayoffSchedule({
      method: 'snowball',
      monthlyPayment: paymentNum,
      debts,
    });
    const avalanche = calculatePayoffSchedule({
      method: 'avalanche',
      monthlyPayment: paymentNum,
      debts,
    });
    const custom = calculatePayoffSchedule({
      method: 'custom',
      monthlyPayment: paymentNum,
      debts,
      customOrder: orderedIds,
    });
    return [
      { name: 'Snowball', ...snowball, method: 'snowball' as const },
      { name: 'Avalanche', ...avalanche, method: 'avalanche' as const },
      { name: 'Custom', ...custom, method: 'custom' as const },
    ];
  }, [debts, paymentNum, orderedIds, hasValidPayment]);

  if (debts.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4} data-testid="payoff-empty">
        <Typography variant="h6">No debts yet</Typography>
        <Typography color="text.secondary" textAlign="center">
          Add your debts on the Debts tab, then come back here to pick a payoff method and see your timeline.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Card data-testid="payoff-method-card">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Payoff Method
          </Typography>
          <ToggleButtonGroup
            value={method}
            exclusive
            onChange={(_, v: PayoffMethod | null) => v && setMethod(v)}
            size="small"
            fullWidth
          >
            <ToggleButton value="snowball">Snowball</ToggleButton>
            <ToggleButton value="avalanche">Avalanche</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {method === 'snowball' && 'Pay off smallest balances first for quick wins'}
            {method === 'avalanche' && 'Pay off highest interest rates first to save money'}
            {method === 'custom' && 'Drag or use arrows to set the order you will pay off debts'}
          </Typography>
          {method === 'custom' && (
            <List dense sx={{ mt: 1 }} data-testid="custom-order-list">
              {orderedIds.map((id, index) => {
                const debt = debts.find((d) => d.id === id);
                if (!debt) return null;
                return (
                  <ListItem
                    key={debt.id}
                    secondaryAction={
                      <Box component="span">
                        <IconButton
                          size="small"
                          onClick={() => moveCustomOrder(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${debt.name} up`}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => moveCustomOrder(index, 1)}
                          disabled={index === orderedIds.length - 1}
                          aria-label={`Move ${debt.name} down`}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${index + 1}. ${debt.name}`}
                      secondary={formatCurrency(debt.balance)}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Monthly Payment
          </Typography>
          <TextField
            fullWidth
            label="Total Monthly Payment"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            type="number"
            inputProps={{ inputMode: 'decimal', min: 0, step: 1, 'data-testid': 'monthly-payment-input' }}
            InputProps={{ startAdornment: '$' }}
            placeholder="0.00"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Minimum payments total: {formatCurrency(totalMinimumPayments)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Your plan is saved automatically.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              First payment date (optional)
            </Typography>
            <TextField
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'start-date-input' }}
              sx={{ maxWidth: 200 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Timeline will show real months (e.g. March 2027) instead of &quot;Month 1&quot;
            </Typography>
          </Box>
          {monthlyIncome === 0 && (
            <Typography variant="body2" color="text.secondary">
              Add your income in Settings to see debt-to-income insights
            </Typography>
          )}
        </CardContent>
      </Card>

      {monthlyIncome > 0 && (
        <Card data-testid="income-insights-card">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Income Insights
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Minimum payments:</Typography>
              <Typography fontWeight={600}>
                {((totalMinimumPayments / monthlyIncome) * 100).toFixed(1)}% of income
              </Typography>
            </Box>
            {schedule && parseFloat(monthlyPayment) > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Your payment:</Typography>
                <Typography fontWeight={600}>
                  {((parseFloat(monthlyPayment) / monthlyIncome) * 100).toFixed(1)}% of income
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              Experts suggest keeping debt payments under 36% of gross income
            </Typography>
          </CardContent>
        </Card>
      )}

      {methodComparison && paymentNum > 0 && (
        <Card data-testid="method-comparison-card">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Compare methods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Same debts, same monthly payment — see how each method affects timeline and interest.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Months</TableCell>
                  <TableCell align="right">Total interest</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {methodComparison.map((row) => (
                  <TableRow
                    key={row.method}
                    selected={row.method === method}
                    sx={row.method === method ? { bgcolor: 'action.selected' } : undefined}
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.totalMonths}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalInterest)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {schedule && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Payoff Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Time to Payoff:</Typography>
              <Typography fontWeight={600}>
                {schedule.totalMonths} months ({(schedule.totalMonths / 12).toFixed(1)} years)
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Total Interest:</Typography>
              <Typography fontWeight={600}>{formatCurrency(schedule.totalInterest)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Total Payments:</Typography>
              <Typography fontWeight={600}>{formatCurrency(schedule.totalPayments)}</Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button component={Link} to="/payoff-timeline" variant="outlined" startIcon={<TimelineIcon />}>
                Timeline
              </Button>
              <Button component={Link} to="/charts" variant="outlined" startIcon={<BarChartIcon />}>
                Charts
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
