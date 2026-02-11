import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Documentation() {
  const { t } = useTranslation('documentation');

  return (
    <Box display="flex" flexDirection="column" gap={2} data-testid="documentation-page">
      <Typography variant="h6">{t('title')}</Typography>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('debtsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('debtsDescription')}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('payoffTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('payoffDescription')}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('chartsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('chartsDescription')}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('timelineTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('timelineDescription')}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('incomeTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('incomeDescription')}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('settingsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settingsDescription')}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
