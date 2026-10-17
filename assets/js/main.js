/* The Wedding of Putri & Vira — interaksi undangan (vanilla JS) */
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

  /* ---------- Salin nomor rekening ---------- */
  var copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", function () {
    var norek = document.getElementById("norek").textContent.replace(/[^0-9]/g, "");
    navigator.clipboard.writeText(norek).then(function () {
      document.getElementById("copied-msg").textContent = "✓ Nomor rekening tersalin";
      setTimeout(function () { document.getElementById("copied-msg").textContent = ""; }, 2500);
    });
  });

  /* ---------- Ucapan via WhatsApp ---------- */
  // Nomor WhatsApp mempelai perempuan
  var WA_NUMBER = "6283814135137";
  document.getElementById("wish-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var nama = document.getElementById("wish-name").value.trim();
    var pesan = document.getElementById("wish-msg").value.trim();
    var teks = "Ucapan & doa untuk Putri & Vira\n\nDari: " + nama + "\n\n" + pesan;
    var url = WA_NUMBER
      ? "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(teks)
      : "https://wa.me/?text=" + encodeURIComponent(teks);
    window.open(url, "_blank", "noopener");
  });
})();
