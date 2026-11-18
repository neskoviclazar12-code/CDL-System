/* CDL System — rise-and-tilt entrance for card groups marked data-rise (v3). One IntersectionObserver; children get a stagger index. */
(function () {
  'use strict';
  var groups = [].slice.call(document.querySelectorAll('[data-rise]'));
  if (!groups.length || !document.documentElement.classList.contains('js')) return;
  groups.forEach(function (g) { g.classList.add('rise'); [].slice.call(g.children).forEach(function (c, i) { c.style.setProperty('--i', i); }); });
  if (!('IntersectionObserver' in window)) { groups.forEach(function (g) { g.classList.add('is-up'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-up'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  groups.forEach(function (g) { io.observe(g); });
})();
