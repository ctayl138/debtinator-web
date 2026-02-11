import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import i18n from '@/i18n/config';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and display React errors gracefully.
 * Prevents the entire app from crashing and shows a user-friendly error message.
 * User data is safe as it's stored locally in browser storage.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught error:', error);
    console.error('Error info:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
          data-testid="error-boundary"
        >
          <Card sx={{ maxWidth: 600 }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
                <Typography variant="h5" component="h1" gutterBottom>
                  {i18n.t('common:errorTitle')}
                </Typography>
                <Typography color="text.secondary" textAlign="center">
                  {i18n.t('common:errorDescription')}
                </Typography>
                {this.state.error && (
                  <Box
                    component="pre"
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxWidth: '100%',
                      maxHeight: '200px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      color: 'error.main',
                    }}
                  >
                    {this.state.error.message}
                  </Box>
                )}
                <Button variant="contained" onClick={this.handleReset} sx={{ mt: 2 }}>
                  {i18n.t('common:errorReturnHome')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}
