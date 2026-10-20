/**
 * RSVP, Guest Wall & Log Penyebaran (dengan login keluarga)
 * The Wedding of Putri & Pira
 *
 * Pasang di: spreadsheet RSVP > Extensions > Apps Script (ganti isi Code.gs)
 * Deploy: Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Spreadsheet TETAP PRIVAT — hanya URL /exec skrip ini yang publik.
 *
 * Akun pengirim: isi sheet "PENGIRIM" (Username | Password | Nama).
 * Gunakan password karangan — JANGAN password asli akun lain.
 * Login diverifikasi di server ini; halaman statis tak pernah menyimpan password.
 *
 * @OnlyCurrentDoc  — izin skrip dibatasi HANYA ke spreadsheet ini,
 * bukan seluruh Drive/akun. Google menegakkan batas ini saat otorisasi.
 */
var SHEET_NAME = "RSVP";
var SHEET_KIRIM = "KIRIM";
var SHEET_USER = "PENGIRIM";
var TOKEN_HARI = 7; // token login berlaku 7 hari

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
    sh.appendRow(["Waktu", "Nama", "Nomor", "Cara", "Pengirim"]);
  }
  return sh;
}

function lembarUser_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_USER) || ss.insertSheet(SHEET_USER);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Username", "Password", "Nama"]);
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

/* ---------- Login & token (CacheService, kedaluwarsa otomatis) ---------- */

function login_(user, pass) {
  user = String(user || "").trim().toLowerCase().slice(0, 40);
  pass = String(pass || "").slice(0, 80);
  if (!user || !pass) return { ok: false, pesan: "Isi username dan password." };

  // rem brute force: 5x gagal = kunci 10 menit per username
  var cache = CacheService.getScriptCache();
  var gagal = parseInt(cache.get("gagal_" + user), 10) || 0;
  if (gagal >= 5) return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi 10 menit." };

  var rows = lembarUser_().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === user &&
        String(rows[i][1]) === pass && pass !== "") {
      var token = Utilities.getUuid();
      // PropertiesService: tahan lama (CacheService bisa terhapus sewaktu-waktu)
      bersihkanTokenKadaluarsa_();
      PropertiesService.getScriptProperties().setProperty("tok_" + token,
        JSON.stringify({
          user: user,
          nama: String(rows[i][2] || user),
          exp: Date.now() + TOKEN_HARI * 86400000
        }));
      cache.remove("gagal_" + user);
      return { ok: true, token: token, nama: String(rows[i][2] || user), user: user };
    }
  }
  cache.put("gagal_" + user, String(gagal + 1), 600);
  return { ok: false, pesan: "Username atau password salah." };
}

function pengirimDariToken_(token) {
  if (!token) return null;
  var kunci = "tok_" + String(token).slice(0, 64);
  var props = PropertiesService.getScriptProperties();
  var isi = props.getProperty(kunci);
  if (!isi) return null;
  try {
    var data = JSON.parse(isi);
    if (!data.exp || data.exp < Date.now()) {
      props.deleteProperty(kunci);
      return null;
    }
    return data;
  } catch (err) { return null; }
}

function bersihkanTokenKadaluarsa_() {
  var props = PropertiesService.getScriptProperties();
  var semua = props.getProperties();
  for (var k in semua) {
    if (k.indexOf("tok_") !== 0) continue;
    try {
      var d = JSON.parse(semua[k]);
      if (!d.exp || d.exp < Date.now()) props.deleteProperty(k);
    } catch (err) { props.deleteProperty(k); }
  }
}

/* ---------- Endpoint ---------- */

/**
 * GET: daftar ucapan untuk guest wall (publik, maks. 100 terbaru).
 * GET ?daftar=kirim&token=…: log penyebaran (hanya pengirim login,
 *   maks. 500 terbaru, nomor disamarkan).
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.daftar === "kirim") {
    if (!pengirimDariToken_(e.parameter.token)) {
      return json_({ ok: false, butuhLogin: true });
    }
    var rowsK = lembarKirim_().getDataRange().getValues();
    var kirim = [];
    for (var k = rowsK.length - 1; k >= 1 && kirim.length < 500; k--) {
      if (!rowsK[k][1]) continue;
      kirim.push({
        waktu: rowsK[k][0] ? new Date(rowsK[k][0]).toISOString() : "",
        nama: String(rowsK[k][1]),
        nomor: samar_(rowsK[k][2]),
        cara: String(rowsK[k][3] || ""),
        pengirim: String(rowsK[k][4] || "")
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
      ucapan: String(rows[i][4] || ""),
      waktu: rows[i][0] ? new Date(rows[i][0]).toISOString() : ""
    });
  }
  return json_({ ok: true, data: data });
}

/**
 * POST {aksi:"login", user, pass}: masuk, balasannya {ok, token, nama}.
 * POST {aksi:"kirim", token, nama, nomor, cara}: catat penyebaran (wajib login).
 * POST {nama, hadir, jumlah, ucapan}: simpan konfirmasi/ucapan tamu (publik).
 */
function doPost(e) {
  var ok = false;
  try {
    var p = JSON.parse(e.postData.contents || "{}");

    if (p.aksi === "login") {
      return json_(login_(p.user, p.pass));
    }

    if (p.aksi === "kirim") {
      var pengirim = pengirimDariToken_(p.token);
      if (!pengirim) return json_({ ok: false, butuhLogin: true });
      var namaK = String(p.nama || "").trim().slice(0, 80);
      var nomor = String(p.nomor || "").replace(/[^0-9]/g, "").slice(0, 20);
      var cara = (p.cara === "salin" || p.cara === "link") ? p.cara : "wa";
      if (namaK) {
        lembarKirim_().appendRow([new Date(), teks_(namaK), nomor, cara, pengirim.user]);
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
