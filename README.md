# 🏘 SHIVAM DUPLEX — Society Management System

A fully-featured, modern web application for managing **SHIVAM DUPLEX Society** — built with vanilla JavaScript, Firebase Firestore, and a beautiful **Glassmorphism + Spatial UI** design.

## ✨ Features

### 🏠 Society Management
- **Member Directory** — Owner & tenant profiles with full details
- **Tenant Management** — Aadhar/PAN, job details, family members, rent dates
- **Maintenance Bills** — Generate single or bulk bills (₹600/month standard)
- **Advance Payments** — Track 6-month (₹3,600) and annual (₹7,200) advance payments
- **Expenses** — Log society expenses with categories
- **Fund Management** — Track credits and debits with running balance

### 💳 Finance
- **Payment Recording** — Cash, UPI, Cheque, Bank Transfer
- **Advance Balance Tracking** — Who has paid in advance vs who is overdue
- **Reports & Exports** — 9 different Excel reports

### 🖨 Smart Printing
- **A4 Bills** — 1, 2, 3, or 4 bills per page with ✂ cut marks
- **Live Preview** — See exactly how the print will look before printing
- **Receipt Format** — Professional maintenance receipts

### 🏠 Resident Portal
- Residents enter their flat/house number to view their account
- See pending bills, payment history, advance balance
- Print their own bills

### 🌟 Community
- **Events** — Track society events with budget
- **Notice Board** — Post and view society notices

## 🎨 Design
- **Glassmorphism + Spatial UI** — Dark navy background with frosted glass panels
- Animated gradient orbs, colored glow effects, spring animations
- Fully responsive (mobile, tablet, desktop)

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES5/Compat) |
| **Database** | Firebase Firestore v9 (Compat SDK) |
| **Design** | Glassmorphism, CSS `backdrop-filter`, Spatial UI |
| **Charts** | Chart.js v4 |
| **Excel** | SheetJS (xlsx) |
| **Hosting** | Vercel (static) |

## 🚀 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** in test mode
3. Update `js/firebase-config.js` with your project credentials:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Set Firestore rules to allow read/write (for development):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📁 Project Structure

```
shivam-duplex-society/
├── index.html          # Dashboard
├── members.html        # Member management
├── maintenance.html    # Maintenance bills
├── payments.html       # Payment recording
├── expenses.html       # Expense tracking
├── funds.html          # Fund management
├── events.html         # Society events
├── notices.html        # Notice board
├── reports.html        # Reports & exports
├── resident.html       # Resident self-service portal
├── css/
│   ├── style.css       # Glassmorphism UI + layout
│   ├── tables.css      # Data tables styling
│   └── forms.css       # Form controls styling
└── js/
    ├── app.js          # All page logic (Firebase v9 Compat)
    ├── print.js        # Bill printing module
    ├── firebase-config.js  # Firebase configuration
    ├── excel-export.js     # Excel export functions
    └── utils.js            # Utility functions
```

## 💡 Running Locally

```bash
# Using Python (no install needed)
python -m http.server 8001

# Then open:
# http://localhost:8001
```

## 💰 Society Fee Structure

| Period | Amount |
|---|---|
| Monthly | ₹600 |
| 6 Months (Advance) | ₹3,600 |
| Annual (Advance) | ₹7,200 |

---

**Built for SHIVAM DUPLEX Society** 🏘
