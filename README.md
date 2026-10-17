# The Wedding of Putri & Wira

Undangan pernikahan digital **Putri Wahyu Ningsih & Wira** bernuansa adat
Minangkabau — palet marawa (marun · emas · hitam), ornamen gonjong Rumah
Gadang, pita motif songket, dan pepatah Minang.

- **Akad Nikah:** Jumat, 12 Maret 2027
- **Resepsi (Baralek):** Selasa, 16 Maret 2027

Situs statis murni (HTML/CSS/JS, tanpa framework) — ringan untuk dibuka
dari WhatsApp di ponsel.

## Fitur

- Gerbang "Buka Undangan" dengan nama tamu dari parameter URL `?to=`
  (dirender aman via `textContent`, bebas bug double-escape)
- Musik latar (mulai setelah tombol dibuka — sesuai kebijakan autoplay
  browser) dengan tombol putar/jeda melayang
- Hitung mundur ke hari resepsi (WIB)
- Ayat QS. Ar-Rum: 21 + pepatah Minang *"Bulek aia dek pambuluah, bulek
  kato dek mufakaik"*
- Profil mempelai, rangkaian acara (Akad & Baralek) dengan tombol lokasi,
  galeri, lini masa Perkenalan → Maminang → Baralek
- "Tando Kasih": nomor rekening + tombol salin
- Ucapan & doa terkirim via WhatsApp
- Animasi reveal halus, hormati `prefers-reduced-motion`

## Yang masih menyusul (placeholder)

Cari teks `…………` / "menyusul" di `index.html`, lalu isi:

1. **Nama orang tua** kedua mempelai (section Pasangan Mempelai)
2. **Waktu & lokasi** Akad dan Resepsi + link Google Maps
   (ganti `href="#"` pada tombol `data-maps`, hapus `aria-disabled`)
3. **Foto** mempelai & galeri → letakkan di `assets/img/`, ganti
   placeholder `.photo-frame` / `.g-ph` dengan `<img>`
4. **Musik** → simpan sebagai `assets/audio/backsound.mp3`
5. **Bank & nomor rekening** (section Tando Kasih)
6. **Nomor WhatsApp keluarga** → variabel `WA_NUMBER` di
   `assets/js/main.js`

## Menjalankan & deploy

```bash
python3 -m http.server 8080   # lalu buka http://127.0.0.1:8080/?to=Nama+Tamu
```

Deploy: buat repo GitHub `wedding_invitations` → push → Settings → Pages
→ Source: *Deploy from a branch* → `main` / root. Bagikan ke tamu dengan
format:

```
https://<user>.github.io/wedding_invitations/?to=Nama+Tamu+%26+Partner
```
