# Debtinator Web

A **client-side only** web app for managing personal debt and payoff plans. Built with **React + Vite**. No backend—all data stays in your browser (localStorage). You don’t own or store user data; users own their data on their device.

## Quick Links

| Documentation | Description |
|---------------|-------------|
| [Features](docs/FEATURES.md) | Complete feature guide with usage instructions |
| [Technology Stack](docs/TECHNOLOGY.md) | Detailed breakdown of all technologies used |
| [Architecture](docs/ARCHITECTURE.md) | System design, patterns, and project structure |
| [Development Guide](docs/DEVELOPMENT.md) | Setup, building, and deployment |
| [API Reference](docs/API.md) | TypeScript types, stores, and utility functions |

## Stack

| Category        | Technology                          |
|----------------|--------------------------------------|
| Build / runtime| **Vite** + **React 18**              |
| Language       | TypeScript                           |
| Routing        | React Router v7                     |
| UI             | Material UI (MUI)                    |
| State          | Zustand (with localStorage persist) |
| Charts         | Recharts                             |
| Export         | xlsx (browser download)              |

## Data & privacy

- **No backend.** No server, no database, no user accounts.
- **All data is stored in the browser** via `localStorage` (debts, theme, optional income).
- **Export to Excel** is a direct download from the browser; nothing is sent to a server.
- Sensitive data never leaves the user’s device unless they export it themselves.

## Prerequisites

- Node.js 24+

## Quick start

```bash
cd debtinator-web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command            | Description                    |
|--------------------|--------------------------------|
| `npm run dev`      | Start dev server               |
| `npm run build`    | Production build               |
| `npm run preview`  | Preview production build       |
| `npm run test:e2e` | Run Playwright E2E tests       |
| `npm run test:e2e:ui` | Run Playwright E2E tests with UI |

## Deployment (Cloudflare Pages)

This app is a static SPA built with Vite. Recommended free hosting: **Cloudflare Pages**.

**Build settings:**
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Node version: `24`

**SPA routing:** A redirect rule is included at `public/_redirects` to route all paths to `index.html`.

## Features

- **Debts** — Add/edit/delete debts (name, type, balance, APR, minimum payment).
- **Payoff** — Snowball or Avalanche method; enter monthly payment; see payoff summary.
- **Charts** — Principal vs interest (pie), balance over time (line).
- **Timeline** — Month-by-month payoff schedule.
- **Settings** — Light/dark/system theme, optional monthly income, export to Excel, features guide.

## Project structure

```
debtinator-web/
├── docs/             # Documentation
│   ├── FEATURES.md
│   ├── TECHNOLOGY.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── API.md
├── public/           # Static assets (favicon)
├── src/
│   ├── components/   # ThemeProvider, DebtForm
│   ├── pages/        # Debts, Payoff, Charts, PayoffTimeline, Settings, Documentation
│   ├── store/        # Zustand stores (debts, payoff form, theme, income) + localStorage adapter
│   ├── theme/        # MUI theme, tokens
│   ├── types/        # TypeScript types
│   ├── utils/        # payoffCalculations, exportToExcel
│   ├── App.tsx       # Router routes
│   └── main.tsx      # Entry
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

MIT.
