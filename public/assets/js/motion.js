/* CDL System — motion layer: scroll reveals, header state, hero sequence, parallax, counters.
   Transform/opacity only; one IntersectionObserver; everything off under reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: structure appears once the page has scrolled ---------- */
  var header = document.querySelector('.site-header');
  var scrolled = false;
  function onScrollHeader() {
    var s = window.scrollY > 8;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  }
  if (header) { onScrollHeader(); window.addEventListener('scroll', onScrollHeader, { passive: true }); }

  /* ---------- hero video: copy enters only when the clip has ended ---------- */
  var hero = document.querySelector(".hero--video");
  var video = hero && hero.querySelector(".hero__video");
  if (video && reduce) {                          // static end frame, no playback
    video.autoplay = false; video.pause();
    video.addEventListener("loadedmetadata", function () { try { video.currentTime = Math.max(0, video.duration - 0.05); } catch (e) {} });
    hero.classList.add("is-done");
  }

  if (reduce) { root.classList.remove("js"); return; }   // CSS then shows everything immediately

  /* ---------- hero: split the headline into words for a staggered entrance ---------- */
  var heroH1 = document.querySelector('.hero h1');
  if (heroH1 && !heroH1.querySelector('.w')) {
    var words = heroH1.textContent.trim().split(/\s+/);
    heroH1.setAttribute('aria-label', heroH1.textContent.trim());
    heroH1.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w; s.setAttribute('aria-hidden', 'true');
      heroH1.appendChild(s);
      if (i < words.length - 1) heroH1.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- reveal targets: grouped and staggered through --i ---------- */
  var BLOCKS = '.page-head .container > *, .band .container > *, .hero__copy > :not(h1), .hero__board, ' +
    '.section .container > :not(.rules):not(.seq):not(.steps):not(.faq):not(.qa__item):not(.steps-wrap):not(script):not(.col-span-8):not(.col-span-4)';
  var ITEMS = '.rules > li, .seq > li, .steps > li, .faq > details, .qa__item, .facts > li, .related > li, .legend > li, ' +
    '.col-span-4, .col-span-8:not(.faq), .proof__block, .steps-wrap > *, .modules tbody tr.group';
  var targets = [];
  function tag(list, cls) {
    Array.prototype.forEach.call(document.querySelectorAll(list), function (el) {
      if (el.closest('.site-footer') || el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      if (cls) el.classList.add(cls);
      // stagger index = position among revealed siblings
      var i = 0, s = el.previousElementSibling;
      while (s) { if (s.classList.contains('reveal')) i++; s = s.previousElementSibling; }
      el.style.setProperty('--i', Math.min(i, 8));
      targets.push(el);
    });
  }
  tag(ITEMS);
  tag(BLOCKS);
  document.querySelectorAll('.hero__board, .sheet').forEach(function (el) { if (el.classList.contains('reveal')) el.classList.add('reveal--scale'); });
  // the hero is above the fold: run its sequence right away instead of waiting for the observer
  var heroNow = Array.prototype.slice.call(document.querySelectorAll(".hero .reveal"));
  if (heroH1) heroNow.push(heroH1);
  targets = targets.filter(function (el) { return heroNow.indexOf(el) < 0; });
  var pHero = document.querySelector("[data-hero-particles]");
  var heroRan = false;
  function runHero() {
    if (heroRan) return; heroRan = true;
    if (hero) hero.classList.add("is-done");
    if (pHero) pHero.classList.add("is-done");
    heroNow.forEach(show);
  }
  if (video) {
    var started = false, armed = false;
    function arm() { if (armed) return; armed = true; hero.classList.add("is-playing"); }
    video.addEventListener("playing", function () { started = true; arm(); });
    video.addEventListener("ended", runHero);
    video.addEventListener("error", runHero);
    var p = video.play(); if (p && p.catch) p.catch(runHero);   // autoplay refused: show the copy at once
    setTimeout(function () { if (!started) runHero(); }, 2500);  // slow network: do not hold the page hostage
    setTimeout(runHero, 6500);                                    // hard cap
  } else if (pHero) {
    // the text and buttons enter only once the particle logo has finished forming
    if (window.__heroFormed) runHero();
    else {
      pHero.addEventListener("cdl:hero-formed", runHero, { once: true });
      setTimeout(runHero, 7500);                                   // hard cap: never hold the copy back if the animation cannot run
    }
  } else {
    setTimeout(runHero, 60);                                       // a timer, not rAF: throttled frames must not hold the copy back
  }
  document.querySelectorAll('.section--rule').forEach(function (s) { targets.push(s); });

  function show(el) {
    el.classList.add('is-in');
    if (el.matches && el.matches('.stat, .sheet')) countUp(el);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else { targets.forEach(show); }

  /* ---------- counters: integers inside stat tiles count up on reveal ---------- */
  function countUp(scope) {
    scope.querySelectorAll('.stat b').forEach(function (b) {
      if (b.dataset.counted) return;
      var txt = b.textContent.trim();
      if (!/^\d{1,4}$/.test(txt)) return;
      b.dataset.counted = '1';
      var target = parseInt(txt, 10), t0 = null;
      function frame(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 900, 1); p = 1 - Math.pow(1 - p, 3);
        b.textContent = Math.round(target * p);
        if (p < 1) requestAnimationFrame(frame); else b.textContent = txt;
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- hero board: very subtle parallax, desktop only ---------- */
  var board = document.querySelector(".hero__media") || document.querySelector(".hero__board");
  if (board && window.innerWidth >= 960) {
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 900 && (board.classList.contains("is-in") || board.classList.contains("hero__media"))) board.style.transform = "translateY(" + (board.classList.contains("hero__media") ? (y * 0.18).toFixed(1) : (-(y * 0.05)).toFixed(1)) + "px)";
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
