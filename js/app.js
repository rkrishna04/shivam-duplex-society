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
  MEMBERS:    "sd_members",
  MAINT_BILLS:"sd_maintenance_bills",
  PAYMENTS:   "sd_payments",
  EXPENSES:   "sd_expenses",
  EVENTS:     "sd_events",
  FUNDS:      "sd_funds",
  NOTICES:    "sd_notices",
  META:       "sd_meta",
};

// Society fee constants
const MONTHLY_FEE    = 600;   // ₹600/month
const SIX_MONTH_FEE  = 3600;  // ₹3600 for 6 months
const ANNUAL_FEE     = 7200;  // ₹7200/year

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
  return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
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
      const months=[];const mData=[];
      for(let i=5;i>=0;i--){
        const d=new Date(now.getFullYear(),now.getMonth()-i,1);
        const key=d.toISOString().slice(0,7);
        const label=d.toLocaleDateString("en-IN",{month:"short",year:"2-digit"});
        months.push(label);
        mData.push(payments.filter(p=>(p.paymentDate||"").startsWith(key)).reduce((s,p)=>s+(parseFloat(p.amount)||0),0));
      }
      const ctx1=document.getElementById("chart-collection");
      if(ctx1)new Chart(ctx1,{type:"bar",data:{labels:months,datasets:[{label:"Collection (₹)",data:mData,
        backgroundColor:months.map((_,i)=>`rgba(${79+i*10},${70+i*5},229,${0.55+i*0.04})`),
        borderColor:"rgba(129,140,248,0.8)",borderWidth:1,borderRadius:8,borderSkipped:false}]},
        options:{responsive:true,plugins:{legend:{display:false},tooltip:{backgroundColor:"rgba(15,10,50,0.9)",titleColor:"#a5b4fc",bodyColor:"white",borderColor:"rgba(79,70,229,0.4)",borderWidth:1}},
        scales:{y:{beginAtZero:true,grid:{color:"rgba(255,255,255,0.05)"},ticks:{color:"rgba(165,180,252,0.7)",font:{size:11}}},
        x:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:"rgba(165,180,252,0.7)",font:{size:11}}}}}});

      // Bill status donut
      const paid=bills.filter(b=>b.status==="Paid").length;
      const over=bills.filter(b=>b.status==="Overdue").length;
      const part=bills.filter(b=>b.status==="Partial").length;
      const ctx2=document.getElementById("chart-status");
      if(ctx2)new Chart(ctx2,{type:"doughnut",data:{labels:["Paid","Pending","Overdue","Partial"],
        datasets:[{data:[paid,pending.length-over,over,part],
        backgroundColor:["rgba(16,185,129,0.75)","rgba(245,158,11,0.75)","rgba(239,68,68,0.75)","rgba(139,92,246,0.75)"],
        borderColor:["rgba(16,185,129,0.4)","rgba(245,158,11,0.4)","rgba(239,68,68,0.4)","rgba(139,92,246,0.4)"],
        borderWidth:2,hoverOffset:6}]},
        options:{responsive:true,cutout:"65%",plugins:{legend:{position:"bottom",labels:{color:"rgba(165,180,252,0.8)",padding:14,font:{size:11}}},
        tooltip:{backgroundColor:"rgba(15,10,50,0.9)",titleColor:"#a5b4fc",bodyColor:"white",borderColor:"rgba(79,70,229,0.4)",borderWidth:1}}}});
    }
  } catch(e){showToast("Dashboard load failed: "+e.message,"error");}
}

