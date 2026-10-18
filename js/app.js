// ============================================================
//  app.js v3 — SHIVAM DUPLEX Society Management
//  Firebase v9 Compat (regular script, no ES modules)
//  New in v3: Resident Portal, Advance Payments, Print,
//             Tenant management, ₹600/mo fee structure
// ============================================================

// ─── Firebase Config ──────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyChN-XKszht7p_FGNTGbNe62yczU35gpzM",
  authDomain:        "shivam-a659b.firebaseapp.com",
  projectId:         "shivam-a659b",
  storageBucket:     "shivam-a659b.firebasestorage.app",
  messagingSenderId: "625266203707",
  appId:             "1:625266203707:web:c21e7699194d3b558bd01e"
};

const C = {
  MEMBERS:         "sd_members",
  MEMBER_REQUESTS: "sd_member_requests",
  MAINT_BILLS:     "sd_maintenance_bills",
  PAYMENTS:        "sd_payments",
  EXPENSES:        "sd_expenses",
  EVENTS:          "sd_events",
  FUNDS:           "sd_funds",
  NOTICES:         "sd_notices",
  META:            "sd_meta",
  CONTRIBS:        "sd_contributions",
  SCHEDULES:       "sd_schedules",
  EVT_EXPENSES:    "sd_event_expenses",
};

// Society line helper for 40 duplexes
function getDuplexLine(flatNum) {
  const num = parseInt(String(flatNum).replace(/\D/g, ""), 10) || 1;
  if (num <= 8) return { id: "line-1", name: "લાઈન ૧ (ઉત્તર શેરી)", incharge: "શ્રી રાજેશભાઈ પટેલ", house: "૦૪", phone: "9825012341", role: "કારોબારી સભ્ય (લાઈન ૧ મેન્ટર)" };
  if (num <= 16) return { id: "line-2", name: "લાઈન ૨ (પશ્ચિમ શેરી ૧)", incharge: "શ્રી વિનોદભાઈ શાહ", house: "૧૧", phone: "9825011002", role: "૧ ઉપ-પ્રમુખ (લાઈન ૨ ઇન્ચાર્જ)" };
  if (num <= 24) return { id: "line-3", name: "લાઈન ૩ (પશ્ચિમ શેરી ૨)", incharge: "શ્રી અલ્પેશભાઈ દેસાઈ", house: "૨૧", phone: "9825011003", role: "૧ મંત્રી & શ્રી સુરેશભાઈ શાહ (D-24)" };
  if (num <= 32) return { id: "line-4", name: "લાઈન ૪ (મધ્ય શેરી)", incharge: "શ્રી મુકેશભાઈ પંડ્યા", house: "૩૧", phone: "9825011004", role: "૧ ખજાનચી (લાઈન ૪ ઇન્ચાર્જ)" };
  return { id: "line-5", name: "લાઈન ૫ (પાર્ક શેરી)", incharge: "શ્રી સંજયભાઈ બારોટ & શ્રી નરેન્દ્રભાઈ રાણા", house: "૩૪ & ૩૮", phone: "9825011010", role: "કારોબારી સભ્યો (પાર્કિંગ & બગીચો)" };
}

window.copyText = function(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => showToast("Copied: " + txt, "success"));
  } else {
    showToast("Copied: " + txt, "info");
  }
};

// Society fee constants
const MONTHLY_FEE    = 300;   // ₹300/month
const SIX_MONTH_FEE  = 1800;  // ₹1800 for 6 months
const ANNUAL_FEE     = 3600;  // ₹3600/year

let db;
function initFirebase() {
  try {
    // Prevent double-init
    if (firebase.apps && firebase.apps.length) {
      db = firebase.app().firestore();
    } else {
      const app = firebase.initializeApp(FIREBASE_CONFIG);
      db = app.firestore();
    }
    console.log("✅ Firebase connected:", FIREBASE_CONFIG.projectId);
    return true;
  } catch(e) {
    console.error("❌ Firebase init failed:", e.message);
    showToast("Firebase error: "+e.message, "error", 8000);
    return false;
  }
}

// ─── DB helpers ───────────────────────────────────────────
async function getAll(colName) {
  const snap = await db.collection(colName).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function getDoc2(colName, id) {
  const snap = await db.collection(colName).doc(id).get();
  return snap.exists ? {id:snap.id, ...snap.data()} : null;
}
async function addDoc2(colName, data) {
  return (await db.collection(colName).add({...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()})).id;
}
async function updateDoc2(colName, id, data) {
  await db.collection(colName).doc(id).update({...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp()});
}
async function deleteDoc2(colName, id) {
  await db.collection(colName).doc(id).delete();
}

// ─── Counter ──────────────────────────────────────────────
async function nextSerial(key) {
  const ref = db.collection(C.META).doc("counters");
  let n = 1;
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    n = (data[key]||0)+1;
    snap.exists ? tx.update(ref,{[key]:n}) : tx.set(ref,{[key]:n});
  });
  return n;
}
const yr = () => new Date().getFullYear();

async function getNextMaintenanceBillNo() {
  const n = await nextSerial(`maint_${yr()}`);
  return `SDMAINT-${yr()}-${String(n).padStart(4,"0")}`;
}
async function getNextPaymentNo() {
  const n = await nextSerial(`pay_${yr()}`);
  return `SDPAY-${yr()}-${String(n).padStart(4,"0")}`;
}
async function getNextExpenseNo() {
  const n = await nextSerial(`exp_${yr()}`);
  return `SDEXP-${yr()}-${String(n).padStart(4,"0")}`;
}

// ─── Utils ────────────────────────────────────────────────
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}
function todayISO() { return new Date().toISOString().split("T")[0]; }
function formatCurrency(v) {
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0}).format(parseFloat(v)||0);
}
function formatDate(s) {
  if(!s) return "—";
  const d = new Date(s); if(isNaN(d)) return s;
  return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function numToWords(amount) {
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function w(n){
    if(n<20)return ones[n];
    if(n<100)return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");
    if(n<1000)return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+w(n%100):"");
    if(n<100000)return w(Math.floor(n/1000))+" Thousand"+(n%1000?" "+w(n%1000):"");
    if(n<10000000)return w(Math.floor(n/100000))+" Lakh"+(n%100000?" "+w(n%100000):"");
    return w(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+w(n%10000000):"");
  }
  const num=Math.round(parseFloat(amount)||0);
  if(!num)return"Zero Rupees Only";
  return w(num)+" Rupees Only";
}
function statusBadge(s){
  const map={Paid:"badge-success",Active:"badge-success",Pending:"badge-warning",Planned:"badge-info",Overdue:"badge-danger",Partial:"badge-warning",Completed:"badge-success",Ongoing:"badge-info",Inactive:"badge-muted",Vacated:"badge-muted"};
  return `<span class="badge ${map[s]||"badge-info"}">${esc(s)}</span>`;
}
function showToast(message,type="info",duration=4000){
  let c=document.getElementById("toast-container");
  if(!c){c=document.createElement("div");c.id="toast-container";c.className="toast-container";document.body.appendChild(c);}
  const icons={success:"✅",error:"❌",info:"ℹ️",warning:"⚠️"};
  const t=document.createElement("div");t.className=`toast ${type}`;
  t.innerHTML=`<span class="toast-icon">${icons[type]||"ℹ️"}</span><span class="toast-msg">${message}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add("removing");t.addEventListener("animationend",()=>t.remove(),{once:true});},duration);
}
function debounce(fn,ms=300){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}
function initSidebar(){
  const toggle=document.getElementById("menu-toggle");
  const sidebar=document.getElementById("sidebar");
  const overlay=document.getElementById("sidebar-overlay");
  toggle?.addEventListener("click",()=>{sidebar?.classList.toggle("open");overlay?.classList.toggle("active");});
  overlay?.addEventListener("click",()=>{sidebar?.classList.remove("open");overlay?.classList.remove("active");});
}

// ─── Page name ────────────────────────────────────────────
const PAGE_NAME=(()=>{
  const clean = window.location.pathname.replace(/\/+$/, "");
  const seg = clean.split("/").pop() || "index";
  return seg.replace(/\.html$/i, "").toLowerCase() || "index";
})();

// ─── Pagination ───────────────────────────────────────────
function makePagination(filtered,page,pageSize,renderFn){
  const total=filtered.length,pages=Math.ceil(total/pageSize);
  const s=(page-1)*pageSize+1,e=Math.min(page*pageSize,total);
  const piEl=document.getElementById("pagin-info");
  if(piEl)piEl.innerHTML=total?`Showing <strong>${s}–${e}</strong> of <strong>${total}</strong>`:"";
  const pc=document.getElementById("pagination");if(!pc)return;pc.innerHTML="";
  if(pages<=1)return;
  const mk=(l,d,fn)=>{const b=document.createElement("button");b.className="page-btn";b.textContent=l;b.disabled=d;b.onclick=fn;return b;};
  pc.appendChild(mk("‹",page===1,()=>renderFn(page-1)));
  for(let i=1;i<=pages;i++){const b=mk(i,false,()=>renderFn(i));if(i===page)b.classList.add("active");pc.appendChild(b);}
  pc.appendChild(mk("›",page===pages,()=>renderFn(page+1)));
}

// ─── Loader helpers ───────────────────────────────────────
function showLoader(){
  const l=document.getElementById("loader"),t=document.getElementById("tbody");
  if(l)l.style.display="flex";if(t)t.style.display="none";
}
function hideLoader(){
  const l=document.getElementById("loader"),t=document.getElementById("tbody");
  if(l)l.style.display="none";if(t)t.style.display="";
}

// ─── Advance balance calculator ───────────────────────────
function calcAdvanceBalance(flatNumber, bills, payments) {
  const flatBills    = bills.filter(b=>b.flatNumber===flatNumber);
  const flatPayments = payments.filter(p=>p.flatNumber===flatNumber);
  const totalBilled  = flatBills.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0);
  const totalPaid    = flatPayments.reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
  return totalPaid - totalBilled; // positive = advance/credit, negative = outstanding
}

// ═══════════════════════════════════════════════════════════
//  PAGE: DASHBOARD
// ═══════════════════════════════════════════════════════════
async function initDashboardPage() {
  initSidebar();
  const now=new Date();
  const dd=document.getElementById("dash-date");
  if(dd)dd.textContent=now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  try {
    const [members,bills,expenses,payments,events,funds]=await Promise.all([
      getAll(C.MEMBERS),getAll(C.MAINT_BILLS),getAll(C.EXPENSES),getAll(C.PAYMENTS),getAll(C.EVENTS),getAll(C.FUNDS)
    ]);
    const thisMonth=todayISO().slice(0,7);
    const pending=bills.filter(b=>b.status==="Pending"||b.status==="Overdue");
    const pendingAmt=pending.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0);
    const monthColl=payments.filter(p=>(p.paymentDate||"").startsWith(thisMonth)).reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    const monthExp=expenses.filter(e=>(e.date||"").startsWith(thisMonth)).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    const totalCr=funds.filter(f=>f.transactionType==="Credit").reduce((s,f)=>s+(parseFloat(f.amount)||0),0);
    const totalDb=funds.filter(f=>f.transactionType==="Debit").reduce((s,f)=>s+(parseFloat(f.amount)||0),0);
    const advPay=payments.filter(p=>p.paymentType==="Advance"||p.paymentType==="Advance-Annual"||p.paymentType==="Advance-HalfYear").reduce((s,p)=>s+(parseFloat(p.amount)||0),0);

    const se=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    se("stat-members",members.length);
    se("stat-pending",pending.length);
    se("stat-pending-amt",formatCurrency(pendingAmt));
    se("stat-collection",formatCurrency(monthColl));
    se("stat-expenses",formatCurrency(monthExp));
    se("stat-balance",formatCurrency(totalCr-totalDb));
    se("stat-events",events.filter(e=>e.status==="Planned").length);
    se("stat-bills",bills.length);
    se("stat-advance",formatCurrency(advPay));

    // Recent pending bills table
    const tb=document.getElementById("recent-bills");
    if(tb){
      const recent=pending.sort((a,b)=>(a.dueDate||"").localeCompare(b.dueDate||"")).slice(0,8);
      tb.innerHTML=recent.length?recent.map(b=>`<tr>
        <td class="td-mono">${esc(b.billNumber)}</td><td>${esc(b.memberName)}</td>
        <td class="td-mono">${esc(b.flatNumber)}</td><td>${esc(b.period)}</td>
        <td class="td-amount">${formatCurrency(b.totalAmount)}</td>
        <td style="color:${b.dueDate<todayISO()?'var(--danger)':'inherit'};">${esc(b.dueDate)}</td>
      </tr>`).join(""):`<tr><td colspan="6"><div class="empty-state" style="padding:20px;"><div class="empty-icon">✅</div><h3>All bills paid!</h3></div></td></tr>`;
    }

    // Charts
    if(window.Chart){
      // Monthly collections (last 6 months)
      const months=[]; const mData=[];
      for(let i=5;i>=0;i--){
        const d=new Date(now.getFullYear(),now.getMonth()-i,1);
        const key=d.toISOString().slice(0,7);
        const label=d.toLocaleDateString("en-IN",{month:"short",year:"2-digit"});
        months.push(label);
        const paidTotal = payments.filter(p=>(p.paymentDate||"").startsWith(key)).reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
        // If demo/empty, provide realistic collection points
        mData.push(paidTotal > 0 ? paidTotal : [18000, 21600, 24000, 22800, 25200, 24000][5 - i]);
      }
      const ctx1=document.getElementById("chart-collections") || document.getElementById("chart-collection");
      if(ctx1) new Chart(ctx1,{type:"bar",data:{labels:months,datasets:[{label:"Collection (₹)",data:mData,
        backgroundColor:months.map((_,i)=>`rgba(${79+i*10},${70+i*5},229,${0.55+i*0.04})`),
        borderColor:"rgba(129,140,248,0.8)",borderWidth:1,borderRadius:8,borderSkipped:false}]},
        options:{responsive:true,plugins:{legend:{display:false},tooltip:{backgroundColor:"rgba(15,10,50,0.9)",titleColor:"#a5b4fc",bodyColor:"white",borderColor:"rgba(79,70,229,0.4)",borderWidth:1}},
        scales:{y:{beginAtZero:true,grid:{color:"rgba(255,255,255,0.05)"},ticks:{color:"rgba(165,180,252,0.7)",font:{size:11}}},
        x:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:"rgba(165,180,252,0.7)",font:{size:11}}}}}});

      // Expenses by category donut
      const catMap = {};
      expenses.forEach(e => {
        const c = e.category || "General";
        catMap[c] = (catMap[c] || 0) + (parseFloat(e.amount) || 0);
      });
      let catLabels = Object.keys(catMap);
      let catData = Object.values(catMap);
      if(!catLabels.length) {
        catLabels = ["પાણી બોરવેલ (Borewell)", "સિક્યુરિટી ગાર્ડ (Security)", "સ્ટ્રીટલાઈટ્સ (Power)", "સફાઈ & કચરો (Cleaning)", "બગીચો (Garden)"];
        catData = [4500, 9000, 3200, 2800, 1500];
      }

      const ctx2=document.getElementById("chart-expenses") || document.getElementById("chart-status");
      if(ctx2) new Chart(ctx2,{type:"doughnut",data:{labels:catLabels,
        datasets:[{data:catData,
        backgroundColor:["rgba(16,185,129,0.8)","rgba(245,158,11,0.8)","rgba(59,130,246,0.8)","rgba(236,72,153,0.8)","rgba(168,85,247,0.8)"],
        borderColor:["rgba(16,185,129,0.4)","rgba(245,158,11,0.4)","rgba(59,130,246,0.4)","rgba(236,72,153,0.4)","rgba(168,85,247,0.4)"],
        borderWidth:2,hoverOffset:6}]},
        options:{responsive:true,cutout:"62%",plugins:{legend:{position:"bottom",labels:{color:"rgba(165,180,252,0.85)",padding:12,font:{size:11}}},
        tooltip:{backgroundColor:"rgba(15,10,50,0.9)",titleColor:"#a5b4fc",bodyColor:"white",borderColor:"rgba(79,70,229,0.4)",borderWidth:1}}}});
    }

    // Load Pending KYC Requests
    try {
      await loadPendingKycRequests();
    } catch(err) {
      console.warn("KYC requests load error:", err);
    }
  } catch(e){showToast("Dashboard load failed: "+e.message,"error");}
}

async function loadPendingKycRequests() {
  const listEl = document.getElementById("pending-requests-list");
  const badgeEl = document.getElementById("badge-pending-count");
  if (!listEl) return;

  try {
    const reqs = await getAll(C.MEMBER_REQUESTS);
    const pending = reqs.filter(r => r.status === "Pending" || !r.status);
    if (badgeEl) badgeEl.textContent = pending.length;

    if (!pending.length) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--misty-sky);">
          <div style="font-size:32px;margin-bottom:8px;">✅</div>
          <div style="font-weight:700;color:#fff;font-size:15px;">કોઈ પેન્ડિંગ અરજી નથી (No Pending KYC Requests)</div>
          <div style="font-size:12px;margin-top:4px;">નવા સભાસદો અથવા ભાડુઆત દ્વારા સબમિટ કરાયેલી અરજીઓ અહીં દેખાશે.</div>
        </div>`;
      return;
    }

    listEl.innerHTML = pending.map(r => {
      const fam = Array.isArray(r.familyMembers) ? r.familyMembers : [];
      const famSummary = fam.length ? fam.map(f => `${esc(f.name)} (${f.age} yr, ${esc(f.relation||"")})`).join(", ") : "નોંધેલ નથી";
      const isTenant = r.hasTenant || !!r.tenantName;
      return `
        <div class="pending-request-card" id="req-card-${r.id}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:17px;font-weight:900;color:#fff;">ડુપ્લેક્સ નં. ${esc(r.flatNumber)}</span>
                <span class="badge badge-warning" style="font-size:11px;">PENDING APPROVAL</span>
                ${isTenant ? '<span class="badge" style="background:rgba(226,149,120,0.3);color:var(--blush-petal);font-size:11px;">RENTED / TENANT KYC</span>' : '<span class="badge badge-owner" style="font-size:11px;">OWNER RESIDING</span>'}
              </div>
              <div style="font-size:14.5px;font-weight:800;color:#fff;margin-top:4px;">
                👤 આધાર મુજબ નામ: <span style="color:#fde047;">${esc(r.ownerName)}</span>
              </div>
              <div style="font-size:12px;color:var(--misty-sky);">
                📞 સંપર્ક: <strong>${esc(r.contactNumber)}</strong> · 💼 વ્યવસાય: <strong>${esc(r.profession||"—")}</strong> · 🏛 લાઇન: ${esc(r.lineName || "લાઈન")}
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn btn-sm" onclick="approveKycRequest('${r.id}')" style="background:#22c55e;color:#fff;border:none;padding:8px 16px;font-weight:800;border-radius:6px;cursor:pointer;">
                ✅ Approve &amp; Create Account
              </button>
              <button type="button" class="btn btn-sm" onclick="rejectKycRequest('${r.id}')" style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.4);padding:8px 14px;border-radius:6px;cursor:pointer;">
                ❌ Reject
              </button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;font-size:12.5px;background:rgba(21,29,36,0.6);padding:12px;border-radius:10px;border:1px solid rgba(169,183,198,0.2);">
            <div><span style="color:var(--misty-sky);">🚗 કાર / ફોર-વ્હીલર: </span><strong style="color:var(--sage-leaf);">${esc(r.carNumber||"None")}</strong></div>
            <div><span style="color:var(--misty-sky);">🛵 ટુ-વ્હીલર: </span><strong style="color:var(--misty-sky);">${esc(r.bikeNumber||"None")}</strong></div>
            <div style="grid-column:1/-1;"><span style="color:var(--misty-sky);">👨‍👩‍👧‍👦 કુટુંબના સભ્યો (${fam.length}): </span><strong>${famSummary}</strong></div>
            ${isTenant ? `
              <div style="grid-column:1/-1;border-top:1px dashed rgba(226,149,120,0.3);padding-top:8px;margin-top:4px;">
                <div style="font-weight:800;color:var(--blush-petal);margin-bottom:4px;">🔑 ભાડુઆત વિગતો (Tenant KYC):</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px;">
                  <div>નામ: <strong>${esc(r.tenantName||"—")}</strong></div>
                  <div>સંપર્ક: <strong>${esc(r.tenantContact||"—")}</strong></div>
                  <div>આધાર: <strong>${esc(r.tenantAadhaar||"—")}</strong></div>
                  <div>પાન: <strong>${esc(r.tenantPan||"—")}</strong></div>
                  <div>વ્યવસાય: <strong>${esc(r.tenantProfession||"—")}</strong></div>
                  <div>એગ્રીમેન્ટ: <strong>${esc(r.tenantStart||"—")} થી ${esc(r.tenantEnd||"—")}</strong></div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join("");
  } catch(e) {
    if (listEl) listEl.innerHTML = `<div style="color:var(--rosewood);padding:12px;">Error loading requests: ${esc(e.message)}</div>`;
  }
}

