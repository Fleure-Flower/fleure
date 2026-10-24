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
// 6. Once only: pick "setup" in the function menu at the top and click Run. It adds the Status dropdown and
//    turns on the email that asks the customer for a review when you set an order to Delivered.
//
// Order status: change the Status cell of an order in the sheet. The customer sees it on the website's My Orders page.

const HEADERS = ["Received", "Type", "Order number", "Name", "Email", "Phone", "Items", "Bouquets total",
  "Pickup / delivery", "Delivery charge", "Total", "Address / delivery details", "Date needed", "Customisation / extra requests", "Payment screenshot", "Status"];
const FIELDS = ["type", "orderId", "name", "email", "phone", "items", "subtotal",
  "method", "deliveryCharge", "total", "address", "date", "notes", "screenshot"];
const FOLDER = "Fleure payment screenshots";
// The orders sheet and the address that gets an email for every order.
const SHEET_ID = "1KAAAt5vcHgrMFtPoHFLNAcefgM0tKrV_y7KliExuV5o";
const NOTIFY = "fleurehandmadeflower@gmail.com";
const SITE = "https://fleure-flower.github.io/fleure/";
const STATUSES = ["Order placed", "Confirmed", "Out for delivery", "Ready for pickup", "Delivered", "Cancelled"];
const COL = { type: 2, orderId: 3, name: 4, email: 5, phone: 6, items: 7, total: 11, method: 9, date: 13, status: 16 };
const REVIEW_HEADERS = ["Received", "Order number", "Name", "Email", "Rating (1-5)", "Review"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.parameter.data);
    if (data.type === "Review") return saveReview(data);
    data.screenshot = saveScreenshot(data.screenshot, data.orderId);
    // Text starting with = + - @ is stored as plain text, never run as a formula.
    const clean = (v) => {
      const s = v == null ? "" : String(v).slice(0, 2000);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    const row = [new Date()].concat(FIELDS.map((f) => clean(data[f])), data.type === "Order" ? STATUSES[0] : "");
    const sheet = ordersSheet();
    sheet.appendRow(row);

    const body = HEADERS.slice(1, -1).map((h, i) => h + ": " + row[i + 1]).filter((l) => !/: $/.test(l)).join("\n");
    MailApp.sendEmail({ to: NOTIFY, replyTo: data.email || NOTIFY, subject: "New " + data.type + " " + (data.orderId || "") + " from " + data.name, body: body });
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Website "My Orders" page: returns the orders that match both the email and the phone number.
function doGet(e) {
  const p = e.parameter || {};
  if (p.action !== "orders") return reply({ ok: false, error: "unknown request" });
  return reply({ ok: true, orders: findOrders(p.email, p.phone).map((o) => ({
    orderId: o.orderId, placed: o.placed, items: o.items, total: o.total, method: o.method,
    date: o.date, status: o.status, reviewed: o.reviewed })) });
}

function findOrders(email, phone) {
  email = String(email || "").trim().toLowerCase();
  phone = digits(phone);
  if (!email || phone.length < 10) return [];
  const book = SpreadsheetApp.openById(SHEET_ID);
  const reviewed = {};
  const rs = book.getSheetByName("Reviews");
  if (rs && rs.getLastRow() > 1) rs.getRange(2, 2, rs.getLastRow() - 1, 1).getValues().forEach((r) => (reviewed[r[0]] = true));
  const sheet = ordersSheet();
  if (sheet.getLastRow() < 2) return [];
  const tz = Session.getScriptTimeZone();
  const day = (v) => v instanceof Date ? Utilities.formatDate(v, tz, "yyyy-MM-dd") : String(v);
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues()
    .filter((r) => r[COL.type - 1] === "Order" && String(r[COL.email - 1]).trim().toLowerCase() === email && digits(r[COL.phone - 1]) === phone)
    .map((r) => ({ orderId: r[COL.orderId - 1], name: r[COL.name - 1], placed: day(r[0]), items: String(r[COL.items - 1]),
      total: r[COL.total - 1], method: r[COL.method - 1], date: day(r[COL.date - 1]), status: r[COL.status - 1] || STATUSES[0],
      reviewed: !!reviewed[r[COL.orderId - 1]] }))
    .reverse();
}

// Last 10 digits, so +91 7086467797 and 7086467797 match.
function digits(v) {
  return String(v == null ? "" : v).replace(/\D/g, "").slice(-10);
}

// A review from the My Orders page. Only accepted for a delivered order that matches the email and phone.
function saveReview(data) {
  const order = findOrders(data.email, data.phone).filter((o) => o.orderId === data.orderId)[0];
  if (!order || order.status !== "Delivered") return reply({ ok: false, error: "order not delivered" });
  if (order.reviewed) return reply({ ok: false, error: "already reviewed" });
  const rating = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 0)));
  const text = String(data.text || "").slice(0, 2000).replace(/^[=+\-@]/, "'$&");
  const book = SpreadsheetApp.openById(SHEET_ID);
  const rs = book.getSheetByName("Reviews") || book.insertSheet("Reviews");
  if (rs.getLastRow() === 0) rs.appendRow(REVIEW_HEADERS);
  rs.appendRow([new Date(), order.orderId, order.name, data.email, rating, text]);
  MailApp.sendEmail({ to: NOTIFY, subject: "New review (" + rating + "/5) for " + order.orderId + " from " + order.name,
    body: "Rating: " + rating + "/5\n\n" + text });
  return reply({ ok: true });
}

// The orders tab, with the header row (including Status) in place.
function ordersSheet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else if (sheet.getRange(1, COL.status).getValue() !== "Status") sheet.getRange(1, COL.status).setValue("Status");
  return sheet;
}

// Run once from the editor: Status dropdown, "Order placed" on existing orders, and the review email trigger.
function setup() {
  const sheet = ordersSheet();
  const rows = sheet.getLastRow() - 1;
  if (rows > 0) {
    const status = sheet.getRange(2, COL.status, rows, 1);
    const types = sheet.getRange(2, COL.type, rows, 1).getValues();
    status.setValues(status.getValues().map((r, i) => [r[0] || (types[i][0] === "Order" ? STATUSES[0] : "")]));
  }
  sheet.getRange(2, COL.status, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());
  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === "onStatusEdit").forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("onStatusEdit").forSpreadsheet(SHEET_ID).onEdit().create();
}

// When you set an order to Delivered, email the customer to say thanks and ask for a review.
function onStatusEdit(e) {
  const range = e.range;
  if (range.getSheet().getIndex() !== 1 || range.getColumn() > COL.status || range.getLastColumn() < COL.status) return;
  const sheet = range.getSheet();
  for (let r = range.getRow(); r <= range.getLastRow(); r++) {
    if (r < 2) continue;
    const row = sheet.getRange(r, 1, 1, HEADERS.length).getValues()[0];
    if (row[COL.status - 1] !== "Delivered" || row[COL.type - 1] !== "Order" || !row[COL.email - 1]) continue;
    const name = String(row[COL.name - 1]).split(" ")[0];
    MailApp.sendEmail({ to: row[COL.email - 1], replyTo: NOTIFY, name: "Fleure",
      subject: "Your Fleure order " + row[COL.orderId - 1] + " has been delivered",
      body: "Hi " + name + ",\n\nYour order " + row[COL.orderId - 1] + " has been delivered. We hope you love your flowers!\n\n" +
        "We'd be so grateful if you could tell us what you think. Leave a review here (use the email and phone number you ordered with):\n" +
        SITE + "orders.html\n\nWith love,\nFleure Handmade Flowers" });
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
