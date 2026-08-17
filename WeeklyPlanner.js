// ── Reveal animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const delay = parseInt(e.target.dataset.delay || 0, 10);
    setTimeout(() => e.target.classList.add('visible'), delay);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.shot-frame, .stat-card, .feature-card, .shot-row')
  .forEach(el => observer.observe(el));

document.querySelectorAll('.table-card').forEach((el, i) => {
  el.dataset.delay = i * 80;
  observer.observe(el);
});
