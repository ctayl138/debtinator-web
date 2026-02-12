# Development Guide

Complete guide for setting up, developing, and deploying Debtinator Web.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Building & Deployment](#building--deployment)
- [Code Organization](#code-organization)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or higher | JavaScript runtime |
| npm | 9.x or higher | Package manager |
| Git | 2.x or higher | Version control |

### Optional Tools

| Tool | Purpose |
|------|---------|
| [VS Code](https://code.visualstudio.com/) | Recommended IDE |
| [React Developer Tools](https://react.dev/learn/react-developer-tools) | Browser extension for debugging |

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/debtinator-web.git
cd debtinator-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Installation

```bash
# Check Node version
node --version   # Should be 18+

# Check npm
npm --version
```

### 4. IDE Configuration (Optional)

#### VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **ESLint**
- **Prettier - Code formatter**

#### VS Code Settings

Add to `.vscode/settings.json` (optional):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

This starts the Vite dev server. Open [http://localhost:5173](http://localhost:5173) in your browser.

**Features**:
- **Hot Module Replacement (HMR)** – Changes to source files update the app without a full reload
- **Fast refresh** – React component state is preserved when possible

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server |
| `build` | `tsc -b && vite build` | Type-check and production build |
| `preview` | `vite preview` | Serve production build locally |
| `test:e2e` | `playwright test` | Run E2E tests (starts dev server if needed) |
| `test:e2e:ui` | `playwright test --ui` | Run E2E tests with Playwright UI |

### E2E Testing

E2E tests use Playwright and the Page Object Model (see `e2e/pages/`, `e2e/tests/`).

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with browser UI
npm run test:e2e:ui

# Run a specific test file
npx playwright test e2e/tests/debts.spec.ts
```

**Note**: The first run may need browser install: `npx playwright install`.

### Running a Production Build Locally

```bash
npm run build
npm run preview
```

Then open the URL shown (e.g. http://localhost:4173) to test the production build.

---

## Building & Deployment

### Production Build

```bash
npm run build
```

Output is written to the `dist/` directory:

- `dist/index.html` – Entry HTML
- `dist/assets/*.js` – Bundled JavaScript
- `dist/assets/*.css` – Bundled CSS
- `public/` contents (e.g. favicon) are copied to `dist/`

### Deployment Options

Debtinator Web is a **static site**. Deploy the contents of `dist/` to any static host:

| Platform | Notes |
|----------|--------|
| **Vercel** | Connect repo; build command: `npm run build`; output: `dist` |
| **Netlify** | Same; publish directory: `dist` |
| **GitHub Pages** | Build locally or use GitHub Actions; push `dist/` or use `gh-pages` |
| **AWS S3 + CloudFront** | Upload `dist/` to S3; optionally put behind CloudFront |
| **Any static host** | Serve `dist/` as static files |

### Deploying with Feedback API (Cloudflare Worker)

To enable **Report bug / Request enhancement** from Settings (creating GitHub issues), deploy using **Wrangler** so the Worker and static assets are both published:

1. Build: `pnpm run build`
2. Deploy: `pnpm exec wrangler deploy`
3. In the Cloudflare dashboard (Workers & Pages → your worker → Settings → Variables and secrets), add:
   - **GITHUB_TOKEN** – GitHub Personal Access Token with Issues read/write for the repo
   - **GITHUB_REPO** – Repository in `owner/repo` form (e.g. `yourusername/debtinator-web`)

The Worker serves the static app and handles `POST /api/feedback` to create issues.

### Environment Variables

No environment variables are required for the core app. All data is client-side (localStorage). If you add analytics or feature flags later, use `import.meta.env` (Vite) and prefix with `VITE_` for client-exposed values.

### Base URL (Optional)

If the app is served from a subpath (e.g. `https://example.com/debtinator/`), set the base in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/debtinator/',
  // ...
});
```

And wrap the router with the same base in `main.tsx`:

```tsx
<BrowserRouter basename="/debtinator">
  ...
</BrowserRouter>
```

---

## Code Organization

### File Naming

- Components and pages: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `index.ts` (barrel exports)

### Import Order

```typescript
// 1. React
import { useState, useMemo } from 'react';

// 2. Third-party
import { Card, CardContent } from '@mui/material';

// 3. Internal (using @ alias)
import { useDebts } from '@/store/useDebtStore';
import type { Debt } from '@/types';
```

### Path Alias

- `@/` resolves to `src/` (configured in `tsconfig.json` and `vite.config.ts`).

---

## Troubleshooting

### "Cannot find module '@/...'"

- Ensure `tsconfig.json` has `"paths": { "@/*": ["src/*"] }` and `"baseUrl": "."`.
- Ensure `vite.config.ts` has the same alias in `resolve.alias`.
- Restart the dev server and/or the TypeScript server in your IDE.

### Build fails with TypeScript errors

```bash
# Type-check only
npx tsc -b
```

Fix reported errors in source files. Build runs `tsc -b` before `vite build`, so fixing `tsc` fixes the build.

### Blank page after deployment

- Confirm the host is serving `index.html` for all routes (SPA fallback). On Vercel/Netlify, this is usually automatic for a single `index.html`. For static servers, you may need to redirect all routes to `index.html`.
- Check the browser console for 404s (e.g. wrong `base` for assets).

### localStorage cleared

- Data is only in the browser. Clearing site data or using private browsing removes it. There is no server backup. Recommend exporting to Excel for backups.

### Getting Help

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [MUI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
