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
const errorDetail = document.getElementById('form-error-detail');

function trAktif() {
  try { return localStorage.getItem('hmt-lang') === 'tr'; } catch (e) { return false; }
}

// Formspree'nin JSON hata govdesinden okunabilir bir mesaj cikarir.
function hataMesaji(data) {
  if (!data) return '';
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map(e => e.message || e.code).filter(Boolean).join(' · ');
  }
  return data.error || '';
}

form.addEventListener('submit', async (e) => {

  e.preventDefault();

  successMsg.style.display = 'none';
  errorMsg.style.display = 'none';
  errorDetail.style.display = 'none';
  errorDetail.textContent = '';

  const originalText = submitBtn.innerHTML;
  const tr = trAktif();
  submitBtn.innerHTML = tr ? 'Gönderiliyor...' : 'Sending...';
  submitBtn.disabled = true;

  let yonlendirildi = false;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.reset();
      successMsg.style.display = 'block';
      submitBtn.innerHTML = tr ? 'Mesaj Gönderildi ✓' : 'Message Sent ✓';
      return;
    }

    const data = await response.json().catch(() => null);
    const mesaj = hataMesaji(data);

    // Formda reCAPTCHA acikken Formspree AJAX gonderimini 403 ile reddediyor.
    // Bu durumda klasik form gonderimine dusuyoruz: Formspree kendi sayfasinda
    // dogrulamayi alip mesaji iletiyor, yani mesaj kaybolmuyor.
    if (response.status === 403 && /recaptcha|custom key/i.test(mesaj)) {
      submitBtn.innerHTML = tr ? 'Doğrulamaya yönlendiriliyor...' : 'Redirecting to verification...';
      yonlendirildi = true;
      form.submit();   // submit olayini tetiklemez, dongu olusmaz
      return;
    }

    throw new Error(mesaj || ('HTTP ' + response.status));

  } catch (err) {
    errorMsg.style.display = 'block';
    if (err && err.message) {
      errorDetail.textContent = err.message;
      errorDetail.style.display = 'block';
    }
    console.error('Formspree:', err);
    submitBtn.innerHTML = originalText;
  } finally {
    if (!yonlendirildi) {
      submitBtn.disabled = false;
      setTimeout(() => { submitBtn.innerHTML = originalText; }, 3000);
    }
  }

});
