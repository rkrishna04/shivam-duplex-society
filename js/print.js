// ============================================================
//  print.js v3 — SHIVAM DUPLEX Society
//  Layouts: 1 / 2 / 3 / 4 horizontal strips per A4 page
//  4-strip = user's exact requested layout with cut marks
// ============================================================

/* ─── Number to Words ─────────────────────────────────── */
function numToWords(amount){const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];function w(n){if(n<20)return ones[n];if(n<100)return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");if(n<1000)return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+w(n%100):"");if(n<100000)return w(Math.floor(n/1000))+" Thousand"+(n%1000?" "+w(n%1000):"");if(n<10000000)return w(Math.floor(n/100000))+" Lakh"+(n%100000?" "+w(n%100000):"");return w(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+w(n%10000000):"");}const num=Math.round(parseFloat(amount)||0);if(!num)return"Zero Rupees Only";return w(num)+" Rupees Only";}

/* ─── STRIP receipt (horizontal, for 2/3/4 per page) ─── */
function buildStripHTML(bill) {
  const maint=parseFloat(bill.maintenanceAmount)||0;
  const late=parseFloat(bill.lateFee)||0;
  const total=parseFloat(bill.totalAmount)||(maint+late);
  const st=(bill.status||"Pending").toLowerCase();
  const stBg=st==="paid"?"#e8f5e9":st==="overdue"?"#ffebee":"#fff3e0";
  const stColor=st==="paid"?"#1b5e20":st==="overdue"?"#b71c1c":"#e65100";
  return `<div style="width:100%;height:100%;box-sizing:border-box;border:1.5px solid #1a237e;border-radius:4px;padding:5mm 7mm;font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;display:flex;flex-direction:column;justify-content:space-between;position:relative;">
    ${st==="paid"?`<div style="position:absolute;top:8px;right:12px;border:2.5px solid #1b5e20;color:#1b5e20;border-radius:3px;padding:1px 7px;font-weight:900;font-size:8pt;transform:rotate(-12deg);opacity:0.6;letter-spacing:2px;">PAID ✓</div>`:""}
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid #1a237e;padding-bottom:3mm;margin-bottom:3mm;">
      <div style="display:flex;align-items:center;gap:7px;">
        <span style="font-size:18px;line-height:1;">🏘</span>
        <div><div style="font-size:9.5pt;font-weight:800;color:#1a237e;letter-spacing:0.3px;">SHIVAM DUPLEX SOCIETY</div><div style="font-size:7pt;color:#666;font-style:italic;">Maintenance Payment Receipt</div></div>
      </div>
      <div style="text-align:right;"><div style="font-size:9pt;font-weight:800;color:#1a237e;">${bill.billNumber||"—"}</div><div style="font-size:7.5pt;color:#666;">Period: ${bill.period||"—"}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1.5fr 1fr;gap:6px;margin-bottom:3mm;">
      <div><div style="font-size:6.5pt;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;">Member Name</div><div style="font-size:9pt;font-weight:700;">${(bill.memberName||"—").replace(/</g,"&lt;")}</div></div>
      <div><div style="font-size:6.5pt;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;">House / Flat</div><div style="font-size:9pt;font-weight:700;">${(bill.flatNumber||"—").replace(/</g,"&lt;")}${bill.wing?", Wing "+bill.wing:""}</div></div>
      <div style="text-align:right;"><div style="background:${stBg};color:${stColor};font-weight:800;font-size:7.5pt;padding:2px 8px;border-radius:3px;display:inline-block;letter-spacing:0.5px;">${(bill.status||"PENDING").toUpperCase()}</div><div style="font-size:7pt;color:#888;margin-top:2px;">Due: ${bill.dueDate||"—"}</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px dashed #ccc;padding-top:3mm;">
      <div>
        <span style="color:#666;font-size:8pt;">Maintenance: </span><span style="font-weight:600;">₹${maint.toFixed(2)}</span>
        ${late>0?`<span style="color:#666;font-size:8pt;margin-left:10px;">Late Fee: </span><span style="font-weight:600;color:#e65100;">₹${late.toFixed(2)}</span>`:""}
        <span style="font-size:10.5pt;font-weight:800;color:#1a237e;margin-left:14px;">TOTAL: ₹${total.toFixed(2)}</span>
        <div style="font-size:7pt;color:#555;font-style:italic;margin-top:2px;">${numToWords(total)}</div>
      </div>
      <div style="display:flex;gap:18mm;font-size:7pt;color:#666;">
        <div>Resident Signature<br><div style="border-top:1px solid #555;width:40mm;margin-top:6px;"></div></div>
        <div>Authorised Signatory<br><div style="border-top:1px solid #555;width:40mm;margin-top:6px;"></div></div>
      </div>
    </div>
  </div>`;
}

/* ─── PORTRAIT receipt (full page, 1 per page) ────────── */
function buildReceiptHTML(bill, isCompact) {
  const maint=parseFloat(bill.maintenanceAmount)||0;
  const late=parseFloat(bill.lateFee)||0;
  const total=parseFloat(bill.totalAmount)||(maint+late);
  const st=(bill.status||"Pending").toLowerCase();
  const stColor=st==="paid"?"color:#1b5e20;background:#e8f5e9":st==="overdue"?"color:#b71c1c;background:#ffebee":"color:#e65100;background:#fff3e0";
  const fs=isCompact?"7pt":"9.5pt";const fsSm=isCompact?"6.5pt":"8pt";const fsH=isCompact?"9pt":"12pt";
  return `<div style="border:2px solid #1a237e;border-radius:6px;padding:${isCompact?"6mm 7mm":"9mm 11mm"};display:flex;flex-direction:column;height:100%;box-sizing:border-box;font-size:${fs};font-family:Arial,Helvetica,sans-serif;position:relative;overflow:hidden;">
    ${st==="paid"?`<div style="position:absolute;top:14px;right:10px;border:3px solid #1b5e20;color:#1b5e20;border-radius:4px;padding:1px 8px;font-weight:900;font-size:${isCompact?"8pt":"11pt"};transform:rotate(-18deg);opacity:0.65;letter-spacing:2px;pointer-events:none;">PAID ✓</div>`:""}
    <div style="text-align:center;border-bottom:2px solid #1a237e;padding-bottom:${isCompact?"4px":"7px"};margin-bottom:${isCompact?"4px":"8px"};">
      <div style="font-size:${isCompact?"14px":"20px"};line-height:1;">🏘</div>
      <div style="font-size:${fsH};font-weight:800;color:#1a237e;letter-spacing:0.3px;margin:2px 0;">SHIVAM DUPLEX SOCIETY</div>
      <div style="font-size:${fsSm};color:#666;font-style:italic;">Maintenance Payment Receipt</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:${fs};">
      <tr><td style="color:#777;padding:2px 4px;width:44%;">Receipt No.</td><td style="font-weight:700;padding:2px 4px;">${bill.billNumber||"—"}</td></tr>
      <tr><td style="color:#777;padding:2px 4px;">Period</td><td style="font-weight:600;padding:2px 4px;">${bill.period||"—"}</td></tr>
      <tr><td style="color:#777;padding:2px 4px;">Due Date</td><td style="padding:2px 4px;">${bill.dueDate||"—"}</td></tr>
      <tr><td colspan="2"><div style="border-top:1px dashed #ccc;margin:3px 0 2px;"></div></td></tr>
      <tr><td style="color:#777;padding:2px 4px;">Member Name</td><td style="font-weight:700;padding:2px 4px;">${(bill.memberName||"—").replace(/</g,"&lt;")}</td></tr>
      <tr><td style="color:#777;padding:2px 4px;">House / Flat No.</td><td style="padding:2px 4px;">${(bill.flatNumber||"—").replace(/</g,"&lt;")}${bill.wing?", Wing "+bill.wing:""}</td></tr>
      <tr><td style="color:#777;padding:2px 4px;">Contact</td><td style="padding:2px 4px;">${bill.contactNumber||"—"}</td></tr>
      <tr><td colspan="2"><div style="border-top:1px dashed #ccc;margin:3px 0 2px;"></div></td></tr>
      <tr><td style="color:#777;padding:2px 4px;">Maintenance Charges</td><td style="text-align:right;padding:2px 4px;">₹${maint.toFixed(2)}</td></tr>
      ${late>0?`<tr><td style="color:#777;padding:2px 4px;">Late Fee</td><td style="text-align:right;padding:2px 4px;color:#e65100;">₹${late.toFixed(2)}</td></tr>`:""}
      <tr style="border-top:2px solid #1a237e;"><td style="color:#1a237e;font-weight:800;padding:4px 4px;font-size:${isCompact?"8pt":"10pt"};">TOTAL AMOUNT</td><td style="text-align:right;color:#1a237e;font-weight:800;padding:4px 4px;font-size:${isCompact?"8pt":"10pt"};">₹${total.toFixed(2)}</td></tr>
    </table>
    <div style="background:#eef2ff;border-radius:3px;padding:4px 7px;font-size:${fsSm};color:#444;font-style:italic;margin:${isCompact?"4px 0":"6px 0"};"><strong>In Words:</strong> ${numToWords(total)}</div>
    <div style="text-align:center;${stColor};font-weight:700;border-radius:4px;padding:3px 6px;font-size:${fsSm};letter-spacing:1px;margin-bottom:${isCompact?"3px":"5px"};">STATUS: ${(bill.status||"PENDING").toUpperCase()}</div>
    <div style="margin-top:auto;padding-top:${isCompact?"5mm":"8mm"};display:flex;justify-content:space-between;gap:8px;">
      <div style="flex:1;text-align:center;"><div style="border-top:1px solid #555;margin-bottom:3px;"></div><div style="font-size:${fsSm};color:#777;">Resident Signature</div></div>
      <div style="flex:1;text-align:center;"><div style="border-top:1px solid #555;margin-bottom:3px;"></div><div style="font-size:${fsSm};color:#777;">Authorised Signatory</div></div>
    </div>
  </div>`;
}

/* ─── CUT LINE HTML ────────────────────────────────────── */
function cutLineHTML(){
  return `<div style="height:8px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
    <div style="position:absolute;left:0;right:0;border-top:1.5px dashed #bbb;"></div>
    <div style="background:white;padding:0 6px;font-size:7pt;color:#bbb;position:relative;letter-spacing:1px;">✂ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✂</div>
  </div>`;
}

/* ─── Open Print Preview Modal ─────────────────────────── */
function openPrintModal(bills) {
  if(!bills||!bills.length){if(typeof showToast==="function")showToast("Select at least one bill to print","warning");else alert("Select at least one bill.");return;}
  const old=document.getElementById("print-modal");if(old)old.remove();
  const modal=document.createElement("div");
  modal.id="print-modal";
  modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:99999;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;";
  modal.innerHTML=`<div style="background:white;border-radius:14px;width:100%;max-width:960px;overflow:hidden;margin:auto;box-shadow:0 24px 80px rgba(0,0,0,.4);">
    <div style="background:linear-gradient(135deg,#1a237e,#3949ab);color:white;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;">
      <div><div style="font-size:18px;font-weight:800;">🖨 Print Maintenance Bills</div><div style="font-size:12px;opacity:.75;margin-top:3px;">${bills.length} bill${bills.length>1?"s":""} — choose how to fit on A4</div></div>
      <button onclick="closePrintModal()" style="background:rgba(255,255,255,.2);border:none;color:white;font-size:20px;cursor:pointer;border-radius:8px;padding:5px 12px;">✕</button>
    </div>
    <div style="padding:18px 24px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;flex-wrap:wrap;gap:18px;background:#fafbff;">
      <div>
        <div style="font-size:11px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:9px;">BILLS PER A4 PAGE (horizontal strips with cut lines)</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;" id="pm-layout-btns">
          <button onclick="setPrintLayout(1)" data-n="1" class="pm-lb" style="padding:8px 14px;border:2px solid #1a237e;background:#1a237e;color:white;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;text-align:left;min-width:90px;">1 per page<br><span style="font-size:9px;font-weight:400;opacity:.8;">Full A4 receipt</span></button>
          <button onclick="setPrintLayout(2)" data-n="2" class="pm-lb" style="padding:8px 14px;border:2px solid #ddd;background:white;color:#333;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;text-align:left;min-width:90px;">2 per page<br><span style="font-size:9px;font-weight:400;opacity:.6;">2 strips + cut lines</span></button>
          <button onclick="setPrintLayout(3)" data-n="3" class="pm-lb" style="padding:8px 14px;border:2px solid #ddd;background:white;color:#333;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;text-align:left;min-width:90px;">3 per page<br><span style="font-size:9px;font-weight:400;opacity:.6;">3 strips + cut lines</span></button>
          <button onclick="setPrintLayout(4)" data-n="4" class="pm-lb" style="padding:8px 14px;border:2px solid #ddd;background:white;color:#333;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;text-align:left;min-width:90px;">4 per page<br><span style="font-size:9px;font-weight:400;opacity:.6;">4 strips + cut lines</span></button>
        </div>
      </div>
      <div style="margin-left:auto;text-align:right;">
        <div style="font-size:13px;color:#555;margin-bottom:9px;font-weight:500;" id="pm-info">—</div>
        <button onclick="executePrint()" style="background:#1a237e;color:white;border:none;padding:11px 26px;border-radius:9px;cursor:pointer;font-size:14px;font-weight:700;box-shadow:0 3px 10px rgba(26,35,126,.3);">🖨 Print Now</button>
      </div>
    </div>
    <div style="padding:20px;background:#f0f2f5;">
      <div style="font-size:11px;font-weight:700;color:#999;text-align:center;margin-bottom:14px;letter-spacing:1px;">📄 LIVE PREVIEW (scaled — actual cut lines shown)</div>
      <div id="pm-preview" style="display:flex;flex-wrap:wrap;gap:22px;justify-content:center;"></div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  window._pBills=bills;window._pLayout=1;
  renderPrintPreview(bills,1);
}

function closePrintModal(){const m=document.getElementById("print-modal");if(m)m.remove();}

function setPrintLayout(n){
  window._pLayout=n;
  document.querySelectorAll(".pm-lb").forEach(b=>{const active=parseInt(b.dataset.n)===n;b.style.background=active?"#1a237e":"white";b.style.color=active?"white":"#333";b.style.borderColor=active?"#1a237e":"#ddd";});
  renderPrintPreview(window._pBills,n);
}

function renderPrintPreview(bills,perPage){
  const pages=[];for(let i=0;i<bills.length;i+=perPage)pages.push(bills.slice(i,i+perPage));
  const info=document.getElementById("pm-info");if(info)info.textContent=`${bills.length} bill${bills.length>1?"s":""} → ${pages.length} A4 page${pages.length>1?"s":""}`;
  const container=document.getElementById("pm-preview");if(!container)return;
  const SCALE=0.34;const W=Math.round(794*SCALE);const H=Math.round(1123*SCALE);
  const CUT_H=8;// pixels for cut line in 794px A4

  container.innerHTML=pages.map((pg,pi)=>{
    let innerHTML="";
    if(perPage===1){
      innerHTML=`<div style="width:100%;height:100%;padding:20px;box-sizing:border-box;">${buildReceiptHTML(pg[0],false)}</div>`;
    } else {
      const slots=pg.length;const emptySlots=perPage-slots;
      const totalCutH=CUT_H*(perPage-1);
      const stripH=Math.floor((1123-40-totalCutH)/perPage);
      let html=`<div style="width:100%;height:100%;padding:20px 20px 20px;box-sizing:border-box;display:flex;flex-direction:column;gap:0;">`;
      for(let s=0;s<perPage;s++){
        if(s>0)html+=`<div style="height:${CUT_H}px;flex-shrink:0;position:relative;display:flex;align-items:center;"><div style="position:absolute;left:0;right:0;border-top:1.5px dashed #bbb;"></div><div style="background:white;padding:0 8px;font-size:5px;color:#bbb;position:relative;">✂ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ✂</div></div>`;
        if(s<slots){html+=`<div style="height:${stripH}px;flex-shrink:0;">${buildStripHTML(pg[s])}</div>`;}
        else{html+=`<div style="height:${stripH}px;flex-shrink:0;border:1.5px dashed #e0e0e0;border-radius:4px;"></div>`;}
      }
      html+="</div>";
      innerHTML=html;
    }
    return `<div style="text-align:center;"><div style="font-size:11px;color:#aaa;margin-bottom:7px;font-weight:600;letter-spacing:0.5px;">PAGE ${pi+1} OF ${pages.length}</div><div style="width:${W}px;height:${H}px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.25);border-radius:3px;background:white;display:inline-block;"><div style="width:794px;height:1123px;transform:scale(${SCALE});transform-origin:top left;">${innerHTML}</div></div></div>`;
  }).join("");
}

function executePrint(){
  const bills=window._pBills||[];const perPage=window._pLayout||1;if(!bills.length)return;
  const pages=[];for(let i=0;i<bills.length;i+=perPage)pages.push(bills.slice(i,i+perPage));

  let pageCSS,pageHTML;
  if(perPage===1){
    pageCSS=`.print-page{display:grid;grid-template-columns:1fr;width:190mm;height:277mm;page-break-after:always;}.print-page:last-child{page-break-after:avoid;}`;
    pageHTML=pages.map(pg=>`<div class="print-page">${buildReceiptHTML(pg[0],false)}</div>`).join("");
  } else {
    const cutH=3;// mm
    const stripH=Math.floor((277-10-cutH*(perPage-1))/perPage);
    pageCSS=`.print-page{width:190mm;page-break-after:always;padding:5mm 0;}.print-page:last-child{page-break-after:avoid;}.strip{height:${stripH}mm;width:100%;}.cut{height:${cutH}mm;display:flex;align-items:center;justify-content:center;position:relative;}.cut::before{content:"";position:absolute;left:0;right:0;border-top:1.5px dashed #aaa;}.cut-text{background:white;padding:0 5mm;font-size:7pt;color:#aaa;position:relative;letter-spacing:2px;}.empty-slot{border:1.5px dashed #ddd;border-radius:4px;height:${stripH}mm;}`;
    pageHTML=pages.map(pg=>{
      let html=`<div class="print-page">`;
      for(let s=0;s<perPage;s++){
        if(s>0)html+=`<div class="cut"><span class="cut-text">✂ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ✂</span></div>`;
        if(s<pg.length)html+=`<div class="strip">${buildStripHTML(pg[s])}</div>`;
        else html+=`<div class="empty-slot"></div>`;
      }
      return html+"</div>";
    }).join("");
  }

  const printWin=window.open("","_blank","width=900,height=700");
  if(!printWin){alert("⚠️ Allow popups to print.\nClick popup blocked icon → Allow.");return;}
  printWin.document.write(`<!DOCTYPE html><html><head><title>SHIVAM DUPLEX — Bills</title><meta charset="UTF-8"/>
<style>@page{size:A4 portrait;margin:10mm;}*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,Helvetica,sans-serif;background:white;}${pageCSS}@media print{body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}}</style>
</head><body>${pageHTML}<script>window.onload=function(){window.print();setTimeout(function(){window.close();},2000);};<\/script></body></html>`);
  printWin.document.close();
  if(typeof showToast==="function")showToast("Opening print dialog…","success");
}
