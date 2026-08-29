# MyBooks — Book Quote App

Fullstack app for tracking books and personal quotes: ASP.NET Core 9 Web API backend + Angular 20 SPA frontend.

## Live demo

- **Frontend**: https://book-quote-app-1.onrender.com
- **Backend health check**: https://book-quote-app.onrender.com — returns `{"status":"ok",...}` when the API is up. The actual API base the frontend talks to is `/api` (e.g. `/api/books`), which isn't meant to be opened directly in a browser — those routes require a JWT and 401/404 without one.

Both are on Render's free tier — the backend spins down after ~15 min of inactivity, so the first request after a while can take 30–60s to wake it up.

> Swagger UI is only enabled in `Development` (see `Program.cs`), so `/swagger` is not available on the live backend.

## Tech stack

- **Backend**: ASP.NET Core 9, Entity Framework Core + SQLite, JWT bearer auth
- **Frontend**: Angular 20 (standalone components), Bootstrap 5, Font Awesome

## Project structure

```
backend/BookQuoteApi/   ASP.NET Core 9 Web API
frontend/                Angular 20 SPA
```

## Local development

### Backend

```bash
cd backend/BookQuoteApi
dotnet run
```

Runs at `http://localhost:5000`, Swagger UI at `/swagger`. The SQLite database (`app.db`) is created automatically on first run (`Database.EnsureCreated()` in `Program.cs`) — no migrations to run.

Config lives in `appsettings.json` — the `Jwt:Key` there is a placeholder and `Cors:AllowedOrigin` defaults to `http://localhost:4200`, which matches the frontend dev server.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:4200`.

⚠️ `frontend/src/app/core/api-config.ts` currently has `API_BASE_URL` hardcoded to the **deployed** backend (`https://book-quote-app.onrender.com/api`), not `localhost`. To develop against a local backend, temporarily point it at `http://localhost:5000/api` — just don't commit that change.

## API overview

All endpoints under `/api`:

| Route | Auth | Notes |
|---|---|---|
| `POST /auth/register`, `POST /auth/login` | — | Returns a JWT |
| `GET/POST/PUT/DELETE /quotes` | JWT required | Scoped to the calling user (personal quotes) |
| `GET/POST/PUT/DELETE /books` | JWT required | Shared across all users, not scoped per-user |

## Deployment (Render.com)

- **Backend** — Docker Web Service, built from `backend/BookQuoteApi/Dockerfile`. Free tier disk is ephemeral: the SQLite file resets on every redeploy, restart, and spin-down after inactivity. Fine for a demo; for real persistence, move to a managed Postgres instead.
- **Frontend** — Static Site, Root Directory `frontend`, Build Command `npm install && npm run build`, Publish Directory `dist/frontend/browser`, with a Rewrite Rule (`/*` → `/index.html`) so client-side routes like `/books/new` don't 404 on refresh.

Backend environment variables (Render dashboard, not committed to the repo):

| Key | Value |
|---|---|
| `Jwt__Key` | Long random secret — **not** the placeholder in `appsettings.json` |
| `Jwt__Issuer`, `Jwt__Audience` | Match what the token was issued with |
| `Cors__AllowedOrigin` | Deployed frontend URL, no trailing slash |

`ConnectionStrings__Default` is set directly in the Dockerfile (points at `/app/data/app.db`) since it's not environment-specific.

## Known limitations

- SQLite on Render's free tier is ephemeral — don't rely on data surviving a redeploy or a period of inactivity.
- Books are global/shared; Quotes are personal (scoped to the JWT's user id).
