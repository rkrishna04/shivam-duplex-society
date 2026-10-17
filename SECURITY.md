# Security & Robustness — Shivam Duplex / KutumSetu

## Current Security Posture

### Frontend (Vercel)
- Strong security headers already in `vercel.json`:
  - Content-Security-Policy
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - Referrer-Policy
  - Permissions-Policy

### Firebase
- Client-side config is public (normal for Firebase web apps).
- **Critical**: All real security must live in **Firestore Security Rules**.

## Recommended Firestore Security Rules (Robust)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: only authenticated committee/admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.role == 'admin';
    }

    // Helper: resident can only access their own house data
    function isOwner(houseId) {
      return request.auth != null && 
             request.auth.token.houseId == houseId;
    }

    // Members / Houses
    match /members/{houseId} {
      allow read: if true; // public directory or authenticated
      allow write: if isAdmin();
    }

    // Maintenance Bills
    match /bills/{billId} {
      allow read: if isAdmin() || isOwner(resource.data.houseId);
      allow create, update, delete: if isAdmin();
    }

    // Payments / UTR submissions
    match /payments/{paymentId} {
      allow read: if isAdmin() || isOwner(resource.data.houseId);
      allow create: if request.auth != null; // residents can submit UTR
      allow update, delete: if isAdmin();
    }

    // Festival contributions & expenses
    match /festivals/{festivalId} {
      allow read: if true; // transparency
      allow write: if isAdmin();
    }

    // Notices
    match /notices/{noticeId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Vehicles (for emergency lookup)
    match /vehicles/{vehicleId} {
      allow read: if true; // needed for public vehicle search
      allow write: if isAdmin() || isOwner(resource.data.houseId);
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Authentication Recommendations

1. Use Firebase Authentication (Email/Password or Phone for residents).
2. Custom claims for role (`admin` / `resident`) and `houseId`.
3. Never rely only on client-side checks.

## CRUD Notes

- Current architecture is client-side CRUD via Firestore.
- For higher robustness later:
  - Move sensitive writes to Cloud Functions
  - Add rate limiting
  - Audit logs collection

## CI/CD Pipeline

- Already excellent: Vercel auto-deploys from `main` on every push.
- Recommended additions:
  - Protect `main` branch (require PR reviews)
  - Add simple GitHub Action for lint/CSS validation if desired
  - Preview deployments on every PR (Vercel does this automatically)

## Next Hardening Steps

1. Deploy the recommended Firestore rules above.
2. Enable Firebase App Check (optional but strong).
3. Add server-side validation via Cloud Functions for bill generation and payment confirmation.
4. Keep API keys restricted in Firebase Console (HTTP referrer restrictions).
