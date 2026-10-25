# Shivam Duplex production rollout

## Stage 1 — application foundation
- Next.js App Router, TypeScript, responsive society landing page.
- PostgreSQL/Prisma connection singleton and no-cache health endpoint at `/api/health`.
- Security response headers and PWA manifest metadata.
- Existing standalone `/portal-v2.html` preview retained.

## Stage 2 — environment and persistence
1. Provision a managed PostgreSQL database with TLS and backups.
2. Add `DATABASE_URL` in Vercel project environment variables; do not commit credentials.
3. Apply and verify the schema in `database/schema.sql` against a staging database, then add versioned migrations.
4. Test `/api/health`; it reports database `not_configured` until the connection is set.

## Stage 3 — security-critical application modules
- Authentication: verified phone/email OTP or password flow, secure HttpOnly sessions, rate limits, recovery and audit trail.
- Authorization: server-side role + house membership checks on every protected request; never trust client-selected role/house IDs.
- Requests and expenses: transaction boundaries, idempotency keys, append-only audit events, two distinct expense approvers and transactional outbox.
- Payments: payment-provider account, signed webhook verification, idempotent payment reconciliation and receipt issuance. Never mark an invoice paid based only on browser redirects.
- Notifications: provider credentials, consent, delivery tracking and retry/dead-letter handling.
- SOS: verified security-desk endpoint, high-priority alert channel, acknowledgement and tested fallback procedures before activation.

## Release gates
- Typecheck, lint, build, unit/integration tests and migration checks.
- Cross-house authorization tests, concurrent idempotency tests, webhook signature tests and file-upload abuse tests.
- Browser/mobile accessibility checks and a staged end-to-end test with test provider credentials.
- Do not advertise payments, identity verification, emergency dispatch or document confidentiality as operational until end-to-end tests pass.

## Current limitation
No real database URL, OTP/payment/notification credentials, verified society roster or actual house-map coordinates were supplied. Therefore the current release is the app foundation and informational UI; those external integrations cannot safely be enabled yet.
