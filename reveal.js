(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supported = 'IntersectionObserver' in window;
  var io = null;

  if (supported && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }

  function bind() {
    var els = document.querySelectorAll('.rv:not(.rv-bound)');
    Array.prototype.forEach.call(els, function (e) {
      e.classList.add('rv-bound');
      if (io) io.observe(e); else e.classList.add('in');
    });
  }

  bind();
  document.addEventListener('works:rendered', bind);
})();
