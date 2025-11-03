function setupShipmentTracker() {
  const ss = SpreadsheetApp.getActive();
  const mainName = "Shipments";
  const cfgName  = "Config";
  const dashName = "Dashboard";

  // 1) Ensure main sheet
  let sh = ss.getSheetByName(mainName);
  if (!sh) {
    sh = ss.insertSheet(mainName);
    sh.appendRow([
      "Shipment ID","Supplier / Factory","Agent","Origin Port","Destination Port","Incoterm",
      "ETD","ETA","Forwarder / Courier","Tracking / BL No.","Status","Progress (%)",
      "Last Update","Next Step","Remarks","Files / Links"
    ]);
  }

  // Freeze header & enable filter
  sh.setFrozenRows(1);
  if (!sh.getFilter()) {
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).createFilter();
  }

  // 2) Config sheet with lists
  let cfg = ss.getSheetByName(cfgName);
  if (!cfg) cfg = ss.insertSheet(cfgName);

  cfg.clear();
  cfg.getRange("A1").setValue("Statuses");
  const statuses = ["Pending","In Production","Ready","Shipped","In Transit","Customs","Delivered"];
  cfg.getRange(2, 1, statuses.length, 1).setValues(statuses.map(s => [s]));

  cfg.getRange("C1").setValue("Incoterms");
  const incoterms = ["EXW","FCA","FOB","CIF","CFR","DAP","DDP"];
  cfg.getRange(2, 3, incoterms.length, 1).setValues(incoterms.map(i => [i]));

  cfg.getRange("E1").setValue("Sample Ports");
  const ports = ["Shanghai","Ningbo","Shenzhen","Qingdao","Xiamen","San Antonio","Valparaiso"];
  cfg.getRange(2, 5, ports.length, 1).setValues(ports.map(p => [p]));

  cfg.getRange("G1").setValue("Forwarders");
  const fwds = ["DHL","UPS","FedEx","COSCO","Maersk","MSC","CMA CGM"];
  cfg.getRange(2, 7, fwds.length, 1).setValues(fwds.map(f => [f]));

  // Named ranges for validation
  setNamedRange_(ss, "STATUS_LIST",   cfg, 2, 1, statuses.length, 1);
  setNamedRange_(ss, "INCOTERM_LIST", cfg, 2, 3, incoterms.length, 1);
  setNamedRange_(ss, "PORT_LIST",     cfg, 2, 5, ports.length, 1);
  setNamedRange_(ss, "FWD_LIST",      cfg, 2, 7, fwds.length, 1);

  // 3) Data validation dropdowns
  const lastRow = Math.max(sh.getMaxRows(), 1000);
  dataValidationList_(sh.getRange(2, 11, lastRow - 1, 1), "=STATUS_LIST");   // K Status
  dataValidationList_(sh.getRange(2, 6,  lastRow - 1, 1), "=INCOTERM_LIST"); // F Incoterm
  dataValidationList_(sh.getRange(2, 4,  lastRow - 1, 1), "=PORT_LIST");     // D Origin
  dataValidationList_(sh.getRange(2, 5,  lastRow - 1, 1), "=PORT_LIST");     // E Destination
  dataValidationList_(sh.getRange(2, 9,  lastRow - 1, 1), "=FWD_LIST");      // I Forwarder

  // 4) Progress formula (L)
  // Only set formula for initial rows, onEdit will handle new rows
  const formulaRow = sh.getRange("L2");
  if (!formulaRow.getFormula()) {
    formulaRow.setFormula(
      '=IF($K2="","",SWITCH($K2,"Pending",0,"In Production",20,"Ready",40,"Shipped",60,"In Transit",70,"Customs",85,"Delivered",100,0))'
    );
  }

  // 5) Conditional formatting
  // Clear existing
  const existingRules = sh.getConditionalFormatRules();
  sh.clearConditionalFormatRules();

  const rules = [];

  // a) Row shading by Status (columna K)
  // CORREGIDO: Usar whenFormulaSatisfied con referencia a columna K
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$K2="Delivered"')
      .setBackground("#D9EBD3") // soft green
      .setRanges([sh.getRange(2, 1, lastRow - 1, 16)])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$K2="In Transit"')
      .setBackground("#FFE8CC") // soft orange
      .setRanges([sh.getRange(2, 1, lastRow - 1, 16)])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$K2="Customs"')
      .setBackground("#E8E1FF") // soft purple
      .setRanges([sh.getRange(2, 1, lastRow - 1, 16)])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$K2="Pending"')
      .setBackground("#FFF5CC") // soft yellow
      .setRanges([sh.getRange(2, 1, lastRow - 1, 16)])
      .build()
  );

  // b) ETA overdue >3 days (and not delivered): red text on ETA cell
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .setRanges([sh.getRange(2, 8, lastRow - 1, 1)]) // ETA column
      .whenFormulaSatisfied('=AND($H2<TODAY()-3,$K2<>"Delivered",$H2<>"")')
      .setFontColor("#A50E0E")
      .build()
  );

  // c) Missing BL/Tracking while Shipped/In Transit/Customs: highlight J
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .setRanges([sh.getRange(2, 10, lastRow - 1, 1)]) // J
      .whenFormulaSatisfied('=AND($J2="",OR($K2="Shipped",$K2="In Transit",$K2="Customs"))')
      .setBackground("#FDE2E1")
      .build()
  );

  sh.setConditionalFormatRules(rules);

  // 6) Create Dashboard
  let dash = ss.getSheetByName(dashName);
  if (!dash) dash = ss.insertSheet(dashName);
  dash.clear();

  const titleCell = dash.getRange("A1");
  titleCell.setValue("Shipments Dashboard");
  titleCell.setFontSize(16);
  titleCell.setFontWeight("bold");

  dash.getRange("A3").setValue("Total Shipments");
  dash.getRange("B3").setFormula('=COUNTA(Shipments!A2:A)');

  dash.getRange("A4").setValue("Delivered");
  dash.getRange("B4").setFormula('=COUNTIF(Shipments!K2:K,"Delivered")');

  dash.getRange("A5").setValue("In Transit");
  dash.getRange("B5").setFormula('=COUNTIF(Shipments!K2:K,"In Transit")');

  dash.getRange("A6").setValue("Customs");
  dash.getRange("B6").setFormula('=COUNTIF(Shipments!K2:K,"Customs")');

  dash.getRange("A7").setValue("Overdue (ETA < Today - 3, not delivered)");
  dash.getRange("B7").setFormula('=SUMPRODUCT((Shipments!H2:H<TODAY()-3)*(Shipments!K2:K<>"Delivered")*(Shipments!H2:H<>""))');

  // Simple bar chart (Status)
  const chart = dash.newChart()
    .asColumnChart()
    .addRange(dash.getRange("A4:B6"))
    .setPosition(9, 1, 0, 0)
    .setOption("title", "Shipments by Status")
    .setOption("legend", {position: "bottom"})
    .build();
  dash.insertChart(chart);

  // 7) Friendly column widths
  const widths = [140, 160, 120, 130, 140, 100, 100, 100, 150, 150, 120, 120, 120, 160, 200, 220];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // 8) Sort by ETA (ascending) - CORREGIDO: no crear filtro duplicado
  try {
    const filter = sh.getFilter();
    if (filter) {
      filter.sort(8, true); // Sort by ETA (col H) ascending
    }
  } catch(e) {
    Logger.log("Could not sort filter: " + e.toString());
  }

  SpreadsheetApp.getUi().alert("Shipment Tracker configurado correctamente!");
}

