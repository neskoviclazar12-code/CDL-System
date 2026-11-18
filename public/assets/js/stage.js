/* CDL System — dark product stage controller.
   Desktop (>= 1024 px): scroll progress drives --e (0 = exploded, 1 = flat working screen); the stage is scaled to fit the viewport.
   Narrower: cards rise and tilt into place as they enter (IntersectionObserver). Reduced motion: finished screen, no effect. */
(function () {
  'use strict';
  var stage = document.getElementById('stage');
  if (!stage) return;
  var world = document.getElementById('stage-world'), fit = document.getElementById('stage-fit'), sticky = stage.querySelector('.ds__sticky');
  if (!world || !fit || !sticky) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = window.matchMedia('(max-width: 1023px)');
  var raf = 0, io = null;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  var cap = stage.querySelector(".ds__cap");
  function fitScale() {                                                // fill the space under the heading, equal room above and below
    var avail = sticky.clientHeight - 24 - (cap ? cap.offsetHeight : 0) - 36;   // top padding, the heading, and at least 18 px above and below the cards
    return Math.min(1.08, (window.innerWidth - 48) / 1140, avail / 624);
  }

  function update() {
    raf = 0;
    if (narrow.matches) { fit.style.removeProperty('--s'); world.style.removeProperty('--e'); sticky.style.removeProperty('--e'); return; }
    var s = Math.max(0.4, fitScale());
    if (reduce) {                                            // finished screen, scaled to fit, no scroll effect
      world.style.setProperty('--e', 1); sticky.style.setProperty('--e', 1);
      fit.style.setProperty('--s', s.toFixed(4));
      return;
    }
    var r = stage.getBoundingClientRect();
    var top = parseFloat(window.getComputedStyle(sticky).top) || 0;      // the sticky offset under the site header
    var total = stage.offsetHeight - sticky.offsetHeight;
    var prog = total > 0 ? clamp((top - r.top) / total) : 1;
    var p = clamp(prog / 0.7);                                           // assemble over the first 70 % of the scroll, then hold
    var e = p * p * (3 - 2 * p);
    world.style.setProperty('--e', e.toFixed(4));
    sticky.style.setProperty('--e', e.toFixed(4));
    fit.style.setProperty("--s", (s * (0.92 + 0.08 * e)).toFixed(4));   // exploded view sits at 92 % of the final size
  }
  function schedule() { if (!raf) raf = window.requestAnimationFrame(update); }

  /* narrow screens: rise-and-tilt reveal, staggered within a row of cards */
  function setupReveal() {
    var items = stage.querySelectorAll('.ds__world > .ds__card, .ds__world > .ds__stack');
    if (!('IntersectionObserver' in window) || reduce) { return; }
    items.forEach(function (el, i) { el.style.setProperty('--i', i % 2); });
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    stage.classList.add('ds-ready');                                     // cards stay visible if this never runs
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  if (narrow.addEventListener) narrow.addEventListener('change', schedule);
  setupReveal();
  update();
})();