// ═══════════════════════════════════════════════════════════
//  PAGE: MEMBERS (with tenant management)
// ═══════════════════════════════════════════════════════════
async function initMembersPage() {
  initSidebar();
  let all=[],filtered=[],page=1,editId=null;
  const PS=10;

  async function load(){
    showLoader();
    try{all=await getAll(C.MEMBERS);all.sort((a,b)=>(a.flatNumber||"").localeCompare(b.flatNumber||""));applyFilter();}
    catch(e){showToast("Load failed: "+e.message,"error");}
    finally{hideLoader();}
  }

  function applyFilter(){
    const q=document.getElementById("search")?.value.toLowerCase()||"";
    const w=document.getElementById("filter-wing")?.value||"";
    const st=document.getElementById("filter-status")?.value||"";
    const ty=document.getElementById("filter-type")?.value||"";
    filtered=all.filter(m=>(!q||(m.flatNumber||"").toLowerCase().includes(q)||(m.ownerName||"").toLowerCase().includes(q)||(m.tenantName||"").toLowerCase().includes(q)||(m.contactNumber||"").includes(q))&&(!w||m.wing===w)&&(!st||m.status===st)&&(!ty||m.memberType===ty));
    document.getElementById("member-count").textContent=filtered.length;
    page=1;render(1);
  }

  function render(p){
    page=p;const rows=filtered.slice((p-1)*PS,p*PS);const tb=document.getElementById("tbody");
    if(!filtered.length){tb.innerHTML=`<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🏠</div><h3>No members found</h3><p>Click "+ Add Member" to start.</p></div></td></tr>`;makePagination(filtered,p,PS,render);return;}
    tb.innerHTML=rows.map(m=>`<tr>
      <td class="td-mono">${esc(m.flatNumber)}</td>
      <td><span class="badge badge-info">${esc(m.wing)}</span></td>
      <td class="col-dept"><strong>${esc(m.ownerName)}</strong>${m.tenantName?`<br><span style="font-size:11px;color:var(--text-muted);">🔑 Tenant: ${esc(m.tenantName)}</span>`:""}</td>
      <td>${esc(m.contactNumber)}</td>
      <td class="td-muted" style="font-size:12px;">${m.tenantContact?esc(m.tenantContact):"—"}</td>
      <td class="col-slot td-muted">${esc(m.parkingSlot||"—")}</td>
      <td>${esc(m.memberType||"Owner")}</td>
      <td>${statusBadge(m.status||"Active")}</td>
      <td class="td-muted" style="font-size:11px;">${formatCurrency(m.maintenanceAmount||MONTHLY_FEE)}<br><span style="color:var(--text-muted);">per month</span></td>
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
    const fields=["flatNumber","wing","ownerName","contactNumber","email","parkingSlot","moveInDate","memberType","status","maintenanceAmount","tenantName","tenantContact","tenantEmail","tenantAadhar","tenantRentStart","tenantRentEnd"];
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

  ["search","filter-wing","filter-status","filter-type"].forEach(id=>
    document.getElementById(id)?.addEventListener(id==="search"?"input":"change",debounce(applyFilter,250)));

  document.getElementById("memberType")?.addEventListener("change",toggleTenantSection);
  document.getElementById("hasTenant")?.addEventListener("change",toggleTenantSection);

  document.getElementById("btn-add-member")?.addEventListener("click",()=>{
    editId=null;document.getElementById("member-form")?.reset();
    document.getElementById("modal-title").textContent="Add Member";
    document.getElementById("maintenanceAmount").value=MONTHLY_FEE;
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
      ownerName:document.getElementById("ownerName").value.trim(),
      contactNumber:document.getElementById("contactNumber").value.trim(),
      email:document.getElementById("email")?.value.trim()||"",
      parkingSlot:document.getElementById("parkingSlot")?.value.trim()||"",
      moveInDate:document.getElementById("moveInDate")?.value||"",
      memberType:document.getElementById("memberType")?.value||"Owner",
      status:document.getElementById("status")?.value||"Active",
      maintenanceAmount:parseFloat(document.getElementById("maintenanceAmount")?.value)||MONTHLY_FEE,
      // Tenant info
      tenantName:document.getElementById("tenantName")?.value.trim()||"",
      tenantContact:document.getElementById("tenantContact")?.value.trim()||"",
      tenantEmail:document.getElementById("tenantEmail")?.value.trim()||"",
      tenantAadhar:document.getElementById("tenantAadhar")?.value.trim()||"",
      tenantRentStart:document.getElementById("tenantRentStart")?.value||"",
      tenantRentEnd:document.getElementById("tenantRentEnd")?.value||"",
      tenantRent:parseFloat(document.getElementById("tenantRent")?.value)||0,
      hasTenant:!!(document.getElementById("hasTenant")?.checked||document.getElementById("tenantName")?.value.trim()),
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
      ["Flat","Wing","Owner Name","Contact","Email","Parking","Type","Status","Maint/Month","Tenant Name","Tenant Contact","Rent Start","Rent End"],
      ["flatNumber","wing","ownerName","contactNumber","email","parkingSlot","memberType","status","maintenanceAmount","tenantName","tenantContact","tenantRentStart","tenantRentEnd"],
      [10,8,22,14,26,10,10,10,14,22,14,13,13]);
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
    try{all=await getAll(C.EXPENSES);all.sort((a,b)=>(b.date||"").localeCompare(a.date||""));updateStats();applyFilter();}
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
    try{all=await getAll(C.FUNDS);all.sort((a,b)=>(b.date||"").localeCompare(a.date||""));updateStats();applyFilter();}
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
//  PAGE: EVENTS
// ═══════════════════════════════════════════════════════════
async function initEventsPage() {
  initSidebar();
  let all=[],editId=null;

  async function load(){
    const loader=document.getElementById("loader");if(loader)loader.style.display="flex";
    try{all=await getAll(C.EVENTS);all.sort((a,b)=>(b.startDate||"").localeCompare(a.startDate||""));render();}
    catch(e){showToast("Load failed: "+e.message,"error");}
    finally{const loader=document.getElementById("loader");if(loader)loader.style.display="none";}
  }

  function render(){
    const grid=document.getElementById("events-grid"),empty=document.getElementById("empty-state");
    if(!all.length){if(grid)grid.innerHTML="";if(empty)empty.style.display="block";return;}
    if(empty)empty.style.display="none";
    grid.innerHTML=all.map(e=>{
      const bgt=parseFloat(e.estimatedBudget)||0,act=parseFloat(e.actualExpenses)||0,con=parseFloat(e.contributions)||0;
      const over=act>bgt,pct=bgt>0?Math.min(Math.round(act/bgt*100),100):0;
      return `<div class="card" style="overflow:visible;">
        <div style="padding:16px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div><div style="font-size:15px;font-weight:700;color:var(--primary);">${esc(e.eventName)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">📅 ${esc(e.startDate)}${e.endDate&&e.endDate!==e.startDate?" → "+esc(e.endDate):""}</div></div>
          ${statusBadge(e.status||"Planned")}
        </div>
        <div style="padding:14px 18px;">
          ${e.venue?`<div style="font-size:12.5px;color:var(--text-muted);margin-bottom:6px;">📍 ${esc(e.venue)}</div>`:""}
          ${e.organizedBy?`<div style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">👤 ${esc(e.organizedBy)}</div>`:""}
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
            <div style="text-align:center;background:#f7f9fc;border-radius:8px;padding:8px;"><div style="font-size:10px;color:var(--text-muted);font-weight:600;">BUDGET</div><div style="font-size:14px;font-weight:700;color:var(--primary);">${formatCurrency(bgt)}</div></div>
            <div style="text-align:center;background:${over?"#ffebee":"#e8f5e9"};border-radius:8px;padding:8px;"><div style="font-size:10px;color:var(--text-muted);font-weight:600;">ACTUAL</div><div style="font-size:14px;font-weight:700;color:${over?"var(--danger)":"var(--success)"};">${formatCurrency(act)}</div></div>
            <div style="text-align:center;background:#e8eaf6;border-radius:8px;padding:8px;"><div style="font-size:10px;color:var(--text-muted);font-weight:600;">CONTRIB</div><div style="font-size:14px;font-weight:700;color:var(--info);">${formatCurrency(con)}</div></div>
          </div>
          ${bgt>0?`<div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px;"><span>Budget used</span><span>${pct}%</span></div><div style="background:#e0e0e0;border-radius:20px;height:6px;"><div style="width:${pct}%;background:${over?"var(--danger)":"var(--success)"};height:100%;border-radius:20px;"></div></div></div>`:""}
          ${e.description?`<div style="font-size:12px;color:var(--text-muted);background:#f7f9fc;border-radius:6px;padding:8px;margin-top:10px;white-space:pre-line;">${esc(e.description)}</div>`:""}
        </div>
        <div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline btn-sm" onclick="evtEdit('${e.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="evtDel('${e.id}')">🗑 Delete</button>
        </div>
      </div>`;
    }).join("");
  }

  window.evtEdit=(id)=>{const e=all.find(x=>x.id===id);if(!e)return;editId=id;document.getElementById("modal-title").textContent="Edit Event";["eventName","startDate","endDate","venue","organizedBy","description"].forEach(k=>{const el=document.getElementById(k);if(el)el.value=e[k]||"";});["estimatedBudget","actualExpenses","contributions"].forEach(k=>{const el=document.getElementById(k);if(el)el.value=e[k]||"";});document.getElementById("eventStatus").value=e.status||"Planned";document.getElementById("modal").classList.remove("hidden");};
  window.evtDel=async(id)=>{if(!confirm("Delete event?"))return;try{await deleteDoc2(C.EVENTS,id);showToast("Deleted","success");await load();}catch(e){showToast("Error: "+e.message,"error");}};

  document.getElementById("btn-add")?.addEventListener("click",()=>{editId=null;document.getElementById("modal-title").textContent="Add Event";document.getElementById("modal")?.querySelectorAll("input,select,textarea").forEach(el=>{el.value="";});document.getElementById("modal").classList.remove("hidden");});
  document.getElementById("modal-close")?.addEventListener("click",()=>{document.getElementById("modal").classList.add("hidden");editId=null;});
  document.getElementById("btn-cancel")?.addEventListener("click",()=>{document.getElementById("modal").classList.add("hidden");editId=null;});
  document.getElementById("btn-save")?.addEventListener("click",async()=>{
    const data={eventName:document.getElementById("eventName").value.trim(),startDate:document.getElementById("startDate").value,endDate:document.getElementById("endDate")?.value||"",venue:document.getElementById("venue")?.value.trim()||"",organizedBy:document.getElementById("organizedBy")?.value.trim()||"",estimatedBudget:parseFloat(document.getElementById("estimatedBudget")?.value)||0,actualExpenses:parseFloat(document.getElementById("actualExpenses")?.value)||0,contributions:parseFloat(document.getElementById("contributions")?.value)||0,status:document.getElementById("eventStatus").value,description:document.getElementById("description")?.value.trim()||""};
    if(!data.eventName||!data.startDate){showToast("Fill event name and start date","error");return;}
    try{
      if(editId){await updateDoc2(C.EVENTS,editId,data);showToast("Updated!","success");}
      else{await addDoc2(C.EVENTS,data);showToast("Event added!","success");}
      document.getElementById("modal").classList.add("hidden");editId=null;await load();
    }catch(e){showToast("Save failed: "+e.message,"error");}
  });
  document.getElementById("btn-export")?.addEventListener("click",()=>{exportExcel(all,"Event Register",["Event","Start","End","Venue","Organized By","Budget","Actual","Contributions","Status"],["eventName","startDate","endDate","venue","organizedBy","estimatedBudget","actualExpenses","contributions","status"],[28,13,13,20,20,14,16,14,12]);showToast("Exported!","success");});
  await load();
}

// ═══════════════════════════════════════════════════════════
//  PAGE: NOTICES
// ═══════════════════════════════════════════════════════════
async function initNoticesPage() {
  initSidebar();
  let all=[],editId=null;

  async function load(){
    try{all=await getAll(C.NOTICES);all.sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));render();}
    catch(e){showToast("Load failed: "+e.message,"error");}
  }

  const priColors={Urgent:"#ffebee",Important:"#fff3e0",General:"#e8eaf6"};
  const priText={Urgent:"#c62828",Important:"#e65100",General:"#1565c0"};
  const priIcons={Urgent:"🚨",Important:"⚠️",General:"📌"};

  function render(){
    const cat=document.getElementById("filter-cat")?.value||"";
    const pri=document.getElementById("filter-priority")?.value||"";
    let shown=all.filter(n=>(!cat||n.category===cat)&&(!pri||n.priority===pri));
    shown.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    const list=document.getElementById("notices-list"),empty=document.getElementById("empty-state");
    if(!shown.length){if(list)list.innerHTML="";if(empty)empty.style.display="block";return;}
    if(empty)empty.style.display="none";
    list.innerHTML=shown.map(n=>`<div class="card" style="margin-bottom:14px;border-left:4px solid ${priText[n.priority]||"#1a237e"};">
      <div style="padding:14px 18px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
              ${n.pinned===true||n.pinned==="true"?'<span>📌</span>':""}
              <span style="font-size:16px;font-weight:700;color:var(--primary);">${esc(n.title)}</span>
              <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;background:${priColors[n.priority]||"#e8eaf6"};color:${priText[n.priority]||"#1565c0"};">${priIcons[n.priority]||""} ${esc(n.priority||"General")}</span>
              <span class="badge badge-info">${esc(n.category||"General")}</span>
            </div>
            <div style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;white-space:pre-wrap;">${esc(n.body)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);">
          <div style="font-size:11.5px;color:var(--text-muted);">👤 ${esc(n.postedBy||"Society Committee")}${n.expiryDate?" · Expires: "+esc(n.expiryDate):""}</div>
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
//  PAGE: RESIDENT PORTAL
// ═══════════════════════════════════════════════════════════
async function initResidentPage() {
  const searchSection=document.getElementById("resident-search");
  const dashSection=document.getElementById("resident-dash");
  let residentFlat="", memberData=null, allBills=[], allPayments=[], allNotices=[];

  async function loadResident(flatNumber) {
    showToast("Loading your account…","info");
    document.getElementById("res-loading").style.display="flex";
    try {
      const [members,bills,payments,notices]=await Promise.all([
        getAll(C.MEMBERS),getAll(C.MAINT_BILLS),getAll(C.PAYMENTS),getAll(C.NOTICES)
      ]);
      const member=members.find(m=>m.flatNumber.toLowerCase().trim()===flatNumber.toLowerCase().trim());
      if(!member){showToast("Flat not found. Check the flat number.","error");document.getElementById("res-loading").style.display="none";return;}

      memberData=member;
      allBills=bills.filter(b=>b.flatNumber===member.flatNumber).sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
      allPayments=payments.filter(p=>p.flatNumber===member.flatNumber).sort((a,b)=>(b.paymentDate||"").localeCompare(a.paymentDate||""));
      allNotices=notices.filter(n=>n.status!=="Inactive").sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));

      renderResidentDash();
      searchSection.style.display="none";
      dashSection.style.display="block";
    }catch(e){showToast("Error: "+e.message,"error");}
    finally{document.getElementById("res-loading").style.display="none";}
  }

  function renderResidentDash(){
    const m=memberData;
    // Header
    document.getElementById("res-name").textContent=m.ownerName;
    document.getElementById("res-flat").textContent=`House ${m.flatNumber}, Wing ${m.wing}`;
    document.getElementById("res-type").textContent=m.memberType||"Owner";
    document.getElementById("res-contact").textContent=m.contactNumber||"";

    // Stats
    const totalBilled=allBills.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0);
    const totalPaid=allPayments.reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    const balance=totalPaid-totalBilled;
    const pending=allBills.filter(b=>b.status==="Pending"||b.status==="Overdue");

    const se=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    se("res-stat-pending",pending.length);
    se("res-stat-pending-amt",formatCurrency(pending.reduce((s,b)=>s+(parseFloat(b.totalAmount)||0),0)));
    se("res-stat-balance",formatCurrency(Math.abs(balance)));
    se("res-stat-balance-label",balance>=0?"💎 Advance Credit":"⚠️ Outstanding");
    se("res-stat-paid",formatCurrency(totalPaid));
    se("res-stat-monthly",formatCurrency(m.maintenanceAmount||MONTHLY_FEE));

    // Tenant info (if house is rented)
    const tenantCard=document.getElementById("tenant-info-card");
    if(tenantCard){
      if(m.tenantName){
        tenantCard.style.display="block";
        se("res-tenant-name",m.tenantName);
        se("res-tenant-contact",m.tenantContact||"—");
        se("res-tenant-rent",`${m.tenantRentStart||"—"} to ${m.tenantRentEnd||"—"}`);
      } else {
        tenantCard.style.display="none";
      }
    }

    // Bills table
    const billsTb=document.getElementById("res-bills-tbody");
    if(billsTb){
      billsTb.innerHTML=allBills.length?allBills.map(b=>`<tr>
        <td class="td-mono">${esc(b.billNumber)}</td>
        <td>${esc(b.period)}</td>
        <td class="td-amount">${formatCurrency(b.totalAmount)}</td>
        <td>${esc(b.dueDate)}</td>
        <td>${statusBadge(b.status)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="resPrintBill('${b.id}')">🖨 Print</button></td>
      </tr>`).join(""):`<tr><td colspan="6"><div class="empty-state" style="padding:20px;"><div class="empty-icon">🧾</div><h3>No bills yet</h3></div></td></tr>`;
    }

    // Payments table
    const payTb=document.getElementById("res-payments-tbody");
    if(payTb){
      payTb.innerHTML=allPayments.length?allPayments.map(p=>`<tr>
        <td class="td-mono">${esc(p.paymentId)}</td>
        <td class="td-muted">${esc(p.paymentDate)}</td>
        <td class="td-amount" style="color:var(--success);">+${formatCurrency(p.amount)}</td>
        <td><span class="badge badge-success">${esc(p.paymentMode||"Cash")}</span></td>
        <td class="td-muted">${esc(p.paymentType==="Advance"?"Advance":p.paymentType==="Advance-Annual"?"Annual Advance":p.paymentType==="Advance-HalfYear"?"6-Month Advance":"Regular")}</td>
        <td class="td-muted">${esc(p.referenceNumber||"—")}</td>
      </tr>`).join(""):`<tr><td colspan="6"><div class="empty-state" style="padding:20px;"><div class="empty-icon">💳</div><h3>No payments recorded</h3></div></td></tr>`;
    }

    // Notices
    const noticesList=document.getElementById("res-notices-list");
    if(noticesList){
      noticesList.innerHTML=allNotices.slice(0,5).map(n=>`
        <div style="border-left:3px solid ${n.priority==="Urgent"?"#c62828":n.priority==="Important"?"#e65100":"#1565c0"};padding:10px 14px;margin-bottom:10px;background:white;border-radius:0 8px 8px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${n.pinned?'📌 ':''}${esc(n.title)}</div>
          <div style="font-size:12.5px;color:#555;line-height:1.5;">${esc(n.body.slice(0,200))}${n.body.length>200?"…":""}</div>
          <div style="font-size:11px;color:#888;margin-top:6px;">— ${esc(n.postedBy||"Society Committee")}</div>
        </div>`).join("")||'<p style="color:#888;padding:10px;">No active notices.</p>';
    }
  }

  window.resPrintBill=(id)=>{
    const b=allBills.find(x=>x.id===id);
    if(b&&window.openPrintModal)openPrintModal([b]);
    else if(b&&window.executePrint){window._pBills=[b];window._pLayout=1;executePrint();}
  };

  // Tab switching
  document.querySelectorAll('.res-tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.res-tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.res-tab-content').forEach(c=>c.style.display='none');
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).style.display='block';
    });
  });

  // Search form
  document.getElementById("res-search-form")?.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const flat=document.getElementById("res-flat-input").value.trim();
    if(!flat){showToast("Enter your flat/house number","error");return;}
    residentFlat=flat;
    await loadResident(flat);
  });

  document.getElementById("btn-back-search")?.addEventListener("click",()=>{
    searchSection.style.display="block";dashSection.style.display="none";
  });

  // Print all pending bills
  document.getElementById("btn-res-print-all")?.addEventListener("click",()=>{
    const pending=allBills.filter(b=>b.status==="Pending"||b.status==="Overdue");
    if(!pending.length){showToast("No pending bills to print","info");return;}
    if(window.openPrintModal)openPrintModal(pending);
  });
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
  if(PAGE_NAME==="index"||PAGE_NAME==="")         initDashboardPage();
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
