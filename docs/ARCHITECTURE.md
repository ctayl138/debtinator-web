# Architecture

System design, patterns, and project structure for Debtinator Web.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Business Logic](#business-logic)
- [Theming System](#theming-system)
- [Navigation Architecture](#navigation-architecture)
- [Data & Privacy](#data--privacy)

---

## Overview

Debtinator Web follows a **feature-based architecture** with clear separation of concerns. All debt and user data stays in the browser; there is no backend for core features. An optional **Cloudflare Worker** can be deployed alongside the static app to handle **Feedback** (report bug / request enhancement) by creating GitHub issues; the Worker is the only server-side component and only receives the title and description the user types.

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │  Pages  │ │Components│ │  Theme  │ │  Navigation │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   │
│       │           │           │              │           │
├───────┴───────────┴───────────┴──────────────┴──────────┤
│                   State Layer                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Zustand Stores                      │    │
│  │  ┌──────────┐ ┌───────────┐ ┌─────────────┐    │    │
│  │  │DebtStore │ │PayoffStore │ │ ThemeStore   │    │    │
│  │  └──────────┘ └───────────┘ └─────────────┘    │    │
│  │  ┌──────────┐                                    │    │
│  │  │IncomeStore│                                   │    │
│  │  └──────────┘                                    │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
├───────────────────────────┴─────────────────────────────┤
│                  Business Logic                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Utils (payoffCalculations.ts)            │    │
│  │         Utils (exportToExcel.ts)                │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
├───────────────────────────┴─────────────────────────────┤
│                  Persistence Layer                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │              localStorage (browser)               │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
debtinator-web/
├── public/                    # Static assets
│   └── favicon.svg
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── DebtForm.tsx       # Debt add/edit form (MUI Dialog)
│   │   └── ThemeProvider.tsx  # MUI theme + system preference
│   │
│   ├── pages/                  # Route-level components
│   │   ├── Layout.tsx          # App bar, drawer, bottom nav, Outlet
│   │   ├── Debts.tsx           # Debt list and summary
│   │   ├── Payoff.tsx          # Payoff method and summary
│   │   ├── Charts.tsx          # Pie and line charts (Recharts)
│   │   ├── PayoffTimeline.tsx  # Month-by-month schedule
│   │   ├── Settings.tsx        # Theme, income, export, help, feedback
│   │   └── Documentation.tsx   # In-app features guide
│   │
│   ├── store/                  # Zustand state stores
│   │   ├── storage.ts          # localStorage adapter for persist
│   │   ├── useDebtStore.ts     # Debt CRUD + persistence
│   │   ├── usePayoffFormStore.ts
│   │   ├── useThemeStore.ts
│   │   └── useIncomeStore.ts
│   │
│   ├── theme/                  # Design system
│   │   ├── tokens.ts           # ThemeMode, spacing, radius
│   │   └── muiTheme.ts         # MUI createTheme (light/dark)
│   │
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── utils/                  # Business logic & helpers
│   │   ├── payoffCalculations.ts
│   │   ├── exportToExcel.ts
│   │   └── feedbackApi.ts       # Submit feedback to /api/feedback (Worker)
│   │
│   ├── App.tsx                 # React Router routes
│   ├── main.tsx                # Entry (React root, Router, ThemeProvider)
│   └── index.css               # Global styles
│
├── worker/                     # Cloudflare Worker (optional)
│   └── index.ts                # POST /api/feedback → GitHub issue
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── TECHNOLOGY.md
│   ├── DEVELOPMENT.md
│   └── API.md
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Directory Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `src/pages/` | Route-level screens and layout |
| `src/components/` | Reusable UI (DebtForm, ThemeProvider) |
| `src/store/` | Global state and localStorage persistence |
| `src/theme/` | Theme mode type and MUI theme |
| `src/types/` | TypeScript type definitions |
| `src/utils/` | Payoff algorithm and Excel export |

---

## Application Flow

### Startup Sequence

```
1. index.html loads
         │
         ▼
2. main.tsx
    - createRoot(#root)
    - BrowserRouter
    - ThemeProvider (reads useThemeStore, applies MUI theme)
         │
         ▼
3. App.tsx
    - Routes with Layout as parent
    - Index route → Debts
         │
         ▼
4. Layout
    - AppBar, Drawer (menu), Outlet (page content), BottomNavigation
         │
         ▼
5. Debts (or Payoff) page
    - Loads persisted data from localStorage via Zustand
    - Renders UI
```

### User Flow: Adding a Debt

```
User clicks FAB (+)
       │
       ▼
DebtForm dialog opens (key="new")
       │
       ▼
User fills form fields
       │
       ▼
User clicks "Add Debt"
       │
       ▼
DebtForm calls onSubmit(debtData)
       │
       ▼
Debts page calls addDebt(debtData)
       │
       ▼
useDebtStore.addDebt():
  - Generates unique ID
  - Adds createdAt
  - Updates state
  - Persist middleware writes to localStorage
       │
       ▼
React re-renders with new debt
```

### User Flow: Export to Excel

```
User opens Settings → Export Data → Export to Excel
       │
       ▼
createExportWorkbook({ debts, monthlyIncome, payoffMethod, monthlyPayment })
       │
       ▼
downloadWorkbook(wb, filename)
  - workbookToBinary(wb) → Uint8Array
  - Blob → URL.createObjectURL
  - <a download>.click()
  - URL.revokeObjectURL
       │
       ▼
Browser downloads file; no data sent to server
```

---

## State Management

### Store Architecture

- **useDebtStore**: `debts`, `addDebt`, `updateDebt`, `deleteDebt`, `getDebtById`. Persisted to `debtinator-debt-storage`.
- **usePayoffFormStore**: `method`, `monthlyPayment`, `setMethod`, `setMonthlyPayment`. Not persisted.
- **useThemeStore**: `mode`, `setMode`. Persisted to `debtinator-theme-storage`.
- **useIncomeStore**: `monthlyIncome`, `setMonthlyIncome`. Persisted to `debtinator-income-storage`.

### Selector Hooks

- `useDebts()` – re-renders only when `debts` changes.
- `useDebtActions()` – stable reference to add/update/delete (useShallow).

### Persistence Flow

```
Store action (e.g. addDebt)
         │
         ▼
Zustand updates state
         │
         ▼
persist middleware
         │
         ▼
State serialized to JSON
         │
         ▼
localStorage.setItem(key, jsonString)
```

---

## Data Flow

- **Unidirectional**: User action → Store → UI. No server round-trip.
- **Derived state**: Payoff summary and charts use `useMemo` with `calculatePayoffSchedule(plan)`.

---

## Component Architecture

- **Layout**: App bar, menu drawer, bottom nav (Debts / Payoff), `<Outlet />` for current route.
- **Pages**: Full-page components that read stores and render content.
- **DebtForm**: Controlled form in a MUI Dialog; keyed by `editingDebt?.id ?? 'new'` so it resets when switching add vs edit.

---

## Business Logic

- **payoffCalculations.ts**: `calculatePayoffSchedule(plan)`, `getDebtSummary(debts)`. Same algorithm as debtinator-mobile (snowball/avalanche sort, monthly interest, minimums, extra to priority).
- **exportToExcel.ts**: `createExportWorkbook(data)`, `workbookToBinary(wb)`, `downloadWorkbook(wb, filename)`. Client-side only.

---

## Theming System

- **ThemeMode**: `'light' | 'dark' | 'system'` in `src/theme/tokens.ts`.
- **ThemeProvider**: Reads `useThemeStore().mode`; resolves “system” via `window.matchMedia('prefers-color-scheme: dark')`; calls `getAppTheme(effectiveMode)` and wraps app in MUI `ThemeProvider` + `CssBaseline`.

---

## Navigation Architecture

- **Routes**: Defined in `App.tsx`. Layout wraps all pages; index is Debts, then Payoff, Charts, PayoffTimeline, Settings, Documentation.
- **Bottom nav**: Links to `/` and `/payoff` (Debts and Payoff tabs).
- **Drawer**: Links to `/charts`, `/payoff-timeline`, `/settings`, `/documentation`.

---

## Data & Privacy

- **No backend for core app**: No server, no database, no user accounts. Debt and settings stay in the browser.
- **localStorage only**: Debts, theme, income stored in browser under keys prefixed with `debtinator-`.
- **Export**: Generated in browser and downloaded via Blob; no upload. Users own their data; clearing site data removes it.
- **Feedback (optional)**: When the app is deployed with the Worker, Settings → Feedback sends only the title and description the user types to `POST /api/feedback`; the Worker creates a GitHub issue. No debt data or other app state is sent.
