# JobRadar Frontend

This repository contains the Next.js frontend for JobRadar.

## Included

- `apps/web`
- `packages/shared`
- `packages/db`
- `packages/ats-adapters`

## Split notes

- Next.js API routes were removed from `apps/web/src/app/api`.
- Frontend now rewrites `/api/*` to `BACKEND_API_URL` (default `http://localhost:3002`) via `apps/web/next.config.js`.
- Auth and some server-rendered pages still use Prisma directly; those can be migrated to backend APIs incrementally.

## Local development

1. Install dependencies:
   - `npm install`
2. Start frontend:
   - `npm run dev:web`

Set `BACKEND_API_URL` in `.env.local` if backend runs on a different host/port.
