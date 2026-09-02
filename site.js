(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function tel(s) { return String(s || '').replace(/[^0-9+]/g, ''); }

  fetch('site.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (site) {
    document.querySelectorAll('.brand').forEach(function (brand) {
      var words = String(site.name || '').trim().split(/\s+/);
      var last = words.pop() || '';
      brand.innerHTML = esc(words.join(' ')) + (words.length ? ' ' : '') + '<span>' + esc(last) + '</span>';
    });
    document.querySelectorAll('[data-site-location]').forEach(function (el) {
      el.textContent = [site.name, site.location].filter(Boolean).join(' · ');
    });
    document.querySelectorAll('[data-site-phone]').forEach(function (el) {
      el.textContent = site.phone || '';
      if (el.tagName === 'A') el.href = 'tel:' + tel(site.phone);
    });
    document.querySelectorAll('[data-site-phone-link]').forEach(function (el) {
      el.href = 'tel:' + tel(site.phone);
    });
    document.querySelectorAll('[data-site-email]').forEach(function (el) {
      el.textContent = site.email || '';
      if (el.tagName === 'A') el.href = 'mailto:' + site.email;
    });
    document.querySelectorAll('[data-site-whatsapp]').forEach(function (el) {
      if (el.tagName === 'A') el.href = 'https://wa.me/' + String(site.whatsapp || '').replace(/\D/g, '');
    });
    document.dispatchEvent(new CustomEvent('site:loaded', { detail: site }));
  }).catch(function (err) {
    if (window.console) console.error('site.json:', err);
  });
})();
