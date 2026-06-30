// ── Frame Sequence (canvas, scroll-scrub, cross-fade) ──
// Ekran görüntülerini frames/ps2/frame_000.webp ... şeklinde bu klasöre koy.
const FRAME_COUNT = 73; // SP2.mp4: 3.04s × 24fps, tüm kareler
const FRAME_PATH  = i => `frames/ps2/frame_${String(i).padStart(3, '0')}.webp`;

const SMOOTHNESS = 0.08;

let canvas, ctx;
let images = [];
let currentFrame = 0, targetFrame = 0;

const progressBar   = document.getElementById('progress-bar');
const stickySection = document.getElementById('sticky-section');

function clampIndex(i) { return Math.max(0, Math.min(FRAME_COUNT - 1, i)); }

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
}

function loadFrame(i, cb) {
  i = clampIndex(i);
  if (images[i]) { cb && cb(); return; }
  const img = new Image();
  img.onload = () => { images[i] = img; cb && cb(); };
  img.src = FRAME_PATH(i);
}

// Tüm kareleri PARALEL (aynı anda) yükle — sıra ile bekleme yok,
// böylece scroll sırasında henüz gelmemiş kareye takılma azalır.
function preloadAll() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    loadFrame(i);
  }
}

function drawCover(img, cw, ch) {
  const iw = img.width, ih = img.height;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function draw(value) {
  if (!ctx) return;
  const lo = clampIndex(Math.floor(value));
  const hi = clampIndex(Math.ceil(value));
  const t  = value - lo;

  const imgLo = images[lo];
  const imgHi = images[hi];
  const fallback = imgLo || imgHi;
  if (!fallback) return;

  const cw = canvas.width, ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);
  drawCover(fallback, cw, ch);

  if (imgLo && imgHi && lo !== hi) {
    ctx.globalAlpha = t;
    drawCover(imgHi, cw, ch);
    ctx.globalAlpha = 1;
  }

  if (!imgLo) loadFrame(lo, () => draw(currentFrame));
  if (!imgHi) loadFrame(hi, () => draw(currentFrame));
}

function onScroll() {
  const rect = stickySection.getBoundingClientRect();
  const stickyH = stickySection.offsetHeight;
  const scrolled = -rect.top;
  const pct = Math.max(0, Math.min(scrolled / (stickyH - window.innerHeight), 1));
  targetFrame = pct * (FRAME_COUNT - 1);
  progressBar.style.width = (pct * 100) + '%';
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', resizeCanvas);

function animate() {
  currentFrame += (targetFrame - currentFrame) * SMOOTHNESS;
  draw(currentFrame);
  requestAnimationFrame(animate);
}

function initFrames() {
  canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  loadFrame(0, () => {
    draw(0);
    preloadAll();
    animate();
  });
}
initFrames();

// ── Reveal animations (stats / features / screenshots) ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), parseInt(delay));
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-card, .feature-card, .shot-row').forEach(el => {
  observer.observe(el);
});

// ── Side cards: scroll-driven reveal ──
const leftCards  = document.querySelectorAll('#left-panel .info-card');
const rightCards = document.querySelectorAll('#right-panel .info-card');
const allSideCards = [...leftCards, ...rightCards];

const interleaved = [];
for (let i = 0; i < Math.max(leftCards.length, rightCards.length); i++) {
  if (leftCards[i])  interleaved.push({ el: leftCards[i],  side: 'left'  });
  if (rightCards[i]) interleaved.push({ el: rightCards[i], side: 'right' });
}
const CARD_COUNT = interleaved.length;

allSideCards.forEach(c => {
  c.style.opacity = '0';
  c.style.transform = 'translateY(60px)';
  c.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s';
});

let lastCardPct = -1;

function updateSideCards() {
  const rect = stickySection.getBoundingClientRect();
  const stickyH = stickySection.offsetHeight;
  const scrolled = -rect.top;
  const pct = Math.max(0, Math.min(scrolled / (stickyH - window.innerHeight), 1));

  if (Math.abs(pct - lastCardPct) < 0.002) return;
  lastCardPct = pct;

  interleaved.forEach((item, i) => {
    const threshold = i / CARD_COUNT;
    const cardPct = Math.max(0, Math.min((pct - threshold) / (1 / CARD_COUNT), 1));

    item.el.style.opacity = cardPct.toString();
    const yOffset = 60 * (1 - cardPct);
    const xOffset = item.side === 'left' ? -20 * (1 - cardPct) : 20 * (1 - cardPct);
    item.el.style.transform = `translateY(${yOffset}px) translateX(${xOffset}px)`;
  });
}

let stickyRevealed = false;

window.addEventListener('scroll', () => {
  updateSideCards();
  if (!stickyRevealed) {
    const heroH = document.getElementById('hero').offsetHeight;
    if (window.scrollY > heroH * 0.6) {
      stickySection.classList.add('visible');
      stickyRevealed = true;
    }
  }
}, { passive: true });

updateSideCards();
