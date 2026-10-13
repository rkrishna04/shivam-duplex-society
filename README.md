# 🔱 SHIVAM DUPLEX RESIDENTS ASSOCIATION
### Next-Generation Society Operating System & Resident Portal
**Live Production URL:** [https://shivam-duplex-society.vercel.app](https://shivam-duplex-society.vercel.app)  
**GitHub Repository:** [https://github.com/rkrishna04/shivam-duplex-society](https://github.com/rkrishna04/shivam-duplex-society)

---

## 🌟 Overview

**SHIVAM DUPLEX RESIDENTS ASSOCIATION** is a full-featured, production-ready society operating system designed specifically for a gated community of **40 luxury duplex residences**. It combines an eye-friendly **Liquid Glass & Spatial UI** aesthetic with deep, practical society governance features: automated maintenance billing, multi-slip A4 paper printing, 20-house committee mentorship, emergency vehicle parking lookup, door-to-door festival ledgers (e.g. Ganesh Utsav), and tenant KYC management.

---

## 🎨 Design System: Liquid Glass & Spatial UI Kit

Inspired by natural organic aesthetics and modern spatial interfaces, the system uses an eye-friendly palette crafted to eliminate eye strain across long sessions:

| Token | Hex Code | RGB | Role |
|---|---|---|---|
| **Midnight Lagoon** | `#2D3A47` / `#151D24` | `45, 58, 71` | Deep, eye-friendly ambient background |
| **Misty Sky** | `#A9B7C6` | `169, 183, 198` | Soothing slate periwinkle text & card borders |
| **Sage Leaf** | `#A8B58A` | `168, 181, 138` | Calming organic green for success & verified metrics |
| **Blush Petal** | `#F7C8D3` | `247, 200, 211` | Soft warm petal highlight & divine accents |
| **Rosewood** | `#B46A72` | `180, 106, 114` | Elegant terracotta for warnings & overdue balances |

### ✨ Divine Lord Shiva Cosmic Elements
- **3D Gyroscope Cosmic Hologram Loader:** Rotating celestial rings, cosmic particle stars, and sacred mantra `"॥ ॐ नमः शिवाय ॥"`.
- **Trishul 🔱 & Damru Brand Accents:** Sacred spiritual identity for the society.

---

## 🚀 Key Modules & Capabilities

### 1. 🌐 Public Modern SaaS Homepage (`index.html`)
- **Hero Command Deck:** High-impact typography, live society statistics chips, and dual CTA buttons (`Resident Portal` and `Committee Login`).
- **Emergency Vehicle Parking Lookup Bar:** Type any license plate (e.g., `GJ06`, `1234`) or car/bike model to find the resident's house number and phone number immediately with 1-click calling (`tel:...`) and WhatsApp.
- **Features Showcase:** Visual breakdown of the 6 core pillars of Shivam Duplex governance.
- **Festival Spotlight:** Live preview of Shri Ganesh Mahotsav day-wise schedule and transparency ledger.
- **Multi-Bill A4 Printing Visualizer:** Explains how the paper-saving 1/2/3/4 slips per sheet works.
- **Official Bank & UPI QR Hub:** Scan QR code or copy IFSC and Account number with 1-click copy buttons.
- **FAQ Accordion & Community Guidelines:** Speed limit (15 km/h), quiet hours, and waste rules.

### 2. 📊 Committee Admin Command Center (`dashboard.html`)
- Real-time financial health cards (Total Members, Pending Bills, Monthly Collection, Expenses, Reserve Balance, Advance Balance).
- Interactive Chart.js analytics: Monthly Collections Trend and Expenses Breakdown.
- Follow-up table of pending bills.
- Committee Cluster distribution cards.

### 3. 🏠 Resident Self-Service Portal (`resident.html`)
- **Duplex Identification:** Enter house number (e.g., `12`, `04`) to view your personal account.
- **Assigned Committee Guardian Banner:** Displays your dedicated committee leader (Cluster 1: Houses 1–20 or Cluster 2: Houses 21–40) with direct Call and WhatsApp complaint buttons.
- **Owner-Managed Tenant KYC:** Home owners can register or update their tenants directly with full KYC:
  - Tenant Full Name & Mobile Number
  - Aadhaar Card No. & PAN Card No.
  - Job / Occupation & Family Member Count
  - Rent Agreement Start & End Dates & Monthly Rent
  - Tenant Login PIN (for tenant self-service)
- **Vehicle Directory Management:** Register your Four-Wheeler (Car) and Two-Wheeler (Bike/Scooter).
- **Society UPI QR Code & Payment Reporting:** Scan society QR code, select ₹600, ₹3,600, or ₹7,200, and submit UTR reference for instant ledger credit!
- **A4 Bill Receipt Printing:** Print individual or batch bills directly from home.

### 4. 🌺 Events & Shri Ganesh Mahotsav Hub (`events.html`)
- **Panel 1: All Society Events:** Create, edit, and budget society events.
- **Panel 2: Door-to-Door Contribution Register (Ghar-Ghar Collection List):** Track contributions across all 40 houses (Amount, Payment Mode, Status: Received/Pending, Remarks).
- **Panel 3: Day-Wise Program Designer:** Plan day-wise activities (e.g., Day 1 Sthapana & Aarti, Day 2 Satyanarayan Katha, Day 3 Cultural Night, Day 10 Mahaprasad & Visarjan).
- **Panel 4: Itemized Expense Breakdown:** Record exact expenditures for Pandit Ji Dakshina, Mandap/Lighting, Mahaprasad food, Sound/DJ, and Dhol Visarjan with real-time remaining surplus balance!

### 5. 🖨 Smart Multi-Bill A4 Printing Engine (`js/print.js`)
- Divide a single A4 page into **1, 2, 3, or 4 horizontal slips**.
- Printed with dashed scissors cut lines (`✂ ------------------ ✂`).
- Includes amount converted to Indian words (e.g., *"Rupees Six Hundred Only"*).
- Dual signature slots: Resident Signature and Authorized Signatory.

### 6. 👥 Members & Resident Directory (`members.html`)
- Complete database of 40 duplexes.
- Tracks parking slot, car registration number, bike registration number, and assigned committee cluster.
- Owner and tenant profiles with full export to Excel.

### 7. 💳 Maintenance & Finance Engine (`maintenance.html`, `payments.html`, `expenses.html`, `funds.html`)
- Society fee constants:
  - **₹600 / month** (Regular)
  - **₹3,600 / 6 months** (Half-Yearly Advance)
  - **₹7,200 / year** (Annual Advance)
- Automatic advance balance calculation (`calcAdvanceBalance()`).
- Single and Bulk Bill generation.

### 8. 📱 Progressive Web App (PWA v5)
- Installable on **Android**, **iOS**, **Windows**, and **macOS**.
- 1-click guided installation modal for mobile devices.
- Network-first service worker (`sw.js`) with offline caching.

---

## 🏛 Committee 20-House Allocation

To ensure prompt resolution of complaints without bureaucratic delays:

| Cluster | Houses Covered | Committee Incharge | Phone Number | Responsibilities |
|---|---|---|---|---|
| **Cluster 1** | Duplex 01 – Duplex 20 | **Rajeshbhai Patel** | `+91 98250 12341` | Water supply, plumbing, civil maintenance, dues collection |
| **Cluster 2** | Duplex 21 – Duplex 40 | **Sureshbhai Shah** | `+91 98250 12342` | Gate security, streetlights, sanitation, event coordination |

---

## 🏦 Society Bank & UPI Details

- **Account Name:** SHIVAM DUPLEX RESIDENTS ASSOCIATION
- **Bank & Branch:** State Bank of India, Gotri Branch, Vadodara
- **Account Number:** `38492019485`
- **IFSC Code:** `SBIN0010948`
- **UPI VPA:** `shivamduplex@sbi`

---

## 📁 File Structure

```
shivam-duplex-society/
├── index.html            # Public SaaS Landing Page & Emergency Vehicle Finder
├── dashboard.html        # Dedicated Committee Admin Command Center
├── members.html          # Member & Vehicle Directory (CRUD + Excel export)
├── maintenance.html      # Maintenance Billing & Bulk Generator
├── payments.html         # Payment Ledger & Receipt Tracker
├── expenses.html         # Society Expenditure Ledger
├── funds.html            # Reserve Fund Accounting
├── events.html           # Ganesh Utsav Hub (Ghar-Ghar List, Schedule & Expenses)
├── notices.html          # Digital Notice Board (Pinned & Priority badges)
├── reports.html          # 9 Financial & Directory Excel Export Reports
├── resident.html         # Resident Self-Service Portal & Tenant KYC Manager
├── manifest.json         # PWA Web App Manifest
├── sw.js                 # Service Worker (Cache v5)
├── vercel.json           # Security Headers, CSP & Clean URL Rewrites
├── css/
│   ├── style.css         # Liquid Glass Design Tokens & Spatial Cards
│   ├── homepage.css      # SaaS Landing Page Stylesheet
│   ├── tables.css        # Responsive Data Tables
│   ├── forms.css         # Liquid Glass Form Controls
│   └── shiva-theme.css   # 3D Gyroscope Shiva Hologram Loader
└── js/
    ├── app.js            # Core Business Logic & Firestore Handlers
    ├── print.js          # Multi-Bill A4 Printing Engine (1/2/3/4 Slips)
    └── pwa.js            # Universal PWA Install Trigger
```

---

## 🔒 Security & Best Practices

1. **Content Security Policy (CSP):** Configured in `vercel.json` restricting scripts, styles, fonts, and API connections to official origins (`gstatic.com`, `googleapis.com`, `jsdelivr.net`).
2. **XSS Sanitization:** All user inputs and database strings are sanitized via `esc()` before DOM injection.
3. **HTTP Security Headers:** HSTS (`max-age=63072000`), X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Referrer-Policy (`strict-origin-when-cross-origin`).
4. **No Secrets in Repo:** Public client configuration utilizes standard Firebase Web SDK credentials; secrets and administrative functions remain server-side.

---

## 🚀 Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/rkrishna04/shivam-duplex-society.git
   cd shivam-duplex-society
   ```

2. **Serve Locally:**
   Run any local static file server:
   ```bash
   npx serve .
   # or Python:
   python -m http.server 8000
   ```

3. **Open in Browser:**
   Visit `http://localhost:8000` to test the Landing Page, `dashboard.html` for Admin, and `resident.html` for Resident Portal.

---

*Made with devotion for SHIVAM DUPLEX RESIDENTS ASSOCIATION · ॥ ॐ नमः शिवाय ॥*
