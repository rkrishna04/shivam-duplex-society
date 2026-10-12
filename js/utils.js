// ============================================================
//  utils.js  —  Shared helper functions for SHIVAM DUPLEX
// ============================================================

/* ---- Toast Notifications ---- */
export function showToast(message, type = "info", duration = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "ℹ️"}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, duration);
}

/* ---- Date helpers ---- */
export function formatDate(val) {
  if (!val) return "—";
  const d = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function monthYear(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "-01");
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function currentMonthISO() {
  return new Date().toISOString().slice(0, 7); // "2026-09"
}

/* ---- Currency ---- */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", minimumFractionDigits: 2
  }).format(parseFloat(amount) || 0);
}

/* ---- Number to Words (INR) ---- */
const _ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const _tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function _w(n) {
  if (n < 20)   return _ones[n];
  if (n < 100)  return _tens[Math.floor(n/10)] + (n%10 ? " "+_ones[n%10] : "");
  if (n < 1000) return _ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " "+_w(n%100) : "");
  if (n < 100000) return _w(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " "+_w(n%1000) : "");
  if (n < 10000000) return _w(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " "+_w(n%100000) : "");
  return _w(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " "+_w(n%10000000) : "");
}

export function numberToWords(amount) {
  const num = Math.round(parseFloat(amount) || 0);
  if (!num) return "Zero Rupees Only";
  return _w(num) + " Rupees Only";
}

/* ---- Sidebar Toggle ---- */
export function initSidebar() {
  const toggle  = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  toggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("active");
  });
  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("active");
  });
}

/* ---- Debounce ---- */
export function debounce(fn, ms = 300) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ---- Escape HTML ---- */
export function esc(s) {
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ---- Empty / Loading state helpers ---- */
export function showLoading(tableBodyId, loaderId) {
  const tb = document.getElementById(tableBodyId);
  const ld = document.getElementById(loaderId);
  if (ld) ld.style.display = "flex";
  if (tb) tb.style.display = "none";
}

export function hideLoading(tableBodyId, loaderId) {
  const tb = document.getElementById(tableBodyId);
  const ld = document.getElementById(loaderId);
  if (ld) ld.style.display = "none";
  if (tb) tb.style.display = "";
}

/* ---- Status badge helper ---- */
export function statusBadge(status) {
  const map = {
    "Paid":    "badge-success",
    "Active":  "badge-success",
    "Pending": "badge-warning",
    "Planned": "badge-info",
    "Overdue": "badge-danger",
    "Partial": "badge-warning",
    "Completed":"badge-success",
    "Ongoing": "badge-info",
    "Inactive":"badge-muted",
    "Vacated": "badge-muted",
  };
  return `<span class="badge ${map[status]||"badge-info"}">${esc(status)}</span>`;
}
