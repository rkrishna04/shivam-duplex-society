# Shivam Duplex Society — Role-Based Workflow Test Plan

**Status:** Test plan prepared; execution results must be recorded against a configured staging database and deployed build.  
**Rule:** A test is not PASS until its steps are executed and evidence is recorded. A successful build alone is not an end-to-end test.

## Release gates

- [ ] PostgreSQL staging database is provisioned with TLS, backups, and least-privilege credentials.
- [ ] `DATABASE_URL` is configured in Vercel for the intended environment; no secrets are committed to Git.
- [ ] Versioned migrations apply cleanly to an empty database and to a copy of the intended staging schema.
- [ ] Initial society, 203 houses, 14 committee accounts, role assignments, and area mappings are loaded from an approved roster (not guessed house ranges).
- [ ] Authentication and session security are implemented and verified.
- [ ] Authorization is enforced on the server for every protected read and write.
- [ ] Automated checks, integration tests, and browser/mobile end-to-end tests pass.
- [ ] Production smoke tests pass and rollback/backup restoration procedures are documented.

## Role and permission matrix

| Role | Expected allowed actions | Expected restrictions |
|---|---|---|
| Pramukh | Society-wide issue visibility; review escalations; final decisions where policy permits; committee oversight | Cannot bypass audit trail or view authentication secrets |
| Mantri | Society operations; issue coordination; escalation handling; notices if authorized | Cannot impersonate residents or silently rewrite issue history |
| Khanjanji | Finance records and reports within approved finance permissions | No editing authentication, resident credentials, or unrelated private complaint details |
| Upmantri | Delegated operational actions and escalation handling defined by society policy | No actions outside delegated permissions |
| Area committee member | View and handle issues assigned to their verified area; update status and add notes; escalate with reason | Must not access another area’s private house/tenant data or act as another committee member |
| House owner | View own authorized house data; create and track issues for authorized house; view notices available to owners | Must not read another house’s private data or use client-side IDs to bypass access checks |
| Tenant | View permitted notices; create and track own/authorized-house issues according to lease policy | No owner-only financial, document, or membership actions unless explicitly authorized |

The final permission matrix must be approved by the society. “Khanjanji” and other committee labels must map to explicit server-side permissions, not merely display names.

## Test case format

For every executed test, record: **Test ID, build/commit, environment, seeded role/account, steps, expected result, actual result, PASS/FAIL/BLOCKED, evidence/reference, tester, timestamp**. Never put real passwords, OTPs, session cookies, or resident-sensitive information in test evidence.

## Authentication and session tests

| ID | Test | Expected result |
|---|---|---|
| AUTH-01 | Sign in with valid active test account | Session established; user reaches permitted dashboard |
| AUTH-02 | Sign in with invalid credentials | Generic failure; no account/credential disclosure |
| AUTH-03 | Sign in as inactive account | Access denied |
| AUTH-04 | Repeated failed sign-in attempts | Rate limit / protective response enforced server-side |
| AUTH-05 | Inspect session cookie | HttpOnly, Secure in HTTPS environments, appropriate SameSite and expiry |
| AUTH-06 | Sign out, then replay old session | Old session is rejected |
| AUTH-07 | Attempt session fixation / reuse after credential reset | Session rotates or is invalidated as designed |
| AUTH-08 | Call protected API without a session | 401 response; no private data returned |

## Authorization and privacy tests (must run for every role)

| ID | Test | Expected result |
|---|---|---|
| AUTHZ-01 | Change role in browser/UI request | Server ignores client role; permissions derive from trusted session and database |
| AUTHZ-02 | Change house ID to a different household | Request denied; no data leakage |
| AUTHZ-03 | Area member requests another area’s issue | Denied unless an explicit authorized escalation policy allows it |
| AUTHZ-04 | Tenant requests owner-only finance/document action | Denied |
| AUTHZ-05 | Owner requests another owner’s profile or tickets | Denied |
| AUTHZ-06 | Committee member attempts Pramukh-only action | Denied |
| AUTHZ-07 | Unauthenticated user calls write endpoint | Denied without database mutation |
| AUTHZ-08 | Cross-society IDs are supplied | Denied; all records remain tenant/society scoped |

