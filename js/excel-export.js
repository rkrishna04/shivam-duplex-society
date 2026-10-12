// ============================================================
//  excel-export.js  —  SheetJS exports for SHIVAM DUPLEX
// ============================================================

/* ─── Worksheet builder with styling ─── */
function buildWS(rows, title, headers, keys, widths) {
  const data = rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[keys[i]] ?? ""; });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data, { origin: "A2" });
  ws["!cols"] = widths.map(w => ({ wch: w }));

  // Title row
  const colCount = headers.length;
  ws["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:colCount-1} }];
  ws["A1"] = {
    v: title, t: "s",
    s: { font:{bold:true,sz:13,color:{rgb:"1a237e"}}, fill:{fgColor:{rgb:"E8EAF6"},patternType:"solid"}, alignment:{horizontal:"center"} }
  };

  // Header style (row 2 = index 1)
  for (let c = 0; c < colCount; c++) {
    const ca = XLSX.utils.encode_cell({r:1,c});
    if (ws[ca]) ws[ca].s = {
      font:{bold:true,color:{rgb:"FFFFFF"},sz:11},
      fill:{fgColor:{rgb:"1A237E"},patternType:"solid"},
      alignment:{horizontal:"center",vertical:"center"},
    };
  }

  // Data rows
  const range = XLSX.utils.decode_range(ws["!ref"]||"A1");
  for (let r = 2; r <= range.e.r; r++) {
    for (let c = 0; c < colCount; c++) {
      const ca = XLSX.utils.encode_cell({r,c});
      if (!ws[ca]) continue;
      ws[ca].s = {
        fill:{fgColor:{rgb: r%2===0?"EEF0FA":"FFFFFF"},patternType:"solid"},
        border:{top:{style:"thin",color:{rgb:"E2E8F0"}},bottom:{style:"thin",color:{rgb:"E2E8F0"}},left:{style:"thin",color:{rgb:"E2E8F0"}},right:{style:"thin",color:{rgb:"E2E8F0"}}},
      };
    }
  }
  return ws;
}

function dl(wb, name) {
  XLSX.writeFile(wb, name, { bookType:"xlsx", type:"binary", cellStyles:true });
}

/* ─── MEMBERS ─── */
export function exportMembers(members) {
  const headers = ["Flat No","Wing","Owner Name","Tenant","Contact","Email","Parking","Type","Status","Move-In Date"];
  const keys    = ["flatNumber","wing","ownerName","tenantName","contactNumber","email","parkingSlot","memberType","status","moveInDate"];
  const widths  = [10,8,22,20,14,26,10,10,10,14];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(members,"SHIVAM DUPLEX — Member Directory",headers,keys,widths),"Members");
  dl(wb, `SD_Members_${Date.now()}.xlsx`);
}

/* ─── MAINTENANCE BILLS ─── */
export function exportMaintenanceBills(bills, title="Maintenance Bills") {
  const headers = ["Bill No","Period","Flat No","Wing","Member Name","Maint Amount","Late Fee","Total","Due Date","Status"];
  const keys    = ["billNumber","period","flatNumber","wing","memberName","maintenanceAmount","lateFee","totalAmount","dueDate","status"];
  const widths  = [18,16,10,8,22,16,10,12,14,12];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(bills,`SHIVAM DUPLEX — ${title}`,headers,keys,widths),"Bills");
  dl(wb, `SD_MaintenanceBills_${Date.now()}.xlsx`);
}

/* ─── PAYMENTS ─── */
export function exportPayments(payments) {
  const headers = ["Payment ID","Bill No","Flat No","Member Name","Amount","Payment Date","Mode","Reference","Collected By"];
  const keys    = ["paymentId","billNumber","flatNumber","memberName","amount","paymentDate","paymentMode","referenceNumber","collectedBy"];
  const widths  = [16,18,10,22,12,14,16,18,18];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(payments,"SHIVAM DUPLEX — Payment Register",headers,keys,widths),"Payments");
  dl(wb, `SD_Payments_${Date.now()}.xlsx`);
}

/* ─── EXPENSES ─── */
export function exportExpenses(expenses, label="Expense Register") {
  const headers = ["Expense ID","Date","Category","Description","Vendor","Amount","Mode","Invoice No","Approved By","Status"];
  const keys    = ["expenseId","date","category","description","vendorName","amount","paymentMode","invoiceNumber","approvedBy","status"];
  const widths  = [16,13,18,28,22,12,14,14,16,10];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(expenses,`SHIVAM DUPLEX — ${label}`,headers,keys,widths),"Expenses");
  dl(wb, `SD_Expenses_${Date.now()}.xlsx`);
}

/* ─── EVENTS ─── */
export function exportEvents(events) {
  const headers = ["Event Name","Start Date","End Date","Venue","Organized By","Est Budget","Actual Expense","Contributions","Status"];
  const keys    = ["eventName","startDate","endDate","venue","organizedBy","estimatedBudget","actualExpenses","contributions","status"];
  const widths  = [28,13,13,20,20,14,16,14,12];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(events,"SHIVAM DUPLEX — Event Register",headers,keys,widths),"Events");
  dl(wb, `SD_Events_${Date.now()}.xlsx`);
}

/* ─── FUND LEDGER ─── */
export function exportFunds(funds) {
  const headers = ["Date","Fund Type","Transaction","Description","Amount","Reference","Closing Balance"];
  const keys    = ["date","fundType","transactionType","description","amount","reference","balance"];
  const widths  = [13,20,14,30,14,20,16];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(funds,"SHIVAM DUPLEX — Fund Ledger",headers,keys,widths),"Fund Ledger");
  dl(wb, `SD_FundLedger_${Date.now()}.xlsx`);
}

/* ─── DEFAULTER REPORT ─── */
export function exportDefaulters(bills) {
  const defaulters = bills.filter(b => b.status === "Pending" || b.status === "Overdue");
  const headers = ["Flat No","Wing","Member Name","Period","Amount","Late Fee","Total Due","Status","Due Date","Contact"];
  const keys    = ["flatNumber","wing","memberName","period","maintenanceAmount","lateFee","totalAmount","status","dueDate","contactNumber"];
  const widths  = [10,8,22,16,12,10,12,10,13,14];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(defaulters,"SHIVAM DUPLEX — Defaulter List",headers,keys,widths),"Defaulters");
  dl(wb, `SD_DefaulterList_${Date.now()}.xlsx`);
}

/* ─── SINGLE MAINTENANCE RECEIPT ─── */
export function exportSingleBill(bill) {
  const rows = [bill];
  const headers = ["Bill No","Period","Flat No","Wing","Member Name","Maint Amount","Late Fee","Total","Due Date","Status"];
  const keys    = ["billNumber","period","flatNumber","wing","memberName","maintenanceAmount","lateFee","totalAmount","dueDate","status"];
  const widths  = [18,16,10,8,22,16,10,12,14,12];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildWS(rows,`Receipt — ${bill.billNumber}`,headers,keys,widths),"Receipt");
  dl(wb, `${bill.billNumber}.xlsx`);
}
