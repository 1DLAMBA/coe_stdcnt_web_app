# COE Study Center Web App

## Environment files

- **Local dev:** `npm start` uses `environments/.env.development`.
- **Production build:** `npm run build:prod` uses `environments/.env.production`.

Edit the files in `environments/` to set `REACT_APP_API_BASE_URL` and `REACT_APP_PAYSTACK_PUBLIC_KEY` (use real values for production in `.env.production`).

## Deploying to Vercel

1. In Vercel: **Project → Settings → General** (or the build step when importing).
2. Set **Build Command** to: `npm run build:prod`
3. Leave **Output Directory** as `build`, **Install Command** as default.
4. Do not add `REACT_APP_*` in Vercel Environment Variables; they are read from `environments/.env.production` in the repo.
