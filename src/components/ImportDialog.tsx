import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import type { ImportResult } from '@/utils/importDebts';

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  importText: string;
  setImportText: (v: string) => void;
  importResult: ImportResult | null;
  onPreview: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Dialog for importing debts from CSV data.
 * Supports both pasted text and file upload.
 * Displays preview of parsed rows and any parsing errors.
 */
export default function ImportDialog({
  open,
  onClose,
  importText,
  setImportText,
  importResult,
  onPreview,
  onFileChange,
  onConfirm,
  fileInputRef,
}: ImportDialogProps) {
  const { t } = useTranslation('debts');
  const { t: tc } = useTranslation('common');

  return (
    <Dialog open={open} onClose={onClose} data-testid="import-debts-dialog">
      <DialogTitle>{t('importTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('importInstructions')}
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder={t('importPlaceholder')}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          sx={{ mb: 1 }}
          data-testid="import-paste-input"
        />
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Button variant="outlined" size="small" onClick={onPreview} data-testid="import-preview-btn">
            {tc('preview')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<UploadFileIcon />}
          >
            {t('importChooseFile')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={onFileChange}
            style={{ display: 'none' }}
            data-testid="import-file-input"
          />
        </Box>
        {importResult && (
          <Box sx={{ mt: 2 }}>
            {importResult.errors.length > 0 && (
              <Typography variant="body2" color="error" component="div">
                {importResult.errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {t('importToImport', { count: importResult.rows.length })}
              {importResult.errors.length > 0 ? ` · ${t('importErrors', { count: importResult.errors.length })}` : ''}.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{tc('cancel')}</Button>
        <Button onClick={onPreview}>{tc('preview')}</Button>
        <Button onClick={onConfirm} variant="contained" disabled={!importResult?.rows.length} data-testid="import-confirm-btn">
          {importResult?.rows.length ? t('importConfirm', { count: importResult.rows.length }) : tc('import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
