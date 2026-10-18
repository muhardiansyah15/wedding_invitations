/**
 * RSVP, Guest Wall & Log Penyebaran — The Wedding of Putri & Pira
 * Pasang di: spreadsheet RSVP > Extensions > Apps Script (ganti isi Code.gs)
 * Deploy: Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Spreadsheet TETAP PRIVAT — hanya URL /exec skrip ini yang publik.
 *
 * @OnlyCurrentDoc  — izin skrip dibatasi HANYA ke spreadsheet ini,
 * bukan seluruh Drive/akun. Google menegakkan batas ini saat otorisasi.
 */
var SHEET_NAME = "RSVP";
var SHEET_KIRIM = "KIRIM";

function lembar_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Waktu", "Nama", "Kehadiran", "Jumlah", "Ucapan"]);
  }
  return sh;
}

function lembarKirim_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_KIRIM) || ss.insertSheet(SHEET_KIRIM);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Waktu", "Nama", "Nomor", "Cara"]);
  }
  return sh;
}

/** Cegah formula injection: teks berawalan = + - @ disimpan sebagai teks biasa. */
function teks_(v) {
  v = String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

/** Nomor disamarkan sebelum keluar endpoint publik; utuh hanya di sheet. */
function samar_(v) {
  var d = String(v).replace(/[^0-9]/g, "");
  if (!d) return "";
  if (d.length < 7) return "••••";
  return d.slice(0, 4) + "••••" + d.slice(-3);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET: daftar ucapan untuk guest wall (maks. 100 terbaru).
 * GET ?daftar=kirim: log penyebaran undangan (maks. 500 terbaru, nomor disamarkan).
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.daftar === "kirim") {
    var rowsK = lembarKirim_().getDataRange().getValues();
    var kirim = [];
    for (var k = rowsK.length - 1; k >= 1 && kirim.length < 500; k--) {
      if (!rowsK[k][1]) continue;
      kirim.push({
        waktu: rowsK[k][0] ? new Date(rowsK[k][0]).toISOString() : "",
        nama: String(rowsK[k][1]),
        nomor: samar_(rowsK[k][2]),
        cara: String(rowsK[k][3] || "")
      });
    }
    return json_({ ok: true, data: kirim });
  }

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
  return json_({ ok: true, data: data });
}

/**
 * POST {nama, hadir, jumlah, ucapan}: simpan satu konfirmasi/ucapan.
 * POST {aksi:"kirim", nama, nomor, cara}: catat satu penyebaran undangan.
 */
function doPost(e) {
  var ok = false;
  try {
    var p = JSON.parse(e.postData.contents || "{}");

    if (p.aksi === "kirim") {
      var namaK = String(p.nama || "").trim().slice(0, 80);
      var nomor = String(p.nomor || "").replace(/[^0-9]/g, "").slice(0, 20);
      var cara = p.cara === "salin" ? "salin" : "wa";
      if (namaK) {
        lembarKirim_().appendRow([new Date(), teks_(namaK), nomor, cara]);
        ok = true;
      }
      return json_({ ok: ok });
    }

    var nama = String(p.nama || "").trim().slice(0, 80);
    var hadir = p.hadir === "hadir" ? "Hadir" : "Tidak Hadir";
    var jumlah = Math.max(1, Math.min(10, parseInt(p.jumlah, 10) || 1));
    var ucapan = String(p.ucapan || "").trim().slice(0, 500);
    if (nama) {
      lembar_().appendRow([new Date(), teks_(nama), hadir, hadir === "Hadir" ? jumlah : 0, teks_(ucapan)]);
      ok = true;
    }
  } catch (err) {}
  return json_({ ok: ok });
}
