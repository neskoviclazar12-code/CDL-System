/* CDL System — step-by-step request forms (v3), the previous version's wizard made generic.
   Markup: form#…[data-wizard][data-subject][data-endpoint] .hire__card with fieldset.step[data-step] panels, a .done panel and the
   Back/Continue nav; an aside.hire__ledger next to it. Required text fields carry data-required; a group of choice tiles carries
   data-required and data-label on its .tiles container; the consent checkbox carries data-required.
   Branching: a form with data-branch="<field>" shows a step with data-role="<value>" only while that choice is selected in the
   named tile group; steps without data-role are always part of the path. The count, bar and ledger follow the active path.
   Delivery: with data-endpoint the answers are POSTed as JSON; without one (this build) nothing is sent, the page says so and offers
   the answers as a ready e-mail. The page never shows a success message for something that did not happen. No dependencies. */
(function () {
  'use strict';
  var MAIL = 'info@cdlsystem.com';
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function emailOk(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

  [].slice.call(document.querySelectorAll('form[data-wizard]')).forEach(function (form) {
    var endpoint = form.getAttribute('data-endpoint') || '';
    var subject = form.getAttribute('data-subject') || 'Website request';
    var branch = form.getAttribute('data-branch') || '';
    var steps = [].slice.call(form.querySelectorAll('.step'));
    var next = form.querySelector('.js-next'), back = form.querySelector('.js-back'), bar = form.querySelector('.hire__bar i');
    var stepN = form.querySelector('.js-step'), totalN = form.querySelector('.js-total'), status = form.querySelector('.status'), need = form.querySelector('.need');
    var nav = form.querySelector('.hire__nav'), done = form.querySelector('.done');
    var scope = form.closest('.hire') || document;
    var ledger = scope.querySelector('.hire__ll'), ledN = scope.querySelector('.hire__lh b');
    var started = Date.now(), i = 0, act = steps;

    /* ---- the active path: every step without a role, plus the steps of the chosen role ---- */
    function roleValue() { if (!branch) return ''; var c = form.querySelector('input[name="' + branch + '"]:checked'); return c ? c.value : ''; }
    function path() {
      var v = roleValue();
      return steps.filter(function (s) { var r = s.getAttribute('data-role'); return !r || r === v; });
    }
    function tileText(c) { var t = c.parentNode && (c.parentNode.querySelector('strong') || c.parentNode.querySelector('span')); return t ? t.textContent.trim() : c.value; }

    /* ---- fields and ledger rows, in document order ---- */
    var rows = [];
    steps.forEach(function (st) {
      [].slice.call(st.querySelectorAll('input, select, textarea, .tiles')).forEach(function (el) {
        if (el.classList && el.classList.contains('tiles')) {
          var name = (el.querySelector('input') || {}).name; if (!name) return;
          rows.push({ stepEl: st, kind: 'group', name: name, label: el.getAttribute('data-label') || name, get: function () { var c = form.querySelector('input[name="' + name + '"]:checked'); return c ? tileText(c) : ''; }, el: el });
        } else if (el.closest('.tiles') || el.type === 'checkbox' || el.type === 'hidden' || el.name === 'website' || !el.name) { return; }
        else {
          var l = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
          rows.push({ stepEl: st, kind: 'field', name: el.name, label: l ? l.textContent.replace(/\s*\(.*?\)\s*/g, '').trim() : el.name, get: function () { return el.value.trim(); }, el: el });
        }
      });
    });
    if (ledger) rows.forEach(function (r) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="n"></span><span><span class="k"></span><span class="v">—</span></span>';
      li.querySelector('.k').textContent = r.label; ledger.appendChild(li); r.li = li;
    });
    function activeRows() { return rows.filter(function (r) { return act.indexOf(r.stepEl) !== -1; }); }
    function paintLedger() {
      var filled = 0, k = 0;
      rows.forEach(function (r) {
        var on = act.indexOf(r.stepEl) !== -1, v = on ? r.get() : '';
        if (r.li) {
          r.li.hidden = !on;
          if (on) { r.li.querySelector('.n').textContent = pad(++k); r.li.querySelector('.v').textContent = v || '—'; r.li.classList.toggle('has', !!v); r.li.classList.toggle('on', r.stepEl === act[i]); }
        }
        if (v) filled++;
      });
      if (ledN) ledN.textContent = String(filled);
    }

    /* ---- validation per step ---- */
    function stepOk(st) {
      var ok = true;
      [].slice.call(st.querySelectorAll('[data-required]')).forEach(function (el) {
        if (el.classList.contains('tiles')) { var n = (el.querySelector('input') || {}).name; if (!form.querySelector('input[name="' + n + '"]:checked')) ok = false; }
        else if (el.type === 'checkbox') { if (!el.checked) ok = false; }
        else { var v = el.value.trim(); if (!v) ok = false; else if (el.type === 'email' && !emailOk(v)) ok = false; else if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) ok = false; }
      });
      return ok;
    }
    // before a role is chosen the path is unknown: count the common steps plus the longest role branch
    function pathLen() {
      if (!branch || roleValue()) return act.length;
      var base = 0, per = {}, longest = 0;
      steps.forEach(function (s) { var r = s.getAttribute('data-role'); if (!r) base++; else { per[r] = (per[r] || 0) + 1; if (per[r] > longest) longest = per[r]; } });
      return base + longest;
    }
    function paintCount() {
      var T = pathLen(), last = i === act.length - 1 && !(branch && !roleValue());
      stepN.textContent = String(i + 1); if (totalN) totalN.textContent = String(T);
      bar.style.width = ((i + 1) / T * 100) + '%';
      next.textContent = last ? (form.getAttribute('data-submit') || 'Send') : 'Continue';
    }
    function refresh() {
      var newPath = path();
      if (newPath.length !== act.length || newPath.some(function (s, k) { return s !== act[k]; })) { act = newPath; paintCount(); }
      var ok = stepOk(act[i]);
      next.disabled = !ok;
      need.textContent = ok ? '' : (act[i].getAttribute('data-need') || 'Complete this step to continue.');
      paintLedger();
    }

    /* ---- moving between steps ---- */
    function show(n) {
      act = path();
      steps.forEach(function (s) { s.hidden = s !== act[n]; });
      i = n; paintCount();
      back.style.visibility = n === 0 ? 'hidden' : 'visible';
      status.hidden = true;
      refresh();
      var h = act[n].querySelector('.q'); if (h && n > 0) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
      if (n > 0) { var top = form.getBoundingClientRect().top; if (top < 0 || top > window.innerHeight * 0.4) window.scrollTo({ top: window.pageYOffset + top - 96, behavior: 'smooth' }); }
    }
    form.addEventListener('change', refresh);
    form.addEventListener('input', refresh);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    back.addEventListener('click', function () { if (i > 0) show(i - 1); });
    // a step that is one group of tiles and nothing else moves on by itself
    steps.forEach(function (st) {
      var groups = st.querySelectorAll('.tiles'), others = st.querySelectorAll('input:not([type=radio]):not([type=checkbox]), select, textarea');
      if (groups.length === 1 && !others.length) [].slice.call(st.querySelectorAll('input[type=radio]')).forEach(function (x) {
        x.addEventListener('click', function () { setTimeout(function () { var k = path().indexOf(st); if (k === i && stepOk(st) && k < path().length - 1) show(k + 1); }, 200); });
      });
    });

    /* ---- sending ---- */
    function payload() {
      var d = { form: form.getAttribute('data-wizard'), source_page: location.pathname };
      if (branch) d[branch + '_key'] = roleValue();
      activeRows().forEach(function (r) { d[r.name] = r.get(); });
      [].slice.call(form.querySelectorAll('input[type=checkbox][name]')).forEach(function (c) { if (act.indexOf(c.closest('.step')) !== -1) d[c.name] = c.checked ? 'yes' : 'no'; });
      return d;
    }
    function asText(d) {
      var lines = [subject, ''];
      activeRows().forEach(function (r) { if (d[r.name]) lines.push(r.label + ': ' + d[r.name]); });
      lines.push('');
      if ('consent' in d) lines.push('Consent to calls and e-mails from CDL System LLC: ' + d.consent);
      if ('sms_consent' in d) lines.push('SMS consent: ' + d.sms_consent);
      return lines.join('\n');
    }
    function finish(title, text, actions) {
      steps.forEach(function (s) { s.hidden = true; });
      nav.hidden = true; status.hidden = true; bar.style.width = '100%'; stepN.textContent = String(act.length);
      done.hidden = false;
      done.querySelector('.js-done-title').textContent = title;
      done.querySelector('.js-done-msg').textContent = text;
      var box = done.querySelector('.done__actions'); box.innerHTML = '';
      (actions || []).forEach(function (a) { box.appendChild(a); });
      done.focus();
    }
    next.addEventListener('click', function () {
      if (!stepOk(act[i])) return;
      if (i < act.length - 1) { show(i + 1); return; }
      var hp = form.querySelector('input[name="website"]');
      if ((hp && hp.value) || Date.now() - started < 3000) { status.hidden = false; status.textContent = 'That was quick. Please check your answers and send again.'; started = Date.now(); return; }
      var d = payload();
      if (!endpoint) {
        var text = asText(d), who = d.company || d.agency || d.name || '';
        var mail = document.createElement('a'); mail.className = 'btn btn--primary'; mail.textContent = 'E-mail my request';
        mail.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject + (who ? ': ' + who : '')) + '&body=' + encodeURIComponent(text);
        var copy = document.createElement('button'); copy.type = 'button'; copy.className = 'btn btn--ghost'; copy.textContent = 'Copy my answers';
        copy.addEventListener('click', function () {
          if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { copy.textContent = 'Copied'; }, function () { copy.textContent = 'Use the e-mail button'; }); else copy.textContent = 'Use the e-mail button';
        });
        finish('One more click', 'Your answers are complete, but this website is not connected to a delivery service yet, so nothing has been sent. E-mail it to ' + MAIL + ' in one click and we reply within one business day.', [mail, copy]);
        return;
      }
      next.disabled = true; var label = next.textContent; next.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (r) { if (!res.ok || r.ok !== true) throw new Error(r.error || 'We could not confirm your request. Please retry or e-mail ' + MAIL + '.'); return r; }); })
        .then(function (r) { finish('Request received', r.message || 'We reply within one business day.'); })
        .catch(function (e) { status.hidden = false; status.textContent = e && e.message ? e.message : 'We could not confirm your request. Please retry or e-mail ' + MAIL + '.'; next.disabled = false; next.textContent = label; });
    });

    show(0);
  });
})();
