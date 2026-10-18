# The Wedding of Putri & Pira

Undangan pernikahan digital **Putri Wahyu Nengsih & Kupira** bernuansa adat
Minangkabau — palet marawa (marun · emas · hitam), ornamen gonjong Rumah
Gadang, kaluak paku, pita motif songket, dan pepatah Minang. Dibuat dengan
♥ oleh sang kakak, [ajo Muhardiansyah](https://muhardiansyah15.github.io/).

- **Akad Nikah:** Jumat, 12 Maret 2027
- **Resepsi 1 (kediaman mempelai wanita):** Rabu, 17 Maret 2027, 10.00 WIB
- **Resepsi 2 (kediaman mempelai pria):** Kamis, 18 Maret 2027, 10.00 WIB

Situs statis murni (HTML/CSS/JS, tanpa framework & tanpa server berbayar) —
ringan dibuka dari WhatsApp di ponsel.

## Tiga halaman

| Halaman | Untuk siapa | Fungsi |
|---|---|---|
| `index.html` | Tamu | Undangan utama — nama tamu dari URL `?to=` |
| `kirim.html` | Keluarga | Alat kirim undangan via WhatsApp (tidak ditautkan dari undangan, `noindex`) |
| `ucapan.html` | Layar di lokasi acara | Papan ucapan & doa untuk TV/proyektor maupun ponsel (`noindex`) |

## Cara kerja — alur lengkap

```
 kirim.html ──link ?to=Nama──▶ WhatsApp tamu ──▶ index.html (undangan)
                                                      │
                                     RSVP/ucapan tamu │ POST
                                                      ▼
                                      Google Apps Script (Web App)
                                                      │ tulis/baca
                                                      ▼
                                      Google Spreadsheet (privat)
                                                      ▲ GET tiap 30 detik
                                                      │
                                  ucapan.html (TV di lokasi baralek)
```

1. **Keluarga menyebar undangan** lewat `kirim.html`: isi nama tamu (dan
   nomor WA bila ada) → pratinjau pesan lengkap muncul → tombol membuka
   WhatsApp dengan pesan + link unik
   `…/wedding_invitations/?to=Nama+Tamu`.
2. **Tamu membuka link**: cover pintu Minang menampilkan namanya
   ("Kepada Yth. …"), tombol *Buka Undangan* membelah pintu, musik
   talempong mulai (autoplay baru boleh setelah interaksi — kebijakan
   browser). Lalu: hitung mundur, QS. Ar-Rum 21 + pepatah, profil
   mempelai (+ sosmed), rangkaian acara dengan tombol Google Maps,
   galeri, lini masa, Tando Kasih (rekening & DANA dengan tombol salin).
3. **Tamu konfirmasi kehadiran** (Hadir / Tidak Hadir, jumlah, ucapan) →
   terkirim ke Web App Apps Script → tersimpan sebagai baris baru di
   spreadsheet keluarga. Spreadsheet **tetap privat** — yang publik hanya
   URL Web App-nya.
4. **Guest wall**: undangan dan `ucapan.html` membaca daftar ucapan dari
   endpoint yang sama (JSON, maksimal 100 terbaru). Moderasi = hapus
   barisnya di spreadsheet.
5. **Hari H**: buka `ucapan.html` di laptop yang tersambung TV →
   ⛶ Layar Penuh. Layar lebar: foto sampul 1/3 kiri + kartu ucapan 2/3
   kanan, berganti halaman otomatis tiap 12 detik, data diperbarui tiap
   30 detik. Di ponsel: daftar gulir biasa.

## Preview WhatsApp (foto sampul di chat)

Tag Open Graph di `index.html` menunjuk `assets/img/og-image.jpg`
(1200×630). WhatsApp membuat kartu preview **saat pesan diketik** dan
**meng-cache per URL** berminggu-minggu:

- Tunggu thumbnail muncul di kotak ketik sebelum menekan kirim.
- Link yang pernah dikirim sebelum foto OG ada akan tetap tampil tanpa
  foto sampai cache kedaluwarsa — pakai nama/URL yang belum pernah
  dikirim untuk mengetes.

## RSVP & Guest Wall — setup (sudah terpasang)

Backend: Google Apps Script Web App gratis, kode sumbernya di
`tools/apps-script-rsvp.gs` (sheet `RSVP`, kolom Waktu · Nama · Kehadiran ·
Jumlah · Ucapan; validasi panjang & jumlah tamu di sisi server).
URL deployment tersimpan di `RSVP_URL` (`assets/js/main.js` dan
`ucapan.html`).

Bila perlu deploy ulang (mis. ganti spreadsheet):

1. Spreadsheet → **Extensions → Apps Script** → tempel isi
   `tools/apps-script-rsvp.gs` → Save
2. **Deploy → New deployment → Web app** · *Execute as: Me* ·
   *Who has access: Anyone* → salin URL `/exec`
3. Tempel ke `RSVP_URL` di `assets/js/main.js` **dan** `ucapan.html`

## Struktur foto

Letakkan file apa adanya ke foldernya, nanti dioptimalkan & dipasang:

- `assets/img/sampul/` — foto sampul/cover
- `assets/img/mempelai-wanita/` — foto Putri
- `assets/img/mempelai-pria/` — foto Pira *(masih kosong)*
- `assets/img/galeri/` — foto galeri

## Yang masih menyusul (placeholder)

Cari teks `…………` / "menyusul" di `index.html`, lalu isi:

1. **Waktu & lokasi Akad Nikah** + link Google Maps
2. **Foto Pira** (section Pasangan Mempelai)
3. **Bank & nomor rekening** (Tando Kasih — DANA sudah terisi)
4. **Foto galeri** (masih 2 dari 4 slot)

## Menjalankan lokal & deploy

```bash
python3 -m http.server 8080   # buka http://127.0.0.1:8080/?to=Nama+Tamu
```

Deploy: push ke `main` → GitHub Pages (Settings → Pages → *Deploy from a
branch* → `main` / root). Link untuk tamu:

```
https://muhardiansyah15.github.io/wedding_invitations/?to=Nama+Tamu+%26+Partner
```

## Kredit

- Musik: rekaman lapangan talempong, Sumatera Barat —
  [Aural Archipelago](https://www.auralarchipelago.com/)
- Logo DANA: Wikimedia Commons (domain publik), hanya penanda metode
  pengiriman tando kasih
- Favicon gonjong & ornamen SVG (gonjong, kaluak paku, songket): dibuat
  sendiri untuk undangan ini
