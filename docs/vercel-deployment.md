# Vercel Deployment

This repository contains three independent Next.js applications. Create a separate Vercel project for each app, all linked to this repository:

| Project | Root Directory | Framework |
| --- | --- | --- |
| Public site | `apps/web` | Next.js |
| Admin panel | `apps/admin` | Next.js |
| Marketing site | `apps/landing` | Next.js |

For each project, enable **Include source files outside of the Root Directory** because the public site uses workspace packages from `packages/`. Keep the detected install, build, and output settings unless Vercel requests otherwise. The repository uses npm workspaces and the root `package-lock.json`; do not create per-app lockfiles.

Configure these variables in the matching Vercel project's Production, Preview, and Development environments as appropriate. Keep private values server-only; never use the `NEXT_PUBLIC_` prefix for secrets.

| Variable | Public site (`apps/web`) | Admin (`apps/admin`) | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Required | Required | PostgreSQL connection string |
| `DIRECT_URL` | Build/migrations as needed | Not used directly | Direct PostgreSQL connection |
| `SESSION_SECRET` | Required, at least 32 characters | Not used | Participant session signing |
| `HANDOFF_SECRET` | Required, at least 32 characters | Required, same value | Single-use web-to-admin login handoff |
| `JWT_SECRET` | Not used | Required, at least 32 characters | Admin session signing |
| `SUPER_ADMIN_EMAIL` | Required | Not used | Initial super-admin login |
| `SUPER_ADMIN_PASSWORD` | Required | Not used | Initial super-admin login; use a unique strong password |
| `NEXT_PUBLIC_ADMIN_URL` | Required | Not used | Full deployed admin origin, e.g. `https://admin.example.com` |
| `NEXT_PUBLIC_SITE_URL` | Required | Not used | Full deployed public-site origin |
| `NEXT_PUBLIC_WEB_URL` | Not used | Required | Full deployed public-site origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Not used | Required | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Not used | Required | Supabase service role key; keep server-only |

Set each URL to the corresponding production domain and add the reciprocal domains as needed for Preview deployments. The public site and admin panel must use the same `HANDOFF_SECRET`; the admin login exchange will fail closed if it is missing in production.

The NestJS API and worker under `services/` are long-running services, not Next.js applications. Deploy them to a service/container platform and point the frontends at the appropriate API origin; do not create Vercel projects for those packages unless they are first adapted to Vercel Functions.

Before promoting a deployment, run `npm run build` from the repository root and configure/verify the database schema and production data separately. Never commit `.env` files or paste secret values into this document.