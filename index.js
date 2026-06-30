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

// ── Tab / Panel switching ──
const tabs     = document.querySelectorAll('.nav-tab');
const panelIds = ['about', 'projects', 'erzurum'];
const sections = { erzurum:0, projects:1.5, about:3 }; // video targets

// map tab index → video section key
const TAB_TO_SECTION = ['about', 'projects', 'erzurum'];

tabs.forEach(tab => {
  tab.addEventListener('mouseenter', () => {
    const idx = parseInt(tab.dataset.tab);

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('visible'));
    document.getElementById('panel-' + panelIds[idx]).classList.add('visible');

  if (window.setFrameTarget) window.setFrameTarget(TAB_TO_SECTION[idx]);
  });
});

// cursor ring grow on tabs
tabs.forEach(tab => {
  tab.addEventListener('mouseenter', () => { cursorRing.style.width='44px'; cursorRing.style.height='44px'; });
  tab.addEventListener('mouseleave', () => { cursorRing.style.width='28px'; cursorRing.style.height='28px'; });
});

// init video
if (window.initFrameBg) window.initFrameBg();