# UNZA DigiHealth

A production-grade multi-role healthcare mobile app for the University of Zambia campus clinic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/digihealth run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native), Expo Router v6
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) — generates React Query hooks
- Build: esbuild (CJS bundle)
- Auth: JWT (bcryptjs + jsonwebtoken), SESSION_SECRET env var

## Where things live

- `lib/db/src/schema/` — all DB schema files (users, consultations, queue, prescriptions, lab, notifications, mental-health, hiv-support, audit-logs)
- `lib/db/src/schema/index.ts` — exports all schema tables
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks and Zod schemas
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/routes/index.ts` — all routers registered
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware
- `artifacts/digihealth/app/` — all Expo screens organized by role group
- `artifacts/digihealth/contexts/AuthContext.tsx` — JWT auth state
- `artifacts/digihealth/hooks/useColors.ts` — design token hook (primary: #0f766e teal)

## Architecture decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec` generates all client hooks — never write fetch calls manually.
- **Role-based routing**: `app/index.tsx` redirects each authenticated user to their role-specific tab group `(student)`, `(doctor)`, `(pharmacist)`, `(lab)`, `(mental-health)`, `(hiv-support)`, `(admin)`.
- **JWT auth**: tokens stored in SecureStore, validated on every API request via the `requireAuth` middleware.
- **Audit logging**: all write operations automatically write to the `audit_logs` table via the `auditLog` helper.
- **Relative imports for screens**: screens at `app/(role)/screen.tsx` must use `../../contexts/AuthContext` (2 levels up), NOT 3.

## Product

7 user roles with full workflows:
- **Student**: consultations, prescriptions, lab results, Mental Buddy AI chat, HIV/AIDS resources, queue status, notifications
- **Doctor**: patient queue management, consultation responses, prescriptions, lab requests
- **Pharmacist**: pending prescriptions, dispense workflow, history
- **Lab Technician**: lab request management, upload results
- **Mental Health Counselor**: session management, encrypted chat
- **HIV/AIDS Professional**: support sessions, educational resource management
- **Admin**: analytics dashboard, user management, audit logs

## Test Accounts (password: `password123`)

| Role | Email |
|------|-------|
| Student | student@unza.zm |
| Doctor | doctor@unza.zm |
| Pharmacist | pharmacist@unza.zm |
| Lab Technician | lab@unza.zm |
| Mental Health Counselor | counselor@unza.zm |
| HIV Professional | hiv@unza.zm |
| Admin | admin@unza.zm |

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Screens at `app/(role)/screen.tsx` must use `../../contexts/AuthContext` (not `../../../`) — the parenthetical group directories are real filesystem directories.
- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` instead.
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes before editing screens.
- `lib/api-zod/src/index.ts` uses `export type *` to avoid TS2308 duplicate conflicts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