/** Timestamp "Last Update" automatically & keep Progress formula alive */
function onEdit(e) {
  try {
    const sh = e.range.getSheet();
    if (sh.getName() !== "Shipments") return;

    const row = e.range.getRow();
    const col = e.range.getColumn();
    if (row === 1) return; // header

    // Columns that should trigger Last Update: A..P except L (Progress) and M (Last Update)
    const triggerCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16];
    if (triggerCols.indexOf(col) !== -1) {
      // Update timestamp
      sh.getRange(row, 13).setValue(new Date()); // M = 13

      // Reapply Progress formula on this row (in case status changed)
      const progressCell = sh.getRange(row, 12);
      const expectedFormula = '=IF($K' + row + '="","",SWITCH($K' + row + ',"Pending",0,"In Production",20,"Ready",40,"Shipped",60,"In Transit",70,"Customs",85,"Delivered",100,0))';

      // Only set if formula is missing or different
      if (progressCell.getFormula() !== expectedFormula) {
        progressCell.setFormula(expectedFormula);
      }
    }
  } catch (err) {
    Logger.log("Error in onEdit: " + err.toString());
  }
}

/** Helpers */
function setNamedRange_(ss, name, sheet, row, col, numRows, numCols) {
  const range = sheet.getRange(row, col, numRows, numCols);
  const named = ss.getRangeByName(name);
  if (named) ss.removeNamedRange(name);
  ss.setNamedRange(name, range);
}

function dataValidationList_(range, formula) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(formula)
    .setAllowInvalid(false)
    .build();
  range.setDataValidation(rule);
}
