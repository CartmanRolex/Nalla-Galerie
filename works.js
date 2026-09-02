(function () {
  var mount = document.getElementById('works');
  if (!mount) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function plural(n) { return n + (n > 1 ? ' toiles' : ' toile'); }

  // L'identifiant d'ancre est déduit du nom : « Pavois » → « pavois ».
  function slugify(s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function mediums(works) {
    var seen = [];
    works.forEach(function (w) {
      var m = (w.medium || '').split(' sur ')[0].trim();
      if (m && seen.indexOf(m) === -1) seen.push(m);
    });
    return seen.join(', ');
  }

  function render(data) {
    var pageFields = {
      'works-eyebrow': data.eyebrow,
      'works-title': data.page_title,
      'works-intro': data.page_intro,
      'works-contact-title': data.contact_title,
      'works-contact-text': data.contact_text
    };
    Object.keys(pageFields).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = pageFields[id] || '';
    });
    var series = (data && data.series) || [];
    var html = series.map(function (s) {
      var works = s.works || [];
      if (!works.length) return '';
      var cards = works.map(function (w) {
        var details = [w.medium, w.dimensions, w.year, w.price, w.availability].filter(Boolean);
        return '' +
          '<figure class="work zoom" tabindex="0" role="button"' +
          ' data-title="' + esc(w.title) + '"' +
          ' data-artist="' + esc(w.artist) + '"' +
          ' data-meta="' + esc(details.join(' · ')) + '"' +
          ' data-desc="' + esc(w.description) + '">' +
            '<div class="work-img"><img loading="lazy" src="' + esc(w.image) + '"' +
              ' alt="' + esc(w.title) + (w.alt ? ' — ' + esc(w.alt) : '') + '"/></div>' +
            '<figcaption class="work-txt">' +
              '<h3>' + esc(w.title) + '</h3>' +
              '<p class="meta">' + esc([w.artist].concat(details).filter(Boolean).join(' · ')) + '</p>' +
            '</figcaption>' +
          '</figure>';
      }).join('');

      var count = plural(works.length);
      var med = mediums(works);
      return '' +
        '<div class="serie rv" id="' + esc(slugify(s.name)) + '">' +
          '<div class="serie-bar"><h2>' + esc(s.name) + '</h2>' +
          '<span class="count">' + count + (med ? ' · ' + esc(med) : '') + '</span></div>' +
          '<div class="grid' + (works.length === 2 ? ' pair' : '') + '">' + cards + '</div>' +
        '</div>';
    }).join('');

    mount.innerHTML = html;
    document.dispatchEvent(new CustomEvent('works:rendered'));

    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  fetch('works.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      mount.innerHTML =
        '<p class="prose">Les œuvres n\'ont pas pu être chargées. ' +
        'Rechargez la page, ou contactez la galerie au ' +
        '<a href="tel:+221776817715">+221 77 681 77 15</a>.</p>';
      if (window.console) console.error('works.json:', err);
    });
})();
