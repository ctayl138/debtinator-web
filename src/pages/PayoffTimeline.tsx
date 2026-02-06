import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import type { PayoffPlan, PayoffSchedule } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';

const INITIAL_MONTHS = 12;
const LOAD_MORE = 12;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/** monthIndex is 1-based (month 1 = first payment). baseDate YYYY-MM-DD or empty for current month. */
function getMonthYear(monthIndex: number, baseDate?: string): string {
  const d = baseDate ? new Date(baseDate + 'T12:00:00') : new Date();
  if (!baseDate) d.setMonth(d.getMonth() + monthIndex);
  else d.setMonth(d.getMonth() + monthIndex - 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getNextVisibleMonths(
  current: number,
  schedule: PayoffSchedule | null
): number {
  if (!schedule) return current;
  return Math.min(current + LOAD_MORE, schedule.steps.length);
}

export default function PayoffTimeline() {
  const debts = useDebts();
  const { method, monthlyPayment, customOrder, startDate } = usePayoffFormStore();
  const [visibleMonths, setVisibleMonths] = useState(INITIAL_MONTHS);

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

  const displayedMonths = useMemo(() => {
    if (!schedule) return [];
    return schedule.steps.slice(0, visibleMonths);
  }, [schedule, visibleMonths]);

  const hasMore = schedule ? visibleMonths < schedule.steps.length : false;

  const handleLoadMore = useCallback(() => {
    setVisibleMonths((prev) => getNextVisibleMonths(prev, schedule));
  }, [schedule]);

  if (debts.length === 0) {
    return (
      <Box py={4} textAlign="center" data-testid="timeline-empty">
        <Typography color="text.secondary">
          Add debts on the Debts tab, then set a monthly payment on the Payoff tab to see your timeline here.
        </Typography>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box py={4} textAlign="center" data-testid="timeline-no-plan">
        <Typography color="text.secondary">
          Enter a monthly payment (at least the total of your minimums) on the Payoff tab to see your month-by-month schedule.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} data-testid="payoff-timeline">
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Payoff Timeline — {schedule.totalMonths} months total
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total interest: {formatCurrency(schedule.totalInterest)}
          </Typography>
        </CardContent>
      </Card>

      <List>
        {displayedMonths.map((monthSteps, idx) => {
          const month = idx + 1;
          const monthLabel = getMonthYear(month, startDate || undefined);
          const totalPaid = monthSteps.reduce((sum, s) => sum + s.payment, 0);
          const totalInterest = monthSteps.reduce((sum, s) => sum + s.interestPaid, 0);
          return (
            <Card key={month} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Month {month} — {monthLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total paid: {formatCurrency(totalPaid)} (interest: {formatCurrency(totalInterest)})
                </Typography>
                <List dense disablePadding>
                  {monthSteps.map((step) => (
                    <ListItem key={step.debtId} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={step.debtName}
                        secondary={`${formatCurrency(step.payment)} → ${formatCurrency(step.remainingBalance)} left`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          );
        })}
      </List>

      {hasMore && (
        <Box display="flex" justifyContent="center" py={2}>
          <Typography
            component="button"
            variant="button"
            onClick={handleLoadMore}
            sx={{ cursor: 'pointer' }}
          >
            Load more months
          </Typography>
        </Box>
      )}

      {!hasMore && schedule.steps.length > 0 && (
        <Box textAlign="center" py={2}>
          <Typography color="text.secondary">You&apos;re debt-free in {schedule.totalMonths} months!</Typography>
        </Box>
      )}
    </Box>
  );
}
