# SBS — Shershah, Bolton & Saddar

Marketplace website: public storefront (English/Urdu), separate admin page at `/admin`,
orders dashboard, product uploads with photos.

## Deploy: GitHub -> Bonto
1. Upload every file in this folder to a **private** GitHub repository (keep it private).
2. In Bonto, import the repository. Bonto installs the packages and runs `npm start`.
3. Open `https://YOUR-APP.bonto.run/admin` and log in (first-run login is in the note you were given).
4. **Go to Admin > Account and change the username/password straight away.**

## Environment variables (Bonto > Settings)
- `SESSION_SECRET` — any long random text (recommended)
- `NODE_ENV` — `production`
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — from a free turso.tech database, so products and
  orders survive restarts. Without them the site uses a local file inside Bonto.

## Forgot the admin password?
Add `ADMIN_USERNAME` and `ADMIN_PASSWORD` as environment variables, restart the app,
log in with them, then delete those two variables.

## Payments
Checkout is cash on delivery / bank transfer with a confirmation call. JazzCash / Easypaisa
online payment needs a merchant account first.
