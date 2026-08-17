// ── Reveal animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.feature-card').forEach(el => observer.observe(el));

// ── "Bu uygulama hakkında" genişlet / daralt ──
const aboutMore   = document.getElementById('about-more');
const aboutToggle = document.getElementById('about-toggle');

function trAktif() {
  try { return localStorage.getItem('hmt-lang') === 'tr'; } catch (e) { return false; }
}
aboutToggle.addEventListener('click', () => {
  const open = aboutMore.classList.toggle('open');
  const tr = trAktif();
  aboutToggle.textContent = open
    ? (tr ? 'Daha az ↑'    : 'Read less ↑')
    : (tr ? 'Daha fazla ↓' : 'Read more ↓');
});

// ── Yatay galeri ──
const gallery  = document.getElementById('gallery');
const shots    = [...gallery.querySelectorAll('.shot')];
const btnPrev  = document.getElementById('gal-prev');
const btnNext  = document.getElementById('gal-next');

const END_TOL = 2; // kesirli scrollLeft değerleri için tolerans

function maxScroll()  { return gallery.scrollWidth - gallery.clientWidth; }
function atStart()    { return gallery.scrollLeft <= END_TOL; }
function atEnd()      { return gallery.scrollLeft >= maxScroll() - END_TOL; }

function syncArrows() {
  btnPrev.disabled = atStart();
  btnNext.disabled = atEnd();
}

function scrollByShots(dir) {
  const step = shots[0].offsetWidth + 16; // kart genişliği + gap
  gallery.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
}
btnPrev.addEventListener('click', () => scrollByShots(-1));
btnNext.addEventListener('click', () => scrollByShots(1));

gallery.addEventListener('scroll', syncArrows, { passive: true });
window.addEventListener('resize', syncArrows);
syncArrows();

// Fare tekerleği: dikey kaydırmayı galeride yatay kaydırmaya çevir.
// deltaMode normalize ediliyor — Firefox satır (1) veya sayfa (2) birimi
// gönderebiliyor, Chrome piksel (0).
function wheelDelta(e) {
  if (e.deltaMode === 1) return e.deltaY * 16;                  // satır
  if (e.deltaMode === 2) return e.deltaY * gallery.clientWidth; // sayfa
  return e.deltaY;                                             // piksel
}

// Uca varıldığı anda sayfa devralmıyor; son görsel tam görünmeden aşağı
// kaymasın diye kısa bir bekleme var.
const HANDOFF_DELAY = 200;
let lockUntil = 0;

gallery.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // yatay jest: dokunma
  const now  = e.timeStamp;
  const down = e.deltaY > 0;

  if ((down && !atEnd()) || (!down && !atStart())) {
    e.preventDefault();
    gallery.scrollLeft += wheelDelta(e);
    lockUntil = now + HANDOFF_DELAY;
    return;
  }
  // Uçtayız: aynı kaydırma hareketinin devamıysa sayfayı beklet
  if (now < lockUntil) e.preventDefault();
}, { passive: false });

// ── Lightbox ──
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
let lbIndex = 0;

function showLightbox(i) {
  lbIndex = (i + shots.length) % shots.length;
  const src = shots[lbIndex].querySelector('img');
  lbImg.src = src.src;
  lbImg.alt = src.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

shots.forEach((btn, i) => btn.addEventListener('click', () => showLightbox(i)));

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', (e) => {
  e.stopPropagation(); showLightbox(lbIndex - 1);
});
document.getElementById('lb-next').addEventListener('click', (e) => {
  e.stopPropagation(); showLightbox(lbIndex + 1);
});
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showLightbox(lbIndex - 1);
  if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
});
