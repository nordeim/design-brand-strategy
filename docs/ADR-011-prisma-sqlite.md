# ADR-011: Prisma SQLite for ContactInquiry Persistence

**Status:** Accepted — supersedes ADR-002 (No database)
**Date:** 2026-09-13
**Context:** See PAD §1.3 ADR-002

## Context

ADR-002 made the portfolio intentionally DB-free: content lived in `src/data/*.ts`, and `POST /api/contact` emitted a structured log as the delivery integration point. The `package.json.sample` (car-care) and the untracked `scripts/db.ts` + `.github/workflows/verify-gate.yml` in this repo assumed a SQLite store that did not exist — `typecheck` failed on `src/lib/wcc/db-url` missing, and the workflow's `db:generate`/`db:push` steps had no schema to act on.

Option B was approved to add persistence rather than keep the log-only sink.

## Decision

- **SQLite via Prisma 6.19.3**, `file:../db/custom.db` (relative, re-anchored to absolute by the shared resolver).
- **One model:** `ContactInquiry` (mirrors `contactSchema` fields 1:1, `cuid()` id, `createdAt`, indexes on `createdAt`/`email`).
- **Shared resolver:** `src/lib/wcc/db-url.ts` (`resolveDatabaseUrl`) used by both `src/lib/db.ts` (runtime singleton) and `scripts/db.ts` (CLI wrapper) so `prisma db push` and the server land on the same file regardless of `cwd` or standalone `chdir`.
- **Scripts:** `db:push`, `db:generate`, `db:migrate`, `db:reset` via `bun scripts/db.ts` (pattern from `package.json.sample`).
- **API:** `src/app/api/contact/route.ts` now does a fail-open `db.contactInquiry.create` before the log line — a DB error is caught, logged as `contact_inquiry_db_failed`, and still returns `202`.
- **Env:** `DATABASE_URL=file:../db/custom.db` added to `.env.example` (server-only, not `NEXT_PUBLIC_`).
- **Workflow:** `.github/workflows/verify-gate.yml` now provisions `cp .env.example .env → db:generate → db:push` before `typecheck/lint/test/build/e2e`.

## Consequences

- (+) Inquiries durable and queryable (`bunx prisma studio` or `SELECT * FROM ContactInquiry`); the log remains the email/CRM hook.
- (+) CI gate is now hermetic: the runner creates its own `db/custom.db` from scratch.
- (−) Adds `prisma`, `@prisma/client`, `@types/bun`, `prisma/schema.prisma`, `db/` (gitignored PII), and a `db:generate` requirement before `typecheck`/`build`.
- (−) Editorial content (`src/data/`) stays as code — DB is not a CMS; do not migrate `PROJECTS`/`SERVICES` without a new ADR.

## Alternatives Rejected

- **Option A (keep log-only):** Rejected by approval of Option B.
- **Drizzle/other ORM:** Prisma is the proven pattern in `car-care` (`scripts/db.ts` resolver) and the sample; switching would re-prove the `DATABASE_URL` hazard.
- **Postgres:** Overkill for a single-table portfolio; SQLite is zero-ops, file-based, and matches the `db/custom.db` PII gitignore already in place.

## Verification

```
cp .env.example .env && bun run db:generate && bun run db:push  # creates db/custom.db
bun run typecheck && bun run lint && bun run test                # 52/52 (was 44)
bun run build                                                    # 20 routes
bun run e2e                                                      # 76/76 (81/81 with mobile)
curl -X POST /api/contact … && bun -e "prisma.contactInquiry.findMany()"
```

All gates green at acceptance.
