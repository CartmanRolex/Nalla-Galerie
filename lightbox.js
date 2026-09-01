(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.work.zoom'));
  if (!items.length) return;

  var lastFocus = null;
  var index = -1;

  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Œuvre agrandie');
  box.innerHTML =
    '<button class="lb-close" type="button" aria-label="Fermer">&times;</button>' +
    '<button class="lb-nav lb-prev" type="button" aria-label="Œuvre précédente">&#8249;</button>' +
    '<button class="lb-nav lb-next" type="button" aria-label="Œuvre suivante">&#8250;</button>' +
    '<div class="lb-inner">' +
      '<div class="lb-figure"><img class="lb-img" src="" alt=""/></div>' +
      '<div class="lb-info">' +
        '<p class="lb-artist"></p>' +
        '<h2 class="lb-title"></h2>' +
        '<p class="lb-meta"></p>' +
        '<p class="lb-desc"></p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(box);

  var imgEl = box.querySelector('.lb-img');
  var titleEl = box.querySelector('.lb-title');
  var artistEl = box.querySelector('.lb-artist');
  var metaEl = box.querySelector('.lb-meta');
  var descEl = box.querySelector('.lb-desc');
  var closeBtn = box.querySelector('.lb-close');
  var prevBtn = box.querySelector('.lb-prev');
  var nextBtn = box.querySelector('.lb-next');

  function show(i) {
    index = (i + items.length) % items.length;
    var el = items[index];
    var src = el.querySelector('img');
    imgEl.src = src.getAttribute('src');
    imgEl.alt = src.getAttribute('alt') || '';
    titleEl.textContent = el.dataset.title || '';
    artistEl.textContent = el.dataset.artist || '';
    metaEl.textContent = el.dataset.meta || '';
    descEl.textContent = el.dataset.desc || '';
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('on');
    document.body.classList.add('lb-locked');
    closeBtn.focus();
  }

  function close() {
    box.classList.remove('on');
    document.body.classList.remove('lb-locked');
    imgEl.src = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (el, i) {
    el.addEventListener('click', function () { open(i); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'Tab') {
      var f = [closeBtn, prevBtn, nextBtn];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
})();
