(function () {
  var mount = document.getElementById('home-featured');
  if (!mount) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slugify(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function summary(works) {
    var media = [];
    works.forEach(function (work) {
      var short = String(work.medium || '').split(' sur ')[0];
      if (short && media.indexOf(short) === -1) media.push(short);
    });
    return works.length + (works.length > 1 ? ' toiles' : ' toile') +
      (media.length ? ' · ' + media.join(', ') : '');
  }

  Promise.all([
    fetch('artists.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('artists.json: HTTP ' + r.status);
      return r.json();
    }),
    fetch('works.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('works.json: HTTP ' + r.status);
      return r.json();
    })
  ]).then(function (data) {
    var artist = ((data[0] && data[0].artists) || [])[0];
    var series = ((data[1] && data[1].series) || []).filter(function (s) {
      return (s.works || []).length;
    });
    if (!artist) throw new Error('Aucun artiste dans artists.json');

    var cards = series.map(function (s) {
      var works = s.works || [];
      var work = works[0];
      return '<a class="work" href="oeuvres.html#' + esc(slugify(s.name)) +
        '" style="text-decoration:none">' +
        '<div class="work-img"><img loading="lazy" src="' + esc(work.image) +
        '" alt="' + esc(work.alt || work.title) + '"/></div>' +
        '<div class="work-txt"><h3>' + esc(s.name) + '</h3><p class="meta">' +
        esc(summary(works)) + '</p></div></a>';
    }).join('');

    mount.innerHTML =
      '<div class="section-head rv"><h2>À l\'affiche · ' + esc(artist.name) + '</h2>' +
      (artist.intro ? '<p class="lead">' + esc(artist.intro) + '</p>' : '') + '</div>' +
      '<div class="grid rv">' + cards + '</div>' +
      '<div class="cta-row rv"><a class="btn" href="' + esc(slugify(artist.name)) +
      '.html">Découvrir ' + esc(artist.name) + '</a></div>';
    document.dispatchEvent(new CustomEvent('works:rendered'));
  }).catch(function (err) {
    mount.innerHTML = '<p class="prose">Les informations n\'ont pas pu être chargées. ' +
      '<a href="oeuvres.html">Voir toutes les œuvres</a>.</p>';
    if (window.console) console.error('Accueil:', err);
  });
})();
