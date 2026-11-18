/* CDL System website — vanilla JS, no dependencies.
   Everything here is an enhancement: the site reads and navigates without it. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- navigation: features menu + drawer ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var item = toggle && toggle.closest('.has-menu');
  function closeMenu() { if (!item) return; item.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) closeMenu(); });
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) closeMenu(); });
  }
  var burger = document.querySelector('.nav__burger');
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    if (!burger || !drawer) return;
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = drawer.querySelector('a'); if (first) first.focus(); }
  }
  if (burger) burger.addEventListener('click', function () { setDrawer(drawer.hidden); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer && !drawer.hidden) { setDrawer(false); burger.focus(); }
    if (item && item.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960 && drawer && !drawer.hidden) setDrawer(false); });

  /* ---------- the Board: one row advances one status on load (instant, no fade) ---------- */
  var step = document.querySelector('[data-board-step]');
  if (step && !reduceMotion) {
    window.setTimeout(function () {
      var cell = step.querySelector('[data-next-status]');
      var next = step.querySelector('[data-next-next]');
      if (!cell) return;
      var chip = cell.querySelector('.chip');
      var wasLive = step.classList.contains('is-live');
      var prev = step.parentNode.querySelector('tr.is-live');
      if (prev && prev !== step) { prev.classList.remove('is-live'); var pc = prev.querySelector('.chip--live'); if (pc) pc.classList.remove('chip--live'); }
      if (chip) { chip.textContent = cell.getAttribute('data-next-status'); chip.classList.add('chip--live'); }
      if (next) { next.textContent = next.getAttribute('data-next-next'); }
      step.classList.add('is-live');
      void wasLive;
    }, 1200);
  }

  /* ---------- pipeline: board / list toggle (both views are in the HTML) ---------- */
  document.querySelectorAll('[data-view-switch]').forEach(function (group) {
    var buttons = group.querySelectorAll('button[data-view]');
    var panels = {};
    buttons.forEach(function (b) { panels[b.getAttribute('data-view')] = document.getElementById(b.getAttribute('aria-controls')); });
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = k !== b.getAttribute('data-view'); });
      });
    });
  });

  /* ---------- offer matching demonstrator (deterministic rules, sample data) ---------- */
  var demo = document.getElementById('match-demo');
  if (demo) {
    var offers = [
      { name: 'Carrier A · Regional dry van', states: ['TX', 'OK', 'LA', 'AR'], minExp: 12, sap: 'no', felony: 'case', maxViol: 2, maxAcc: 1, trailer: 'dry van', written: false },
      { name: 'Carrier B · OTR reefer', states: ['TX', 'OH', 'GA', 'IL', 'NJ', 'PA'], minExp: 6, sap: 'case', felony: 'no', maxViol: 3, maxAcc: 2, trailer: 'reefer', written: true },
      { name: 'Carrier C · Local, Atlanta', states: ['GA'], minExp: 24, sap: 'yes', felony: 'yes', maxViol: null, maxAcc: 1, trailer: 'dry van', written: false }
    ];
    var policyLabel = { yes: 'accepted', case: 'case by case', no: 'not accepted' };
    function req(label, state) { return { label: label, state: state }; }
    function evaluate(d) {
      return offers.map(function (o) {
        var reqs = [];
        // hiring state
        if (!d.state) reqs.push(req('Hiring state: unknown', 'review'));
        else reqs.push(req('Hiring state ' + d.state + (o.states.indexOf(d.state) >= 0 ? ': in list' : ': not hired'), o.states.indexOf(d.state) >= 0 ? 'meets' : 'conflict'));
        // experience
        if (d.exp === '') reqs.push(req('Experience: unknown', 'review'));
        else reqs.push(req('Min. experience ' + o.minExp + ' mo (driver ' + d.exp + ')', Number(d.exp) >= o.minExp ? 'meets' : 'conflict'));
        // SAP
        if (d.sap === 'unknown') reqs.push(req('SAP status: unknown', 'review'));
        else if (d.sap === 'no') reqs.push(req('SAP: not a SAP driver', 'meets'));
        else reqs.push(req('SAP driver: ' + policyLabel[o.sap], o.sap === 'yes' ? 'meets' : (o.sap === 'case' ? 'review' : 'conflict')));
        // felony
        if (d.felony === 'unknown') reqs.push(req('Felony: unknown', 'review'));
        else if (d.felony === 'none') reqs.push(req('Felony: none', 'meets'));
        else reqs.push(req('Felony: ' + policyLabel[o.felony], o.felony === 'yes' ? 'meets' : (o.felony === 'case' ? 'review' : 'conflict')));
        // violations
        if (d.viol === '') reqs.push(req('Violations (3 y): unknown', 'review'));
        else if (o.maxViol === null) reqs.push(req('Violations: no limit stated', 'review'));
        else reqs.push(req('Violations ≤ ' + o.maxViol + ' (driver ' + d.viol + ')', Number(d.viol) <= o.maxViol ? 'meets' : 'conflict'));
        // accidents
        if (d.acc === '') reqs.push(req('Accidents (3 y): unknown', 'review'));
        else reqs.push(req('Accidents ≤ ' + o.maxAcc + ' (driver ' + d.acc + ')', Number(d.acc) <= o.maxAcc ? 'meets' : 'conflict'));
        // trailer
        if (d.trailers.length === 0) reqs.push(req('Trailer experience: unknown', 'review'));
        else reqs.push(req('Trailer: ' + o.trailer, d.trailers.indexOf(o.trailer) >= 0 ? 'meets' : 'conflict'));
        if (o.written) reqs.push(req('Written record conditions', 'na'));
        var result = 'Good match';
        if (reqs.some(function (r) { return r.state === 'conflict'; })) result = 'Not a match';
        else if (reqs.some(function (r) { return r.state === 'review'; })) result = 'Needs review';
        return { offer: o, reqs: reqs, result: result };
      });
    }
    function read() {
      var f = demo;
      return {
        state: f.querySelector('[name="state"]').value,
        exp: f.querySelector('[name="exp"]').value,
        sap: f.querySelector('[name="sap"]').value,
        felony: f.querySelector('[name="felony"]').value,
        viol: f.querySelector('[name="viol"]').value,
        acc: f.querySelector('[name="acc"]').value,
        trailers: Array.prototype.map.call(f.querySelectorAll('[name="trailer"]:checked'), function (c) { return c.value; })
      };
    }
    var out = document.getElementById('match-results');
    function render() {
      var rows = evaluate(read());
      out.innerHTML = '';
      rows.forEach(function (r) {
        var row = document.createElement('div'); row.className = 'match__row';
        var name = document.createElement('div'); name.innerHTML = '<b>' + r.offer.name + '</b>';
        var chip = document.createElement('span');
        chip.className = 'chip ' + (r.result === 'Good match' ? 'chip--good' : r.result === 'Needs review' ? 'chip--warn' : 'chip--bad');
        chip.textContent = r.result;
        var reqs = document.createElement('div'); reqs.className = 'match__reqs';
        r.reqs.forEach(function (q) {
          var c = document.createElement('span'); c.className = 'chip req--' + q.state;
          c.textContent = (q.state === 'meets' ? 'Meets · ' : q.state === 'review' ? 'Review · ' : q.state === 'conflict' ? 'Conflict · ' : 'Not evaluated · ') + q.label;
          reqs.appendChild(c);
        });
        row.appendChild(name); row.appendChild(chip); row.appendChild(reqs);
        out.appendChild(row);
      });
      var live = document.getElementById('match-live');
      if (live) live.textContent = rows.map(function (r) { return r.offer.name + ': ' + r.result; }).join('. ') + '.';
    }
    demo.addEventListener('change', render);
    demo.addEventListener('input', render);
    demo.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  }

  /* ---------- walkthrough form: validation, honeypot, minimum fill time ---------- */
  var form = document.getElementById('walkthrough-form');
  if (form) {
    var started = Date.now();
    var status = document.getElementById('form-status');
    var endpoint = form.getAttribute('data-endpoint') || '';
    function setError(field, msg) {
      var wrap = field.closest('.field'); if (!wrap) return;
      var err = wrap.querySelector('.field__error');
      if (msg) { wrap.classList.add('has-error'); if (err) err.textContent = msg; field.setAttribute('aria-invalid', 'true'); }
      else { wrap.classList.remove('has-error'); field.removeAttribute('aria-invalid'); }
    }
    function validate() {
      var ok = true, firstBad = null;
      form.querySelectorAll('[data-required]').forEach(function (f) {
        var v = f.value.trim(); var msg = '';
        if (!v) msg = f.getAttribute('data-msg') || 'This field is needed.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a work e-mail address, like name@agency.com.';
        setError(f, msg);
        if (msg) { ok = false; if (!firstBad) firstBad = f; }
      });
      if (firstBad) firstBad.focus();
      return ok;
    }
    form.querySelectorAll('[data-required]').forEach(function (f) {
      f.addEventListener('blur', function () { if (f.closest('.field').classList.contains('has-error')) validate(); });
    });
    form.addEventListener('submit', function (e) {
      var hp = form.querySelector('[name="website"]');
      var tooFast = Date.now() - started < 3000;
      if (!validate()) { e.preventDefault(); return; }
      if ((hp && hp.value) || tooFast) {
        e.preventDefault();
        status.className = 'form__status is-shown';
        status.innerHTML = '<p>That was quick. Please check the form and send it again.</p>';
        started = Date.now();
        return;
      }
      if (!endpoint) {
        // No delivery endpoint is configured in this build. Say so honestly instead of pretending.
        e.preventDefault();
        var name = form.querySelector('[name="name"]').value.trim();
        status.className = 'form__status form__status--ok is-shown';
        status.innerHTML = '<p><strong>Form checked, nothing sent.</strong> Thanks' + (name ? ', ' + name.split(' ')[0] : '') + '. This build has no delivery endpoint yet, so your request was not sent anywhere. Once the owner sets the destination (see the implementation plan), this form posts normally and lands on the confirmation page.</p>';
        status.focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.setAttribute('aria-disabled', 'true'); btn.textContent = 'Sending…'; }
    });
  }
})();

/* Partners dropdown: click/touch toggle, Escape and outside click close (hover and focus also open it via CSS) */
(function () {
  var btn = document.querySelector('.nav__dd-btn'); if (!btn) return;
  function set(o) { btn.setAttribute('aria-expanded', o ? 'true' : 'false'); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', function () { set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); } });
})();