## Complaint workflow tests

| ID | Test | Expected result |
|---|---|---|
| TKT-01 | Authorized resident submits valid issue | Persisted once with server-derived resident/house/society context |
| TKT-02 | Submit blank, too-short, too-long, or invalid fields | Validation error; no row created |
| TKT-03 | Repeat request with same idempotency key | No duplicate complaint |
| TKT-04 | Create issue for a house with verified area mapping | Correct current area committee assignment |
| TKT-05 | Area member adds an update | Actor, timestamp, and change are recorded |
| TKT-06 | Area member escalates with reason | Escalation recorded and routed to the configured next authority |
| TKT-07 | Escalation reaches Mantri/Upmantri and then Pramukh per policy | Each transition is authorized and auditable |
| TKT-08 | Unauthorized role changes issue status | Denied; status unchanged |
| TKT-09 | Two users update the same issue concurrently | No silent lost update; conflict handled predictably |
| TKT-10 | Resolved issue is reopened under approved policy | Reopen reason and actor are recorded |
| TKT-11 | Read issue after reload / new session | Persisted state is returned from the database, not browser memory |
| TKT-12 | Issue creation fails midway | Transaction leaves no partial/invalid records |

## Notices, finance, and audit tests

| ID | Test | Expected result |
|---|---|---|
| AUX-01 | Authorized notice publisher creates notice | Persisted and visible only to its intended audience |
| AUX-02 | Resident attempts to publish a society-wide notice | Denied |
| AUX-03 | Khanjanji views finance page | Only permitted financial records returned |
| AUX-04 | Non-finance role requests restricted financial endpoint | Denied |
| AUX-05 | Expense approval policy is exercised | Required distinct approvers enforced server-side; no self-approval where prohibited |
| AUX-06 | Important issue/finance/role change occurs | Append-only audit event records actor, action, target, timestamp, and safe metadata |
| AUX-07 | Attempt to alter or delete audit history through app | Denied |
| AUX-08 | Provider/payment/notification failure is simulated | No false “success”; retry/error state is recorded safely |

## Input, abuse, and resilience tests

- [ ] SQL injection strings in all text fields do not bypass authorization or alter query structure.
- [ ] Stored/reflected XSS payloads are safely rendered as text.
- [ ] CSRF protections are tested for cookie-authenticated mutations.
- [ ] Oversized and unsupported file uploads are rejected; file access follows authorization policy.
- [ ] Rate limits and request-size limits work on expensive endpoints.
- [ ] Server errors do not expose stack traces, SQL, credentials, or personal data.
- [ ] Database outage produces a safe error; no fake success is shown.
- [ ] Backups can be restored into a clean staging database and integrity is checked.
- [ ] Mobile widths, keyboard-only navigation, focus states, labels, and error messages are tested.

## Role-by-role execution checklist

Run the full applicable test suite using separate test accounts for:
- [ ] Pramukh
- [ ] Mantri
- [ ] Khanjanji
- [ ] Upmantri
- [ ] Area committee member A
- [ ] Area committee member B
- [ ] Area committee member C
- [ ] Area committee member D
- [ ] Area committee member E
- [ ] Area committee member F
- [ ] Area committee member G
- [ ] Area committee member H
- [ ] Area committee member I
- [ ] Area committee member J
- [ ] House owner
- [ ] Tenant

There are 14 committee members in total: the four named leadership roles plus ten other committee members. The list above intentionally uses separate test cases for the ten area members, but their actual names and assigned houses must come from the approved society roster.

## Release decision

**Do not approve production** while any of the following is true:
- database/session/authentication is unconfigured or bypassable;
- role and area authorization tests fail or are unexecuted;
- house/committee assignments are guessed rather than approved;
- critical/high-severity issues remain open;
- backups, migration rollback/recovery, and production smoke tests are unverified.

## Test execution log

| Date | Commit/build | Environment | Executed by | Result | Evidence / blockers |
|---|---|---|---|---|---|
| Not run | — | — | — | NOT RUN | Database environment and approved roster required |