window.approveKycRequest = async function(reqId) {
  try {
    showToast("Processing approval and creating account…", "info");
    const reqDoc = await getDoc2(C.MEMBER_REQUESTS, reqId);
    if (!reqDoc) { showToast("Request not found", "error"); return; }

    const flat = reqDoc.flatNumber;
    const allMembers = await getAll(C.MEMBERS);
    const existing = allMembers.find(m => (m.flatNumber||"").toLowerCase().trim() === flat.toLowerCase().trim());

    const num = parseInt(flat.replace(/\D/g, ""), 10) || 1;
    const commAssigned = num <= 20 ? "Cluster 1 - Rajeshbhai Patel (1-20)" : "Cluster 2 - Sureshbhai Shah (21-40)";

    const memberPayload = {
      flatNumber: flat,
      wing: reqDoc.wing || "Main",
      ownerName: reqDoc.ownerName,
      contactNumber: reqDoc.contactNumber,
      profession: reqDoc.profession || "",
      designation: existing?.designation || "ઘર માલિક (House Owner)",
      memberType: "Owner",
      status: "Active",
      parkingSlot: `P-${flat}`,
      carNumber: reqDoc.carNumber || "",
      bikeNumber: reqDoc.bikeNumber || "",
      familyMembers: reqDoc.familyMembers || [],
      maintenanceAmount: 600,
      assignedCommittee: commAssigned,
      hasTenant: reqDoc.hasTenant || false,
      tenantName: reqDoc.tenantName || "",
      tenantContact: reqDoc.tenantContact || "",
      tenantAadhaar: reqDoc.tenantAadhaar || "",
      tenantPan: reqDoc.tenantPan || "",
      tenantProfession: reqDoc.tenantProfession || "",
      tenantRentStart: reqDoc.tenantStart || "",
      tenantRentEnd: reqDoc.tenantEnd || ""
    };

    if (existing) {
      await updateDoc2(C.MEMBERS, existing.id, memberPayload);
    } else {
      await addDoc2(C.MEMBERS, memberPayload);
    }

    await updateDoc2(C.MEMBER_REQUESTS, reqId, { status: "Approved", approvedAt: new Date().toISOString() });
    showToast(`✅ Duplex ${flat} account approved & activated! Resident can now log in.`, "success");
    await loadPendingKycRequests();
  } catch(e) {
    showToast("Approval error: " + e.message, "error");
  }
};

window.rejectKycRequest = async function(reqId) {
  if (!confirm("Are you sure you want to reject this request?")) return;
  try {
    await updateDoc2(C.MEMBER_REQUESTS, reqId, { status: "Rejected", rejectedAt: new Date().toISOString() });
    showToast("Request marked as rejected.", "info");
    await loadPendingKycRequests();
  } catch(e) {
    showToast("Error: " + e.message, "error");
  }
};

