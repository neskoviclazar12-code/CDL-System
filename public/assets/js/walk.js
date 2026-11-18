/* CDL System — pinned step walkthrough (v3). For every section.hw[data-walk]: reads its ordered list (.steps > li), builds a step rail
   and a ledger from it, and shows one step at a time as the page scrolls. Active at >= 1000 px with .js; otherwise the stacked list
   is left alone. Ledger heading from data-ledger, short rail labels from each li's data-short (else the h2). No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var wide = window.matchMedia('(min-width: 1000px)');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function headerH() { return parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 72; }

  [].slice.call(document.querySelectorAll('section.hw[data-walk]')).forEach(function (sec) {
    var wrap = sec.querySelector('.steps-wrap'), list = sec.querySelector('.steps');
    var side = wrap && wrap.firstElementChild;
    if (!wrap || !list || !side) return;
    var lis = [].slice.call(list.children), N = lis.length;
    if (!N) return;
    sec.style.setProperty('--n', N);
    var ledgerTitle = sec.getAttribute('data-ledger') || 'So far';
    var noteTxt = (side.querySelector('.small') || {}).textContent || '';

    var glow = document.createElement('div'); glow.className = 'hw__glow'; glow.setAttribute('aria-hidden', 'true'); glow.innerHTML = '<i></i>';
    sec.insertBefore(glow, wrap); var glowEl = glow.firstChild;
    var num = document.createElement('div'); num.className = 'hw__num'; num.setAttribute('aria-hidden', 'true'); num.innerHTML = '<span>01</span>';
    list.parentNode.insertBefore(num, list); num.style.gridColumn = '2'; num.style.gridRow = '1';

    var rail = document.createElement('ol'); rail.className = 'hw__rail'; var railBtns = [];
    var ledger = document.createElement('aside'); ledger.className = 'hw__ledger'; ledger.setAttribute('aria-hidden', 'true');
    var ll = document.createElement('ul'); ll.className = 'hw__ll';
    var head = document.createElement('div'); head.className = 'hw__lh'; head.innerHTML = '<span></span><span><b class="hw__cnt">01</b> / ' + pad(N) + '</span>';
    head.firstChild.textContent = ledgerTitle;
    var foot = document.createElement('p'); foot.className = 'hw__lf'; foot.textContent = noteTxt;
    var entries = [], cnt = head.querySelector('.hw__cnt');

    lis.forEach(function (li, i) {
      var money = li.classList.contains('is-money');
      var h2 = li.querySelector('h2'), rec = li.querySelector('.records dd');
      var short = li.getAttribute('data-short') || (h2 ? h2.textContent : 'Step ' + (i + 1));
      var k = document.createElement('p'); k.className = 'hw__k';
      k.innerHTML = '<b>Step ' + pad(i + 1) + '</b><i></i><span>of ' + pad(N) + '</span>';
      li.firstElementChild.insertBefore(k, li.firstElementChild.firstChild);
      var r = document.createElement('li'); if (money) r.className = 'money';
      r.innerHTML = '<button type="button"><span class="d">' + pad(i + 1) + '</span><span></span></button>';
      r.querySelector('span:last-child').textContent = short; r.firstChild.setAttribute('aria-label', 'Go to step ' + (i + 1));
      rail.appendChild(r); railBtns.push(r);
      r.firstChild.addEventListener('click', function () { goto(i); });
      var e = document.createElement('li'); e.className = 'hw__e';
      e.innerHTML = '<span class="n">' + pad(i + 1) + '</span><div><b></b><p></p></div>';
      e.querySelector('b').textContent = h2 ? h2.textContent : short;
      e.querySelector('p').textContent = rec ? rec.textContent : '';
      ll.appendChild(e); entries.push(e);
    });
    side.appendChild(rail);
    ledger.appendChild(head); ledger.appendChild(ll); ledger.appendChild(foot);
    wrap.appendChild(ledger);
    var hint = document.createElement('div'); hint.className = 'hw__hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = 'Scroll';
    sec.appendChild(hint);

    var cur = -1, active = false;
    function show(i) {
      var prev = cur; cur = i;
      lis.forEach(function (li, j) { li.classList.toggle('on', j === i); li.classList.toggle('past', j < i); li.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      railBtns.forEach(function (r, j) { r.classList.toggle('on', j === i); r.classList.toggle('done', j < i); });
      entries.forEach(function (e, j) { e.classList.toggle('in', j <= i); e.classList.toggle('now', j === i); });
      cnt.textContent = pad(i + 1);
      sec.toggleAttribute('data-money', lis[i].classList.contains('is-money'));
      num.classList.add('swap');
      setTimeout(function () { num.firstChild.textContent = pad(i + 1); num.classList.remove('swap'); }, 220);
      var sw = wrap.getBoundingClientRect();
      glowEl.style.transform = 'translate(' + Math.round(sw.left + sw.width * (0.34 + 0.4 * (N > 1 ? i / (N - 1) : 0))) + 'px,' + Math.round(sw.height * (0.2 + 0.5 * Math.abs(Math.sin(i * 1.3)))) + 'px)';
      if (prev !== -1 && prev !== i) sec.classList.add('moved');
    }
    function span() { return sec.offsetHeight - wrap.offsetHeight; }
    function top() { return sec.getBoundingClientRect().top + window.pageYOffset - headerH(); }
    function goto(i) { window.scrollTo({ top: top() + ((i + 0.5) / N) * span(), behavior: 'smooth' }); }
    function read() {
      if (!active) return;
      var r = sec.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      var prog = clamp(-(r.top - headerH()) / span(), 0, 0.9999);
      var i = Math.floor(prog * N);
      rail.style.setProperty('--fill', clamp((prog * N - 0.5) / Math.max(N - 1, 1), 0, 1).toFixed(4));
      if (i !== cur) show(i);
    }
    function setMode() {
      var on = wide.matches && root.classList.contains('js');
      if (on === active) return;
      active = on; sec.classList.toggle('is-pin', on);
      if (on) {
        lis.forEach(function (li) { li.classList.remove('reveal', 'is-in'); });
        [].slice.call(wrap.children).forEach(function (c) { c.classList.remove('reveal', 'is-in'); c.style.transform = ''; c.style.opacity = ''; });
        cur = -1; read();
      } else {
        lis.forEach(function (li) { li.classList.remove('on', 'past'); li.removeAttribute('aria-hidden'); });
        sec.classList.remove('moved'); sec.removeAttribute('data-money');
      }
    }
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', function () { setMode(); read(); });
    if (wide.addEventListener) wide.addEventListener('change', function () { setMode(); read(); });
    setMode(); read();
  });
})();
