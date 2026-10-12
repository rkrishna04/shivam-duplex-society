// ============================================================
//  db.js  —  All Firestore operations for SHIVAM DUPLEX
//  v2 — Removed orderBy (client-side sort to avoid index issues)
//       Added 15s timeout wrapper on all reads
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  deleteDoc, runTransaction, serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ─── Collection names ─────────────────────────────────────
const C = {
  MEMBERS:    "sd_members",
  MAINT_BILLS:"sd_maintenance_bills",
  PAYMENTS:   "sd_payments",
  EXPENSES:   "sd_expenses",
  EVENTS:     "sd_events",
  FUNDS:      "sd_funds",
  NOTICES:    "sd_notices",
  META:       "sd_meta",
};

// ─── Timeout wrapper (15 seconds) ─────────────────────────
function withTimeout(promise, ms = 15000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(
      "Connection timeout. Check: 1) Firestore rules (allow read, write: if true) " +
      "2) Firebase config values are correct 3) Run via http://localhost not file://"
    )), ms)
  );
  return Promise.race([promise, timeout]);
}

// ─── Safe getDocs with timeout ─────────────────────────────
async function safeDocs(col) {
  const snap = await withTimeout(getDocs(collection(db, col)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Counter helper ───────────────────────────────────────
async function nextSerial(key) {
  const ref = doc(db, C.META, "counters");
  let n = 1;
  await withTimeout(runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : {};
    n = (data[key] || 0) + 1;
    snap.exists() ? tx.update(ref, { [key]: n }) : tx.set(ref, { [key]: n });
  }));
  return n;
}

const yr = () => new Date().getFullYear();

// ─── Client-side sort helpers ─────────────────────────────
const byCreated = (a, b) => {
  const at = a.createdAt?.toMillis?.() ?? 0;
  const bt = b.createdAt?.toMillis?.() ?? 0;
  return bt - at;
};
const byFlat = (a, b) => (a.flatNumber || "").localeCompare(b.flatNumber || "");
const byDate = (a, b) => (b.date || "").localeCompare(a.date || "");

// ─── SETTINGS ─────────────────────────────────────────────
export async function getSettings() {
  const snap = await withTimeout(getDoc(doc(db, C.META, "settings")));
  return snap.exists() ? snap.data() : {
    societyName: "SHIVAM DUPLEX",
    maintenanceAmount: 1500,
    dueDay: 10,
    lateFee: 100,
    wings: ["A", "B"],
    secretary: "Secretary",
    chairman: "Chairman",
  };
}
export async function saveSettings(data) {
  await setDoc(doc(db, C.META, "settings"), data, { merge: true });
}

// ─── MEMBERS ──────────────────────────────────────────────
export async function addMember(data) {
  return (await addDoc(collection(db, C.MEMBERS), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getMembers() {
  const rows = await safeDocs(C.MEMBERS);
  return rows.sort(byFlat);
}
export async function getMemberById(id) {
  const s = await withTimeout(getDoc(doc(db, C.MEMBERS, id)));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}
export async function updateMember(id, data) {
  await updateDoc(doc(db, C.MEMBERS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteMember(id) {
  await deleteDoc(doc(db, C.MEMBERS, id));
}

// ─── MAINTENANCE BILLS ────────────────────────────────────
export async function getNextMaintenanceBillNo() {
  const k = `maint_${yr()}`;
  const n = await nextSerial(k);
  return `SDMAINT-${yr()}-${String(n).padStart(4, "0")}`;
}
export async function addMaintenanceBill(data) {
  return (await addDoc(collection(db, C.MAINT_BILLS), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getMaintenanceBills(filters = {}) {
  const rows = await safeDocs(C.MAINT_BILLS);
  let bills = rows.sort(byCreated);
  if (filters.period) bills = bills.filter(b => b.period === filters.period);
  if (filters.status) bills = bills.filter(b => b.status === filters.status);
  if (filters.wing)   bills = bills.filter(b => b.wing   === filters.wing);
  return bills;
}
export async function updateMaintenanceBill(id, data) {
  await updateDoc(doc(db, C.MAINT_BILLS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteMaintenanceBill(id) {
  await deleteDoc(doc(db, C.MAINT_BILLS, id));
}

// ─── PAYMENTS ─────────────────────────────────────────────
export async function getNextPaymentNo() {
  const k = `pay_${yr()}`;
  const n = await nextSerial(k);
  return `SDPAY-${yr()}-${String(n).padStart(4, "0")}`;
}
export async function addPayment(data) {
  return (await addDoc(collection(db, C.PAYMENTS), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getPayments() {
  const rows = await safeDocs(C.PAYMENTS);
  return rows.sort(byCreated);
}
export async function deletePayment(id) {
  await deleteDoc(doc(db, C.PAYMENTS, id));
}

// ─── EXPENSES ─────────────────────────────────────────────
export async function getNextExpenseNo() {
  const k = `exp_${yr()}`;
  const n = await nextSerial(k);
  return `SDEXP-${yr()}-${String(n).padStart(4, "0")}`;
}
export async function addExpense(data) {
  return (await addDoc(collection(db, C.EXPENSES), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getExpenses() {
  const rows = await safeDocs(C.EXPENSES);
  return rows.sort(byDate);
}
export async function updateExpense(id, data) {
  await updateDoc(doc(db, C.EXPENSES, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteExpense(id) {
  await deleteDoc(doc(db, C.EXPENSES, id));
}

// ─── EVENTS ───────────────────────────────────────────────
export async function addEvent(data) {
  return (await addDoc(collection(db, C.EVENTS), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getEvents() {
  const rows = await safeDocs(C.EVENTS);
  return rows.sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));
}
export async function updateEvent(id, data) {
  await updateDoc(doc(db, C.EVENTS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteEvent(id) {
  await deleteDoc(doc(db, C.EVENTS, id));
}

// ─── FUNDS ────────────────────────────────────────────────
export async function addFundTransaction(data) {
  return (await addDoc(collection(db, C.FUNDS), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getFundTransactions() {
  const rows = await safeDocs(C.FUNDS);
  return rows.sort(byDate);
}
export async function deleteFundTransaction(id) {
  await deleteDoc(doc(db, C.FUNDS, id));
}

// ─── NOTICES ──────────────────────────────────────────────
export async function addNotice(data) {
  return (await addDoc(collection(db, C.NOTICES), { ...data, createdAt: serverTimestamp() })).id;
}
export async function getNotices() {
  const rows = await safeDocs(C.NOTICES);
  return rows.sort(byCreated);
}
export async function updateNotice(id, data) {
  await updateDoc(doc(db, C.NOTICES, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteNotice(id) {
  await deleteDoc(doc(db, C.NOTICES, id));
}

// ─── DASHBOARD STATS ──────────────────────────────────────
export async function getDashboardStats() {
  const [members, bills, expenses, payments, events, funds] = await Promise.all([
    safeDocs(C.MEMBERS),
    safeDocs(C.MAINT_BILLS),
    safeDocs(C.EXPENSES),
    safeDocs(C.PAYMENTS),
    safeDocs(C.EVENTS),
    safeDocs(C.FUNDS),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);

  const pendingBills = bills.filter(b => b.status === "Pending" || b.status === "Overdue");
  const pendingAmount = pendingBills.reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);

  const monthExpenses = expenses
    .filter(e => (e.date || "").startsWith(thisMonth))
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const monthCollection = payments
    .filter(p => (p.paymentDate || "").startsWith(thisMonth))
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  const totalCredits = funds.filter(f => f.transactionType === "Credit").reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const totalDebits  = funds.filter(f => f.transactionType === "Debit").reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);

  return {
    totalMembers:   members.length,
    totalBills:     bills.length,
    pendingCount:   pendingBills.length,
    pendingAmount,
    monthCollection,
    monthExpenses,
    societyBalance: totalCredits - totalDebits,
    upcomingEvents: events.filter(e => e.status === "Planned").length,
  };
}
