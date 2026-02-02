# Technology Stack

Detailed breakdown of all technologies, libraries, and tools used in Debtinator Web.

## Table of Contents

- [Core Framework](#core-framework)
- [Routing](#routing)
- [State Management](#state-management)
- [Data Persistence](#data-persistence)
- [UI Components](#ui-components)
- [Data Visualization](#data-visualization)
- [Development Tools](#development-tools)
- [Build & Deployment](#build--deployment)

---

## Core Framework

### React

**Version**: 18.3.x

React is the UI library powering the application:

- Functional components with hooks
- Declarative UI and component composition
- Large ecosystem and community

### Vite

**Version**: 6.x

Vite is the build tool and dev server:

| Feature | Description |
|---------|-------------|
| Dev server | Fast HMR (Hot Module Replacement) |
| Build | Rollup-based production builds |
| Config | `vite.config.ts` with path alias `@/` → `src/` |

**Configuration** (`vite.config.ts`):

```typescript
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### TypeScript

**Version**: 5.6.x

TypeScript adds static typing:

- Compile-time error detection
- IntelliSense and autocomplete
- Self-documenting code
- Safer refactoring

**Configuration** (`tsconfig.json`):

- `strict: true`, path alias `@/*` → `src/*`
- Target ES2020, module ESNext

---

## Routing

### React Router

**Version**: 7.x

React Router provides client-side routing:

- Declarative routes in `App.tsx`
- Nested layouts (e.g. `Layout` with `Outlet`)
- `Link` and `useNavigate` for navigation

**Route Structure**:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Debts | Debt list (default tab) |
| `/payoff` | Payoff | Payoff plan |
| `/charts` | Charts | Data visualization |
| `/payoff-timeline` | PayoffTimeline | Month-by-month schedule |
| `/settings` | Settings | Theme, income, export |
| `/documentation` | Documentation | Features guide |

**Navigation Patterns**:

```typescript
import { Link, useNavigate } from 'react-router-dom';

// Declarative link
<Link to="/charts">Charts</Link>

// Programmatic
const navigate = useNavigate();
navigate('/settings');
```

---

## State Management

### Zustand

**Version**: 5.x

Zustand is used for global state:

| Feature | Benefit |
|---------|---------|
| Small bundle | Minimal impact on app size |
| Simple API | No reducers/actions boilerplate |
| TypeScript | Full type inference |
| Middleware | Persist to localStorage |

**Stores**:

| Store | Purpose | Persisted |
|-------|---------|-----------|
| `useDebtStore` | Debt CRUD | Yes (localStorage) |
| `usePayoffFormStore` | Payoff method & monthly payment | No |
| `useThemeStore` | Theme mode (light/dark/system) | Yes (localStorage) |
| `useIncomeStore` | Monthly income | Yes (localStorage) |

**Selector Hooks** (for optimized re-renders):

```typescript
const debts = useDebts();           // re-renders when debts change
const { addDebt, updateDebt } = useDebtActions();  // stable reference
```

---

## Data Persistence

### localStorage

All persisted state uses the browser’s **localStorage** via a small adapter used with Zustand’s `persist` middleware.

**Why localStorage?**

- No backend required; data stays on the user’s device
- Synchronous API; no async plumbing in the adapter
- Same key/value shape as needed for Zustand `createJSONStorage`

**Storage Keys** (prefix `debtinator-` to avoid collisions):

- `debtinator-debt-storage` – debts array and store state
- `debtinator-theme-storage` – theme mode
- `debtinator-income-storage` – monthly income

**Adapter** (`src/store/storage.ts`):

```typescript
export const localStorageAdapter: StateStorage = {
  getItem: (name) => window.localStorage.getItem(name),
  setItem: (name, value) => window.localStorage.setItem(name, value),
  removeItem: (name) => window.localStorage.removeItem(name),
};
```

No user data is sent to any server.

---

## UI Components

### Material UI (MUI)

**Version**: 6.x

Material UI provides the component library:

| Component | Usage |
|-----------|--------|
| `Button`, `TextField` | Forms and actions |
| `Card`, `CardContent` | Debt cards, sections |
| `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` | Add/Edit debt, delete confirm |
| `BottomNavigation`, `BottomNavigationAction` | Tab bar (Debts, Payoff) |
| `Drawer`, `List`, `ListItemButton` | Menu (Charts, Timeline, Settings, Documentation) |
| `AppBar`, `Toolbar` | Top bar and menu button |
| `Accordion`, `AccordionSummary`, `AccordionDetails` | Settings sections |
| `ToggleButtonGroup`, `ToggleButton` | Payoff method, chart type |
| `Fab` | Add-debt button |

**Theming** (`src/theme/muiTheme.ts`):

- Light and dark palettes (primary, secondary, background, error)
- `getAppTheme(mode)` returns an MUI theme for `'light' | 'dark'`
- `ThemeProvider` wraps the app and reads `useThemeStore`; “system” resolves via `prefers-color-scheme`

**Icons**: `@mui/icons-material` (e.g. List, TrendingUp, BarChart, Settings).

---

## Data Visualization

### Recharts

**Version**: 2.x

Recharts powers the Charts page:

| Chart | Purpose |
|-------|---------|
| `PieChart` + `Pie` + `Cell` | Principal vs. interest breakdown |
| `LineChart` + `Line` + `XAxis` + `YAxis` | Balance over time |

- Responsive containers via `ResponsiveContainer`
- Theming uses MUI `theme.palette.primary.main` and `secondary.main`
- Tooltips format currency via helper
- Y-axis labels abbreviated ($44.2k, $1.1M) in `formatYAxisLabel`

---

## Export

### xlsx (SheetJS)

**Version**: 0.18.x

Used to generate Excel files in the browser:

- `createExportWorkbook(data)` – builds a workbook with Summary, Debts, Income & Plan, Payoff Schedule sheets
- `workbookToBinary(wb)` – returns `Uint8Array` for the workbook
- `downloadWorkbook(wb, filename)` – creates a Blob, triggers `<a download>`; no server upload

Export is fully client-side; data never leaves the user’s device unless they save or share the file.

---

## Development Tools

- **Node.js** 18+ – runtime for install and build
- **npm** – package manager
- **TypeScript** – type checking (no emit for app code; `tsc -b` used for build)
- **Path alias** – `@/` → `src/` in `tsconfig.json` and `vite.config.ts`

---

## Build & Deployment

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server (default http://localhost:5173) |
| `build` | `tsc -b && vite build` | Type-check and production build |
| `preview` | `vite preview` | Serve production build locally |

### Output

- **Build output**: `dist/` (static assets: HTML, JS, CSS)
- **Deployment**: Any static host (Vercel, Netlify, GitHub Pages, S3, etc.). No server-side rendering or API required.
- **Environment**: No env vars required for core app; all data is client-side.

---

## Dependency Summary

### Production

| Package | Purpose |
|---------|---------|
| react, react-dom | UI |
| react-router-dom | Routing |
| zustand | State + persist |
| @mui/material, @emotion/react, @emotion/styled | UI and theming |
| @mui/icons-material | Icons |
| recharts | Charts |
| xlsx | Excel export |

### Development

| Package | Purpose |
|---------|---------|
| typescript | Type checking |
| vite | Build and dev server |
| @vitejs/plugin-react | React fast refresh |
| @types/react, @types/react-dom | Type definitions |
