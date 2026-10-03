# Switched-off backend code (not deleted)

While IEEE IGNITE '26 registrations run on the SKIT ERP and official Google Forms, the website
is frontend only: it needs no database, Supabase, login or secrets to build and deploy.

Everything that needed those lives here, at the same path it had under `apps/web/`, and is
excluded from the build (`tsconfig.json` "exclude", `eslint.config.mjs` ignores):

| Here | What it did |
| --- | --- |
| `app/actions/*` | Server actions: login/logout, sessions, registration, teams, submissions, jury, dashboard (Prisma + Supabase Postgres via `@project-organizer/sdk`) |
| `app/login`, `app/reset-password` | Single login page and password reset |
| `app/dashboard` | Participant dashboard with QR tickets |
| `app/teams`, `app/teams/[id]` | Team HQ and project submission workspace |
| `app/jury` | Judging panel |
| `app/components/LoginForm.tsx`, `RegistrationModal.tsx` | Login form and on-site registration / join-a-team form |
| `app/components/Header.tsx` | Full header with login, logout, forgot password and account links |
| `app/events/[id]/page.tsx`, `layout.tsx` | Event page that read the database (registration, QR ticket) |
| `lib/session.ts`, `lib/registration.ts`, `lib/admin-handoff.ts` | Session cookies, registration rules, admin hand-off |

## Switching accounts back on

1. Move each file back to the same path under `apps/web/` (the `Header.tsx` and `events/[id]`
   files replace the frontend-only versions there).
2. Remove `"_backend"` from `tsconfig.json` "exclude" and `"_backend/**"` from `eslint.config.mjs`.
3. Remove the temporary redirects for `/login`, `/dashboard`, `/teams`, `/jury` and `/reset-password`
   in `next.config.ts`.
4. In `app/page.tsx` and `app/components/IgniteHero.tsx`, restore the commented-out login /
   "My Pass & QR" buttons.
5. Point `app/events/page.tsx` and `app/hackathons/page.tsx` back at `getPublicEvents()` (the
   calls are left commented out there) instead of `lib/events.ts`.
6. In `apps/web/package.json`, move `@project-organizer/sdk` and `@project-organizer/ui` from
   `disabledDependencies` back into `dependencies`, then run `npm install` at the repo root.
7. Set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET` and `HANDOFF_SECRET` in the deploy environment.

## Deploying the frontend-only site

From the repo root: `npm run build:web` (builds only `apps/web`; no database or secrets needed).
Optional: set `NEXT_PUBLIC_SITE_URL` to the live URL so share previews use the right domain.
