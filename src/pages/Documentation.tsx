import { Box, Typography, Card, CardContent } from '@mui/material';

export default function Documentation() {
  return (
    <Box display="flex" flexDirection="column" gap={2} data-testid="documentation-page">
      <Typography variant="h6">Features Guide</Typography>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Debts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add and edit your debts with name, type (Credit Card, Personal Loan, Other), balance, interest rate (APR %), and minimum payment. Your data is stored only in your browser—nothing is sent to a server.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Payoff Plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose Snowball (smallest balance first) or Avalanche (highest interest first), then enter your total monthly payment. The app calculates how long until you&apos;re debt-free and total interest. Use Timeline and Charts (from the menu) to see the month-by-month schedule and visualizations.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set light/dark theme (or system), optional monthly income for debt-to-income insights, and export your data to Excel. Export is a download from your browser—your data never leaves your device.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
