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
  return (
    <Dialog open={open} onClose={onClose} data-testid="import-debts-dialog">
      <DialogTitle>Import debts from CSV</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Paste comma- or tab-separated data, or upload a CSV. Columns: name, balance, interest rate (%), minimum payment. Optional 5th column: type (credit_card, personal_loan, other).
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Name, Balance, APR, Min Payment&#10;Card One, 5000, 18.5, 150&#10;Loan Two, 10000, 6, 300"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          sx={{ mb: 1 }}
          data-testid="import-paste-input"
        />
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Button variant="outlined" size="small" onClick={onPreview} data-testid="import-preview-btn">
            Preview
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<UploadFileIcon />}
          >
            Choose file
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
              {importResult.rows.length} debt{importResult.rows.length !== 1 ? 's' : ''} to import
              {importResult.errors.length > 0 ? ` · ${importResult.errors.length} error(s)` : ''}.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onPreview}>Preview</Button>
        <Button onClick={onConfirm} variant="contained" disabled={!importResult?.rows.length} data-testid="import-confirm-btn">
          {importResult?.rows.length ? `Import ${importResult.rows.length} debt${importResult.rows.length !== 1 ? 's' : ''}` : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
