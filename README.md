# MovieReviews Web Standalone

This folder is a clean standalone copy of the React + Vite frontend from the main repository.

Included:

- `src/`
- `public/`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- TypeScript and ESLint config files
- `.env.example`

Not included:

- `node_modules/`
- `dist/`

## Move To A New Folder

You can move this entire folder anywhere and rename it if needed.

## Install And Run

```bash
npm install
npm run dev
```

## API Configuration

For local development, the Vite dev server proxies `/api` requests to the ASP.NET Core API.

Copy `.env.example` to `.env` if you want to override the defaults.

Default values:

```env
VITE_API_BASE_URL=https://localhost:7042/api
VITE_PROXY_TARGET=https://localhost:7042
```

## Backend Requirement

This frontend expects the MovieReviews API to be running separately.

From the main repository root:

```bash
dotnet run --project MovieReviews.Api/MovieReviews.Api.csproj
```
