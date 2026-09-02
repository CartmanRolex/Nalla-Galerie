(function () {
  var mount = document.getElementById('editorial-page');
  if (!mount) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeUrl(s) {
    var url = String(s || '').trim();
    return /^(https?:|mailto:|tel:|[^:]+$)/i.test(url) ? esc(url) : '#';
  }

  function render(data) {
    document.title = (data.title || 'Galerie') + ' · Galerie Weurseuk';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && data.intro) meta.setAttribute('content', data.intro);

    var sections = (data.sections || []).map(function (section) {
      var visual = !section.image ? '' :
        '<figure class="content-visual rv"><img loading="lazy" src="' + esc(section.image) +
        '" alt="' + esc(section.image_alt || section.title) + '"/>' +
        (section.caption ? '<figcaption>' + esc(section.caption) + '</figcaption>' : '') + '</figure>';
      return '<article class="content-block' + (section.image ? ' has-image' : '') + '">' +
        '<div class="content-copy rv"><h2>' + esc(section.title) + '</h2>' +
        (section.text ? '<p>' + esc(section.text) + '</p>' : '') + '</div>' + visual + '</article>';
    }).join('');

    var gallery = (data.gallery || []).filter(function (item) { return item.image; });
    var galleryHtml = !gallery.length ? '' :
      '<div class="editorial-gallery"><div class="grid">' + gallery.map(function (item) {
        return '<figure class="work rv"><div class="work-img"><img loading="lazy" src="' +
          esc(item.image) + '" alt="' + esc(item.alt || item.caption || '') + '"/></div>' +
          (item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div></div>';

    var cta = !(data.cta_title || data.cta_text || data.cta_label) ? '' :
      '<div class="editorial-cta rv">' +
      (data.cta_title ? '<h2>' + esc(data.cta_title) + '</h2>' : '') +
      (data.cta_text ? '<p>' + esc(data.cta_text) + '</p>' : '') +
      (data.cta_label ? '<div class="cta-row"><a class="btn" href="' + safeUrl(data.cta_url) + '">' +
        esc(data.cta_label) + '</a></div>' : '') + '</div>';

    mount.innerHTML = '<section class="page-head"><div class="wrap">' +
      (data.eyebrow ? '<p class="eyebrow">' + esc(data.eyebrow) + '</p>' : '') +
      '<h1>' + esc(data.title) + '</h1>' +
      (data.intro ? '<p class="lead">' + esc(data.intro) + '</p>' : '') +
      '</div></section><section class="section"><div class="wrap">' +
      '<div class="content-blocks">' + sections + '</div>' + galleryHtml + cta + '</div></section>';
    document.dispatchEvent(new CustomEvent('works:rendered'));
  }

  fetch(mount.dataset.source, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(render)
    .catch(function (err) {
      mount.innerHTML = '<section class="page-head"><div class="wrap"><h1>Page indisponible</h1>' +
        '<p class="lead">Cette page n\'a pas pu être chargée. Veuillez réessayer.</p></div></section>';
      if (window.console) console.error(mount.dataset.source + ':', err);
    });
})();
