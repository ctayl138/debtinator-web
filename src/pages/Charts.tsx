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
import { useTranslation } from 'react-i18next';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { useLocale } from '@/hooks/useLocale';
import type { PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';
import { formatCurrency, formatYAxisLabel, getMonthYearLabel } from '@/utils/formatters';

// Re-export for backward compatibility
export { formatYAxisLabel };

export default function Charts() {
  const { t } = useTranslation('charts');
  const locale = useLocale();
  const theme = useTheme();
  const debts = useDebts();
  const { method, monthlyPayment, customOrder } = usePayoffFormStore();
  const [chartView, setChartView] = useState<'pie' | 'line' | 'freed'>('pie');

  const totalMinimumPayments = useMemo(
    () => debts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [debts]
  );

  const orderedIds = useMemo(() => {
    const order = customOrder ?? [];
    const debtIds = new Set(debts.map((d) => d.id));
    const existing = order.filter((id) => debtIds.has(id));
    const added = debts.map((d) => d.id).filter((id) => !order.includes(id));
    return existing.length > 0 || added.length > 0 ? [...existing, ...added] : [...debts].sort((a, b) => a.balance - b.balance).map((d) => d.id);
  }, [debts, customOrder]);

  const schedule = useMemo(() => {
    const payment = parseFloat(monthlyPayment) || 0;
    if (debts.length === 0 || payment < totalMinimumPayments) return null;
    const plan: PayoffPlan = {
      method,
      monthlyPayment: payment,
      debts,
      customOrder: method === 'custom' ? orderedIds : undefined,
    };
    return calculatePayoffSchedule(plan);
  }, [debts, method, monthlyPayment, totalMinimumPayments, orderedIds]);

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
      { name: t('principal'), value: Math.round(principal * 100) / 100, color: primary },
      { name: t('interest'), value: Math.round(interest * 100) / 100, color: secondary },
    ].filter((d) => d.value > 0);
  }, [schedule, theme.palette.primary.main, theme.palette.secondary.main, t]);

  const lineData = useMemo(() => {
    if (!schedule || schedule.steps.length === 0) return [];
    const points: { month: number; label: string; balance: number }[] = [
      { month: 0, label: getMonthYearLabel(0, locale), balance: initialTotalBalance },
    ];
    for (let i = 0; i < schedule.steps.length; i++) {
      const total = schedule.steps[i].reduce((sum, s) => sum + s.remainingBalance, 0);
      points.push({
        month: i + 1,
        label: getMonthYearLabel(i + 1, locale),
        balance: total,
      });
    }
    return points;
  }, [schedule, initialTotalBalance, locale]);

  const freedUpData = useMemo(() => {
    if (!schedule || schedule.steps.length === 0 || debts.length === 0) return [];
    const minByDebtId = new Map(debts.map((d) => [d.id, d.minimumPayment]));
    const paidOffIds = new Set<string>();
    const points: { month: number; label: string; freed: number }[] = [
      { month: 0, label: getMonthYearLabel(0, locale), freed: 0 },
    ];
    for (let i = 0; i < schedule.steps.length; i++) {
      for (const step of schedule.steps[i]) {
        if (step.remainingBalance === 0) paidOffIds.add(step.debtId);
      }
      const freed = [...paidOffIds].reduce((sum, id) => sum + (minByDebtId.get(id) ?? 0), 0);
      points.push({
        month: i + 1,
        label: getMonthYearLabel(i + 1, locale),
        freed,
      });
    }
    return points;
  }, [schedule, debts, locale]);

  if (debts.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">
          {t('emptyNoDebts')}
        </Typography>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">
          {t('emptyNoPlan', { amount: formatCurrency(totalMinimumPayments, locale) })}
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
          onChange={(_, v: 'pie' | 'line' | 'freed' | null) => v && setChartView(v)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="pie">{t('principalVsInterest')}</ToggleButton>
          <ToggleButton value="line">{t('balanceOverTime')}</ToggleButton>
          <ToggleButton value="freed">{t('freedUpOverTime')}</ToggleButton>
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
                  label={({ name, value }) => `${name}: ${formatCurrency(value, locale)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v, locale)} />
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
                <LineTooltip formatter={(v: number) => formatCurrency(v, locale)} />
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

        {chartView === 'freed' && freedUpData.length > 0 && (
          <Box height={280}>
            <LineResponsiveContainer width="100%" height="100%">
              <LineChart data={freedUpData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                <LineTooltip formatter={(v: number) => formatCurrency(v, locale)} />
                <Line
                  type="monotone"
                  dataKey="freed"
                  stroke={theme.palette.secondary.main}
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
