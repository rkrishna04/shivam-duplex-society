# Secure workflow setup and current limitations

## Current implementation in this branch

- Database-backed opaque sessions, stored as SHA-256 token hashes, with 12-hour expiry and server-side revocation.
- Password login endpoint using Node scrypt hashes, generic invalid-credential response, and a database-backed per-identifier failure counter.
- Authenticated session introspection and logout endpoints.
- Issue creation with server-derived house membership, input limits, and idempotency key.
- Issue event history table and transactional issue creation.
- Status-update endpoint with a database row lock, a note, and an event record.
- A documented test plan in [ROLE-WORKFLOW-TEST-PLAN.md](./ROLE-WORKFLOW-TEST-PLAN.md).

This is a **backend foundation**, not a claim of production completion. The existing public dashboard is still a preview and must not be used as the security boundary.

## Required deployment configuration

1. Provision PostgreSQL with TLS, backups, and least-privilege application credentials.
2. Add `DATABASE_URL` in Vercel for Preview first. Do not commit the connection string.
3. Apply the existing baseline schema from `database/schema.sql` to a clean staging database using a controlled migration process.
4. Apply `database/migrations/20261025_secure_workflow.sql`.
5. Run Prisma generation and build, then test `/api/health`, which should report database `ok`.
6. Create test users using a secure administrative provisioning process. Password hashes are formatted as `scrypt$<salt-hex>$<derived-key-hex>`; generate one locally with `node scripts/hash-password.mjs '<password>'`. Never pass a real password in a URL, chat, or committed shell history.
7. Populate society, house, membership, and committee records from an approved roster. Do not seed guessed house assignments or fake resident identities.
8. Verify sign-in and role-based permissions in Preview before considering Production.

## API contracts

### Login
`POST /api/auth/login`
JSON body: `{"phone":"+91XXXXXXXXXX","password":"..." }`

Phone must be stored in the same normalized E.164 format. The endpoint uses `users.password_hash` and accepts only the documented scrypt format.

### Current session
`GET /api/auth/me` — returns the current user or 401.

### Logout
`POST /api/auth/logout` — revokes the server-side session and clears the cookie.

### Issues
`GET /api/issues` — returns issues for the authenticated resident or assigned committee queue.
`POST /api/issues` — body: `{"category":"Water","description":"...","idempotencyKey":"a-unique-key-123"}`; alternatively send an `Idempotency-Key` header.
`PATCH /api/issues/:id/status` — body: `{"status":"IN_PROGRESS","note":"...","escalate":false}`.

## Important open security/product work

- Enforce and review CSRF controls for cookie-authenticated mutations.
- Add explicit database-level role enums/permission policy and PostgreSQL row-level security.
- Implement the approved house-line to committee-member mapping and ticket assignment. The current data model does not safely infer real line assignment from house numbers.
- Correct role-specific permissions for all actual committee position titles and require explicit finance permissions. Never infer authorization from a display label alone.
- Implement owner/tenant lease verification and membership-selection rules for people linked to multiple houses.
- Add transactional audit events for role changes and all sensitive operations, immutable audit controls, and operational monitoring.
- Add production-grade IP-aware rate limiting and retention/cleanup for login attempt records.
- Build actual login UI and connect dashboards to these APIs; remove preview role-switcher from any resident-facing production route.
- Add automated unit/integration/browser tests, run them against staging, record evidence, and complete independent security review.

## Release gate

Do not mark production ready until the role test plan is executed, critical/high findings are resolved, the database and backups are verified, and the actual deployed routes have been exercised end-to-end.
