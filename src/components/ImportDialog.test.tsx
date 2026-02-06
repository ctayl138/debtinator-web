import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportDialog from './ImportDialog';
import { createRef } from 'react';

describe('ImportDialog', () => {
  const createMockRef = () => createRef<HTMLInputElement>();

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    importText: '',
    setImportText: jest.fn(),
    importResult: null,
    onPreview: jest.fn(),
    onFileChange: jest.fn(),
    onConfirm: jest.fn(),
    fileInputRef: createMockRef(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ImportDialog {...defaultProps} />);
    expect(screen.getByText('Import debts from CSV')).toBeInTheDocument();
  });

  it('renders paste instructions', () => {
    render(<ImportDialog {...defaultProps} />);
    expect(screen.getByText(/Paste comma- or tab-separated data/)).toBeInTheDocument();
  });

  it('renders textarea for paste input', () => {
    render(<ImportDialog {...defaultProps} />);
    expect(screen.getByTestId('import-paste-input')).toBeInTheDocument();
  });

  it('renders file upload button', () => {
    render(<ImportDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
  });

  it('calls onFileChange when file input changes', async () => {
    const user = userEvent.setup();
    const mockFileChange = jest.fn();

    render(<ImportDialog {...defaultProps} onFileChange={mockFileChange} />);

    const fileInput = screen.getByTestId('import-file-input');
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });

    await user.upload(fileInput, file);

    expect(mockFileChange).toHaveBeenCalled();
  });

  it('renders preview button', () => {
    render(<ImportDialog {...defaultProps} />);
    expect(screen.getByTestId('import-preview-btn')).toBeInTheDocument();
  });

  it('calls onPreview when preview button clicked', async () => {
    const user = userEvent.setup();
    const mockPreview = jest.fn();

    render(<ImportDialog {...defaultProps} onPreview={mockPreview} />);
    await user.click(screen.getByTestId('import-preview-btn'));

    expect(mockPreview).toHaveBeenCalled();
  });

  it('displays import result with error messages', () => {
    const result = {
      rows: [],
      errors: ['Error 1', 'Error 2'],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('displays row count when import result provided', () => {
    const result = {
      rows: [
        {
          name: 'Test',
          balance: 100,
          interestRate: 5,
          minimumPayment: 10,
          type: 'other' as const,
        },
      ],
      errors: [],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    // Text is spread across multiple elements, so use within
    const dialog = screen.getByTestId('import-debts-dialog');
    expect(within(dialog).getByText(/1 debt to import/)).toBeInTheDocument();
  });

  it('displays correct row count for multiple rows', () => {
    const result = {
      rows: [
        { name: 'Test 1', balance: 100, interestRate: 5, minimumPayment: 10, type: 'other' as const },
        { name: 'Test 2', balance: 200, interestRate: 5, minimumPayment: 20, type: 'credit_card' as const },
      ],
      errors: [],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    const dialog = screen.getByTestId('import-debts-dialog');
    expect(within(dialog).getByText(/2 debts to import/)).toBeInTheDocument();
  });

  it('disables confirm button when no rows', () => {
    render(<ImportDialog {...defaultProps} />);
    expect(screen.getByTestId('import-confirm-btn')).toBeDisabled();
  });

  it('disables confirm button when result has no rows', () => {
    const result = {
      rows: [],
      errors: ['Error'],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    expect(screen.getByTestId('import-confirm-btn')).toBeDisabled();
  });

  it('enables confirm button when rows present', () => {
    const result = {
      rows: [
        {
          name: 'Test',
          balance: 100,
          interestRate: 5,
          minimumPayment: 10,
          type: 'other' as const,
        },
      ],
      errors: [],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    expect(screen.getByTestId('import-confirm-btn')).not.toBeDisabled();
  });

  it('displays correct button label for single row', () => {
    const result = {
      rows: [
        {
          name: 'Test',
          balance: 100,
          interestRate: 5,
          minimumPayment: 10,
          type: 'other' as const,
        },
      ],
      errors: [],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    expect(screen.getByText('Import 1 debt')).toBeInTheDocument();
  });

  it('displays correct button label for multiple rows', () => {
    const result = {
      rows: [
        { name: 'Test 1', balance: 100, interestRate: 5, minimumPayment: 10, type: 'other' as const },
        { name: 'Test 2', balance: 200, interestRate: 5, minimumPayment: 20, type: 'credit_card' as const },
      ],
      errors: [],
    };

    render(<ImportDialog {...defaultProps} importResult={result} />);
    expect(screen.getByText('Import 2 debts')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button clicked', async () => {
    const user = userEvent.setup();
    const mockClose = jest.fn();

    render(<ImportDialog {...defaultProps} onClose={mockClose} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Import button clicked with rows', async () => {
    const user = userEvent.setup();
    const mockConfirm = jest.fn();
    const result = {
      rows: [
        {
          name: 'Test',
          balance: 100,
          interestRate: 5,
          minimumPayment: 10,
          type: 'other' as const,
        },
      ],
      errors: [],
    };

    render(
      <ImportDialog
        {...defaultProps}
        importResult={result}
        onConfirm={mockConfirm}
      />
    );

    await user.click(screen.getByTestId('import-confirm-btn'));
    expect(mockConfirm).toHaveBeenCalled();
  });
});
