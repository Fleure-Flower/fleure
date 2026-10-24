// Saves every website order, custom request and message to this Google Sheet,
// keeps each payment screenshot in a Google Drive folder (linked from the sheet),
// and emails you about each one.
//
// Setup (once):
// 1. Make a new Google Sheet (sheets.new) and name it, e.g. "Fleure Orders".
// 2. In the sheet: Extensions > Apps Script. Delete what is there, paste this whole file, click Save.
// 3. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Click Deploy and allow access
//    (Google asks to let the script use your Sheets, Drive and Gmail; click Advanced > Go to project > Allow).
// 4. To update an existing deployment: Deploy > Manage deployments > pencil icon > Version: New version > Deploy (the URL stays the same).
// 5. Copy the Web app URL (ends in /exec) and put it in assets/js/data.js as orderSheetUrl.

const HEADERS = ["Received", "Type", "Order number", "Name", "Email", "Phone", "Items", "Bouquets total",
  "Pickup / delivery", "Delivery charge", "Total", "Address / delivery details", "Date needed", "Customisation / extra requests", "Payment screenshot"];
const FIELDS = ["type", "orderId", "name", "email", "phone", "items", "subtotal",
  "method", "deliveryCharge", "total", "address", "date", "notes", "screenshot"];
const FOLDER = "Fleure payment screenshots";
// The orders sheet and the address that gets an email for every order.
const SHEET_ID = "1KAAAt5vcHgrMFtPoHFLNAcefgM0tKrV_y7KliExuV5o";
const NOTIFY = "fleurehandmadeflower@gmail.com";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.parameter.data);
    data.screenshot = saveScreenshot(data.screenshot, data.orderId);
    // Text starting with = + - @ is stored as plain text, never run as a formula.
    const clean = (v) => {
      const s = v == null ? "" : String(v).slice(0, 2000);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    const row = [new Date()].concat(FIELDS.map((f) => clean(data[f])));
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow(row);

    const body = HEADERS.slice(1).map((h, i) => h + ": " + row[i + 1]).filter((l) => !/: $/.test(l)).join("\n");
    MailApp.sendEmail({ to: NOTIFY, replyTo: data.email || NOTIFY, subject: "New " + data.type + " " + (data.orderId || "") + " from " + data.name, body: body });
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Stores a payment screenshot (sent as a data: URL) in Drive and returns a link to it.
function saveScreenshot(dataUrl, orderId) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || "");
  if (!m) return "";
  const folders = DriveApp.getFoldersByName(FOLDER);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER);
  const name = String(orderId || "order").replace(/[^\w-]/g, "") + " payment." + m[1].split("/")[1];
  return folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name)).getUrl();
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
