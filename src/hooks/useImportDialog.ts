import { useState, useRef } from 'react';
import { parseCsvText, parseCsvFile, type ImportResult } from '@/utils/importDebts';

/**
 * Custom hook for managing import dialog state and operations.
 * Encapsulates CSV parsing, file handling, and dialog state to reduce component complexity.
 *
 * @returns Object with dialog state, setters, and handlers
 */
export function useImportDialog() {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Preview the import by parsing the pasted text as CSV
   */
  const handleImportPreview = () => {
    if (importText.trim()) {
      setImportResult(parseCsvText(importText));
    } else {
      setImportResult(null);
    }
  };

  /**
   * Handle file upload by reading and parsing the CSV file
   */
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await parseCsvFile(file);
      setImportResult(result);
      setImportText('');
    }
    e.target.value = '';
  };

  /**
   * Open the import dialog
   */
  const openImport = () => setImportOpen(true);

  /**
   * Close the import dialog and reset all state
   */
  const closeImport = () => {
    setImportOpen(false);
    setImportText('');
    setImportResult(null);
  };

  return {
    // State
    importOpen,
    importText,
    importResult,
    fileInputRef,
    // Setters
    setImportText,
    // Handlers
    handleImportPreview,
    handleImportFile,
    // Actions
    openImport,
    closeImport,
  };
}
