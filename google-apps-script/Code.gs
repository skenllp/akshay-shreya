/**
 * RSVP backend for the Akshay & Shreya wedding invitation.
 * Receives JSON from the website, appends a row to the "RSVP Responses" sheet
 * of the spreadsheet this script is bound to, and optionally emails you.
 * Setup steps: see README.md
 */
const SHEET_NAME = "RSVP Responses";
const NOTIFY_EMAIL = ""; // optional: your email for a notification on every RSVP

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents);
    if (!data.name || !data.phone || !data.attending) throw new Error("Missing required fields");

    const sheet = getOrCreateSheet_();
    // Ignore exact duplicate submissions (same submissionId)
    if (data.submissionId && sheet.createTextFinder(String(data.submissionId)).matchEntireCell(true).findNext()) {
      return json_({ result: "success", duplicate: true });
    }
    sheet.appendRow([
      new Date(),
      String(data.name).slice(0, 80),
      "'" + String(data.phone).slice(0, 20),
      data.guests || "",
      data.attending === "yes" ? "Attending" : "Unable to Attend",
      (data.events || []).join(", "),
      String(data.message || "").slice(0, 500),
      String(data.submissionId || "")
    ]);
    notify_(data);
    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return ContentService.createTextOutput("RSVP endpoint is live."); }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Phone", "Guests", "Status", "Events", "Message", "Submission ID"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify_(d) {
  if (!NOTIFY_EMAIL) return;
  MailApp.sendEmail(NOTIFY_EMAIL, "New RSVP: " + d.name + " (" + (d.attending === "yes" ? "Attending" : "Unable") + ")",
    "Name: " + d.name + "\nPhone: " + d.phone + "\nGuests: " + d.guests + "\nEvents: " + (d.events || []).join(", ") + "\nMessage: " + (d.message || "-"));
}
