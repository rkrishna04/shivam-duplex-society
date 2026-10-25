# Shivam Duplex portal preview

## Added
- `portal-v2.html`: responsive standalone portal experience with two-tier committee cards, member details and duty-line issue form, role-context switcher, default 2D site map, optional on-demand Three.js scene, PWA install CTA, billing/expense/tenant/gate/document previews, masked parking-alert concept, and three-second SOS interaction.
- `database/schema.sql`: PostgreSQL baseline schema and indexes for societies, users, houses, memberships, committee terms, leases, documents, maintenance billing, dual expense approvals, helpdesk, vehicles, staff attendance, SOS alerts, and audit events.

## Preview
After deployment, open `/portal-v2.html`. The existing `index.html` is intentionally preserved.

## Not production-connected yet
This is a frontend demonstration and schema baseline, not a completed production backend. Demo interactions do not authenticate residents, charge payments, persist tickets, send SMS/push/IVR, notify gate security, or store documents. All resident names, contact details, invoices and unit examples are fictitious.

Before live use, implement and test an authenticated API, server-side RBAC/ABAC and house-level authorization, OTP provider, payment provider with verified webhooks, private object storage, notification outbox, durable idempotency records, tamper-evident audit, abuse limits, backups and monitoring. The SOS workflow must be tested with the actual security desk and a documented fallback before activation.
