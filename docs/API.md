# API Reference

Complete reference for TypeScript types, Zustand stores, and utility functions in Debtinator Web.

## Table of Contents

- [Type Definitions](#type-definitions)
- [Zustand Stores](#zustand-stores)
- [Utility Functions](#utility-functions)
- [Theme API](#theme-api)
- [Component Props](#component-props)
- [Storage](#storage)

---

## Type Definitions

All types are exported from `src/types/index.ts`.

### Debt Types

#### `DebtType`

```typescript
type DebtType = 'credit_card' | 'personal_loan' | 'other';
```

| Value | Description |
|-------|-------------|
| `'credit_card'` | Credit cards and revolving credit |
| `'personal_loan'` | Fixed-term installment loans |
| `'other'` | Any other debt type |

#### `Debt`

```typescript
interface Debt {
  id: string;
  name: string;
  type: DebtType;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: string;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier (generated) |
| `name` | `string` | User-defined name |
| `type` | `DebtType` | Category of debt |
| `balance` | `number` | Current balance in dollars |
| `interestRate` | `number` | Annual percentage rate (APR) |
| `minimumPayment` | `number` | Required monthly minimum |
| `createdAt` | `string` | ISO 8601 timestamp |

### Payoff Types

#### `PayoffMethod`

```typescript
type PayoffMethod = 'snowball' | 'avalanche' | 'custom';
```

#### `PayoffPlan`

```typescript
interface PayoffPlan {
  method: PayoffMethod;
  monthlyPayment: number;
  debts: Debt[];
  customOrder?: string[];
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `method` | `PayoffMethod` | Yes | Selected strategy |
| `monthlyPayment` | `number` | Yes | Total monthly budget |
| `debts` | `Debt[]` | Yes | Debts to include |
| `customOrder` | `string[]` | No | Debt IDs in priority order |

#### `PayoffStep`

```typescript
interface PayoffStep {
  debtId: string;
  debtName: string;
  month: number;
  payment: number;
  remainingBalance: number;
  interestPaid: number;
}
```

#### `PayoffSchedule`

```typescript
interface PayoffSchedule {
  steps: PayoffStep[][];
  totalMonths: number;
  totalInterest: number;
  totalPayments: number;
}
```

---

## Zustand Stores

### useDebtStore

Located in `src/store/useDebtStore.ts`. Persisted to localStorage under `debtinator-debt-storage`.

#### State

```typescript
interface DebtState {
  debts: Debt[];
  isLoading: boolean;
}
```

#### Actions

```typescript
interface DebtActions {
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  getDebtById: (id: string) => Debt | undefined;
}
```

#### Selector Hooks

```typescript
const debts = useDebts();
const { addDebt, updateDebt, deleteDebt } = useDebtActions();
```

#### Migration

```typescript
export function migrateDebts(debts: unknown[]): Debt[];
```

Ensures persisted debts have a valid `type` (defaults to `'other'`). Used by the persist middleware.

---

### usePayoffFormStore

Located in `src/store/usePayoffFormStore.ts`. **Not persisted** (in-memory only).

#### State & Actions

```typescript
interface PayoffFormState {
  method: PayoffMethod;
  monthlyPayment: string;
  setMethod: (method: PayoffMethod) => void;
  setMonthlyPayment: (value: string) => void;
}
```

---

### useThemeStore

Located in `src/store/useThemeStore.ts`. Persisted to localStorage under `debtinator-theme-storage`.

#### State & Actions

```typescript
interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

type ThemeMode = 'light' | 'dark' | 'system';
```

---

### useIncomeStore

Located in `src/store/useIncomeStore.ts`. Persisted to localStorage under `debtinator-income-storage`.

#### State & Actions

```typescript
interface IncomeState {
  monthlyIncome: number;
  setMonthlyIncome: (amount: number) => void;
}
```

---

## Utility Functions

### payoffCalculations.ts

Located in `src/utils/payoffCalculations.ts`.

#### `calculatePayoffSchedule`

```typescript
function calculatePayoffSchedule(plan: PayoffPlan): PayoffSchedule
```

Calculates a complete debt payoff schedule.

**Algorithm**:
1. Sort debts by method (snowball = smallest balance first, avalanche = highest interest first, custom = customOrder).
2. For each month until all debts paid: accrue interest, pay minimums on all, apply remaining budget to priority debt.
3. Return schedule with steps and totals.

**Example**:

```typescript
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';

const schedule = calculatePayoffSchedule({
  method: 'snowball',
  monthlyPayment: 500,
  debts: [/* ... */],
});
console.log(schedule.totalMonths, schedule.totalInterest);
```

#### `getDebtSummary`

```typescript
function getDebtSummary(debts: Debt[]): {
  totalBalance: number;
  totalMinimumPayments: number;
  weightedInterestRate: number;
  count: number;
}
```

---

### exportToExcel.ts

Located in `src/utils/exportToExcel.ts`.

#### `ExportData`

```typescript
interface ExportData {
  debts: Debt[];
  monthlyIncome: number;
  payoffMethod: PayoffMethod;
  monthlyPayment: number;
  customOrder?: string[];
}
```

#### `createExportWorkbook`

```typescript
function createExportWorkbook(data: ExportData): XLSX.WorkBook
```

Builds an Excel workbook with sheets: Summary, Debts, Income & Plan, Payoff Schedule (when plan is valid).

#### `workbookToBinary`

```typescript
function workbookToBinary(wb: XLSX.WorkBook): Uint8Array
```

#### `downloadWorkbook`

```typescript
function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void
```

Creates a Blob, triggers a browser download via `<a download>`. No data is sent to a server.

**Example**:

```typescript
import { createExportWorkbook, downloadWorkbook } from '@/utils/exportToExcel';

const wb = createExportWorkbook({ debts, monthlyIncome, payoffMethod, monthlyPayment });
downloadWorkbook(wb, `debtinator-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
```

---

## Theme API

### Design Tokens

Located in `src/theme/tokens.ts`.

#### ThemeMode

```typescript
type ThemeMode = 'light' | 'dark' | 'system';
```

#### Spacing & Radius

```typescript
const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
const radius = { sm: 4, md: 8, lg: 12, full: 9999 } as const;
```

### MUI Theme

Located in `src/theme/muiTheme.ts`.

#### `getAppTheme`

```typescript
function getAppTheme(mode: 'light' | 'dark'): Theme
```

Returns an MUI theme (createTheme) for the given palette mode. Light uses primary `#4E7BA5`, dark uses primary `#d0bcff`, etc.

---

## Component Props

### DebtForm

Located in `src/components/DebtForm.tsx`.

```typescript
interface DebtFormProps {
  open: boolean;
  debt?: Debt;
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Whether the dialog is open |
| `debt` | `Debt` | No | Existing debt for editing |
| `onSubmit` | `function` | Yes | Called with form data on submit |
| `onCancel` | `function` | Yes | Called when cancel or dialog close |
| `onDelete` | `function` | No | Called when delete pressed (edit mode) |

**Usage** (typically with a key so form resets when switching add vs edit):

```tsx
<DebtForm
  key={editingDebt?.id ?? 'new'}
  open={showForm}
  debt={editingDebt}
  onSubmit={handleSave}
  onCancel={() => setShowForm(false)}
  onDelete={editingDebt ? handleDelete : undefined}
/>
```

### ThemeProvider

Located in `src/components/ThemeProvider.tsx`.

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
}
```

Wraps the app with MUI `ThemeProvider` and `CssBaseline`. Reads `useThemeStore().mode`, resolves “system” via `prefers-color-scheme`, and applies the corresponding MUI theme.

---

## Storage

### localStorageAdapter

Located in `src/store/storage.ts`.

```typescript
import type { StateStorage } from 'zustand/middleware';

export const localStorageAdapter: StateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};
```

Used with Zustand’s `persist` and `createJSONStorage`. All data stays in the browser; no server calls.

### Persistence Keys

| Key | Store |
|-----|--------|
| `debtinator-debt-storage` | useDebtStore |
| `debtinator-theme-storage` | useThemeStore |
| `debtinator-income-storage` | useIncomeStore |
