// Cursor

const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let cx = innerWidth / 2;
let cy = innerHeight / 2;

let rx = cx;
let ry = cy;

document.addEventListener('mousemove', e => {

  cx = e.clientX;
  cy = e.clientY;

});

(function animateCursor(){

  rx += (cx - rx) * 0.15;
  ry += (cy - ry) * 0.15;

  cursor.style.left = cx + 'px';
  cursor.style.top = cy + 'px';

  cursorRing.style.left = rx + 'px';
  cursorRing.style.top = ry + 'px';

  requestAnimationFrame(animateCursor);

})();

// Hover Effects

document.querySelectorAll(
  'a, button, input, textarea'
).forEach(el => {

  el.addEventListener('mouseenter', () => {

    cursorRing.style.width = '44px';
    cursorRing.style.height = '44px';

  });

  el.addEventListener('mouseleave', () => {

    cursorRing.style.width = '28px';
    cursorRing.style.height = '28px';

  });

});

// Gerçek Form Gönderimi (Formspree)

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');
const errorMsg = document.getElementById('form-error');

form.addEventListener('submit', async (e) => {

  e.preventDefault();

  successMsg.style.display = 'none';
  errorMsg.style.display = 'none';

  const originalText = submitBtn.innerHTML;
  var _tr = (function(){ try { return localStorage.getItem('hmt-lang') === 'tr'; }
                       catch (e) { return false; } })();
  submitBtn.innerHTML = _tr ? 'Gönderiliyor...' : 'Sending...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.reset();
      successMsg.style.display = 'block';
      submitBtn.innerHTML = _tr ? 'Mesaj Gönderildi ✓' : 'Message Sent ✓';
    } else {
      throw new Error('Form submission failed');
    }
  } catch (err) {
    errorMsg.style.display = 'block';
    submitBtn.innerHTML = originalText;
  } finally {
    submitBtn.disabled = false;
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
    }, 3000);
  }

});
