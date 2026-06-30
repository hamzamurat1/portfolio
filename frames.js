// ── Frame Sequence Background (canvas-based, hover/tab-triggered) ──
// Komşu kareler arasında cross-fade (alpha blend) yapılarak yumuşak geçiş sağlanır.

const FRAME_COUNT  = 40;
const FRAME_PATH   = i => `frames/frame_${String(i).padStart(3, '0')}.webp`;

// Tab index → target frame
const TAB_FRAMES = { about: 39, projects: 20, erzurum: 0 };

// Düşük değer = daha yavaş/yumuşak geçiş, yüksek değer = daha hızlı tepki
const LERP_SPEED = 0.08;

let canvas, ctx;
let images = [];
let targetFrame  = TAB_FRAMES.about;
let currentLerp  = TAB_FRAMES.about;

function initFrameBg() {
  canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  loadFrame(Math.round(currentLerp), () => {
    draw(currentLerp);
    hideLoader();
    preloadRemaining();
    requestAnimationFrame(loop);
  });
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function loadFrame(i, cb) {
  i = clampIndex(i);
  if (images[i]) { cb && cb(); return; }
  const img = new Image();
  img.onload = () => { images[i] = img; cb && cb(); };
  img.src = FRAME_PATH(i);
}

function clampIndex(i) {
  return Math.max(0, Math.min(FRAME_COUNT - 1, i));
}

function preloadRemaining(i = 0) {
  if (i >= FRAME_COUNT) return;
  if (!images[i]) {
    loadFrame(i, () => preloadRemaining(i + 1));
  } else {
    preloadRemaining(i + 1);
  }
}

// value: ondalıklı kare pozisyonu (ör. 12.6). 12 ve 13 numaralı kareleri
// alpha=0.6 oranıyla üst üste çizerek aradaki geçişi yumuşatır.
function draw(value) {
  if (!ctx) return;

  const lo = clampIndex(Math.floor(value));
  const hi = clampIndex(Math.ceil(value));
  const t  = value - lo; // 0..1 arası karışım oranı

  const imgLo = images[lo];
  const imgHi = images[hi];
  const fallback = imgLo || imgHi || images[clampIndex(Math.round(value))];
  if (!fallback) return;

  const cw = canvas.width, ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);

  drawCover(fallback, cw, ch, 1);

  if (imgLo && imgHi && lo !== hi) {
    ctx.globalAlpha = t;
    drawCover(imgHi, cw, ch, 1);
    ctx.globalAlpha = 1;
  }

  // Eksik kareleri arka planda tetikle (henüz yüklenmemişse)
  if (!imgLo) loadFrame(lo, () => draw(currentLerp));
  if (!imgHi) loadFrame(hi, () => draw(currentLerp));
}

function drawCover(img, cw, ch) {
  const iw = img.width, ih = img.height;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function loop() {
  currentLerp += (targetFrame - currentLerp) * LERP_SPEED;
  draw(currentLerp);
  requestAnimationFrame(loop);
}

function setFrameTarget(section) {
  if (TAB_FRAMES[section] !== undefined) {
    targetFrame = TAB_FRAMES[section];
  }
}

function hideLoader() {
  const loader = document.getElementById('video-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 600);
  }
}

window.setFrameTarget = setFrameTarget;
window.initFrameBg    = initFrameBg;
