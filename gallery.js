(function () {
  var mount = document.getElementById('gallery-page');
  if (!mount) return;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safeUrl(s) { var u = String(s || '').trim(); return /^(https?:|mailto:|tel:|[^:]+$)/i.test(u) ? esc(u) : '#'; }
  Promise.all([
    fetch('gallery.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('gallery.json'); return r.json(); }),
    fetch('site.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('site.json'); return r.json(); })
  ]).then(function (all) {
    var page = all[0], site = all[1];
    var sections = (page.sections || []).map(function (s) {
      return '<div class="serie rv"><div class="serie-bar"><h2>' + esc(s.title) + '</h2></div>' +
        (s.text ? '<p class="prose">' + esc(s.text) + '</p>' : '') +
        (s.button_label ? '<div class="cta-row"><a class="btn" href="' + safeUrl(s.button_url) + '">' + esc(s.button_label) + '</a></div>' : '') + '</div>';
    }).join('');
    var place = [site.location, site.country].filter(Boolean).join(' — ');
    mount.innerHTML = '<section class="page-head"><div class="wrap">' +
      (page.eyebrow ? '<p class="eyebrow">' + esc(page.eyebrow) + '</p>' : '') + '<h1>' + esc(page.title) + '</h1>' +
      (page.intro ? '<p class="lead">' + esc(page.intro) + '</p>' : '') + '</div></section>' +
      '<section class="section"><div class="wrap">' + sections + '</div></section>' +
      '<section class="section contact"><div class="wrap"><h2>' + esc(page.contact_title) + '</h2>' +
      '<p>' + esc(place) + (place && page.contact_text ? '. ' : '') + esc(page.contact_text) + '</p><div class="lines">' +
      (site.phone ? '<a class="line" href="tel:' + esc(String(site.phone).replace(/[^0-9+]/g, '')) + '"><span class="line-label">Téléphone</span>' + esc(site.phone) + '</a>' : '') +
      (site.whatsapp ? '<a class="line" href="https://wa.me/' + esc(String(site.whatsapp).replace(/\D/g, '')) + '"><span class="line-label">WhatsApp</span>' + esc(page.whatsapp_label) + '</a>' : '') +
      (site.email ? '<a class="line" href="mailto:' + esc(site.email) + '"><span class="line-label">Email</span>' + esc(site.email) + '</a>' : '') +
      '</div></div></section>';
    document.dispatchEvent(new CustomEvent('works:rendered'));
  }).catch(function (err) { if (window.console) console.error('Galerie:', err); });
})();
