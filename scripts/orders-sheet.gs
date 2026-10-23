// Saves every website order, custom request and message to this Google Sheet,
// and emails you about each one.
//
// Setup (once):
// 1. Make a new Google Sheet (sheets.new) and name it, e.g. "Fleure Orders".
// 2. In the sheet: Extensions > Apps Script. Delete what is there, paste this whole file, click Save.
// 3. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Click Deploy and allow access.
// 4. Copy the Web app URL (ends in /exec) and put it in assets/js/data.js as orderSheetUrl.

const HEADERS = ["Received", "Type", "Order number", "Name", "Email", "Phone", "Items", "Bouquets total",
  "Pickup / delivery", "Delivery charge", "Total", "Address / delivery details", "Date needed", "Notes / extra requests"];
const FIELDS = ["type", "orderId", "name", "email", "phone", "items", "subtotal",
  "method", "deliveryCharge", "total", "address", "date", "notes"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.parameter.data);
    // Text starting with = + - @ is stored as plain text, never run as a formula.
    const clean = (v) => {
      const s = v == null ? "" : String(v).slice(0, 2000);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    const row = [new Date()].concat(FIELDS.map((f) => clean(data[f])));
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow(row);

    const body = HEADERS.slice(1).map((h, i) => h + ": " + row[i + 1]).filter((l) => !/: $/.test(l)).join("\n");
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "New " + data.type + " " + (data.orderId || "") + " from " + data.name, body);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
