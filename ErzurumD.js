// ── Sayfa kaymaz: scroll/touch hareketini yakalayıp sahneler arası geçiş yapar ──

const scenes = Array.from(document.querySelectorAll('.scene'));
const dotsContainer = document.getElementById('scene-dots');
const scrollHint = document.getElementById('scroll-hint');

let current = 0;
let isAnimating = false;
const COOLDOWN = 850; // ms — bir sonraki geçişe izin vermeden önce bekleme

// Nokta göstergelerini oluştur
scenes.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'scene-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});
const dots = Array.from(dotsContainer.children);

function showScene(index) {
  scenes.forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === index));

  if (index > 0) scrollHint.classList.add('hidden');
  else scrollHint.classList.remove('hidden');
}

function goTo(index) {
  if (isAnimating) return;
  index = Math.max(0, Math.min(scenes.length - 1, index));
  if (index === current) return;

  current = index;
  isAnimating = true;
  showScene(current);

  setTimeout(() => { isAnimating = false; }, COOLDOWN);
}

// ── Wheel (mouse tekerleği) ──
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (isAnimating) return;

  if (e.deltaY > 0) goTo(current + 1);
  else if (e.deltaY < 0) goTo(current - 1);
}, { passive: false });

// ── Touch (mobil swipe) ──
let touchStartY = null;

window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (touchStartY === null) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 40) {
    if (dy > 0) goTo(current + 1);
    else goTo(current - 1);
  }
  touchStartY = null;
});

// ── Klavye okları ──
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
  if (e.key === 'ArrowUp' || e.key === 'PageUp') goTo(current - 1);
});

// İlk sahneyi göster
showScene(0);
