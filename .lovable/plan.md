
# Migrate to Vite + React + React Router + Tailwind

Move the project off TanStack Start (SSR, file-based routing, server functions) onto a standard client-only Vite + React SPA with React Router. Since auth is mock (localStorage) and there's no real backend in use, nothing server-side is lost.

## What changes

### 1. Tooling / config
- Remove TanStack Start deps: `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/router-devtools`, related vite plugins.
- Add: `react-router-dom`.
- Rewrite `vite.config.ts` to a plain React SPA config (`@vitejs/plugin-react` + `@tailwindcss/vite`). Drop SSR/start plugins.
- Update `package.json` scripts to standard `vite` / `vite build` / `vite preview`.
- Delete `src/start.ts`, `src/router.tsx`, `src/routeTree.gen.ts`, `src/integrations/` (TanStack-specific bits), any `*.server.ts` / `*.functions.ts`, `src/routes/api/`.

### 2. Entry point
- New `index.html` at project root with `<div id="root">` and `<script type="module" src="/src/main.tsx">`.
- New `src/main.tsx` mounting `<BrowserRouter><App /></BrowserRouter>` with providers (AuthProvider, Toaster, QueryClient if kept).
- New `src/App.tsx` holding `<Routes>` definitions.

### 3. Routes (convert each file)
Each current TanStack route becomes a plain React component + a `<Route>` entry:

```text
/                     → src/pages/Index.tsx          (from routes/index.tsx)
/login                → src/pages/Login.tsx
/signup               → src/pages/Signup.tsx
/search               → src/pages/Search.tsx
/worker/:id           → src/pages/Worker.tsx         (was worker.$id.tsx)
/dashboard            → src/pages/Dashboard.tsx     (wrapped in <RequireAuth>)
/admin                → src/pages/Admin.tsx         (wrapped in <RequireAuth role="admin">)
*                     → src/pages/NotFound.tsx
```

### 4. API swaps inside components
- `createFileRoute(...)` / `Route.useParams()` → remove; use `useParams()` from `react-router-dom`.
- `Link from @tanstack/react-router` → `Link from react-router-dom` (`to` prop stays).
- `useNavigate` → from `react-router-dom` (call signature `navigate('/path')` — already compatible).
- `Navigate`, `Outlet` → from `react-router-dom`.
- Route `head()` metadata → use `react-helmet-async` or set `document.title` in a small `useEffect` per page (simple approach, no extra dep).
- Remove `ssr: false` flags (no SSR anymore).

### 5. Files kept unchanged
- `src/components/*` (Navbar, WorkerCard, MLScoreRing, ui/*)
- `src/lib/auth.tsx`, `src/lib/mock-data.ts`, `src/lib/use-location.ts`, `src/lib/utils.ts`
- `src/styles.css` (Tailwind v4 `@import "tailwindcss"` + theme tokens — already SPA-compatible)
- `src/hooks/*`

Navbar's `Link` import will be switched to `react-router-dom`.

### 6. Tailwind
Tailwind v4 setup (`@import "tailwindcss"` in `src/styles.css` + `@tailwindcss/vite` plugin) works identically in a plain Vite app — no changes to tokens, theme, or component classes.

## Result

- Same UI, same pages, same mock auth, same geolocation.
- Faster cold start, simpler mental model, standard React SPA.
- No Cloudflare Worker / SSR constraints.
- Trade-off: loses SSR/SEO meta-per-route unless we add `react-helmet-async` (I'll include it so titles still update per page).

Approve and I'll execute the migration in one pass.
