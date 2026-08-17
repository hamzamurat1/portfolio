/* ── Dil değiştirici (EN varsayılan / TR seçenek) ──
   Mimari: HTML içeriği İNGİLİZCEDİR. Türkçe karşılıklar data-tr* özniteliklerinde
   durur. Böylece JS hiç çalışmasa bile sayfa varsayılan dilde (İngilizce) doğru
   görünür — dil değişimi sırasında yanıp sönme olmaz.

   Kullanım:
     <span data-tr="Projeler">Projects</span>          → metin/HTML
     <input data-tr-placeholder="Adınız" placeholder="Your Name">  → öznitelik
     <p class="lx en">...</p><p class="lx tr">...</p>  → uzun, biçimli bloklar

   Seçim localStorage'da tutulur, tüm sayfalarda geçerlidir. */
(function () {
  'use strict';

  var KEY = 'hmt-lang';
  var DILLER = ['en', 'tr'];

  function gecerli(d) { return DILLER.indexOf(d) !== -1 ? d : 'en'; }

  function kayitliDil() {
    try { return gecerli(localStorage.getItem(KEY)); } catch (e) { return 'en'; }
  }
  function dilKaydet(d) {
    try { localStorage.setItem(KEY, d); } catch (e) { /* gizli sekme: yok say */ }
  }

  // İngilizce orijinalleri bir kez yedekle (data-en yoksa)
  var metinler = [].slice.call(document.querySelectorAll('[data-tr]'));
  metinler.forEach(function (el) {
    if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
  });

  // Öznitelik çevirileri: data-tr-placeholder, data-tr-alt, data-tr-title ...
  var ozellikli = [].slice.call(document.querySelectorAll('*')).filter(function (el) {
    for (var i = 0; i < el.attributes.length; i++) {
      if (el.attributes[i].name.indexOf('data-tr-') === 0) return true;
    }
    return false;
  });
  ozellikli.forEach(function (el) {
    for (var i = 0; i < el.attributes.length; i++) {
      var ad = el.attributes[i].name;
      if (ad.indexOf('data-tr-') !== 0) continue;
      var hedef = ad.slice('data-tr-'.length);          // placeholder, alt, title...
      var yedek = 'data-en-' + hedef;
      if (!el.hasAttribute(yedek)) {
        el.setAttribute(yedek, el.getAttribute(hedef) || '');
      }
    }
  });

  var bloklar = [].slice.call(document.querySelectorAll('.lx'));
  var dugme = document.getElementById('lang-toggle');

  function uygula(dil) {
    metinler.forEach(function (el) {
      var yeni = el.getAttribute(dil === 'tr' ? 'data-tr' : 'data-en');
      if (yeni !== null && el.innerHTML !== yeni) el.innerHTML = yeni;
    });

    ozellikli.forEach(function (el) {
      for (var i = 0; i < el.attributes.length; i++) {
        var ad = el.attributes[i].name;
        if (ad.indexOf('data-tr-') !== 0) continue;
        var hedef = ad.slice('data-tr-'.length);
        var deger = dil === 'tr'
          ? el.getAttribute('data-tr-' + hedef)
          : el.getAttribute('data-en-' + hedef);
        if (deger !== null) el.setAttribute(hedef, deger);
      }
    });

    bloklar.forEach(function (el) {
      el.hidden = !el.classList.contains(dil);
    });

    document.documentElement.lang = dil;
    if (dugme) {
      dugme.textContent = dil.toUpperCase();
      dugme.setAttribute('aria-label',
        dil === 'tr' ? 'Dili İngilizceye çevir' : 'Switch language to Turkish');
      dugme.setAttribute('title',
        dil === 'tr' ? 'Dili İngilizceye çevir' : 'Switch language to Turkish');
    }
  }

  var aktif = kayitliDil();
  uygula(aktif);

  if (dugme) {
    dugme.addEventListener('click', function () {
      aktif = aktif === 'tr' ? 'en' : 'tr';
      dilKaydet(aktif);
      uygula(aktif);
    });
  }

  // Başka bir sekmede dil değişirse burayı da güncelle
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    aktif = gecerli(e.newValue);
    uygula(aktif);
  });
})();
