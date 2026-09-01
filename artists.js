(function () {
  var detail = document.getElementById('artist');
  var list = document.getElementById('artists');
  if (!detail && !list) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Autorise <em> et <strong> dans les champs de texte riche.
  function rich(s) {
    return esc(s)
      .replace(/&lt;(\/?)(em|strong)&gt;/g, '<$1$2>');
  }

  function tel(p) { return String(p || '').replace(/[^0-9+]/g, ''); }

  // L'identifiant de page est déduit du nom : « Nalla Thioye » → « nalla-thioye ».
  function slugify(s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function renderDetail(a) {
    if (!a) {
      detail.innerHTML = '<div class="wrap"><p class="prose">Cet artiste est introuvable. ' +
        '<a href="artistes.html">Voir tous les artistes</a>.</p></div>';
      return;
    }
    document.title = a.name + ' · Galerie Weurseuk';

    var head =
      '<section class="page-head"><div class="wrap">' +
        '<p class="eyebrow">' + esc(a.role) + '</p>' +
        '<h1>' + esc(a.name) + '</h1>' +
        (a.intro ? '<p class="lead">' + rich(a.intro) + '</p>' : '') +
        (a.highlight_tag || a.highlight_text ?
          '<div class="badge rv">' +
            (a.highlight_tag ? '<span class="badge-tag">' + esc(a.highlight_tag) + '</span>' : '') +
            (a.highlight_text ? '<p>' + rich(a.highlight_text) + '</p>' : '') +
          '</div>' : '') +
      '</div></section>';

    var bio =
      '<section class="section bio"><div class="wrap bio-grid">' +
        (a.portrait ?
          '<figure class="portrait rv">' +
            '<img src="' + esc(a.portrait) + '" alt="' + esc(a.portrait_alt || a.name) + '"/>' +
            (a.portrait_credit ? '<figcaption>' + esc(a.portrait_credit) + '</figcaption>' : '') +
          '</figure>' : '') +
        '<div class="rv">' +
          '<h2>' + esc(a.statement_title || 'Note d\'intention') + '</h2>' +
          (a.statement ? '<p>' + rich(a.statement) + '</p>' : '') +
          '<div class="cta-row"><a class="btn" href="oeuvres.html">Voir les œuvres</a></div>' +
        '</div>' +
      '</div></section>';

    var exh = (a.exhibitions || []).filter(function (y) { return (y.items || []).length; });
    var expos = !exh.length ? '' :
      '<section class="section"><div class="wrap">' +
        '<div class="section-head rv"><h2>Expositions &amp; participations</h2></div>' +
        exh.map(function (y) {
          return '<div class="expo-year rv"><h3>' + esc(y.year) + '</h3><ul class="expo-list">' +
            y.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
            '</ul></div>';
        }).join('') +
      '</div></section>';

    var lines = '';
    if (a.phone) {
      lines += '<a class="line" href="tel:' + esc(tel(a.phone)) + '">' +
        '<span class="line-label">Téléphone</span>' + esc(a.phone) + '</a>';
      lines += '<a class="line" href="https://wa.me/' + esc(tel(a.phone).replace('+', '')) + '">' +
        '<span class="line-label">WhatsApp</span>Écrire à ' + esc(a.name.split(' ')[0]) + '</a>';
    }
    if (a.email) {
      lines += '<a class="line" href="mailto:' + esc(a.email) + '">' +
        '<span class="line-label">Email</span>' + esc(a.email) + '</a>';
    }
    var contact = !lines ? '' :
      '<section class="section contact"><div class="wrap">' +
        '<h2>Contact</h2>' +
        '<p>Ngor, Dakar — Sénégal. Pour une visite, une acquisition ou un projet d\'exposition.</p>' +
        '<div class="lines">' + lines + '</div>' +
      '</div></section>';

    detail.innerHTML = head + bio + expos + contact;
    document.dispatchEvent(new CustomEvent('works:rendered'));
  }

  function renderList(artists) {
    list.innerHTML = '<div class="grid rv">' + artists.map(function (a) {
      return '<a class="work" href="' + esc(slugify(a.name)) + '.html" style="text-decoration:none">' +
        '<div class="work-img"><img loading="lazy" src="' + esc(a.portrait) + '"' +
          ' alt="' + esc(a.portrait_alt || a.name) + '"/></div>' +
        '<div class="work-txt"><h3>' + esc(a.name) + '</h3>' +
        '<p class="meta">' + esc(a.discipline || a.role) + '</p></div>' +
      '</a>';
    }).join('') + '</div>';
    document.dispatchEvent(new CustomEvent('works:rendered'));
  }

  fetch('artists.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      var artists = (data && data.artists) || [];
      if (detail) {
        var slug = detail.dataset.slug;
        renderDetail(artists.filter(function (a) { return slugify(a.name) === slug; })[0]);
      }
      if (list) renderList(artists);
    })
    .catch(function (err) {
      var mount = detail || list;
      mount.innerHTML = '<div class="wrap"><p class="prose">' +
        'Les informations n\'ont pas pu être chargées. Rechargez la page, ou ' +
        'contactez la galerie au <a href="tel:+221776817715">+221 77 681 77 15</a>.</p></div>';
      if (window.console) console.error('artists.json:', err);
    });
})();
