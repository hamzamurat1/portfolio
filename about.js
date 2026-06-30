// ── Cursor ──
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let cx = innerWidth/2, cy = innerHeight/2;
let rx = cx, ry = cy;

document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
(function animCursor() {
  rx += (cx-rx)*0.15; ry += (cy-ry)*0.15;
  cursor.style.left     = cx+'px'; cursor.style.top     = cy+'px';
  cursorRing.style.left = rx+'px'; cursorRing.style.top = ry+'px';
  requestAnimationFrame(animCursor);
})();

// ── Cursor ring grow on interactive elements ──
document.querySelectorAll('a, .pill, .nav-tab').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.style.width  = '44px';
    cursorRing.style.height = '44px';
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.style.width  = '28px';
    cursorRing.style.height = '28px';
  });
});
