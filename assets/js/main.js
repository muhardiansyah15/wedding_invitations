/* The Wedding of Putri & Pira — interaksi undangan (vanilla JS) */
(function () {
  "use strict";

  /* ---------- Nama tamu dari ?to= (aman dari HTML injection: textContent) ---------- */
  var guestEl = document.getElementById("guest-name");
  var guest = new URLSearchParams(window.location.search).get("to");
  if (guestEl && guest && guest.trim()) {
    guestEl.textContent = guest.replace(/\+/g, " ").trim();
  }

  /* ---------- Gerbang undangan + musik ---------- */
  var cover = document.getElementById("cover");
  var invitation = document.getElementById("invitation");
  var musicBtn = document.getElementById("music-btn");
  var audio = document.getElementById("backsound");

  function setMusicState(playing) {
    musicBtn.classList.toggle("main", playing);
    musicBtn.textContent = playing ? "♪" : "⏸";
    musicBtn.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
  }

  document.getElementById("open-btn").addEventListener("click", function () {
    cover.classList.add("terbuka");
    invitation.hidden = false;
    musicBtn.hidden = false;
    document.body.style.overflow = "";
    // musik mulai dari gestur pengguna — kebijakan autoplay browser terpenuhi
    audio.play().then(function () { setMusicState(true); }).catch(function () {
      // backsound.mp3 belum ada / gagal dimuat: sembunyikan tombol musik
      musicBtn.hidden = true;
    });
    revealInit();
  });

  musicBtn.addEventListener("click", function () {
    if (audio.paused) { audio.play().then(function () { setMusicState(true); }); }
    else { audio.pause(); setMusicState(false); }
  });

  // kunci scroll selama cover terbuka
  document.body.style.overflow = "hidden";

  /* ---------- Hitung mundur ke resepsi (16 Maret 2027, WIB) ---------- */
  var target = new Date("2027-03-17T10:00:00+07:00").getTime();
  var el = {
    hari: document.getElementById("cd-hari"),
    jam: document.getElementById("cd-jam"),
    menit: document.getElementById("cd-menit"),
    detik: document.getElementById("cd-detik")
  };
  function tick() {
    var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    el.hari.textContent = Math.floor(s / 86400);
    el.jam.textContent = Math.floor((s % 86400) / 3600);
    el.menit.textContent = Math.floor((s % 3600) / 60);
    el.detik.textContent = s % 60;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Reveal saat scroll: berjenjang + gonjong melukis diri ---------- */
  function revealInit() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("tampak"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    // jeda berjenjang per section, ala preset Rise/Pan
    document.querySelectorAll(".sect").forEach(function (sect) {
      sect.querySelectorAll(".reveal").forEach(function (n, i) {
        n.style.transitionDelay = Math.min(i * 0.12, 0.6) + "s";
        io.observe(n);
      });
    });
    document.querySelectorAll("#invitation .gonjong").forEach(function (g) { io.observe(g); });
  }

  /* ---------- Salin nomor rekening / e-wallet ---------- */
  function pasangSalin(btnId, norekId, msgId, label) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var nomor = document.getElementById(norekId).textContent.replace(/[^0-9]/g, "");
      navigator.clipboard.writeText(nomor).then(function () {
        document.getElementById(msgId).textContent = label;
        setTimeout(function () { document.getElementById(msgId).textContent = ""; }, 2500);
      });
    });
  }
  pasangSalin("copy-btn", "norek", "copied-msg", "✓ Nomor rekening tersalin");
  pasangSalin("copy-btn-dana", "norek-dana", "copied-msg-dana", "✓ Nomor DANA tersalin");

  /* ---------- RSVP & Guest Wall (Google Apps Script) ---------- */
  // Web App Apps Script — spreadsheet RSVP keluarga (tetap privat)
  var RSVP_URL = "https://script.google.com/macros/s/AKfycbzCDVE5ivtVxFTlzP4xPSU3N_tu64V7F28GDFfRssK_oHTZNaPyIPqXmb9jjGEV9fGg/exec";

  var form = document.getElementById("rsvp-form");
  var nanti = document.getElementById("rsvp-nanti");
  var wall = document.getElementById("wall");
  var wallIsi = document.getElementById("wall-isi");
  var statusEl = document.getElementById("rsvp-status");
  var kirimBtn = document.getElementById("rsvp-kirim");
  var pilihan = "";

  if (RSVP_URL) {
    form.hidden = false;
    nanti.hidden = true;
    wall.hidden = false;
    // nama otomatis dari ?to=
    if (guest && guest.trim()) {
      document.getElementById("rsvp-name").value = guest.replace(/\+/g, " ").trim();
    }
    muatWall();
  }

  document.querySelectorAll(".rsvp-opsi").forEach(function (b) {
    b.addEventListener("click", function () {
      pilihan = b.getAttribute("data-hadir");
      document.querySelectorAll(".rsvp-opsi").forEach(function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      document.getElementById("jumlah-wrap").hidden = pilihan !== "hadir";
    });
  });

  function itemWall(d) {
    var div = document.createElement("div");
    div.className = "wall-item";
    var nama = document.createElement("p");
    nama.className = "wall-nama";
    nama.textContent = d.nama;
    var badge = document.createElement("span");
    badge.className = "wall-badge" + (d.hadir === "Hadir" ? " hadir" : "");
    badge.textContent = d.hadir === "Hadir" ? "InsyaAllah hadir" : "berhalangan";
    nama.appendChild(badge);
    div.appendChild(nama);
    if (d.ucapan) {
      var p = document.createElement("p");
      p.className = "wall-pesan";
      p.textContent = d.ucapan;
      div.appendChild(p);
    }
    return div;
  }

  function muatWall() {
    fetch(RSVP_URL).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.ok) return;
      wallIsi.textContent = "";
      if (!res.data.length) {
        var kosong = document.createElement("p");
        kosong.className = "wish-note";
        kosong.textContent = "Jadilah yang pertama mengirim doa untuk kedua mempelai. 🤲";
        wallIsi.appendChild(kosong);
        return;
      }
      res.data.forEach(function (d) { wallIsi.appendChild(itemWall(d)); });
    }).catch(function () { /* biarkan senyap bila gagal memuat */ });
  }

  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!RSVP_URL) return;
    var nama = document.getElementById("rsvp-name").value.trim();
    if (!nama) return;
    if (!pilihan) { statusEl.textContent = "Mohon pilih kehadiran dulu, ya."; return; }
    kirimBtn.disabled = true;
    statusEl.textContent = "Mengirim…";
    var payload = JSON.stringify({
      nama: nama,
      hadir: pilihan,
      jumlah: document.getElementById("rsvp-jumlah").value,
      ucapan: document.getElementById("rsvp-msg").value.trim()
    });
    fetch(RSVP_URL, { method: "POST", body: payload }).then(function (r) {
      return r.json();
    }).then(function () {
      selesaiKirim();
    }).catch(function () {
      // Apps Script kadang menolak pembacaan respons lintas situs — data tetap masuk
      selesaiKirim();
    });
  });

  function selesaiKirim() {
    statusEl.textContent = "✓ Terima kasih, konfirmasi & doa Anda telah terkirim.";
    kirimBtn.disabled = false;
    document.getElementById("rsvp-msg").value = "";
    setTimeout(muatWall, 1200);
  }
})();
