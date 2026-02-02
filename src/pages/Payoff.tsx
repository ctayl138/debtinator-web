import { useMemo } from 'react';
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
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { useIncomeStore } from '@/store/useIncomeStore';
import type { PayoffMethod, PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function Payoff() {
  const debts = useDebts();
  const { method, monthlyPayment, setMethod, setMonthlyPayment } = usePayoffFormStore();
  const monthlyIncome = useIncomeStore((s) => s.monthlyIncome);

  const totalMinimumPayments = useMemo(
    () => debts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [debts]
  );

  const schedule = useMemo(() => {
    const payment = parseFloat(monthlyPayment) || 0;
    if (debts.length === 0 || payment < totalMinimumPayments) return null;
    const plan: PayoffPlan = { method, monthlyPayment: payment, debts };
    return calculatePayoffSchedule(plan);
  }, [debts, method, monthlyPayment, totalMinimumPayments]);

  if (debts.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4} data-testid="payoff-empty">
        <Typography variant="h6">No Debts to Plan</Typography>
        <Typography color="text.secondary">Add some debts first to create a payoff plan</Typography>
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
            {method === 'custom' && 'Choose your own payoff order (coming soon)'}
          </Typography>
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
