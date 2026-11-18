/* CDL System — home page walkthroughs (3 Nov 2026).
   1. My Day: a pinned board of cards; scroll steps through the five numbered notes, lifting the matching cards.
   2. Route: twelve stops on three lanes; a marker follows the scroll from "Lead" to "Paid", the camera follows the marker.
   Active only when the page has .js and the viewport is >= 1000 px; otherwise the stacked layout from home.css stays as is.
   No dependencies. The hero, particle stream, dark stage and footer have their own scripts and are not touched here. */
(function () {
  'use strict';
  var root = document.documentElement;
  var wide = window.matchMedia('(min-width: 1000px)');
  function on() { return wide.matches && root.classList.contains('js') && window.innerHeight >= 520; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function headerH() { return parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 72; }
  var jobs = [];

  /* ---------------------------------------------------------------- My Day */
  (function () {
    var pin = document.getElementById('day-pin'), board = document.getElementById('day-board'), fit = document.getElementById('day-fit'),
        box = document.getElementById('day-stagebox'), legend = document.getElementById('day-legend');
    if (!pin || !board || !fit || !box || !legend) return;
    var sticky = pin.querySelector('.wt__sticky');
    var items = [].slice.call(legend.querySelectorAll('li'));
    var els = [].slice.call(board.querySelectorAll('[data-s],[data-c]')).map(function (el) {
      return { el: el, s: (el.getAttribute('data-s') || '').split(' '), c: (el.getAttribute('data-c') || '').split(' '), row: el.classList.contains('wt__row') };
    });
    var TILT = { 0: [26, -30], 1: [11, -17], 2: [9, -9], 3: [13, -15], 4: [10, -23], 5: [15, -9] };
    var step = -1, target = TILT[0], rx = TILT[0][0], ry = TILT[0][1], e = 0, eT = 0;

    function apply(st) {
      step = st;
      els.forEach(function (o) {
        var k = String(st), lit = st > 0 && o.s.indexOf(k) > -1, ctx = st > 0 && !lit && o.c.indexOf(k) > -1;
        o.el.classList.toggle('lit', lit);
        if (o.row) return;
        o.el.classList.toggle('ctx', ctx);
        o.el.classList.toggle('dim', st > 0 && !lit && !ctx);
      });
      items.forEach(function (li) { li.classList.toggle('on', +li.getAttribute('data-i') === st); });
      target = TILT[st] || TILT[1];
    }
    function reset() {
      els.forEach(function (o) { o.el.classList.remove('lit', 'ctx', 'dim'); });
      items.forEach(function (li) { li.classList.remove('on'); li.style.removeProperty('--p'); });
      board.style.removeProperty('--e'); board.style.removeProperty('--rx'); board.style.removeProperty('--ry'); fit.style.removeProperty('--s');
      step = -1;
    }
    function read() {
      var hh = headerH(), r = pin.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 400) return;
      var span = pin.offsetHeight - sticky.offsetHeight, top = r.top - hh;
      eT = clamp(1 - top / (vh * 0.8), 0, 1);
      var prog = clamp(-top / span, 0, 1);
      var st = top > 0 ? 0 : 1 + Math.min(4, Math.floor(prog * 5));
      if (st !== step) apply(st);
      if (st > 0) items[st - 1].style.setProperty('--p', (prog * 5 - (st - 1)).toFixed(3));
      fit.style.setProperty('--s', (Math.min(1.08, (box.clientWidth - 16) / 900, (sticky.clientHeight - 150) / 640) * 0.94).toFixed(4));
      fitLegend();
    }
    var lastLs = 0;
    function fitLegend() {
      var avail = sticky.clientHeight - 16, ls = +legend.style.getPropertyValue('--ls') || 1;
      legend.style.setProperty('--ls', 1);
      var h = legend.scrollHeight, want = h > avail ? Math.max(0.6, avail / h) : 1;
      legend.style.setProperty('--ls', want.toFixed(3)); lastLs = want;
    }
    function tick() {
      e += (eT - e) * 0.12; rx += (target[0] - rx) * 0.07; ry += (target[1] - ry) * 0.07;
      board.style.setProperty('--e', (e * e * (3 - 2 * e)).toFixed(4));
      board.style.setProperty('--rx', rx.toFixed(2)); board.style.setProperty('--ry', ry.toFixed(2));
    }
    items.forEach(function (li) {
      li.addEventListener('click', function () {
        if (!on()) return;
        var i = +li.getAttribute('data-i'), span = pin.offsetHeight - sticky.offsetHeight;
        var top = pin.getBoundingClientRect().top + window.pageYOffset - headerH();
        window.scrollTo({ top: top + ((i - 1) / 5 + 0.02) * span, behavior: 'smooth' });
      });
    });
    jobs.push({ read: read, tick: tick, reset: reset });
  })();

  /* ----------------------------------------------------------------- Route */
  (function () {
    var pin = document.getElementById('route-pin'), pan = document.getElementById('rt-pan'), fit = document.getElementById('rt-fit'),
        lit = document.getElementById('rt-lit'), hud = document.getElementById('rt-hud'), rail = document.getElementById('rt-rail');
    if (!pin || !pan || !fit || !lit || !hud || !rail) return;
    var sticky = pin.querySelector('.wt__sticky'), puck = pan.querySelector('.rt__puck');
    var stops = [].slice.call(pan.querySelectorAll('.rt__stop'));
    var N = stops.length;
    var CTR = [[340,60],[580,60],[820,60],[1060,60],[1060,300],[820,300],[580,300],[340,300],[100,300],[100,540],[340,540],[580,540]];
    var GROUP = function (i) { return i < 4 ? 0 : i < 9 ? 1 : 2; };
    var GNAME = ['Driver · recruiting stage', 'Application · status', 'Owner · billing case'];
    var info = stops.map(function (a) { return { name: a.querySelector('h3').textContent, desc: a.querySelector('.rt__d').textContent }; });
    var ticks = [], shown = -1, swapT, idx = -1, cur = document.getElementById('rt-cur');
    var hg = document.getElementById('rt-hg'), hn = document.getElementById('rt-hn'), hd = document.getElementById('rt-hd');

    [['Recruiting', 0, 4, ''], ['Application', 4, 9, ''], ['Billing', 9, 12, ' money']].forEach(function (g) {
      var d = document.createElement('div'); d.className = 'grp' + g[3];
      var t = ''; for (var i = g[1]; i < g[2]; i++) t += '<b></b>';
      d.innerHTML = '<div class="ticks">' + t + '</div><span class="wt__label">' + g[0] + '</span>';
      rail.appendChild(d); ticks = ticks.concat([].slice.call(d.querySelectorAll('b')));
    });

    function showHud(i) {
      if (i === shown) return; shown = i;
      if (cur) cur.textContent = (i < 9 ? '0' : '') + (i + 1);
      hud.classList.add('swapping'); clearTimeout(swapT);
      swapT = setTimeout(function () {
        hg.textContent = 'Step ' + (i < 9 ? '0' : '') + (i + 1) + ' · ' + GNAME[GROUP(i)];
        hg.className = 'wt__label' + (GROUP(i) === 2 ? ' m' : '');
        hn.textContent = info[i].name; hd.textContent = info[i].desc;
        hud.classList.remove('swapping');
      }, 160);
    }
    function reset() {
      stops.forEach(function (s) { s.classList.remove('on', 'done'); s.style.removeProperty('--a'); });
      pan.style.removeProperty('--px'); pan.style.removeProperty('--py'); fit.style.removeProperty('--s'); idx = -1; shown = -1;
    }
    function read() {
      var hh = headerH(), r = pin.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 400) return;
      var span = pin.offsetHeight - sticky.offsetHeight, top = r.top - hh;
      var prog = clamp(-top / span, 0, 1);
      var raw = prog * (N - 1), i0 = Math.min(Math.floor(raw), N - 1), f = raw - i0;
      var g = i0 >= N - 1 ? 0 : clamp((f - 0.35) / 0.55, 0, 1); g = g * g * (3 - 2 * g);
      var t = i0 + g, now = Math.round(t);
      var a = CTR[i0], b = CTR[Math.min(i0 + 1, N - 1)];
      var x = a[0] + (b[0] - a[0]) * g, y = a[1] + (b[1] - a[1]) * g;
      puck.style.setProperty('--mx', x.toFixed(1)); puck.style.setProperty('--my', y.toFixed(1));
      pan.style.setProperty('--px', ((x - 580) * 0.3).toFixed(1)); pan.style.setProperty('--py', ((y - 300) * 0.3).toFixed(1));
      lit.setAttribute('stroke-dashoffset', (1 - t / (N - 1)).toFixed(4));
      for (var i = 0; i < N; i++) {
        stops[i].style.setProperty('--a', clamp(1 - Math.abs(t - i) * 1.5, 0, 1).toFixed(3));
        stops[i].classList.toggle('on', i === now);
        stops[i].classList.toggle('done', i < now);
        ticks[i].className = i < now ? 'd' : (i === now ? 'c' : '');
      }
      showHud(now);
      var s = Math.min(1.05, (sticky.clientWidth - 40) / 1330, (sticky.clientHeight - 250) / 640);
      fit.style.setProperty('--s', s.toFixed(4));
    }
    jobs.push({ read: read, tick: function () {}, reset: reset });
  })();

  /* ------------------------------------------------------------- scheduler */
  var raf = 0, active = false;
  function loop() { raf = 0; if (!active) return; jobs.forEach(function (j) { j.tick(); }); raf = requestAnimationFrame(loop); }
  function update() {
    var now = on();
    if (now !== active) {
      active = now;
      if (!active) jobs.forEach(function (j) { j.reset(); });
      else if (!raf) raf = requestAnimationFrame(loop);
    }
    if (active) jobs.forEach(function (j) { j.read(); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (wide.addEventListener) wide.addEventListener('change', update);
  update();
})();