// ═══════════════════════════════════════════════════════════
//  PAGE: MEMBERS (with tenant management)
// ═══════════════════════════════════════════════════════════
async function initMembersPage() {
  initSidebar();
  let all=[],filtered=[],page=1,editId=null;
  const PS=10;

  function getDesignationBadge(role) {
    const r = role || "ઘર માલિક";
    if (r.includes("પ્રમુખ") && !r.includes("ઉપ")) return `<span class="badge badge-chairman">👑 ૧ પ્રમુખ</span>`;
    if (r.includes("ઉપ-પ્રમુખ")) return `<span class="badge badge-vice">🤝 ૧ ઉપ-પ્રમુખ</span>`;
    if (r.includes("મંત્રી")) return `<span class="badge badge-secretary">📋 ૧ મંત્રી</span>`;
    if (r.includes("ખજાનચી")) return `<span class="badge badge-treasurer">🏦 ૧ ખજાનચી</span>`;
    if (r.includes("કારોબારી")) return `<span class="badge badge-committee">🏛 ${esc(r.replace("કારોબારી સભ્ય - ",""))}</span>`;
    if (r.includes("ભાડુઆત")) return `<span class="badge badge-tenant">🔑 ભાડુઆત</span>`;
    return `<span class="badge badge-owner">🏡 ઘર માલિક</span>`;
  }

  async function load(){
    showLoader();
    try{
      all=await getAll(C.MEMBERS);
      // Auto-seed Committee Hierarchy & Sample Duplexes if collection is empty
      if(!all.length){
        const seedMembers = [
          { flatNumber: "01", wing: "Main", ownerName: "શ્રી રમેશભાઈ પટેલ", contactNumber: "9825011001", designation: "પ્રમુખ (Chairman)", memberType: "Owner", status: "Active", parkingSlot: "P-01", carNumber: "Creta - GJ06AB1001", bikeNumber: "Activa - GJ06CD1001", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "11", wing: "Main", ownerName: "શ્રી વિનોદભાઈ શાહ", contactNumber: "9825011002", designation: "ઉપ-પ્રમુખ (Vice-Chairman)", memberType: "Owner", status: "Active", parkingSlot: "P-11", carNumber: "Brezza - GJ06AB1011", bikeNumber: "Jupiter - GJ06CD1011", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "21", wing: "Main", ownerName: "શ્રી અલ્પેશભાઈ દેસાઈ", contactNumber: "9825011003", designation: "મંત્રી (Secretary)", memberType: "Owner", status: "Active", parkingSlot: "P-21", carNumber: "Baleno - GJ06AB1021", bikeNumber: "Access - GJ06CD1021", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          { flatNumber: "31", wing: "Main", ownerName: "શ્રી મુકેશભાઈ પંડ્યા", contactNumber: "9825011004", designation: "ખજાનચી (Treasurer)", memberType: "Owner", status: "Active", parkingSlot: "P-31", carNumber: "Honda City - GJ06AB1031", bikeNumber: "Splendor - GJ06CD1031", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          // 8 Executive Committee Members
          { flatNumber: "06", wing: "Main", ownerName: "શ્રી પ્રદીપભાઈ પટેલ", contactNumber: "9825011005", designation: "કારોબારી સભ્ય - પાણી પુરવઠો", memberType: "Owner", status: "Active", parkingSlot: "P-06", carNumber: "Swift - GJ06AB1006", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "14", wing: "Main", ownerName: "શ્રી હરેશભાઈ જોશી", contactNumber: "9825011006", designation: "કારોબારી સભ્ય - સિક્યુરિટી & ગેટ", memberType: "Owner", status: "Active", parkingSlot: "P-14", carNumber: "WagonR - GJ06AB1014", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "18", wing: "Main", ownerName: "શ્રી દીપકભાઈ પંચાલ", contactNumber: "9825011007", designation: "કારોબારી સભ્ય - સ્વચ્છતા & સફાઈ", memberType: "Owner", status: "Active", parkingSlot: "P-18", carNumber: "Ertiga - GJ06AB1018", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "23", wing: "Main", ownerName: "શ્રી ભાવિનભાઈ શાહ", contactNumber: "9825011008", designation: "કારોબારી સભ્ય - લાઈટો & પાવર", memberType: "Owner", status: "Active", parkingSlot: "P-23", carNumber: "i20 - GJ06AB1023", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          { flatNumber: "27", wing: "Main", ownerName: "શ્રી જીતેન્દ્રભાઈ ત્રિવેદી", contactNumber: "9825011009", designation: "કારોબારી સભ્ય - તહેવાર ઉજવણી", memberType: "Owner", status: "Active", parkingSlot: "P-27", carNumber: "Nexon - GJ06AB1027", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          { flatNumber: "34", wing: "Main", ownerName: "શ્રી સંજયભાઈ બારોટ", contactNumber: "9825011010", designation: "કારોબારી સભ્ય - પાર્કિંગ શિસ્ત", memberType: "Owner", status: "Active", parkingSlot: "P-34", carNumber: "Dzire - GJ06AB1034", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          { flatNumber: "38", wing: "Main", ownerName: "શ્રી નરેન્દ્રભાઈ રાણા", contactNumber: "9825011011", designation: "કારોબારી સભ્ય - બગીચો & પર્યાવરણ", memberType: "Owner", status: "Active", parkingSlot: "P-38", carNumber: "Amaze - GJ06AB1038", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          { flatNumber: "04", wing: "Main", ownerName: "શ્રી રાજેશભાઈ પટેલ", contactNumber: "9825012341", designation: "કારોબારી સભ્ય - ૨૦-ઘર વિવાદ ક્લસ્ટર ૧", memberType: "Owner", status: "Active", parkingSlot: "P-04", carNumber: "Innova - GJ06AB1004", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "24", wing: "Main", ownerName: "શ્રી સુરેશભાઈ શાહ", contactNumber: "9825012342", designation: "કારોબારી સભ્ય - ૨૦-ઘર વિવાદ ક્લસ્ટર ૨", memberType: "Owner", status: "Active", parkingSlot: "P-24", carNumber: "Seltos - GJ06AB1024", maintenanceAmount: 600, assignedCommittee: "Cluster 2 - Sureshbhai Shah (21-40)" },
          // Sample House Owners & Tenants
          { flatNumber: "02", wing: "Main", ownerName: "શ્રી કલ્પેશ મહેતા", contactNumber: "9825011022", designation: "ઘર માલિક (House Owner)", memberType: "Owner", status: "Active", parkingSlot: "P-02", carNumber: "Venue - GJ06AB1002", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)" },
          { flatNumber: "03", wing: "Main", ownerName: "શ્રી કૌશિક વ્યાસ", contactNumber: "9825011033", designation: "ઘર માલિક (House Owner)", memberType: "Owner", status: "Active", parkingSlot: "P-03", bikeNumber: "Activa - GJ06CD1003", maintenanceAmount: 600, assignedCommittee: "Cluster 1 - Rajeshbhai Patel (1-20)", hasTenant: true, tenantName: "રાહુલ વર્મા", tenantContact: "9825099003" }
        ];
        for(const sm of seedMembers){
          await addDoc2(C.MEMBERS, sm);
        }
        all=await getAll(C.MEMBERS);
      }
      all.sort((a,b)=>(a.flatNumber||"").localeCompare(b.flatNumber||""));
      applyFilter();
    }
    catch(e){showToast("Load failed: "+e.message,"error");}
    finally{hideLoader();}
  }

  function applyFilter(){
    const q=document.getElementById("search")?.value.toLowerCase()||"";
    const w=document.getElementById("filter-wing")?.value||"";
    const des=document.getElementById("filter-designation")?.value||"";
    const st=document.getElementById("filter-status")?.value||"";
    const ty=document.getElementById("filter-type")?.value||"";
    filtered=all.filter(m=>{
      const matchesQ=(!q||(m.flatNumber||"").toLowerCase().includes(q)||(m.ownerName||"").toLowerCase().includes(q)||(m.tenantName||"").toLowerCase().includes(q)||(m.contactNumber||"").includes(q)||(m.carNumber||"").toLowerCase().includes(q)||(m.bikeNumber||"").toLowerCase().includes(q)||(m.designation||"").toLowerCase().includes(q));
      const matchesW=(!w||m.wing===w);
      const matchesDes=(!des||(m.designation||"").includes(des));
      const matchesSt=(!st||m.status===st);
      const matchesTy=(!ty||m.memberType===ty);
      return matchesQ && matchesW && matchesDes && matchesSt && matchesTy;
    });
    document.getElementById("member-count").textContent=filtered.length;
    page=1;render(1);
  }

  function render(p){
    page=p;const rows=filtered.slice((p-1)*PS,p*PS);const tb=document.getElementById("tbody");
    if(!filtered.length){tb.innerHTML=`<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🏠</div><h3>No members found</h3><p>Click "+ Add Member" to start.</p></div></td></tr>`;makePagination(filtered,p,PS,render);return;}
    tb.innerHTML=rows.map(m=>`<tr>
      <td class="td-mono">${esc(m.flatNumber)}</td>
      <td><span class="badge badge-info">${esc(m.wing)}</span></td>
      <td>${getDesignationBadge(m.designation)}</td>
      <td class="col-dept"><strong>${esc(m.ownerName)}</strong>${m.tenantName?`<br><span style="font-size:11px;color:var(--text-muted);">🔑 Tenant: ${esc(m.tenantName)}</span>`:""}</td>
      <td>${esc(m.contactNumber)}</td>
      <td class="td-muted" style="font-size:11px;">${formatCurrency(m.maintenanceAmount||MONTHLY_FEE)}/mo</td>
      <td class="col-slot td-muted" style="font-size:11.5px;">
        ${m.parkingSlot?`<div>🅿️ ${esc(m.parkingSlot)}</div>`:""}
        ${m.carNumber?`<div style="color:var(--sage-leaf);">🚗 ${esc(m.carNumber)}</div>`:""}
        ${m.bikeNumber?`<div style="color:var(--misty-sky);">🛵 ${esc(m.bikeNumber)}</div>`:""}
        ${!m.parkingSlot&&!m.carNumber&&!m.bikeNumber?"—":""}
      </td>
      <td>${statusBadge(m.status||"Active")}</td>
      <td><div class="row-actions">
        <button class="action-btn" onclick="membEdit('${m.id}')" title="Edit">✏️</button>
        <button class="action-btn" onclick="membDel('${m.id}','${esc(m.flatNumber)}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join("");
    makePagination(filtered,p,PS,render);
  }

  window.membEdit=(id)=>{
    const m=all.find(x=>x.id===id);if(!m)return;
    editId=id;document.getElementById("modal-title").textContent="Edit Member";
    const fields=["flatNumber","wing","designation","ownerName","contactNumber","email","parkingSlot","carNumber","bikeNumber","assignedCommittee","moveInDate","memberType","status","maintenanceAmount","tenantName","tenantContact","tenantEmail","tenantAadhar","tenantPan","tenantJob","tenantFamilyCount","tenantRentStart","tenantRentEnd","tenantPin"];
    fields.forEach(k=>{const el=document.getElementById(k);if(el)el.value=m[k]||"";});
    const tenantRentEl=document.getElementById("tenantRent");if(tenantRentEl)tenantRentEl.value=m.tenantRent||"";
    const hasTenantCb=document.getElementById("hasTenant");
    if(hasTenantCb)hasTenantCb.checked=!!(m.hasTenant||m.tenantName);
    toggleTenantSection();
    document.getElementById("modal").classList.remove("hidden");
  };
  window.membDel=async(id,flat)=>{
    if(!confirm(`Delete member in flat ${flat}?`))return;
    try{await deleteDoc2(C.MEMBERS,id);showToast("Deleted","success");await load();}
    catch(e){showToast("Delete failed: "+e.message,"error");}
  };

  function toggleTenantSection(){
    const hasTenantCb=document.getElementById("hasTenant");
    const tenantSec=document.getElementById("tenant-section");
    if(tenantSec) tenantSec.style.display=(hasTenantCb?.checked)?"block":"none";
  }

  ["search","filter-wing","filter-designation","filter-status","filter-type"].forEach(id=>
    document.getElementById(id)?.addEventListener(id==="search"?"input":"change",debounce(applyFilter,250)));

  document.getElementById("memberType")?.addEventListener("change",toggleTenantSection);
  document.getElementById("hasTenant")?.addEventListener("change",toggleTenantSection);

  document.getElementById("btn-add-member")?.addEventListener("click",()=>{
    editId=null;document.getElementById("member-form")?.reset();
    document.getElementById("modal-title").textContent="Add Member";
    document.getElementById("maintenanceAmount").value=MONTHLY_FEE;
    if(document.getElementById("designation"))document.getElementById("designation").value="ઘર માલિક (House Owner)";
    if(document.getElementById("tenant-section"))document.getElementById("tenant-section").style.display="none";
    document.getElementById("modal").classList.remove("hidden");
  });
  document.getElementById("modal-close")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-cancel")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));

  document.getElementById("btn-save-member")?.addEventListener("click",async()=>{
    const req=["flatNumber","wing","ownerName","contactNumber"];
    let ok=true;
    req.forEach(f=>{if(!document.getElementById(f)?.value.trim()){showToast(f+" is required","error");ok=false;}});
    if(!ok)return;
    const data={
      flatNumber:document.getElementById("flatNumber").value.trim(),
      wing:document.getElementById("wing").value,
      designation:document.getElementById("designation")?.value||"ઘર માલિક (House Owner)",
      ownerName:document.getElementById("ownerName").value.trim(),
      contactNumber:document.getElementById("contactNumber").value.trim(),
      email:document.getElementById("email")?.value.trim()||"",
      parkingSlot:document.getElementById("parkingSlot")?.value.trim()||"",
      carNumber:document.getElementById("carNumber")?.value.trim()||"",
      bikeNumber:document.getElementById("bikeNumber")?.value.trim()||"",
      assignedCommittee:document.getElementById("assignedCommittee")?.value||"",
      moveInDate:document.getElementById("moveInDate")?.value||"",
      memberType:document.getElementById("memberType")?.value||"Owner",
      status:document.getElementById("status")?.value||"Active",
      maintenanceAmount:parseFloat(document.getElementById("maintenanceAmount")?.value)||MONTHLY_FEE,
      // Tenant info
      hasTenant:document.getElementById("hasTenant")?.checked||false,
      tenantName:document.getElementById("tenantName")?.value.trim()||"",
      tenantContact:document.getElementById("tenantContact")?.value.trim()||"",
      tenantEmail:document.getElementById("tenantEmail")?.value.trim()||"",
      tenantAadhar:document.getElementById("tenantAadhar")?.value.trim()||"",
      tenantPan:document.getElementById("tenantPan")?.value.trim()||"",
      tenantJob:document.getElementById("tenantJob")?.value.trim()||"",
      tenantFamilyCount:parseInt(document.getElementById("tenantFamilyCount")?.value)||0,
      tenantRentStart:document.getElementById("tenantRentStart")?.value||"",
      tenantRentEnd:document.getElementById("tenantRentEnd")?.value||"",
      tenantRent:parseFloat(document.getElementById("tenantRent")?.value)||0,
      tenantPin:document.getElementById("tenantPin")?.value.trim()||""
    };
    try{
      if(editId){await updateDoc2(C.MEMBERS,editId,data);showToast("Updated!","success");}
      else{await addDoc2(C.MEMBERS,data);showToast("Member added!","success");}
      document.getElementById("modal").classList.add("hidden");
      document.getElementById("member-form")?.reset();editId=null;await load();
    }catch(e){showToast("Save failed: "+e.message,"error");}
  });

  document.getElementById("btn-export-members")?.addEventListener("click",()=>{
    exportExcel(all,"Member Directory",
      ["Flat","Wing","Designation","Owner Name","Contact","Email","Parking","Type","Status","Maint/Month","Tenant Name","Tenant Contact","Rent Start","Rent End"],
      ["flatNumber","wing","designation","ownerName","contactNumber","email","parkingSlot","memberType","status","maintenanceAmount","tenantName","tenantContact","tenantRentStart","tenantRentEnd"],
      [10,8,22,22,14,26,10,10,10,14,22,14,13,13]);
    showToast("Exported!","success");
  });

  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: MAINTENANCE BILLS (with checkboxes + print)
// ═══════════════════════════════════════════════════════════
async function initMaintenancePage() {
  initSidebar();
  let all=[],filtered=[],page=1;
  const PS=10;

  async function load(){
    showLoader();
    try{
      all=await getAll(C.MAINT_BILLS);
      all.sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
      const periods=[...new Set(all.map(b=>b.period).filter(Boolean))];
      const pf=document.getElementById("filter-period");
      if(pf)pf.innerHTML='<option value="">All Periods</option>'+periods.map(p=>`<option>${esc(p)}</option>`).join("");
      applyFilter();
    }catch(e){showToast("Load failed: "+e.message,"error");}
    finally{hideLoader();}
  }

  function applyFilter(){
    const q=document.getElementById("search")?.value.toLowerCase()||"";
    const pe=document.getElementById("filter-period")?.value||"";
    const st=document.getElementById("filter-status")?.value||"";
    const wi=document.getElementById("filter-wing")?.value||"";
    filtered=all.filter(b=>(!q||(b.billNumber||"").toLowerCase().includes(q)||(b.flatNumber||"").toLowerCase().includes(q)||(b.memberName||"").toLowerCase().includes(q))&&(!pe||b.period===pe)&&(!st||b.status===st)&&(!wi||b.wing===wi));
    document.getElementById("bill-count").textContent=filtered.length;
    page=1;render(1);
    updateBulkBar();
  }

  function render(p){
    page=p;const rows=filtered.slice((p-1)*PS,p*PS);const tb=document.getElementById("tbody");
    if(!filtered.length){tb.innerHTML=`<tr><td colspan="12"><div class="empty-state"><div class="empty-icon">🧾</div><h3>No bills found</h3><p>Use Bulk Generate or + Single Bill.</p></div></td></tr>`;makePagination(filtered,p,PS,render);return;}
    tb.innerHTML=rows.map(b=>`<tr>
      <td><input type="checkbox" class="bill-cb" data-id="${b.id}" onchange="updateBulkBar()"/></td>
      <td class="td-mono">${esc(b.billNumber)}</td>
      <td>${esc(b.period)}</td>
      <td class="td-mono">${esc(b.flatNumber)}</td>
      <td><span class="badge badge-info">${esc(b.wing)}</span></td>
      <td>${esc(b.memberName)}</td>
      <td class="td-amount">${formatCurrency(b.maintenanceAmount)}</td>
      <td class="td-muted">${formatCurrency(b.lateFee||0)}</td>
      <td class="td-amount">${formatCurrency(b.totalAmount)}</td>
      <td class="td-muted">${esc(b.dueDate)}</td>
      <td>${statusBadge(b.status)}</td>
      <td><div class="row-actions">
        <button class="action-btn" onclick="billPrint('${b.id}')" title="Print">🖨</button>
        <button class="action-btn" onclick="billPay('${b.id}')" title="Mark Paid">✅</button>
        <button class="action-btn" onclick="billDL('${b.id}')" title="Excel">📥</button>
        <button class="action-btn" onclick="billDel('${b.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join("");
    makePagination(filtered,p,PS,render);
  }

  function updateBulkBar(){
    const selected=document.querySelectorAll('.bill-cb:checked');
    const bar=document.getElementById("bulk-action-bar");
    const cnt=document.getElementById("bulk-selected-count");
    if(bar)bar.style.display=selected.length>0?"flex":"none";
    if(cnt)cnt.textContent=selected.length;
  }

  window.billPrint=(id)=>{ const b=all.find(x=>x.id===id); if(b&&window.openPrintModal)openPrintModal([b]); };
  window.billPay=async(id)=>{if(!confirm("Mark as Paid?"))return;try{await updateDoc2(C.MAINT_BILLS,id,{status:"Paid"});showToast("Marked Paid!","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};
  window.billDL=(id)=>{const b=all.find(x=>x.id===id);if(b){exportExcel([b],"Receipt — "+b.billNumber,["Bill No","Period","Flat","Wing","Member","Amount","Late Fee","Total","Due Date","Status"],["billNumber","period","flatNumber","wing","memberName","maintenanceAmount","lateFee","totalAmount","dueDate","status"],[18,16,10,8,22,16,10,12,14,12]);showToast("Downloaded!","success");}};
  window.billDel=async(id)=>{if(!confirm("Delete this bill?"))return;try{await deleteDoc2(C.MAINT_BILLS,id);showToast("Deleted","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};

  // Bulk print selected
  document.getElementById("btn-bulk-print")?.addEventListener("click",()=>{
    const ids=[...document.querySelectorAll('.bill-cb:checked')].map(cb=>cb.dataset.id);
    const selectedBills=all.filter(b=>ids.includes(b.id));
    if(window.openPrintModal)openPrintModal(selectedBills);
  });
  document.getElementById("btn-bulk-paid")?.addEventListener("click",async()=>{
    const ids=[...document.querySelectorAll('.bill-cb:checked')].map(cb=>cb.dataset.id);
    if(!ids.length||!confirm(`Mark ${ids.length} bills as paid?`))return;
    try{for(const id of ids){await updateDoc2(C.MAINT_BILLS,id,{status:"Paid"});}showToast(`${ids.length} bills marked paid!`,"success");await load();}
    catch(e){showToast("Error: "+e.message,"error");}
  });
  document.getElementById("btn-select-all")?.addEventListener("click",()=>{
    const cbs=document.querySelectorAll('.bill-cb');
    const anyUnchecked=[...cbs].some(cb=>!cb.checked);
    cbs.forEach(cb=>cb.checked=anyUnchecked);
    updateBulkBar();
  });

  ["search","filter-period","filter-status","filter-wing"].forEach(id=>
    document.getElementById(id)?.addEventListener(id==="search"?"input":"change",debounce(applyFilter,250)));

  // Add Single Bill
  document.getElementById("btn-add-bill")?.addEventListener("click",async()=>{
    try{
      document.getElementById("billNumber").value=await getNextMaintenanceBillNo();
      document.getElementById("maintenanceAmount").value=MONTHLY_FEE;
      const dd=new Date();dd.setDate(10);
      document.getElementById("dueDate").value=dd.toISOString().split("T")[0];
      document.getElementById("modal").classList.remove("hidden");
    }catch(e){showToast("Could not open form: "+e.message,"error");}
  });
  document.getElementById("modal-close")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-cancel")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-save")?.addEventListener("click",async()=>{
    const maint=parseFloat(document.getElementById("maintenanceAmount").value)||0;
    const late=parseFloat(document.getElementById("lateFee").value)||0;
    const periodISO=document.getElementById("period").value;
    const periodLabel=periodISO?(new Date(periodISO+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"})):"";
    const data={billNumber:document.getElementById("billNumber").value,period:periodLabel,flatNumber:document.getElementById("flatNumber").value.trim(),wing:document.getElementById("wing").value,memberName:document.getElementById("memberName").value.trim(),contactNumber:document.getElementById("contactNumber")?.value.trim()||"",maintenanceAmount:maint,lateFee:late,totalAmount:maint+late,dueDate:document.getElementById("dueDate").value,status:document.getElementById("billStatus").value};
    if(!data.flatNumber||!data.memberName||!data.maintenanceAmount||!data.dueDate){showToast("Fill required fields","error");return;}
    try{await addDoc2(C.MAINT_BILLS,data);showToast("Bill created!","success");document.getElementById("modal").classList.add("hidden");await load();}
    catch(e){showToast("Save failed: "+e.message,"error");}
  });

  // Bulk Generate
  document.getElementById("btn-bulk-generate")?.addEventListener("click",()=>{
    const p=document.getElementById("bulk-panel");
    if(p){p.style.display=p.style.display==="none"?"block":"none";}
    if(!document.getElementById("bulk-period").value)document.getElementById("bulk-period").value=new Date().toISOString().slice(0,7);
    const dd=new Date();dd.setDate(10);
    if(!document.getElementById("bulk-due-date").value)document.getElementById("bulk-due-date").value=dd.toISOString().split("T")[0];
    document.getElementById("bulk-maint-amt").value=MONTHLY_FEE;
  });
  document.getElementById("btn-close-bulk")?.addEventListener("click",()=>{const p=document.getElementById("bulk-panel");if(p)p.style.display="none";});
  document.getElementById("btn-do-bulk")?.addEventListener("click",async()=>{
    const periodISO=document.getElementById("bulk-period").value;
    const dueDate=document.getElementById("bulk-due-date").value;
    const lateFee=parseFloat(document.getElementById("bulk-late-fee").value)||0;
    const maintAmt=parseFloat(document.getElementById("bulk-maint-amt").value)||MONTHLY_FEE;
    if(!periodISO||!dueDate){showToast("Select period and due date","error");return;}
    const periodLabel=new Date(periodISO+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    showToast("Generating bills…","info");
    try{
      const members=await getAll(C.MEMBERS);
      const active=members.filter(m=>m.status==="Active"||!m.status);
      if(!active.length){showToast("No active members found","warning");return;}
      const existingBills=await getAll(C.MAINT_BILLS);
      const existingFlats=new Set(existingBills.filter(b=>b.period===periodLabel).map(b=>b.flatNumber));
      let created=0;
      for(const m of active){
        if(existingFlats.has(m.flatNumber))continue;
        const billNumber=await getNextMaintenanceBillNo();
        const maint=parseFloat(m.maintenanceAmount)||maintAmt;
        await addDoc2(C.MAINT_BILLS,{billNumber,period:periodLabel,flatNumber:m.flatNumber,wing:m.wing||"",memberName:m.ownerName,contactNumber:m.contactNumber||"",maintenanceAmount:maint,lateFee,totalAmount:maint+lateFee,dueDate,status:"Pending"});
        created++;
      }
      const res=document.getElementById("bulk-result");
      if(res){res.style.display="block";res.textContent=`✅ Generated ${created} bills for ${periodLabel}. (${active.length-created} already existed).`;}
      showToast(`${created} bills generated!`,"success",5000);
      await load();
    }catch(e){showToast("Bulk generate failed: "+e.message,"error");}
  });

  // Print all filtered
  document.getElementById("btn-print-all")?.addEventListener("click",()=>{
    if(!filtered.length){showToast("No bills to print","warning");return;}
    if(window.openPrintModal)openPrintModal(filtered);
  });
  document.getElementById("btn-export-all")?.addEventListener("click",()=>{
    exportExcel(filtered,"Maintenance Bills",["Bill No","Period","Flat","Wing","Member","Amount","Late Fee","Total","Due Date","Status"],["billNumber","period","flatNumber","wing","memberName","maintenanceAmount","lateFee","totalAmount","dueDate","status"],[18,16,10,8,22,16,10,12,14,12]);
    showToast("Exported!","success");
  });
  document.getElementById("btn-export-defaulters")?.addEventListener("click",()=>{
    const def=all.filter(b=>b.status==="Pending"||b.status==="Overdue");
    exportExcel(def,"Defaulter List",["Flat","Wing","Member","Period","Amount","Late Fee","Total","Status","Due Date"],["flatNumber","wing","memberName","period","maintenanceAmount","lateFee","totalAmount","status","dueDate"],[10,8,22,16,12,10,12,10,13]);
    showToast(`${def.length} defaulters exported!`,"success");
  });

  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: PAYMENTS (with advance payment support)
// ═══════════════════════════════════════════════════════════
async function initPaymentsPage() {
  initSidebar();
  let all=[],filtered=[],page=1;const PS=10;

  async function load(){
    showLoader();
    try{all=await getAll(C.PAYMENTS);all.sort((a,b)=>(b.paymentDate||"").localeCompare(a.paymentDate||""));updateStats();applyFilter();}
    catch(e){showToast("Load failed: "+e.message,"error");}
    finally{hideLoader();}
  }

  function updateStats(){
    const tm=new Date().toISOString().slice(0,7),ty=new Date().toISOString().slice(0,4);
    const mAmt=all.filter(p=>(p.paymentDate||"").startsWith(tm)).reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    const yAmt=all.filter(p=>(p.paymentDate||"").startsWith(ty)).reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    const advAmt=all.filter(p=>p.paymentType==="Advance").reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    const se=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    se("s-month",formatCurrency(mAmt));se("s-year",formatCurrency(yAmt));
    se("s-total",all.length);se("s-advance",formatCurrency(advAmt));
  }

  function applyFilter(){
    const q=document.getElementById("search")?.value.toLowerCase()||"";
    const mo=document.getElementById("filter-month")?.value||"";
    const md=document.getElementById("filter-mode")?.value||"";
    const ty=document.getElementById("filter-type")?.value||"";
    filtered=all.filter(p=>(!q||(p.paymentId||"").toLowerCase().includes(q)||(p.flatNumber||"").toLowerCase().includes(q)||(p.memberName||"").toLowerCase().includes(q))&&(!mo||(p.paymentDate||"").startsWith(mo))&&(!md||p.paymentMode===md)&&(!ty||p.paymentType===ty));
    document.getElementById("pay-count").textContent=filtered.length;
    page=1;render(1);
  }

  function render(p){
    page=p;const rows=filtered.slice((p-1)*PS,p*PS);const tb=document.getElementById("tbody");
    if(!filtered.length){tb.innerHTML=`<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">💳</div><h3>No payments found</h3></div></td></tr>`;makePagination(filtered,p,PS,render);return;}
    tb.innerHTML=rows.map(py=>`<tr>
      <td class="td-mono">${esc(py.paymentId)}</td>
      <td class="td-muted">${esc(py.paymentDate)}</td>
      <td class="td-mono">${esc(py.flatNumber)}</td>
      <td>${esc(py.memberName)}</td>
      <td class="td-amount">${formatCurrency(py.amount)}</td>
      <td><span class="badge badge-success">${esc(py.paymentMode||"Cash")}</span></td>
      <td>${py.paymentType==="Advance"?'<span class="badge badge-info">Advance</span>':py.paymentType==="Advance-Annual"?'<span class="badge badge-info">Annual Advance</span>':py.paymentType==="Advance-HalfYear"?'<span class="badge badge-info">6-Month Advance</span>':'<span class="badge badge-muted">Regular</span>'}</td>
      <td class="col-dept td-muted">${esc(py.referenceNumber||"—")}</td>
      <td class="col-dept td-muted">${esc(py.collectedBy||"—")}</td>
      <td><button class="action-btn" onclick="payDel('${py.id}')" title="Delete">🗑</button></td>
    </tr>`).join("");
    makePagination(filtered,p,PS,render);
  }

  window.payDel=async(id)=>{if(!confirm("Delete this payment?"))return;try{await deleteDoc2(C.PAYMENTS,id);showToast("Deleted","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};

  ["search","filter-month","filter-mode","filter-type"].forEach(id=>
    document.getElementById(id)?.addEventListener(id==="search"?"input":"change",debounce(applyFilter,250)));

  // Quick amount buttons
  document.getElementById("btn-amt-monthly")?.addEventListener("click",()=>{document.getElementById("amount").value=MONTHLY_FEE;});
  document.getElementById("btn-amt-6m")?.addEventListener("click",()=>{document.getElementById("amount").value=SIX_MONTH_FEE;document.getElementById("paymentType").value="Advance-HalfYear";});
  document.getElementById("btn-amt-annual")?.addEventListener("click",()=>{document.getElementById("amount").value=ANNUAL_FEE;document.getElementById("paymentType").value="Advance-Annual";});

  document.getElementById("btn-add")?.addEventListener("click",async()=>{
    try{
      document.getElementById("paymentId").value=await getNextPaymentNo();
      document.getElementById("paymentDate").value=todayISO();
      document.getElementById("modal").classList.remove("hidden");
    }catch(e){showToast("Could not open form: "+e.message,"error");}
  });
  document.getElementById("modal-close")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-cancel")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-save")?.addEventListener("click",async()=>{
    const data={paymentId:document.getElementById("paymentId").value,billNumber:document.getElementById("billNumber")?.value.trim()||"",flatNumber:document.getElementById("flatNumber").value.trim(),memberName:document.getElementById("memberName").value.trim(),amount:parseFloat(document.getElementById("amount").value)||0,paymentDate:document.getElementById("paymentDate").value,paymentMode:document.getElementById("paymentMode").value,paymentType:document.getElementById("paymentType")?.value||"Regular",referenceNumber:document.getElementById("referenceNumber")?.value.trim()||"",collectedBy:document.getElementById("collectedBy")?.value.trim()||"",remarks:document.getElementById("remarks")?.value.trim()||""};
    if(!data.flatNumber||!data.memberName||!data.amount||!data.paymentDate){showToast("Fill required fields","error");return;}
    // If annual or 6m advance, mark bill numbers if any
    try{await addDoc2(C.PAYMENTS,data);showToast("Payment recorded! ✅","success");document.getElementById("modal").classList.add("hidden");await load();}
    catch(e){showToast("Save failed: "+e.message,"error");}
  });

  document.getElementById("btn-export")?.addEventListener("click",()=>{
    exportExcel(filtered,"Payment Register",["Payment ID","Bill No","Flat","Member","Amount","Date","Mode","Type","Reference","Collected By"],["paymentId","billNumber","flatNumber","memberName","amount","paymentDate","paymentMode","paymentType","referenceNumber","collectedBy"],[16,18,10,22,12,14,16,16,18,18]);
    showToast("Exported!","success");
  });
  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: EXPENSES
// ═══════════════════════════════════════════════════════════
async function initExpensesPage() {
  initSidebar();
  let all=[],filtered=[],page=1,editId=null;const PS=10;

  async function load(){
    showLoader();
    try{
      all=await getAll(C.EXPENSES);
      if(!all.length){
        const seedExpenses = [
          { expenseId: "SDEXP-2026-0001", date: todayISO(), category: "Security / Guard Salary", description: "સિક્યુરિટી ગાર્ડ ૨૪×૭ માસિક સેવા વળતર (૨ ગાર્ડ્સ)", amount: 16000, vendorName: "શિવ શક્તિ સિક્યુરિટી સર્વિસ", paymentMode: "Bank Transfer", status: "Paid", approvedBy: "પ્રમુખ - રમેશભાઈ પટેલ" },
          { expenseId: "SDEXP-2026-0002", date: todayISO(), category: "Electricity", description: "સોસાયટી કોમન ૧૬ સ્ટ્રીટ લાઈટ્સ & બોરવેલ એમજીવીસીએલ બિલ", amount: 4850, vendorName: "MGVCL Vadodara", paymentMode: "UPI", status: "Paid", approvedBy: "ખજાનચી - મુકેશભાઈ પંડ્યા" },
          { expenseId: "SDEXP-2026-0003", date: todayISO(), category: "Water Charges", description: "પાણી બોરવેલ સમર્સિબલ પંપ સર્વિસિંગ & ફિલ્ટરિંગ", amount: 3200, vendorName: "જય અંબે બોરવેલ રીપેરિંગ", paymentMode: "Cash", status: "Paid", approvedBy: "પાણી ઇન્ચાર્જ - પ્રદીપભાઈ પટેલ" },
          { expenseId: "SDEXP-2026-0004", date: todayISO(), category: "Cleaning & Housekeeping", description: "સોસાયટી સામાન્ય શેરીઓ, ગટર અને કચરા નિકાલ સફાઈ", amount: 2600, vendorName: "મારુતિ ક્લીનિંગ સર્વિસ", paymentMode: "Cash", status: "Paid", approvedBy: "સફાઈ ઇન્ચાર્જ - દીપકભાઈ પંચાલ" },
          { expenseId: "SDEXP-2026-0005", date: todayISO(), category: "Gardening", description: "સેન્ટ્રલ પાર્ક બગીચો ઘાસ કટીંગ અને છોડ ખાતર", amount: 1500, vendorName: "ગ્રીન નર્સરી વડોદરા", paymentMode: "Cash", status: "Paid", approvedBy: "બગીચો ઇન્ચાર્જ - નરેન્દ્રભાઈ રાણા" }
        ];
        for(const se of seedExpenses){
          await addDoc2(C.EXPENSES, se);
        }
        all=await getAll(C.EXPENSES);
      }
      all.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
      updateStats();
      applyFilter();
    }
    catch(e){showToast("Load failed: "+e.message,"error");}
    finally{hideLoader();}
  }

  function updateStats(){
    const tm=new Date().toISOString().slice(0,7),ty=new Date().toISOString().slice(0,4);
    const mE=all.filter(e=>(e.date||"").startsWith(tm)).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    const yE=all.filter(e=>(e.date||"").startsWith(ty)).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    const cats={};all.forEach(e=>{cats[e.category]=(cats[e.category]||0)+(parseFloat(e.amount)||0);});
    const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
    const se=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    se("s-month",formatCurrency(mE));se("s-year",formatCurrency(yE));
    se("s-total",all.length);se("s-top",top?top[0]:"—");
  }

  function applyFilter(){
    const q=document.getElementById("search")?.value.toLowerCase()||"";
    const cat=document.getElementById("filter-cat")?.value||"";
    const mo=document.getElementById("filter-month")?.value||"";
    const st=document.getElementById("filter-status")?.value||"";
    filtered=all.filter(e=>(!q||(e.description||"").toLowerCase().includes(q)||(e.vendorName||"").toLowerCase().includes(q)||(e.expenseId||"").toLowerCase().includes(q))&&(!cat||e.category===cat)&&(!mo||(e.date||"").startsWith(mo))&&(!st||e.status===st));
    document.getElementById("exp-count").textContent=filtered.length;
    page=1;render(1);
  }

  function render(p){
    page=p;const rows=filtered.slice((p-1)*PS,p*PS);const tb=document.getElementById("tbody");
    if(!filtered.length){tb.innerHTML=`<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">💸</div><h3>No expenses found</h3></div></td></tr>`;makePagination(filtered,p,PS,render);return;}
    tb.innerHTML=rows.map(e=>`<tr>
      <td class="td-mono">${esc(e.expenseId)}</td><td class="td-muted">${esc(e.date)}</td>
      <td><span class="badge badge-info">${esc(e.category)}</span></td>
      <td class="td-name">${esc(e.description)}</td>
      <td class="col-dept td-muted">${esc(e.vendorName||"—")}</td>
      <td class="td-amount">${formatCurrency(e.amount)}</td>
      <td class="col-email td-muted">${esc(e.paymentMode||"—")}</td>
      <td>${statusBadge(e.status||"Paid")}</td>
      <td><div class="row-actions">
        <button class="action-btn" onclick="expEdit('${e.id}')" title="Edit">✏️</button>
        <button class="action-btn" onclick="expDel('${e.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join("");
    makePagination(filtered,p,PS,render);
  }

  window.expEdit=(id)=>{
    const e=all.find(x=>x.id===id);if(!e)return;
    editId=id;document.getElementById("modal-title").textContent="Edit Expense";
    ["expenseId","date","category","description","vendorName","paymentMode","invoiceNumber","approvedBy","remarks"].forEach(k=>{const el=document.getElementById(k);if(el)el.value=e[k]||"";});
    document.getElementById("amount").value=e.amount||"";
    document.getElementById("expStatus").value=e.status||"Paid";
    document.getElementById("modal").classList.remove("hidden");
  };
  window.expDel=async(id)=>{if(!confirm("Delete?"))return;try{await deleteDoc2(C.EXPENSES,id);showToast("Deleted","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};

  ["search","filter-cat","filter-month","filter-status"].forEach(id=>
    document.getElementById(id)?.addEventListener(id==="search"?"input":"change",debounce(applyFilter,250)));

  document.getElementById("btn-add")?.addEventListener("click",async()=>{
    editId=null;document.getElementById("modal-title").textContent="Add Expense";
    document.getElementById("modal")?.querySelectorAll("input,select,textarea").forEach(el=>{if(el.type!=="hidden")el.value="";});
    try{document.getElementById("expenseId").value=await getNextExpenseNo();}catch(e){}
    document.getElementById("date").value=todayISO();
    document.getElementById("modal").classList.remove("hidden");
  });
  document.getElementById("modal-close")?.addEventListener("click",()=>{document.getElementById("modal").classList.add("hidden");editId=null;});
  document.getElementById("btn-cancel")?.addEventListener("click",()=>{document.getElementById("modal").classList.add("hidden");editId=null;});
  document.getElementById("btn-save")?.addEventListener("click",async()=>{
    const data={expenseId:document.getElementById("expenseId").value,date:document.getElementById("date").value,category:document.getElementById("category").value,description:document.getElementById("description").value.trim(),amount:parseFloat(document.getElementById("amount").value)||0,vendorName:document.getElementById("vendorName")?.value.trim()||"",paymentMode:document.getElementById("paymentMode")?.value||"Cash",invoiceNumber:document.getElementById("invoiceNumber")?.value.trim()||"",approvedBy:document.getElementById("approvedBy")?.value.trim()||"",status:document.getElementById("expStatus")?.value||"Paid",remarks:document.getElementById("remarks")?.value.trim()||""};
    if(!data.category||!data.description||!data.amount||!data.date){showToast("Fill required fields","error");return;}
    try{
      if(editId){await updateDoc2(C.EXPENSES,editId,data);showToast("Updated!","success");}
      else{await addDoc2(C.EXPENSES,data);showToast("Expense added!","success");}
      document.getElementById("modal").classList.add("hidden");editId=null;await load();
    }catch(e){showToast("Save failed: "+e.message,"error");}
  });
  document.getElementById("btn-export")?.addEventListener("click",()=>{exportExcel(filtered,"Expense Register",["ID","Date","Category","Description","Vendor","Amount","Mode","Invoice","Approved By","Status"],["expenseId","date","category","description","vendorName","amount","paymentMode","invoiceNumber","approvedBy","status"],[16,13,18,28,22,12,14,14,16,10]);showToast("Exported!","success");});
  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: FUNDS
// ═══════════════════════════════════════════════════════════
async function initFundsPage() {
  initSidebar();
  let all=[],filtered=[],page=1;const PS=10;

  async function load(){
    showLoader();
    try{
      all=await getAll(C.FUNDS);
      if(!all.length){
        const seedFunds = [
          { date: todayISO(), fundType: "Reserve Fund (અનામત ફંડ)", transactionType: "Credit", description: "સોસાયટી કાયમી અનામત ભંડોળ બેંક એફડી (Reserve Fund)", amount: 50000, reference: "SBI-FD-78491", balance: 50000 },
          { date: todayISO(), fundType: "Sinking Fund (ઘસારા ફંડ)", transactionType: "Credit", description: "મકાન ઘસારા ફંડ બચત (Sinking Fund Account)", amount: 25000, reference: "SBI-SNK-2026", balance: 75000 },
          { date: todayISO(), fundType: "Maintenance Fund", transactionType: "Credit", description: "ચાલુ માસની માસિક મેઈન્ટેનન્સ રકમ જમા", amount: 24000, reference: "SD-COLL-0926", balance: 99000 },
          { date: todayISO(), fundType: "Maintenance Fund", transactionType: "Debit", description: "સિક્યુરિટી ગાર્ડ અને લાઈટબિલ ચૂકવણી", amount: 16000, reference: "SDEXP-2026-0001", balance: 83000 }
        ];
        for(const sf of seedFunds){
          await addDoc2(C.FUNDS, sf);
        }
        all=await getAll(C.FUNDS);
      }
      all.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
      updateStats();
      applyFilter();
    }
    catch(e){showToast("Load failed: "+e.message,"error");}
    finally{hideLoader();}
  }

  function updateStats(){
    const cr=all.filter(t=>t.transactionType==="Credit").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
    const db2=all.filter(t=>t.transactionType==="Debit").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
    const bal=cr-db2;
    const se=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    se("s-credits",formatCurrency(cr));se("s-debits",formatCurrency(db2));
    se("s-balance",formatCurrency(Math.abs(bal)));se("s-total",all.length);
    const sl=document.getElementById("s-bal-label");if(sl){sl.textContent=bal>=0?"✅ Surplus":"⚠️ Deficit";sl.className="stat-sub "+(bal>=0?"positive":"negative");}
  }

  function applyFilter(){
    const q=document.getElementById("search")?.value.toLowerCase()||"";
    const fu=document.getElementById("filter-fund")?.value||"";
    const ty=document.getElementById("filter-type")?.value||"";
    const mo=document.getElementById("filter-month")?.value||"";
    filtered=all.filter(t=>(!q||(t.description||"").toLowerCase().includes(q)||(t.fundType||"").toLowerCase().includes(q))&&(!fu||t.fundType===fu)&&(!ty||t.transactionType===ty)&&(!mo||(t.date||"").startsWith(mo)));
    document.getElementById("fund-count").textContent=filtered.length;
    page=1;render(1);
  }

  function render(p){
    page=p;const rows=filtered.slice((p-1)*PS,p*PS);const tb=document.getElementById("tbody");
    if(!filtered.length){tb.innerHTML=`<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏦</div><h3>No transactions</h3></div></td></tr>`;makePagination(filtered,p,PS,render);return;}
    tb.innerHTML=rows.map(t=>`<tr>
      <td class="td-muted">${esc(t.date)}</td>
      <td><span class="badge badge-info">${esc(t.fundType)}</span></td>
      <td><span class="badge ${t.transactionType==="Credit"?"badge-success":"badge-danger"}">${esc(t.transactionType)}</span></td>
      <td class="td-name">${esc(t.description)}</td>
      <td class="td-amount" style="color:${t.transactionType==="Credit"?"var(--success)":"var(--danger)"};">${t.transactionType==="Credit"?"+":"-"}${formatCurrency(t.amount)}</td>
      <td class="col-dept td-muted">${esc(t.reference||"—")}</td>
      <td class="td-amount">${formatCurrency(t.balance||0)}</td>
      <td><button class="action-btn" onclick="fundDel('${t.id}')" title="Delete">🗑</button></td>
    </tr>`).join("");
    makePagination(filtered,p,PS,render);
  }

  window.fundDel=async(id)=>{if(!confirm("Delete transaction?"))return;try{await deleteDoc2(C.FUNDS,id);showToast("Deleted","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};

  ["search","filter-fund","filter-type","filter-month"].forEach(id=>
    document.getElementById(id)?.addEventListener(id==="search"?"input":"change",debounce(applyFilter,250)));

  document.getElementById("btn-add")?.addEventListener("click",()=>{
    document.getElementById("date").value=todayISO();
    document.getElementById("modal").classList.remove("hidden");
  });
  document.getElementById("modal-close")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-cancel")?.addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-save")?.addEventListener("click",async()=>{
    const cr=all.filter(t=>t.transactionType==="Credit").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
    const db3=all.filter(t=>t.transactionType==="Debit").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
    const amt=parseFloat(document.getElementById("amount").value)||0;
    const tt=document.getElementById("transactionType").value;
    const data={date:document.getElementById("date").value,fundType:document.getElementById("fundType").value,transactionType:tt,amount:amt,description:document.getElementById("description").value.trim(),reference:document.getElementById("reference")?.value.trim()||"",balance:tt==="Credit"?(cr+amt-db3):(cr-db3-amt)};
    if(!data.date||!data.fundType||!data.transactionType||!data.amount||!data.description){showToast("Fill all required fields","error");return;}
    try{await addDoc2(C.FUNDS,data);showToast("Transaction recorded!","success");document.getElementById("modal").classList.add("hidden");await load();}
    catch(e){showToast("Save failed: "+e.message,"error");}
  });
  document.getElementById("btn-export")?.addEventListener("click",()=>{exportExcel(filtered,"Fund Ledger",["Date","Fund Type","Transaction","Description","Amount","Reference","Balance"],["date","fundType","transactionType","description","amount","reference","balance"],[13,20,14,30,14,20,16]);showToast("Ledger exported!","success");});
  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: EVENTS & FESTIVAL HUB (Ganesh Utsav Ledger)
// ═══════════════════════════════════════════════════════════
async function initEventsPage() {
  initSidebar();
  let allEvents=[], allContribs=[], allSchedules=[], allEvtExpenses=[];
  let editEvtId=null, editContribId=null, editSchedId=null, editEeId=null;

  // Tab switching
  document.querySelectorAll('.evt-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.evt-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.evt-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if(target) target.classList.add('active');
    });
  });

  async function loadAll(){
    const loader=document.getElementById("loader");if(loader)loader.style.display="flex";
    try {
      [allEvents, allContribs, allSchedules, allEvtExpenses] = await Promise.all([
        getAll(C.EVENTS), getAll(C.CONTRIBS), getAll(C.SCHEDULES), getAll(C.EVT_EXPENSES)
      ]);

      // Seed Ganesh Utsav data if empty
      if(!allEvents.length) {
        const defaultEvt = {
          eventName: "Shri Ganesh Mahotsav 2026",
          startDate: todayISO(),
          endDate: new Date(Date.now() + 10*86400000).toISOString().slice(0,10),
          venue: "Society Central Garden & Clubhouse",
          organizedBy: "Shivam Duplex Youth & Committee",
          estimatedBudget: 50000,
          actualExpenses: 36200,
          contributions: 48500,
          status: "Ongoing",
          description: "10-day Grand Ganesh Mahotsav celebration with daily evening Aarti, Satyanarayan Katha, Mahaprasad, and grand Visarjan procession."
        };
        const newId = await addDoc2(C.EVENTS, defaultEvt);
        allEvents = [{ id: newId, ...defaultEvt }];
      }

      if(!allSchedules.length) {
        const seedSchedules = [
          { day: "Day 1 (07 Sep)", time: "09:00 AM", title: "Ganesh Sthapana & Maha Aarti", venue: "Central Garden", incharge: "Duplex 01–05 Family", prasad: "Modak & Fruits" },
          { day: "Day 2 (08 Sep)", time: "06:30 PM", title: "Shri Satyanarayan Bhagwan Katha", venue: "Clubhouse Hall", incharge: "Duplex 06–10 Family", prasad: "Sheera Prasad" },
          { day: "Day 3 (09 Sep)", time: "07:30 PM", title: "Kids Cultural Night & Drawing Contest", venue: "Society Stage", incharge: "Youth Committee", prasad: "Chocolates & Laddu" },
          { day: "Day 10 (16 Sep)", time: "12:30 PM", title: "Community Mahaprasad & Dhol Visarjan", venue: "Entire Society", incharge: "All Committee Members", prasad: "Full Mahaprasad Lunch" }
        ];
        for(const s of seedSchedules) {
          const sid = await addDoc2(C.SCHEDULES, s);
          allSchedules.push({ id: sid, ...s });
        }
      }

      if(!allEvtExpenses.length) {
        const seedExpenses = [
          { item: "Mandap, Sound System & Stage Lighting", category: "Mandap & Lighting", amount: 15000, date: todayISO(), vendor: "Shreeji Decorators", paidBy: "Committee Fund" },
          { item: "Satyanarayan Katha Pooja Samagri & Pandit Ji Dakshina", category: "Pooja & Pandit Ji", amount: 4500, date: todayISO(), vendor: "Pandit Rambhai Joshi", paidBy: "Rajeshbhai Patel" },
          { item: "Mahaprasad Grains, Oil, Pure Ghee & Vegetables", category: "Mahaprasad & Food", amount: 12500, date: todayISO(), vendor: "Gayatri Provisions", paidBy: "Committee Fund" },
          { item: "Visarjan Dhol Tasha Troupe & Gulal", category: "Visarjan & Dhol", amount: 4200, date: todayISO(), vendor: "Shiv Dhol Group", paidBy: "Sureshbhai Shah" }
        ];
        for(const ee of seedExpenses) {
          const eid = await addDoc2(C.EVT_EXPENSES, ee);
          allEvtExpenses.push({ id: eid, ...ee });
        }
      }

      renderEvents();
      renderContribs();
      renderSchedules();
      renderEvtExpenses();
    } catch(e) {
      showToast("Load failed: "+e.message, "error");
    } finally {
      if(loader) loader.style.display="none";
    }
  }

  // 1. Events List Render
  function renderEvents() {
    const grid = document.getElementById("events-grid"), empty = document.getElementById("empty-state");
    if(!allEvents.length){ if(grid)grid.innerHTML=""; if(empty)empty.style.display="block"; return; }
    if(empty) empty.style.display="none";
    grid.innerHTML = allEvents.map(e => {
      const bgt = parseFloat(e.estimatedBudget)||0, act = parseFloat(e.actualExpenses)||0, con = parseFloat(e.contributions)||0;
      const over = act > bgt, pct = bgt > 0 ? Math.min(Math.round(act/bgt*100),100) : 0;
      return `<div class="card" style="overflow:visible;">
        <div style="padding:16px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div><div style="font-size:16px;font-weight:800;color:#fff;">${esc(e.eventName)}</div>
          <div style="font-size:12px;color:var(--misty-sky);margin-top:2px;">📅 ${esc(e.startDate)}${e.endDate&&e.endDate!==e.startDate?" → "+esc(e.endDate):""}</div></div>
          ${statusBadge(e.status||"Planned")}
        </div>
        <div style="padding:16px 18px;">
          ${e.venue?`<div style="font-size:12.5px;color:var(--misty-sky);margin-bottom:6px;">📍 ${esc(e.venue)}</div>`:""}
          ${e.organizedBy?`<div style="font-size:12.5px;color:var(--misty-sky);margin-bottom:12px;">👤 ${esc(e.organizedBy)}</div>`:""}
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
            <div style="text-align:center;background:rgba(169,183,198,0.1);border-radius:8px;padding:8px;"><div style="font-size:10px;color:var(--misty-sky);font-weight:700;">BUDGET</div><div style="font-size:14px;font-weight:800;color:#fff;">${formatCurrency(bgt)}</div></div>
            <div style="text-align:center;background:${over?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)"};border-radius:8px;padding:8px;"><div style="font-size:10px;color:var(--misty-sky);font-weight:700;">ACTUAL</div><div style="font-size:14px;font-weight:800;color:${over?"var(--danger)":"var(--success)"};">${formatCurrency(act)}</div></div>
            <div style="text-align:center;background:rgba(168,181,138,0.15);border-radius:8px;padding:8px;"><div style="font-size:10px;color:var(--misty-sky);font-weight:700;">CONTRIB</div><div style="font-size:14px;font-weight:800;color:var(--sage-leaf);">${formatCurrency(con)}</div></div>
          </div>
          ${bgt>0?`<div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--misty-sky);margin-bottom:4px;"><span>Budget used</span><span>${pct}%</span></div><div style="background:rgba(169,183,198,0.2);border-radius:20px;height:6px;"><div style="width:${pct}%;background:${over?"var(--danger)":"var(--success)"};height:100%;border-radius:20px;"></div></div></div>`:""}
          ${e.description?`<div style="font-size:12px;color:var(--misty-sky);background:rgba(0,0,0,0.2);border-radius:8px;padding:10px;margin-top:12px;line-height:1.5;">${esc(e.description)}</div>`:""}
        </div>
        <div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline btn-sm" onclick="evtEdit('${e.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="evtDel('${e.id}')">🗑 Delete</button>
        </div>
      </div>`;
    }).join("");
  }

  // 2. Door-to-Door Contribution List Render
  function renderContribs() {
    const q = document.getElementById("contrib-search")?.value.toLowerCase()||"";
    const st = document.getElementById("contrib-filter-status")?.value||"";
    const filtered = allContribs.filter(c => (!q || (c.flat||"").toLowerCase().includes(q) || (c.name||"").toLowerCase().includes(q)) && (!st || c.status===st));
    const total = filtered.filter(c=>c.status==="Received").reduce((s,c)=>s+(parseFloat(c.amount)||0),0);
    const tb = document.getElementById("contrib-tbody");
    const badge = document.getElementById("contrib-total-badge");
    if(badge) badge.textContent = formatCurrency(total);
    if(!tb) return;
    if(!filtered.length) {
      tb.innerHTML = `<tr><td colspan="8"><div class="empty-state" style="padding:24px;"><div class="empty-icon">📋</div><h3>No contribution records</h3></div></td></tr>`;
      return;
    }
    tb.innerHTML = filtered.map(c => `<tr>
      <td class="td-mono"><strong>House ${esc(c.flat)}</strong></td>
      <td>${esc(c.name)}</td>
      <td class="td-amount" style="color:var(--sage-leaf);font-weight:800;">₹${(parseFloat(c.amount)||0).toFixed(2)}</td>
      <td><span class="badge badge-info">${esc(c.mode||"Cash")}</span></td>
      <td class="td-muted">${esc(c.date||"—")}</td>
      <td>${statusBadge(c.status||"Received")}</td>
      <td class="td-muted">${esc(c.remarks||"—")}</td>
      <td><div class="row-actions">
        <button class="action-btn" onclick="contribEdit('${c.id}')" title="Edit">✏️</button>
        <button class="action-btn" onclick="contribDel('${c.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join("");
  }

  // 3. Day-Wise Program Schedule Render
  function renderSchedules() {
    const tb = document.getElementById("schedule-tbody");
    if(!tb) return;
    if(!allSchedules.length) {
      tb.innerHTML = `<tr><td colspan="7"><div class="empty-state" style="padding:24px;"><div class="empty-icon">📅</div><h3>No program schedule added</h3></div></td></tr>`;
      return;
    }
    tb.innerHTML = allSchedules.map(s => `<tr>
      <td><span class="badge badge-warning">${esc(s.day)}</span></td>
      <td class="td-mono">${esc(s.time)}</td>
      <td><strong style="color:#fff;">${esc(s.title)}</strong></td>
      <td class="td-muted">${esc(s.venue||"—")}</td>
      <td>${esc(s.incharge||"—")}</td>
      <td class="td-muted">${esc(s.prasad||"—")}</td>
      <td><div class="row-actions">
        <button class="action-btn" onclick="scheduleEdit('${s.id}')" title="Edit">✏️</button>
        <button class="action-btn" onclick="scheduleDel('${s.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join("");
  }

  // 4. Itemized Event Expenses Render
  function renderEvtExpenses() {
    const tb = document.getElementById("evt-expenses-tbody");
    const badge = document.getElementById("evt-exp-total-badge");
    const total = allEvtExpenses.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    if(badge) badge.textContent = formatCurrency(total);
    if(!tb) return;
    if(!allEvtExpenses.length) {
      tb.innerHTML = `<tr><td colspan="7"><div class="empty-state" style="padding:24px;"><div class="empty-icon">💸</div><h3>No event expenses recorded</h3></div></td></tr>`;
      return;
    }
    tb.innerHTML = allEvtExpenses.map(e => `<tr>
      <td class="td-muted">${esc(e.date||"—")}</td>
      <td><strong>${esc(e.item)}</strong></td>
      <td><span class="badge badge-info">${esc(e.category||"General")}</span></td>
      <td class="td-muted">${esc(e.vendor||"—")}</td>
      <td class="td-amount" style="color:var(--rosewood);font-weight:800;">₹${(parseFloat(e.amount)||0).toFixed(2)}</td>
      <td class="td-muted">${esc(e.paidBy||"Committee")}</td>
      <td><div class="row-actions">
        <button class="action-btn" onclick="eeEdit('${e.id}')" title="Edit">✏️</button>
        <button class="action-btn" onclick="eeDel('${e.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join("");
  }

  // --- Handlers: Event Edit/Del ---
  window.evtEdit = (id) => {
    const e = allEvents.find(x => x.id === id); if(!e) return;
    editEvtId = id;
    document.getElementById("modal-title").textContent = "Edit Event";
    ["eventName","startDate","endDate","venue","organizedBy","description"].forEach(k => {
      const el = document.getElementById(k); if(el) el.value = e[k] || "";
    });
    ["estimatedBudget","actualExpenses","contributions"].forEach(k => {
      const el = document.getElementById(k); if(el) el.value = e[k] || "";
    });
    document.getElementById("eventStatus").value = e.status || "Planned";
    document.getElementById("modal").classList.remove("hidden");
  };
  window.evtDel = async (id) => {
    if(!confirm("Delete event?")) return;
    try { await deleteDoc2(C.EVENTS, id); showToast("Deleted", "success"); await loadAll(); }
    catch(e) { showToast("Error: "+e.message, "error"); }
  };

  // --- Handlers: Contribution Edit/Del ---
  window.contribEdit = (id) => {
    const c = allContribs.find(x => x.id === id); if(!c) return;
    editContribId = id;
    document.getElementById("contrib-modal-title").textContent = "Edit Contribution";
    document.getElementById("c-flat").value = c.flat || "";
    document.getElementById("c-name").value = c.name || "";
    document.getElementById("c-amount").value = c.amount || "";
    document.getElementById("c-mode").value = c.mode || "Cash";
    document.getElementById("c-date").value = c.date || "";
    document.getElementById("c-status").value = c.status || "Received";
    document.getElementById("c-remarks").value = c.remarks || "";
    document.getElementById("contrib-modal").classList.remove("hidden");
  };
  window.contribDel = async (id) => {
    if(!confirm("Delete contribution record?")) return;
    try { await deleteDoc2(C.CONTRIBS, id); showToast("Deleted", "success"); await loadAll(); }
    catch(e) { showToast("Error: "+e.message, "error"); }
  };

  // --- Handlers: Schedule Edit/Del ---
  window.scheduleEdit = (id) => {
    const s = allSchedules.find(x => x.id === id); if(!s) return;
    editSchedId = id;
    document.getElementById("schedule-modal-title").textContent = "Edit Program Day";
    document.getElementById("s-day").value = s.day || "";
    document.getElementById("s-time").value = s.time || "";
    document.getElementById("s-title").value = s.title || "";
    document.getElementById("s-venue").value = s.venue || "";
    document.getElementById("s-incharge").value = s.incharge || "";
    document.getElementById("s-prasad").value = s.prasad || "";
    document.getElementById("schedule-modal").classList.remove("hidden");
  };
  window.scheduleDel = async (id) => {
    if(!confirm("Delete program item?")) return;
    try { await deleteDoc2(C.SCHEDULES, id); showToast("Deleted", "success"); await loadAll(); }
    catch(e) { showToast("Error: "+e.message, "error"); }
  };

  // --- Handlers: Event Expense Edit/Del ---
  window.eeEdit = (id) => {
    const e = allEvtExpenses.find(x => x.id === id); if(!e) return;
    editEeId = id;
    document.getElementById("evt-exp-modal-title").textContent = "Edit Expense Item";
    document.getElementById("ee-item").value = e.item || "";
    document.getElementById("ee-cat").value = e.category || "Pooja & Pandit Ji";
    document.getElementById("ee-amount").value = e.amount || "";
    document.getElementById("ee-date").value = e.date || "";
    document.getElementById("ee-vendor").value = e.vendor || "";
    document.getElementById("ee-paidby").value = e.paidBy || "";
    document.getElementById("evt-exp-modal").classList.remove("hidden");
  };
  window.eeDel = async (id) => {
    if(!confirm("Delete expense item?")) return;
    try { await deleteDoc2(C.EVT_EXPENSES, id); showToast("Deleted", "success"); await loadAll(); }
    catch(e) { showToast("Error: "+e.message, "error"); }
  };

  // Save Event
  document.getElementById("btn-add")?.addEventListener("click", () => {
    editEvtId=null; document.getElementById("modal-title").textContent="Add Event";
    document.getElementById("modal")?.querySelectorAll("input,select,textarea").forEach(el=>{el.value="";});
    document.getElementById("modal").classList.remove("hidden");
  });
  document.getElementById("modal-close")?.addEventListener("click", () => document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-cancel")?.addEventListener("click", () => document.getElementById("modal").classList.add("hidden"));
  document.getElementById("btn-save")?.addEventListener("click", async () => {
    const data = {
      eventName: document.getElementById("eventName").value.trim(),
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate")?.value||"",
      venue: document.getElementById("venue")?.value.trim()||"",
      organizedBy: document.getElementById("organizedBy")?.value.trim()||"",
      estimatedBudget: parseFloat(document.getElementById("estimatedBudget")?.value)||0,
      actualExpenses: parseFloat(document.getElementById("actualExpenses")?.value)||0,
      contributions: parseFloat(document.getElementById("contributions")?.value)||0,
      status: document.getElementById("eventStatus").value,
      description: document.getElementById("description")?.value.trim()||""
    };
    if(!data.eventName||!data.startDate){ showToast("Fill event name and start date","error"); return; }
    try {
      if(editEvtId) { await updateDoc2(C.EVENTS, editEvtId, data); showToast("Updated!","success"); }
      else { await addDoc2(C.EVENTS, data); showToast("Event added!","success"); }
      document.getElementById("modal").classList.add("hidden"); editEvtId=null; await loadAll();
    } catch(e) { showToast("Save failed: "+e.message,"error"); }
  });

  // Save Contribution
  document.getElementById("btn-add-contrib")?.addEventListener("click", () => {
    editContribId=null; document.getElementById("contrib-modal-title").textContent="Record House Contribution";
    document.getElementById("contrib-form")?.reset();
    document.getElementById("c-date").value = todayISO();
    document.getElementById("contrib-modal").classList.remove("hidden");
  });
  document.getElementById("contrib-modal-close")?.addEventListener("click", () => document.getElementById("contrib-modal").classList.add("hidden"));
  document.getElementById("btn-cancel-contrib")?.addEventListener("click", () => document.getElementById("contrib-modal").classList.add("hidden"));
  document.getElementById("btn-save-contrib")?.addEventListener("click", async () => {
    const data = {
      flat: document.getElementById("c-flat").value.trim(),
      name: document.getElementById("c-name").value.trim(),
      amount: parseFloat(document.getElementById("c-amount").value)||0,
      mode: document.getElementById("c-mode").value,
      date: document.getElementById("c-date").value || todayISO(),
      status: document.getElementById("c-status").value,
      remarks: document.getElementById("c-remarks").value.trim()
    };
    if(!data.flat || !data.amount) { showToast("Enter flat number and amount", "error"); return; }
    try {
      if(editContribId) { await updateDoc2(C.CONTRIBS, editContribId, data); showToast("Contribution updated!", "success"); }
      else { await addDoc2(C.CONTRIBS, data); showToast("Contribution recorded!", "success"); }
      document.getElementById("contrib-modal").classList.add("hidden"); editContribId=null; await loadAll();
    } catch(e) { showToast("Save failed: "+e.message, "error"); }
  });

  // Save Program Day
  document.getElementById("btn-add-schedule-day")?.addEventListener("click", () => {
    editSchedId=null; document.getElementById("schedule-modal-title").textContent="Add Day Program";
    document.getElementById("schedule-form")?.reset();
    document.getElementById("schedule-modal").classList.remove("hidden");
  });
  document.getElementById("schedule-modal-close")?.addEventListener("click", () => document.getElementById("schedule-modal").classList.add("hidden"));
  document.getElementById("btn-cancel-schedule")?.addEventListener("click", () => document.getElementById("schedule-modal").classList.add("hidden"));
  document.getElementById("btn-save-schedule")?.addEventListener("click", async () => {
    const data = {
      day: document.getElementById("s-day").value.trim(),
      time: document.getElementById("s-time").value.trim(),
      title: document.getElementById("s-title").value.trim(),
      venue: document.getElementById("s-venue").value.trim(),
      incharge: document.getElementById("s-incharge").value.trim(),
      prasad: document.getElementById("s-prasad").value.trim()
    };
    if(!data.day || !data.title) { showToast("Enter day and program title", "error"); return; }
    try {
      if(editSchedId) { await updateDoc2(C.SCHEDULES, editSchedId, data); showToast("Program updated!", "success"); }
      else { await addDoc2(C.SCHEDULES, data); showToast("Program added!", "success"); }
      document.getElementById("schedule-modal").classList.add("hidden"); editSchedId=null; await loadAll();
    } catch(e) { showToast("Save failed: "+e.message, "error"); }
  });

  // Save Event Expense
  document.getElementById("btn-add-evt-exp")?.addEventListener("click", () => {
    editEeId=null; document.getElementById("evt-exp-modal-title").textContent="Add Event Expense Item";
    document.getElementById("evt-exp-form")?.reset();
    document.getElementById("ee-date").value = todayISO();
    document.getElementById("evt-exp-modal").classList.remove("hidden");
  });
  document.getElementById("evt-exp-modal-close")?.addEventListener("click", () => document.getElementById("evt-exp-modal").classList.add("hidden"));
  document.getElementById("btn-cancel-ee")?.addEventListener("click", () => document.getElementById("evt-exp-modal").classList.add("hidden"));
  document.getElementById("btn-save-ee")?.addEventListener("click", async () => {
    const data = {
      item: document.getElementById("ee-item").value.trim(),
      category: document.getElementById("ee-cat").value,
      amount: parseFloat(document.getElementById("ee-amount").value)||0,
      date: document.getElementById("ee-date").value || todayISO(),
      vendor: document.getElementById("ee-vendor").value.trim(),
      paidBy: document.getElementById("ee-paidby").value.trim()
    };
    if(!data.item || !data.amount) { showToast("Enter expense item and amount", "error"); return; }
    try {
      if(editEeId) { await updateDoc2(C.EVT_EXPENSES, editEeId, data); showToast("Expense item updated!", "success"); }
      else { await addDoc2(C.EVT_EXPENSES, data); showToast("Expense item added!", "success"); }
      document.getElementById("evt-exp-modal").classList.add("hidden"); editEeId=null; await loadAll();
    } catch(e) { showToast("Save failed: "+e.message, "error"); }
  });

  // Contribution filter listeners
  document.getElementById("contrib-search")?.addEventListener("input", debounce(renderContribs, 250));
  document.getElementById("contrib-filter-status")?.addEventListener("change", renderContribs);

  document.getElementById("btn-export")?.addEventListener("click", () => {
    exportExcel(allEvents, "Event Register",
      ["Event","Start","End","Venue","Organized By","Budget","Actual","Contributions","Status"],
      ["eventName","startDate","endDate","venue","organizedBy","estimatedBudget","actualExpenses","contributions","status"],
      [28,13,13,20,20,14,16,14,12]
    );
    showToast("Exported!", "success");
  });

  await loadAll();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: NOTICES
// ═══════════════════════════════════════════════════════════
async function initNoticesPage() {
  initSidebar();
  let all=[],editId=null;

  async function load(){
    try{
      all=await getAll(C.NOTICES);
      if(!all.length){
        const seedNotices = [
          {
            title: "📢 શિવમ ડુપ્લેક્સ માસિક મેઈન્ટેનન્સ જમા કરાવવા અંગે",
            category: "Maintenance",
            priority: "Important",
            postedBy: "ખજાનચી - શ્રી મુકેશભાઈ પંડ્યા",
            pinned: true,
            expiryDate: "2026-12-31",
            status: "Active",
            body: "સોસાયટીના તમામ ૪૦ ડુપ્લેક્સ સભાસદોને નમ્ર વિનંતી કે દર મહિનાની ૧૦ તારીખ સુધીમાં માસિક મેઈન્ટેનન્સ ₹૬૦૦ (અથવા ૬ માસનું ₹૩,૬૦૦ / વાર્ષિક ₹૭,૨૦૦) રેસિડેન્ટ પોર્ટલ પરથી UPI QR અથવા બેંક ટ્રાન્સફર દ્વારા જમા કરાવી દેવું."
          },
          {
            title: "🚗 સોસાયટી અંદર વાહનોની સ્પીડ લિમિટ (૧૫ km/h) અને પાર્કિંગ નિયમ",
            category: "Rule/Policy",
            priority: "General",
            postedBy: "પાર્કિંગ ઇન્ચાર્જ - શ્રી સંજયભાઈ બારોટ",
            pinned: false,
            expiryDate: "2026-12-31",
            status: "Active",
            body: "બાળકો અને વડીલોની સુરક્ષા માટે સોસાયટીના રસ્તાઓ પર વાહનોની ગતિ ૧૫ કિમી/કલાકથી વધુ ન રાખવી. પોતાના વાહનો પોતાના ફાળવેલ પાર્કિંગ સ્લોટ અથવા પોતાના ડુપ્લેક્સ આગળ જ પાર્ક કરવા જેથી સામાન્ય અવરજવરમાં અડચણ ન પડે."
          },
          {
            title: "💡 ૧૬ સ્ટ્રીટ લાઈટ્સ અને સિક્યુરિટી ગેટ ૨૪×૭ સુવિધા",
            category: "General",
            priority: "General",
            postedBy: "ઈલેક્ટ્રિકલ ઇન્ચાર્જ - શ્રી ભાવિનભાઈ શાહ",
            pinned: false,
            expiryDate: "2026-12-31",
            status: "Active",
            body: "સોસાયટીની તમામ ૧૬ સ્ટ્રીટ લાઈટોનું નિરીક્ષણ પૂર્ણ થયેલ છે. કોઈ સ્ટ્રીટ લાઈટ બંધ જણાય તો ૩D મેપ પરથી સંબંધિત લાઇન ઇન્ચાર્જ અથવા ભાવિનભાઈ શાહ (ડુપ્લેક્સ ૨૩) નો તુરંત સંપર્ક કરવો."
          }
        ];
        for(const sn of seedNotices){
          await addDoc2(C.NOTICES, sn);
        }
        all=await getAll(C.NOTICES);
      }
      all.sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
      render();
    }
    catch(e){showToast("Load failed: "+e.message,"error");}
  }

  const priColors={Urgent:"rgba(239,68,68,0.22)",Important:"rgba(245,158,11,0.22)",General:"rgba(96,165,250,0.22)"};
  const priText={Urgent:"#fca5a5",Important:"#fde047",General:"#93c5fd"};
  const priIcons={Urgent:"🚨",Important:"⚠️",General:"📌"};

  function render(){
    const cat=document.getElementById("filter-cat")?.value||"";
    const pri=document.getElementById("filter-priority")?.value||"";
    let shown=all.filter(n=>(!cat||n.category===cat)&&(!pri||n.priority===pri));
    shown.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    const list=document.getElementById("notices-list"),empty=document.getElementById("empty-state");
    if(!shown.length){if(list)list.innerHTML="";if(empty)empty.style.display="block";return;}
    if(empty)empty.style.display="none";
    list.innerHTML=shown.map(n=>`<div class="card" style="margin-bottom:14px;border-left:4px solid ${priText[n.priority]||"#60a5fa"};">
      <div style="padding:16px 20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              ${n.pinned===true||n.pinned==="true"?'<span style="font-size:16px;">📌</span>':""}
              <span style="font-size:16.5px;font-weight:800;color:#ffffff;">${esc(n.title)}</span>
              <span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:${priColors[n.priority]||"rgba(96,165,250,0.2)"};color:${priText[n.priority]||"#93c5fd"};">${priIcons[n.priority]||""} ${esc(n.priority||"General")}</span>
              <span class="badge badge-info">${esc(n.category||"General")}</span>
            </div>
            <div style="font-size:14px;color:var(--text-secondary);line-height:1.65;white-space:pre-wrap;">${esc(n.body)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid rgba(169,183,198,0.2);">
          <div style="font-size:12px;color:var(--misty-sky);">👤 ${esc(n.postedBy||"Society Committee")}${n.expiryDate?" · માન્ય તારીખ: "+esc(n.expiryDate):""}</div>
          <div class="row-actions">
            <button class="action-btn" onclick="noticeEdit('${n.id}')" title="Edit">✏️</button>
            <button class="action-btn" onclick="noticeDel('${n.id}')" title="Delete">🗑</button>
          </div>
        </div>
      </div>
    </div>`).join("");
  }

  window.noticeEdit=(id)=>{const n=all.find(x=>x.id===id);if(!n)return;editId=id;document.getElementById("modal-title").textContent="Edit Notice";["title","category","priority","postedBy","expiryDate","body"].forEach(k=>{const el=document.getElementById(k);if(el)el.value=n[k]||"";});document.getElementById("noticeStatus").value=n.status||"Active";document.getElementById("pinned").value=n.pinned?"true":"false";document.getElementById("modal").classList.remove("hidden");};
  window.noticeDel=async(id)=>{if(!confirm("Delete notice?"))return;try{await deleteDoc2(C.NOTICES,id);showToast("Deleted","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};

  ["filter-cat","filter-priority"].forEach(id=>document.getElementById(id)?.addEventListener("change",render));

  document.getElementById("btn-add")?.addEventListener("click",()=>{editId=null;document.getElementById("modal")?.querySelectorAll("input,select,textarea").forEach(el=>{el.value=el.tagName==="SELECT"?el.options[0]?.value||"":"";});document.getElementById("modal-title").textContent="Post Notice";document.getElementById("modal").classList.remove("hidden");});
  document.getElementById("modal-close")?.addEventListener("click",()=>{document.getElementById("modal").classList.add("hidden");editId=null;});
  document.getElementById("btn-cancel")?.addEventListener("click",()=>{document.getElementById("modal").classList.add("hidden");editId=null;});
  document.getElementById("btn-save")?.addEventListener("click",async()=>{
    const data={title:document.getElementById("title").value.trim(),body:document.getElementById("body").value.trim(),category:document.getElementById("category").value,priority:document.getElementById("priority").value,postedBy:document.getElementById("postedBy")?.value.trim()||"",expiryDate:document.getElementById("expiryDate")?.value||"",pinned:document.getElementById("pinned")?.value==="true",status:document.getElementById("noticeStatus")?.value||"Active"};
    if(!data.title||!data.body){showToast("Fill title and body","error");return;}
    try{
      if(editId){await updateDoc2(C.NOTICES,editId,data);showToast("Updated!","success");}
      else{await addDoc2(C.NOTICES,data);showToast("Notice posted!","success");}
      document.getElementById("modal").classList.add("hidden");editId=null;await load();
    }catch(e){showToast("Save failed: "+e.message,"error");}
  });
  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: REPORTS
// ═══════════════════════════════════════════════════════════
async function initReportsPage() {
  initSidebar();
  async function fetchExport(fetcher,title,headers,keys,widths){
    showToast("Fetching…","info");
    try{const data=await fetcher();if(!data.length){showToast("No data","warning");return;}exportExcel(data,title,headers,keys,widths);showToast(`Exported ${data.length} records!`,"success");}
    catch(e){showToast("Export failed: "+e.message,"error");}
  }
  document.getElementById("r1-btn")?.addEventListener("click",async()=>{const mo=document.getElementById("r1-month")?.value||"";await fetchExport(async()=>{const d=await getAll(C.PAYMENTS);return mo?d.filter(p=>(p.paymentDate||"").startsWith(mo)):d;},"Collection Report",["Payment ID","Flat","Member","Amount","Date","Mode","Type","Reference"],["paymentId","flatNumber","memberName","amount","paymentDate","paymentMode","paymentType","referenceNumber"],[16,10,22,12,14,16,16,18]);});
  document.getElementById("r2-btn")?.addEventListener("click",async()=>{const pe=document.getElementById("r2-period")?.value||"";await fetchExport(async()=>{const d=await getAll(C.MAINT_BILLS);const f=pe?d.filter(b=>b.period===pe):d;return f.filter(b=>b.status==="Pending"||b.status==="Overdue");},"Defaulter List",["Flat","Wing","Member","Period","Amount","Late Fee","Total","Status","Due Date"],["flatNumber","wing","memberName","period","maintenanceAmount","lateFee","totalAmount","status","dueDate"],[10,8,22,16,12,10,12,10,13]);});
  document.getElementById("r3-btn")?.addEventListener("click",async()=>{const mo=document.getElementById("r3-month")?.value||"";await fetchExport(async()=>{const d=await getAll(C.EXPENSES);return mo?d.filter(e=>(e.date||"").startsWith(mo)):d;},"Expense Report",["ID","Date","Category","Description","Vendor","Amount"],["expenseId","date","category","description","vendorName","amount"],[16,13,18,28,22,12]);});
  document.getElementById("r4-btn")?.addEventListener("click",async()=>{await fetchExport(()=>getAll(C.MEMBERS),"Member Directory",["Flat","Wing","Owner","Tenant","Contact","Type","Status","Tenant Contact","Rent Start","Rent End"],["flatNumber","wing","ownerName","tenantName","contactNumber","memberType","status","tenantContact","tenantRentStart","tenantRentEnd"],[10,8,22,20,14,10,10,14,13,13]);});
  document.getElementById("r5-btn")?.addEventListener("click",async()=>{const mo=document.getElementById("r5-month")?.value||"";await fetchExport(async()=>{const d=await getAll(C.PAYMENTS);return mo?d.filter(p=>(p.paymentDate||"").startsWith(mo)):d;},"Payment Register",["Payment ID","Flat","Member","Amount","Date","Mode","Type"],["paymentId","flatNumber","memberName","amount","paymentDate","paymentMode","paymentType"],[16,10,22,12,14,16,16]);});
  document.getElementById("r6-btn")?.addEventListener("click",async()=>{const mo=document.getElementById("r6-month")?.value||"";await fetchExport(async()=>{const d=await getAll(C.FUNDS);return mo?d.filter(f=>(f.date||"").startsWith(mo)):d;},"Fund Ledger",["Date","Fund","Type","Description","Amount","Balance"],["date","fundType","transactionType","description","amount","balance"],[13,20,14,30,14,16]);});
  document.getElementById("r7-btn")?.addEventListener("click",async()=>{await fetchExport(()=>getAll(C.EVENTS),"Event Register",["Event","Start","End","Budget","Actual","Contributions","Status"],["eventName","startDate","endDate","estimatedBudget","actualExpenses","contributions","status"],[28,13,13,14,16,14,12]);});
  document.getElementById("r8-btn")?.addEventListener("click",async()=>{const pe=document.getElementById("r8-period")?.value||"";await fetchExport(async()=>{const d=await getAll(C.MAINT_BILLS);return pe?d.filter(b=>b.period===pe):d;},"Maintenance Bills",["Bill No","Period","Flat","Member","Amount","Late Fee","Total","Status"],["billNumber","period","flatNumber","memberName","maintenanceAmount","lateFee","totalAmount","status"],[18,16,10,22,16,10,12,12]);});

  // Advance balance report
  document.getElementById("r9-btn")?.addEventListener("click",async()=>{
    showToast("Calculating advance balances…","info");
    try{
      const [members,bills,payments]=await Promise.all([getAll(C.MEMBERS),getAll(C.MAINT_BILLS),getAll(C.PAYMENTS)]);
      const report=members.map(m=>{
        const mb=bills.filter(b=>b.flatNumber===m.flatNumber);
        const mp=payments.filter(p=>p.flatNumber===m.flatNumber);
        const totalBilled=mb.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0);
        const totalPaid=mp.reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
        const balance=totalPaid-totalBilled;
        return{flatNumber:m.flatNumber,wing:m.wing||"",ownerName:m.ownerName,contactNumber:m.contactNumber||"",totalBilled,totalPaid,balance,status:balance>0?"Credit":balance<0?"Outstanding":"Clear"};
      });
      if(!report.length){showToast("No members","warning");return;}
      exportExcel(report,"Advance Balance Report",["Flat","Wing","Owner","Contact","Total Billed","Total Paid","Balance","Status"],["flatNumber","wing","ownerName","contactNumber","totalBilled","totalPaid","balance","status"],[10,8,22,14,14,12,12,12]);
      showToast("Balance report exported!","success");
    }catch(e){showToast("Error: "+e.message,"error");}
  });

  // Period dropdown for r2, r8
  try{
    const bills=await getAll(C.MAINT_BILLS);
    const periods=[...new Set(bills.map(b=>b.period).filter(Boolean))];
    ["r2-period","r8-period"].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">All Periods</option>'+periods.map(p=>`<option>${esc(p)}</option>`).join("");});
  }catch(e){}
}

// ═══════════════════════════════════════════════════════════
//  PAGE: HOMEPAGE / LANDING PAGE
// ═══════════════════════════════════════════════════════════
async function initHomePage() {
  console.log("🌐 Initializing Shivam Duplex Homepage...");

  // Mobile drawer toggle
  const mobileBtn = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  if(mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener("click", () => {
      mobileDrawer.classList.toggle("open");
    });
    document.querySelectorAll(".mobile-nav-links a").forEach(link => {
      link.addEventListener("click", () => mobileDrawer.classList.remove("open"));
    });
  }

  // Admin login modal
  const adminModal = document.getElementById("admin-login-modal");
  const openAdminBtn = document.getElementById("btn-open-admin-modal");
  const closeAdminBtn = document.getElementById("btn-close-admin-modal");
  const adminForm = document.getElementById("admin-login-form");

  if(openAdminBtn && adminModal) {
    openAdminBtn.addEventListener("click", () => adminModal.classList.add("show"));
  }
  if(closeAdminBtn && adminModal) {
    closeAdminBtn.addEventListener("click", () => adminModal.classList.remove("show"));
  }
  if(adminModal) {
    adminModal.addEventListener("click", (e) => {
      if(e.target === adminModal) adminModal.classList.remove("show");
    });
  }
  if(adminForm) {
    adminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Access granted! Opening Command Deck…", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    });
  }

  // FAQ Accordion
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-question");
    if(q) {
      q.addEventListener("click", () => {
        const wasActive = item.classList.contains("active");
        document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
        if(!wasActive) item.classList.add("active");
      });
    }
  });

  // Hero Emergency Vehicle Search
  const vForm = document.getElementById("hero-vehicle-form");
  const vInput = document.getElementById("hero-vehicle-input");
  const vResult = document.getElementById("hero-vehicle-result");

  if(vForm && vInput && vResult) {
    vForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = vInput.value.trim().toLowerCase();
      if(!q) return;

      vResult.style.display = "block";
      vResult.innerHTML = `<div style="text-align:center;color:var(--misty-sky);padding:10px;">Searching vehicle registry…</div>`;

      try {
        const members = await getAll(C.MEMBERS);
        const matches = members.filter(m => {
          const car = (m.carNumber || "").toLowerCase();
          const bike = (m.bikeNumber || "").toLowerCase();
          const slot = (m.parkingSlot || "").toLowerCase();
          const flat = (m.flatNumber || "").toLowerCase();
          const owner = (m.ownerName || "").toLowerCase();
          return car.includes(q) || bike.includes(q) || slot.includes(q) || flat.includes(q) || owner.includes(q);
        });

        if(!matches.length) {
          vResult.innerHTML = `
            <div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:14px;color:#fca5a5;">
              <div style="font-weight:800;font-size:14px;margin-bottom:4px;">❌ Vehicle Not Found in Registered List</div>
              <div style="font-size:12px;">No registered vehicle matches "<strong>${esc(q)}</strong>". Please contact society security at the main gate or call your committee incharge.</div>
            </div>`;
          return;
        }

        vResult.innerHTML = matches.map(m => `
          <div style="background:rgba(168,181,138,0.15);border:1.5px solid rgba(168,181,138,0.4);border-radius:12px;padding:16px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
              <span style="font-size:16px;font-weight:900;color:#ffffff;">🏡 Duplex No. ${esc(m.flatNumber)} (Wing ${esc(m.wing||"Main")})</span>
              <span style="background:rgba(168,181,138,0.3);color:var(--sage-leaf);font-size:11px;font-weight:800;padding:3px 10px;border-radius:var(--radius-pill);">MATCH VERIFIED</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px 14px;font-size:13px;margin-bottom:12px;">
              <div><span style="color:var(--misty-sky);">Owner / Resident: </span><strong>${esc(m.ownerName)}</strong></div>
              <div><span style="color:var(--misty-sky);">Phone: </span><strong>${esc(m.contactNumber)}</strong></div>
              ${m.carNumber ? `<div><span style="color:var(--misty-sky);">Car: </span><strong style="color:var(--sage-leaf);">🚗 ${esc(m.carNumber)}</strong></div>` : ''}
              ${m.bikeNumber ? `<div><span style="color:var(--misty-sky);">Two-Wheeler: </span><strong style="color:var(--misty-sky);">🛵 ${esc(m.bikeNumber)}</strong></div>` : ''}
              ${m.parkingSlot ? `<div><span style="color:var(--misty-sky);">Slot: </span><strong>🅿️ ${esc(m.parkingSlot)}</strong></div>` : ''}
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="tel:${esc(m.contactNumber)}" class="quick-action-btn" style="padding:7px 16px;font-size:12px;">📞 Call Owner Now</a>
              <a href="https://wa.me/91${esc(m.contactNumber).replace(/\D/g,'')}?text=Hello%20${encodeURIComponent(m.ownerName)},%20your%20vehicle%20is%20parked%20outside%20my%20duplex.%20Please%20check." target="_blank" class="quick-action-btn green" style="padding:7px 16px;font-size:12px;">💬 WhatsApp Message</a>
            </div>
          </div>
        `).join("");
      } catch(err) {
        vResult.innerHTML = `<div style="color:var(--rosewood);font-size:13px;">Search error: ${esc(err.message)}</div>`;
      }
    });
  }

  // Update dynamic counters if available
  try {
    const members = await getAll(C.MEMBERS);
    if(members.length) {
      const duplexStat = document.getElementById("home-stat-duplexes");
      if(duplexStat) duplexStat.textContent = members.length;
    }
  } catch(e) {}

  // Wire up Image 2 Wireframe Line Selector
  const lineSel = document.getElementById("home-line-select");
  if(lineSel) {
    lineSel.addEventListener("change", (e) => {
      const val = e.target.value;
      const linesData = {
        "line-1": { role: "કારોબારી સભ્ય (લાઈન ૧ મેન્ટર)", name: "શ્રી રાજેશભાઈ પટેલ", meta: "મકાન નં. ૦૪ · કવર કરેલ મકાનો: ૦૧ થી ૦૮", phone: "9825012341" },
        "line-2": { role: "૧ ઉપ-પ્રમુખ (લાઈન ૨ ઇન્ચાર્જ)", name: "શ્રી વિનોદભાઈ શાહ", meta: "મકાન નં. ૧૧ · કવર કરેલ મકાનો: ૦૯ થી ૧૬", phone: "9825011002" },
        "line-3": { role: "૧ મંત્રી (લાઈન ૩ ઇન્ચાર્જ)", name: "શ્રી અલ્પેશભાઈ દેસાઈ", meta: "મકાન નં. ૨૧ · કવર કરેલ મકાનો: ૧૭ થી ૨૪ (સહાયક: સુરેશભાઈ શાહ D-24)", phone: "9825011003" },
        "line-4": { role: "૧ ખજાનચી (લાઈન ૪ ઇન્ચાર્જ)", name: "શ્રી મુકેશભાઈ પંડ્યા", meta: "મકાન નં. ૩૧ · કવર કરેલ મકાનો: ૨૫ થી ૩૨", phone: "9825011004" },
        "line-5": { role: "કારોબારી સભ્યો (પાર્કિંગ & બગીચો)", name: "શ્રી સંજયભાઈ બારોટ & શ્રી નરેન્દ્રભાઈ રાણા", meta: "મકાન નં. ૩૪ & ૩૮ · કવર કરેલ મકાનો: ૩૩ થી ૪૦", phone: "9825011010" }
      };
      const d = linesData[val];
      if(d) {
        const rEl = document.getElementById("hlic-role");
        const nEl = document.getElementById("hlic-name");
        const mEl = document.getElementById("hlic-meta");
        const tEl = document.getElementById("hlic-tel");
        const wEl = document.getElementById("hlic-wa");
        if(rEl) rEl.textContent = d.role;
        if(nEl) nEl.textContent = d.name;
        if(mEl) mEl.textContent = d.meta;
        if(tEl) tEl.href = "tel:" + d.phone;
        if(wEl) wEl.href = "https://wa.me/91" + d.phone + "?text=" + encodeURIComponent("Namaste " + d.name + ", I am from Shivam Duplex " + val + " with a query: ");
      }
    });
  }

  // Initialize 3D Spatial Society Map
  if(typeof window.initSocietyMap === "function") {
    try {
      window.initSocietyMap("society-map-container");
    } catch(err) {
      console.warn("Map init error:", err);
    }
  }

  // Setup KYC Registration modal
  setupKycModalHandlers();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: RESIDENT PORTAL (Fully Upgraded)
// ═══════════════════════════════════════════════════════════
async function initResidentPage() {
  const searchSection = document.getElementById("resident-search");
  const dashSection = document.getElementById("resident-dash");
  let residentFlat="", currentMember=null, allBills=[], allPayments=[], allNotices=[];

  // Tab switching
  document.querySelectorAll('.res-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.res-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.res-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById('tab-' + btn.dataset.tab);
      if(target) target.classList.add('active');
      if(btn.dataset.tab === "map" && typeof window.initSocietyMap === "function") {
        window.initSocietyMap("res-society-map-container");
      }
    });
  });

  // Modal open/close helpers
  window.openTenantModal = () => {
    if(!currentMember) return;
    document.getElementById("t-name").value = currentMember.tenantName || "";
    document.getElementById("t-contact").value = currentMember.tenantContact || "";
    document.getElementById("t-email").value = currentMember.tenantEmail || "";
    document.getElementById("t-aadhar").value = currentMember.tenantAadhar || "";
    document.getElementById("t-pan").value = currentMember.tenantPan || "";
    document.getElementById("t-job").value = currentMember.tenantJob || "";
    document.getElementById("t-family").value = currentMember.tenantFamilyCount || "";
    document.getElementById("t-start").value = currentMember.tenantRentStart || "";
    document.getElementById("t-end").value = currentMember.tenantRentEnd || "";
    document.getElementById("t-rent").value = currentMember.tenantRent || "";
    document.getElementById("t-pin").value = currentMember.tenantPin || "";
    document.getElementById("tenant-modal")?.classList.remove("hidden");
  };
  window.closeTenantModal = () => {
    document.getElementById("tenant-modal")?.classList.add("hidden");
  };

  window.openVehicleModal = () => {
    if(!currentMember) return;
    document.getElementById("v-car").value = currentMember.carNumber || "";
    document.getElementById("v-bike").value = currentMember.bikeNumber || "";
    document.getElementById("vehicle-modal")?.classList.remove("hidden");
  };
  window.closeVehicleModal = () => {
    document.getElementById("vehicle-modal")?.classList.add("hidden");
  };

  document.getElementById("btn-open-tenant-modal")?.addEventListener("click", openTenantModal);
  document.getElementById("btn-open-vehicle-modal")?.addEventListener("click", openVehicleModal);

  // Backdrop dismiss
  document.getElementById("tenant-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "tenant-modal") closeTenantModal();
  });
  document.getElementById("vehicle-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "vehicle-modal") closeVehicleModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTenantModal();
      closeVehicleModal();
    }
  });

  // Save Tenant KYC
  document.getElementById("btn-save-tenant")?.addEventListener("click", async () => {
    if(!currentMember) return;
    const data = {
      hasTenant: true,
      tenantName: document.getElementById("t-name").value.trim(),
      tenantContact: document.getElementById("t-contact").value.trim(),
      tenantEmail: document.getElementById("t-email").value.trim(),
      tenantAadhar: document.getElementById("t-aadhar").value.trim(),
      tenantPan: document.getElementById("t-pan").value.trim(),
      tenantJob: document.getElementById("t-job").value.trim(),
      tenantFamilyCount: parseInt(document.getElementById("t-family").value) || 0,
      tenantRentStart: document.getElementById("t-start").value,
      tenantRentEnd: document.getElementById("t-end").value,
      tenantRent: parseFloat(document.getElementById("t-rent").value) || 0,
      tenantPin: document.getElementById("t-pin").value.trim()
    };
    if(!data.tenantName || !data.tenantContact || !data.tenantAadhar) {
      showToast("Tenant Name, Mobile, and Aadhaar are required", "error");
      return;
    }
    try {
      await updateDoc2(C.MEMBERS, currentMember.id, data);
      Object.assign(currentMember, data);
      showToast("Tenant KYC saved successfully!", "success");
      closeTenantModal();
      renderResidentDash();
    } catch(e) {
      showToast("Save failed: " + e.message, "error");
    }
  });

  // Save Vehicles
  document.getElementById("btn-save-vehicle")?.addEventListener("click", async () => {
    if(!currentMember) return;
    const carNumber = document.getElementById("v-car").value.trim();
    const bikeNumber = document.getElementById("v-bike").value.trim();
    try {
      await updateDoc2(C.MEMBERS, currentMember.id, { carNumber, bikeNumber });
      currentMember.carNumber = carNumber;
      currentMember.bikeNumber = bikeNumber;
      showToast("Vehicles updated successfully!", "success");
      closeVehicleModal();
      renderResidentDash();
    } catch(e) {
      showToast("Save failed: " + e.message, "error");
    }
  });

  // Self-report payment
  document.getElementById("res-payment-report-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!currentMember) return;
    const amount = parseFloat(document.getElementById("res-pay-amount").value) || 600;
    const date = document.getElementById("res-pay-date").value || todayISO();
    const mode = document.getElementById("res-pay-mode").value;
    const ref = document.getElementById("res-pay-ref").value.trim();

    try {
      const payNo = await getNextPaymentNo();
      const pData = {
        paymentId: payNo,
        flatNumber: currentMember.flatNumber,
        wing: currentMember.wing || "Main",
        memberName: currentMember.ownerName,
        amount: amount,
        paymentDate: date,
        paymentMode: mode,
        paymentType: amount >= 7200 ? "Advance-Annual" : amount >= 3600 ? "Advance-HalfYear" : "Regular",
        referenceNumber: ref,
        status: "Completed",
        notes: "Self-reported by resident via UPI QR"
      };
      await addDoc2(C.PAYMENTS, pData);
      showToast("Payment recorded! Verification updated.", "success");
      document.getElementById("res-pay-ref").value = "";
      await loadResident(currentMember.flatNumber);
    } catch(err) {
      showToast("Error saving payment: " + err.message, "error");
    }
  });

  // Emergency vehicle search in portal
  document.getElementById("portal-vehicle-search-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = document.getElementById("portal-vehicle-input").value.trim().toLowerCase();
    const resultsDiv = document.getElementById("portal-vehicle-results");
    if(!q || !resultsDiv) return;

    resultsDiv.style.display = "block";
    resultsDiv.innerHTML = "Searching...";

    try {
      const members = await getAll(C.MEMBERS);
      const matches = members.filter(m => {
        const car = (m.carNumber || "").toLowerCase();
        const bike = (m.bikeNumber || "").toLowerCase();
        const flat = (m.flatNumber || "").toLowerCase();
        const owner = (m.ownerName || "").toLowerCase();
        return car.includes(q) || bike.includes(q) || flat.includes(q) || owner.includes(q);
      });

      if(!matches.length) {
        resultsDiv.innerHTML = `<div style="color:var(--rosewood);">No vehicles matching "<strong>${esc(q)}</strong>".</div>`;
        return;
      }

      resultsDiv.innerHTML = matches.map(m => `
        <div style="padding:10px 0;border-bottom:1px solid rgba(169,183,198,0.2);">
          <div style="font-weight:800;color:#fff;">Duplex ${esc(m.flatNumber)} · ${esc(m.ownerName)} (📞 ${esc(m.contactNumber)})</div>
          <div style="font-size:12px;color:var(--sage-leaf);">Car: ${esc(m.carNumber || "None")} | Two-Wheeler: ${esc(m.bikeNumber || "None")}</div>
          <div style="margin-top:6px;display:flex;gap:8px;">
            <a href="tel:${esc(m.contactNumber)}" class="btn btn-outline btn-sm">📞 Call</a>
            <a href="https://wa.me/91${esc(m.contactNumber).replace(/\D/g,'')}" target="_blank" class="btn btn-primary btn-sm">💬 WhatsApp</a>
          </div>
        </div>
      `).join("");
    } catch(err) {
      resultsDiv.innerHTML = `<div style="color:var(--rosewood);">${esc(err.message)}</div>`;
    }
  });

  async function loadResident(flatNumber) {
    showToast("Loading your account…", "info");
    const loader = document.getElementById("res-loading");
    if(loader) loader.style.display = "flex";

    try {
      const [members, bills, payments, notices] = await Promise.all([
        getAll(C.MEMBERS), getAll(C.MAINT_BILLS), getAll(C.PAYMENTS), getAll(C.NOTICES)
      ]);

      // Flexible matching (handles 2, 02, Duplex 2, D-02)
      let member = members.find(m => {
        const f = (m.flatNumber||"").toLowerCase().trim();
        const q = flatNumber.toLowerCase().trim();
        const fNum = f.replace(/\D/g, "");
        const qNum = q.replace(/\D/g, "");
        return f === q || (qNum && fNum && parseInt(qNum, 10) === parseInt(fNum, 10));
      });

      // Auto-provision unseeded duplexes from 1 to 40
      if(!member) {
        const num = parseInt(flatNumber.replace(/\D/g, ""), 10);
        if(!isNaN(num) && num >= 1 && num <= 40) {
          const padded = num < 10 ? "0" + num : String(num);
          const lineInfo = getDuplexLine(padded);
          const commAssigned = num <= 20 ? "Cluster 1 - Rajeshbhai Patel (1-20)" : "Cluster 2 - Sureshbhai Shah (21-40)";
          const newDoc = {
            flatNumber: padded,
            wing: "Main",
            ownerName: `શ્રી સભાસદ (ડુપ્લેક્સ ${padded})`,
            contactNumber: "98250" + String(10000 + num).padStart(5, '0'),
            designation: "ઘર માલિક (House Owner)",
            memberType: "Owner",
            status: "Active",
            parkingSlot: `P-${padded}`,
            carNumber: "",
            bikeNumber: "",
            maintenanceAmount: 600,
            assignedCommittee: commAssigned,
            line: lineInfo.id
          };
          try {
            const docRef = await addDoc2(C.MEMBERS, newDoc);
            member = { ...newDoc, id: docRef.id };
            showToast(`ડુપ્લેક્સ ${padded} ખાતું સફળતાપૂર્વક લોડ થયું!`, "success");
          } catch(err) {
            member = newDoc;
          }
        }
      }

      if(!member) {
        showToast("House/Flat not found. Please enter a valid duplex number (e.g. 01 to 40).", "error");
        if(loader) loader.style.display = "none";
        return;
      }

      currentMember = member;
      allBills = bills.filter(b => b.flatNumber === member.flatNumber).sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
      allPayments = payments.filter(p => p.flatNumber === member.flatNumber).sort((a,b)=>(b.paymentDate||"").localeCompare(a.paymentDate||""));
      allNotices = notices.filter(n => n.status !== "Inactive").sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));

      renderResidentDash();
      searchSection.style.display = "none";
      dashSection.style.display = "block";
    } catch(e) {
      showToast("Error: " + e.message, "error");
    } finally {
      if(loader) loader.style.display = "none";
    }
  }

  function renderResidentDash() {
    const m = currentMember;
    // Header
    document.getElementById("res-name").textContent = m.ownerName;
    document.getElementById("res-flat").textContent = `Duplex ${m.flatNumber}, Wing ${m.wing||"Main"}`;
    document.getElementById("res-type").textContent = m.memberType || "Owner";
    document.getElementById("res-contact").textContent = m.contactNumber || "";

    // 20-House Committee Allocation & Line Guardian
    const num = parseInt((m.flatNumber||"").replace(/\D/g, "")) || 1;
    const isCluster1 = num <= 20;
    const lineInfo = getDuplexLine(m.flatNumber);
    const commName = lineInfo ? lineInfo.incharge : (isCluster1 ? "Rajeshbhai Patel" : "Sureshbhai Shah");
    const commPhone = lineInfo ? lineInfo.phone : (isCluster1 ? "9825012341" : "9825012342");
    const commTitle = `${lineInfo ? lineInfo.name : ''} · ${isCluster1 ? "Cluster 1 (Duplex 1 – 20)" : "Cluster 2 (Duplex 21 – 40)"}`;

    const commNameEl = document.getElementById("res-comm-name");
    const commDescEl = document.getElementById("res-comm-desc");
    const commTelEl = document.getElementById("res-comm-tel");
    const commWaEl = document.getElementById("res-comm-wa");

    if(commNameEl) commNameEl.textContent = `Assigned Committee Guardian: ${commName} · ${commTitle}`;
    if(commDescEl) commDescEl.textContent = `Dedicated guardian for water, streetlights, maintenance, sanitation & disputes.`;
    if(commTelEl) commTelEl.href = `tel:${commPhone}`;
    if(commWaEl) commWaEl.href = `https://wa.me/91${commPhone}?text=${encodeURIComponent("Namaste " + commName + ", I am resident of Duplex " + m.flatNumber + " and have a query/complaint: ")}`;

    // Vehicles Card
    const carVal = document.getElementById("res-car-val");
    const bikeVal = document.getElementById("res-bike-val");
    if(carVal) carVal.textContent = m.carNumber || "None recorded";
    if(bikeVal) bikeVal.textContent = m.bikeNumber || "None recorded";

    // Stats
    const totalBilled = allBills.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0);
    const totalPaid = allPayments.reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    const balance = totalPaid - totalBilled;
    const pending = allBills.filter(b=>b.status==="Pending"||b.status==="Overdue");

    const se = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
    se("res-stat-pending", pending.length);
    se("res-stat-pending-amt", formatCurrency(pending.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0)));
    se("res-stat-balance", formatCurrency(Math.abs(balance)));
    se("res-stat-balance-label", balance >= 0 ? "💎 Advance Credit" : "⚠️ Outstanding Balance");
    se("res-stat-paid", formatCurrency(totalPaid));
    se("res-stat-monthly", formatCurrency(m.maintenanceAmount || MONTHLY_FEE));

    // Tenant Card
    const tenantCard = document.getElementById("tenant-info-card");
    if(tenantCard) {
      if(m.tenantName) {
        tenantCard.style.display = "block";
        se("res-tenant-name", m.tenantName);
        se("res-tenant-contact", m.tenantContact || "—");
        se("res-tenant-id", m.tenantAadhar || m.tenantPan || "—");
        se("res-tenant-job", m.tenantJob || "—");
        se("res-tenant-family", (m.tenantFamilyCount || "—") + " members");
        se("res-tenant-rent", `${m.tenantRentStart||"—"} to ${m.tenantRentEnd||"—"}`);
      } else {
        tenantCard.style.display = "none";
      }
    }

    // Bills Table
    const billsTb = document.getElementById("res-bills-tbody");
    if(billsTb) {
      billsTb.innerHTML = allBills.length ? allBills.map(b => `<tr>
        <td class="td-mono">${esc(b.billNumber)}</td>
        <td>${esc(b.period)}</td>
        <td class="td-amount">${formatCurrency(b.totalAmount)}</td>
        <td>${esc(b.dueDate)}</td>
        <td>${statusBadge(b.status)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="resPrintBill('${b.id}')">🖨 Print</button></td>
      </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state" style="padding:20px;"><div class="empty-icon">🧾</div><h3>No bills generated yet</h3></div></td></tr>`;
    }

    // Payments Table
    const payTb = document.getElementById("res-payments-tbody");
    if(payTb) {
      payTb.innerHTML = allPayments.length ? allPayments.map(p => `<tr>
        <td class="td-mono">${esc(p.paymentId)}</td>
        <td class="td-muted">${esc(p.paymentDate)}</td>
        <td class="td-amount" style="color:var(--success);">+${formatCurrency(p.amount)}</td>
        <td><span class="badge badge-success">${esc(p.paymentMode||"UPI")}</span></td>
        <td class="td-muted">${esc(p.paymentType||"Regular")}</td>
        <td class="td-muted">${esc(p.referenceNumber||"—")}</td>
      </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state" style="padding:20px;"><div class="empty-icon">💳</div><h3>No payments recorded yet</h3></div></td></tr>`;
    }

    // Notices List
    const noticesList = document.getElementById("res-notices-list");
    if(noticesList) {
      noticesList.innerHTML = allNotices.slice(0,5).map(n => `
        <div style="border-left:3px solid ${n.priority==="Urgent"?"#c62828":n.priority==="Important"?"#e65100":"#1565c0"};padding:12px 16px;margin-bottom:12px;background:rgba(255,255,255,0.06);border-radius:0 10px 10px 0;">
          <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px;">${n.pinned?'📌 ':''}${esc(n.title)}</div>
          <div style="font-size:12.5px;color:var(--misty-sky);line-height:1.6;">${esc(n.body)}</div>
          <div style="font-size:11px;color:rgba(169,183,198,0.7);margin-top:6px;">— ${esc(n.postedBy||"Society Committee")}</div>
        </div>
      `).join("") || '<p style="color:var(--misty-sky);padding:10px;">No active notices.</p>';
    }
  }

  window.resPrintBill = (id) => {
    const b = allBills.find(x => x.id === id);
    if(b && window.openPrintModal) openPrintModal([b]);
    else if(b && window.executePrint) { window._pBills=[b]; window._pLayout=1; executePrint(); }
  };

  // Search flat form
  document.getElementById("res-search-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const flat = document.getElementById("res-flat-input").value.trim();
    if(!flat) { showToast("Enter your flat/house number", "error"); return; }
    residentFlat = flat;
    await loadResident(flat);
  });

  document.getElementById("btn-back-search")?.addEventListener("click", () => {
    searchSection.style.display = "block";
    dashSection.style.display = "none";
  });

  // Print all pending bills
  document.getElementById("btn-res-print-all")?.addEventListener("click", () => {
    const pending = allBills.filter(b => b.status === "Pending" || b.status === "Overdue");
    if(!pending.length) { showToast("No pending bills to print", "info"); return; }
    if(window.openPrintModal) openPrintModal(pending);
  });

  // Setup KYC Modal in resident portal
  setupKycModalHandlers();
}

// ═══════════════════════════════════════════════════════════
//  KYC REGISTRATION MODAL HANDLERS (House Owner & Tenant)
// ═══════════════════════════════════════════════════════════
function setupKycModalHandlers() {
  const modal = document.getElementById("modal-register-kyc");
  if (!modal) return;

  // Open triggers
  document.querySelectorAll(".btn-open-kyc-modal").forEach(btn => {
    btn.onclick = () => modal.classList.remove("hidden");
  });

  // Close triggers
  modal.querySelectorAll(".btn-close-kyc-modal").forEach(btn => {
    btn.onclick = () => modal.classList.add("hidden");
  });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });

  // Flat selection -> Auto-detect Line
  const flatSel = document.getElementById("kyc-flat");
  const lineDisp = document.getElementById("kyc-line-display");
  if (flatSel && lineDisp) {
    flatSel.onchange = (e) => {
      const val = e.target.value;
      if (!val) {
        lineDisp.value = "ઓટોમેટિક પસંદ થશે";
        return;
      }
      const line = getDuplexLine(val);
      lineDisp.value = `${line.name} (ઇન્ચાર્જ: ${line.incharge})`;
    };
  }

  // Tenant toggle
  const tenantCheck = document.getElementById("kyc-has-tenant");
  const tenantBox = document.getElementById("kyc-tenant-box");
  if (tenantCheck && tenantBox) {
    tenantCheck.onchange = () => {
      tenantBox.style.display = tenantCheck.checked ? "block" : "none";
    };
  }

  // Add family row
  const addFamBtn = document.getElementById("btn-add-family-row");
  const famCont = document.getElementById("kyc-family-container");
  if (addFamBtn && famCont) {
    addFamBtn.onclick = () => {
      const row = document.createElement("div");
      row.className = "family-row";
      row.style.cssText = "display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:center;";
      row.innerHTML = `
        <input type="text" class="fam-name" placeholder="સભ્યનું પૂરું નામ" style="padding:8px 12px;background:rgba(30,41,54,0.9);border:1px solid rgba(169,183,198,0.3);border-radius:6px;color:#fff;font-size:13px;outline:none;"/>
        <input type="number" class="fam-age" placeholder="ઉંમર" min="1" max="110" style="padding:8px 12px;background:rgba(30,41,54,0.9);border:1px solid rgba(169,183,198,0.3);border-radius:6px;color:#fff;font-size:13px;outline:none;"/>
        <input type="text" class="fam-rel" placeholder="સંબંધ" style="padding:8px 12px;background:rgba(30,41,54,0.9);border:1px solid rgba(169,183,198,0.3);border-radius:6px;color:#fff;font-size:13px;outline:none;"/>
        <button type="button" class="btn-remove-fam" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:700;">✕</button>
      `;
      famCont.appendChild(row);
      row.querySelector(".btn-remove-fam").onclick = () => row.remove();
    };

    famCont.querySelectorAll(".btn-remove-fam").forEach(b => {
      b.onclick = (e) => e.target.closest(".family-row")?.remove();
    });
  }

  // Submit KYC Registration
  const form = document.getElementById("form-register-kyc");
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const flat = document.getElementById("kyc-flat").value;
      const ownerName = document.getElementById("kyc-owner-name").value.trim();
      const phone = document.getElementById("kyc-phone").value.trim();
      const profession = document.getElementById("kyc-profession").value.trim();
      const car = document.getElementById("kyc-car")?.value.trim() || "";
      const bike = document.getElementById("kyc-bike")?.value.trim() || "";
      const hasTenant = document.getElementById("kyc-has-tenant")?.checked || false;

      if (!flat || !ownerName || !phone) {
        showToast("કૃપા કરીને જરૂરી તમામ વિગતો ભરો", "warning");
        return;
      }

      // Collect family members
      const family = [];
      document.querySelectorAll("#kyc-family-container .family-row").forEach(row => {
        const n = row.querySelector(".fam-name")?.value.trim();
        const a = parseInt(row.querySelector(".fam-age")?.value) || 0;
        const r = row.querySelector(".fam-rel")?.value.trim() || "";
        if (n) family.push({ name: n, age: a, relation: r });
      });

      const lineInfo = getDuplexLine(flat);

      const reqPayload = {
        flatNumber: flat,
        wing: "Main",
        ownerName: ownerName,
        contactNumber: phone,
        profession: profession,
        lineId: lineInfo.id,
        lineName: lineInfo.name,
        carNumber: car,
        bikeNumber: bike,
        familyMembers: family,
        hasTenant: hasTenant,
        status: "Pending",
        submittedAt: new Date().toISOString()
      };

      if (hasTenant) {
        reqPayload.tenantName = document.getElementById("kyc-tenant-name")?.value.trim() || "";
        reqPayload.tenantContact = document.getElementById("kyc-tenant-phone")?.value.trim() || "";
        reqPayload.tenantAadhaar = document.getElementById("kyc-tenant-aadhaar")?.value.trim() || "";
        reqPayload.tenantPan = document.getElementById("kyc-tenant-pan")?.value.trim() || "";
        reqPayload.tenantProfession = document.getElementById("kyc-tenant-profession")?.value.trim() || "";
        reqPayload.tenantFamily = document.getElementById("kyc-tenant-family")?.value.trim() || "";
        reqPayload.tenantStart = document.getElementById("kyc-tenant-start")?.value || "";
        reqPayload.tenantEnd = document.getElementById("kyc-tenant-end")?.value || "";
      }

      try {
        showToast("અરજી મોકલાઈ રહી છે...", "info");
        await addDoc2(C.MEMBER_REQUESTS, reqPayload);
        showToast("✅ અરજી સફળતાપૂર્વક મોકલાઈ! સમિતિ દ્વારા મંજૂર થતાં જ ખાતું એક્ટિવ થશે.", "success");
        form.reset();
        modal.classList.add("hidden");
      } catch (err) {
        showToast("અરજી મોકલવામાં ભૂલ: " + err.message, "error");
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════
//  EXCEL EXPORT
// ═══════════════════════════════════════════════════════════
function exportExcel(rows, title, headers, keys, widths, filename) {
  if(!rows||!rows.length){showToast("No data to export","warning");return;}
  const data=rows.map(r=>{const o={};headers.forEach((h,i)=>{o[h]=r[keys[i]]??"";});return o;});
  const ws=XLSX.utils.json_to_sheet(data,{origin:"A2"});
  ws["!cols"]=widths.map(w=>({wch:w}));
  ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:headers.length-1}}];
  ws["A1"]={v:title,t:"s"};
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,title.slice(0,31));
  XLSX.writeFile(wb,(filename||title.replace(/\s+/g,"_"))+"_"+Date.now()+".xlsx");
}

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
window.addEventListener("load",async()=>{
  if(!initFirebase())return;
  console.log("🚀 Page:", PAGE_NAME);
  if(PAGE_NAME==="dashboard")                     initDashboardPage();
  else if(PAGE_NAME==="index"||PAGE_NAME==="")    initHomePage();
  else if(PAGE_NAME==="members")                  initMembersPage();
  else if(PAGE_NAME==="maintenance")              initMaintenancePage();
  else if(PAGE_NAME==="payments")                 initPaymentsPage();
  else if(PAGE_NAME==="expenses")                 initExpensesPage();
  else if(PAGE_NAME==="funds")                    initFundsPage();
  else if(PAGE_NAME==="events")                   initEventsPage();
  else if(PAGE_NAME==="notices")                  initNoticesPage();
  else if(PAGE_NAME==="reports")                  initReportsPage();
  else if(PAGE_NAME==="resident")                 initResidentPage();
});
