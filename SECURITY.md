# Security & Robustness — Shivam Duplex / KutumSetu

## Current Security Posture

### Frontend (Vercel)
Strong security headers already in `vercel.json`:
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy

### Firebase
Client-side config is public (normal for Firebase web apps).
**Critical**: All real security must live in **Firestore Security Rules**.

## Recommended Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.role == 'admin';
    }

    function isOwner(houseId) {
      return request.auth != null && request.auth.token.houseId == houseId;
    }

    match /members/{houseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /bills/{billId} {
      allow read: if isAdmin() || isOwner(resource.data.houseId);
      allow create, update, delete: if isAdmin();
    }

    match /payments/{paymentId} {
      allow read: if isAdmin() || isOwner(resource.data.houseId);
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }

    match /festivals/{festivalId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /notices/{noticeId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /vehicles/{vehicleId} {
      allow read: if true;
      allow write: if isAdmin() || isOwner(resource.data.houseId);
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Authentication Recommendations
1. Use Firebase Authentication (Email/Password or Phone).
2. Custom claims for role (`admin` / `resident`) and `houseId`.
3. Never rely only on client-side checks.

## CRUD Notes
Current architecture is client-side CRUD via Firestore.
For higher robustness later: move sensitive writes to Cloud Functions + audit logs.

## CI/CD
Vercel auto-deploys from `main`. Protect main branch and use PR previews.
