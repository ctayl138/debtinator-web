import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as LineTooltip,
  ResponsiveContainer as LineResponsiveContainer,
} from 'recharts';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import type { PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

function getMonthYearLabel(monthIndex: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthIndex);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatYAxisLabel(value: number): string {
  if (value === 0) return '$0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

export default function Charts() {
  const theme = useTheme();
  const debts = useDebts();
  const { method, monthlyPayment } = usePayoffFormStore();
  const [chartView, setChartView] = useState<'pie' | 'line'>('pie');

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

  const initialTotalBalance = useMemo(
    () => debts.reduce((sum, d) => sum + d.balance, 0),
    [debts]
  );

  const pieData = useMemo(() => {
    if (!schedule) return [];
    const principal = Math.max(0, schedule.totalPayments - schedule.totalInterest);
    const interest = schedule.totalInterest;
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    return [
      { name: 'Principal', value: Math.round(principal * 100) / 100, color: primary },
      { name: 'Interest', value: Math.round(interest * 100) / 100, color: secondary },
    ].filter((d) => d.value > 0);
  }, [schedule, theme.palette.primary.main, theme.palette.secondary.main]);

  const lineData = useMemo(() => {
    if (!schedule || schedule.steps.length === 0) return [];
    const points: { month: number; label: string; balance: number }[] = [
      { month: 0, label: getMonthYearLabel(0), balance: initialTotalBalance },
    ];
    for (let i = 0; i < schedule.steps.length; i++) {
      const total = schedule.steps[i].reduce((sum, s) => sum + s.remainingBalance, 0);
      points.push({
        month: i + 1,
        label: getMonthYearLabel(i + 1),
        balance: total,
      });
    }
    return points;
  }, [schedule, initialTotalBalance]);

  if (debts.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">Add debts first to see charts</Typography>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">
          Set a monthly payment on the Payoff tab (at least {formatCurrency(totalMinimumPayments)}) to see charts
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <ToggleButtonGroup
          value={chartView}
          exclusive
          onChange={(_, v: 'pie' | 'line' | null) => v && setChartView(v)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="pie">Principal vs Interest</ToggleButton>
          <ToggleButton value="line">Balance Over Time</ToggleButton>
        </ToggleButtonGroup>

        {chartView === 'pie' && pieData.length > 0 && (
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}

        {chartView === 'line' && lineData.length > 0 && (
          <Box height={280}>
            <LineResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => formatYAxisLabel(v)}
                  tick={{ fontSize: 10 }}
                />
                <LineTooltip formatter={(v: number) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </LineResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
