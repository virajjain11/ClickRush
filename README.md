# ClickRush

A timed click game: sign in, survive a 3 second countdown, then click as many times as you can in 60 seconds. Scores are saved to your account, shown on personal stats, and ranked on a UTC leaderboard.

## How a round works

1. Sign up, sign in, or Google. The access token is stored in `localStorage` on this device.
2. Start a classic round. The server returns a short-lived game session token; no row is written yet.
3. After the countdown, clicks (pointer, Space, or Enter) increment the local score.
4. When the timer ends, the result is shown immediately and the score is saved in the background.
5. Replay is enabled only after that save succeeds. A retry of the same session returns the already-stored game instead of creating a second one.

Daily, weekly, and monthly boards use the UTC calendar. Only your best score in that window counts; a tied score ranks higher if you finished first. Start and finish are each limited to 30 requests per user per hour.

Open the architecture diagrams on the [local client](http://localhost:5173/architecture) or in [production](http://click-rush-1-seven.vercel.app/architecture).

## Stack

- **Client:** React, Vite, React Router, TanStack Query, TanStack Form
- **Server:** Express, Zod, `jose` JWTs
- **Database:** Postgres 18 via Docker Compose

There is no root `package.json`. `client/` and `server/` are separate apps.

## Prerequisites

- Node 22 (see `client/.nvmrc` and `server/.nvmrc`)
- npm
- Docker Desktop, running

## Quick start

From the repo root:

```bash
./scripts/setup.sh
```

The script copies missing env files, generates JWT secrets if they are blank, installs both apps, starts Postgres, runs migrations, then starts the server (`http://localhost:3000`) and client (`http://localhost:5173`). Ctrl+C stops both.

If `server/.env` or `client/.env` already exist, they are left as-is.

## Manual setup

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Fill JWT_ACCESS_TOKEN_SECRET and JWT_GAME_SESSION_SECRET
# (openssl rand -hex 32 for each; they must be different)

cd server
npm install
npm run db:up
npm run db:migrate
npm run dev

# in another terminal
cd client
npm install
npm run dev
```

## Scripts

**Server** (`server/`)

| Command | What it does |
| --- | --- |
| `npm run dev` | API with `--watch` on port 3000 |
| `npm start` | API without watch |
| `npm run db:up` | Start Postgres |
| `npm run db:down` | Stop Postgres (keeps the volume) |
| `npm run db:migrate` | Apply SQL in `server/migrations/` |

**Client** (`client/`)

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite on port 5173 |
| `npm run build` | Typecheck and production build |
| `npm run lint` | ESLint |

## Environment

Copy from the `.env.example` files. The ones that matter locally:

- `DATABASE_URL` must match the `POSTGRES_*` values. Compose only applies those on first container create. Changing them later means `docker compose down -v` in `server/` (this deletes local game data).
- `JWT_ACCESS_TOKEN_SECRET` and `JWT_GAME_SESSION_SECRET` must each be at least 32 characters and must not be the same value.
- `CLIENT_ORIGIN` and `VITE_API_URL` should point at each other (`http://localhost:5173` and `http://localhost:3000` by default).
- Google sign-in is optional. Set the same OAuth 2.0 Web client ID on `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`, and add the Vite origin to Authorized JavaScript origins. Leave both empty to hide it.

Forgot-password currently only records a reset token (logged in development). There is no reset page or email send.

## Layout

```
client/     Vite app
server/     Express API, migrations, docker-compose
scripts/    repo-level helpers (local setup)
```
