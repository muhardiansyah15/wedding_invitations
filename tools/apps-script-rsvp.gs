/**
 * RSVP & Guest Wall — The Wedding of Putri & Vira
 * Pasang di: spreadsheet RSVP > Extensions > Apps Script (ganti isi Code.gs)
 * Deploy: Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Spreadsheet TETAP PRIVAT — hanya URL /exec skrip ini yang publik.
 */
var SHEET_NAME = "RSVP";

function lembar_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Waktu", "Nama", "Kehadiran", "Jumlah", "Ucapan"]);
  }
  return sh;
}

/** GET: daftar ucapan untuk guest wall (maks. 100 terbaru). */
function doGet() {
  var rows = lembar_().getDataRange().getValues();
  var data = [];
  for (var i = rows.length - 1; i >= 1 && data.length < 100; i--) {
    if (!rows[i][1]) continue;
    data.push({
      nama: String(rows[i][1]),
      hadir: String(rows[i][2]),
      ucapan: String(rows[i][4] || "")
    });
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** POST: simpan satu konfirmasi/ucapan. */
function doPost(e) {
  var ok = false;
  try {
    var p = JSON.parse(e.postData.contents || "{}");
    var nama = String(p.nama || "").trim().slice(0, 80);
    var hadir = p.hadir === "hadir" ? "Hadir" : "Tidak Hadir";
    var jumlah = Math.max(1, Math.min(10, parseInt(p.jumlah, 10) || 1));
    var ucapan = String(p.ucapan || "").trim().slice(0, 500);
    if (nama) {
      lembar_().appendRow([new Date(), nama, hadir, hadir === "Hadir" ? jumlah : 0, ucapan]);
      ok = true;
    }
  } catch (err) {}
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok }))
    .setMimeType(ContentService.MimeType.JSON);
}
