// ── Erzurum: Mouse-driven frame scrub + Ateş Et sekansı ──

const IDLE_FRAME_COUNT = 241; // Asker.mp4: 10.04s × 24fps
const IDLE_FRAME_PATH  = i => `frames/erzurum/asker/frame_${String(i).padStart(3, '0')}.webp`;

const FIRE_FRAME_COUNT = 36; // AskerFire.mp4'ün sadece ilk 1.5 saniyesi (1.5 × 24fps)
const FIRE_FRAME_PATH  = i => `frames/erzurum/fire/frame_${String(i).padStart(3, '0')}.webp`;

const REDIRECT_DELAY = 1500; // ms — ateşten sonra ErzurumD.html'e geçiş

const frameImg     = document.getElementById('frame-img');
const spotlight     = document.getElementById('spotlight');
const cursorWrap     = document.getElementById('cursor-wrap');
const fireBtn        = document.getElementById('fire-btn');
const fireLabel      = document.getElementById('fire-label');
const shakeOverlay  = document.getElementById('shake-overlay');
const flashOverlay   = document.getElementById('flash');
const pageFade       = document.getElementById('page-fade');

let mode = 'idle'; // 'idle' | 'fire'
let mouseRatio = 0.5; // 0 = sol, 1 = sağ
let currentIdle = (1 - mouseRatio) * (IDLE_FRAME_COUNT - 1);
let targetIdle  = currentIdle;
let lastShownIdx = -1;
const IDLE_SMOOTHNESS = 0.055; // daha geriden, daha yumuşak takip

function clampIdx(i, count) { return Math.max(0, Math.min(count - 1, i)); }

const idleCache = {};
const fireCache = {};

function preload(path, cache, count) {
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = path(i);
    cache[i] = img.src;
  }
}

// ── Mouse takibi (cursor + spotlight + sağ=video başı, sol=video sonu) ──
document.addEventListener('mousemove', (e) => {
  const x = e.clientX, y = e.clientY;

  cursorWrap.style.left = x + 'px';
  cursorWrap.style.top  = y + 'px';

  spotlight.style.left = x + 'px';
  spotlight.style.top  = y + 'px';

  if (mode !== 'idle') return;
  mouseRatio = x / window.innerWidth;
  targetIdle = (1 - mouseRatio) * (IDLE_FRAME_COUNT - 1);
});

fireBtn.addEventListener('mouseenter', () => cursorWrap.classList.add('hovered'));
fireBtn.addEventListener('mouseleave', () => cursorWrap.classList.remove('hovered'));

function idleLoop() {
  if (mode !== 'idle') { requestAnimationFrame(idleLoop); return; }

  currentIdle += (targetIdle - currentIdle) * IDLE_SMOOTHNESS;
  const idx = clampIdx(Math.round(currentIdle), IDLE_FRAME_COUNT);

  if (idx !== lastShownIdx) {
    frameImg.src = idleCache[idx] || IDLE_FRAME_PATH(idx);
    lastShownIdx = idx;
  }

  requestAnimationFrame(idleLoop);
}

// ── Ateş Et sekansı ──
function playFireSequence() {
  mode = 'fire';
  fireBtn.style.pointerEvents = 'none';
  fireBtn.style.opacity = '0';
  fireLabel.style.opacity = '0';

  // Ekran sarsıntısı + siyah flash (anlık ateş efekti)
  shakeOverlay.classList.add('shaking');
  flashOverlay.classList.add('flashing');
  setTimeout(() => {
    shakeOverlay.classList.remove('shaking');
    flashOverlay.classList.remove('flashing');
  }, 350);

  // AskerFire kare dizisini sırayla oynat
  let i = 0;
  const totalFrames = FIRE_FRAME_COUNT;
  const stepTime = REDIRECT_DELAY / totalFrames;

  function step() {
    if (i >= totalFrames) return;
    frameImg.src = fireCache[i] || FIRE_FRAME_PATH(i);
    i++;
    if (i < totalFrames) setTimeout(step, stepTime);
  }
  step();

  // Geçişten kısa süre önce ekranı siyaha doğru fade-out yap
  const FADE_DURATION = 600;
  setTimeout(() => {
    pageFade.classList.add('fade-out');
  }, Math.max(0, REDIRECT_DELAY - FADE_DURATION));

  setTimeout(() => {
    window.location.href = 'ErzurumD.html';
  }, REDIRECT_DELAY);
}

fireBtn.addEventListener('click', playFireSequence);

// ── Init ──
function init() {
  const startIdx = clampIdx(Math.round(currentIdle), IDLE_FRAME_COUNT);
  frameImg.src = IDLE_FRAME_PATH(startIdx);
  lastShownIdx = startIdx;

  preload(IDLE_FRAME_PATH, idleCache, IDLE_FRAME_COUNT);
  preload(FIRE_FRAME_PATH, fireCache, FIRE_FRAME_COUNT);

  requestAnimationFrame(idleLoop);
}

init();
