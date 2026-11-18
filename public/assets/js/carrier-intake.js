/* Carrier intake: 9-step form (FMCSA lookup, fleet, pay, trailers, escrow, truck year, drivers wanted, call + contact).
   Delivery: with data-endpoint the answers are POSTed as JSON; without one (this build) the visitor gets a prefilled e-mail to MAIL.
   Set data-endpoint on #carrier-form when a backend exists. */
(function () {
  'use strict';
  var form = document.getElementById('carrier-form');
  if (!form) return;
  var MAIL = 'info@cdlsystem.com', TOTAL = 9;
  var endpoint = form.getAttribute('data-endpoint') || '';
  var steps = [].slice.call(form.querySelectorAll('.step'));
  var next = form.querySelector('.js-next'), back = form.querySelector('.js-back');
  var bar = form.querySelector('.hire__bar i'), stepN = form.querySelector('.js-step');
  var status = form.querySelector('.status'), done = form.querySelector('.done'), need = form.querySelector('.need');
  var i = 0, submissionId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
  var company = { company: '', dot_number: '', mc_number: '', fmcsa_location: '', fmcsa_power_units: '', fmcsa_status: '' };

  function val(n) { var x = form.querySelector('input[name="' + n + '"]:checked'); return x ? x.value : ''; }
  function vals(n) { return [].slice.call(form.querySelectorAll('input[name="' + n + '"]:checked')).map(function (x) { return x.value; }); }
  function fld(id) { return document.getElementById(id).value.trim(); }

  /* ---- step 1: FMCSA ---- */
  var q = document.getElementById('fm-q'), msg = document.getElementById('fm-msg'), results = document.getElementById('fm-results');
  var manual = document.getElementById('fm-manual'), picked = document.getElementById('fm-picked');

  function setCompany(c) {
    Object.keys(c).forEach(function (k) { company[k] = c[k]; });
    if (c.company) {
      picked.hidden = false; picked.textContent = '';
      var b = document.createElement('strong'); b.textContent = c.company;
      var s = document.createElement('span'); s.textContent = ' USDOT ' + c.dot_number + (c.fmcsa_location ? ' · ' + c.fmcsa_location : '');
      picked.appendChild(document.createTextNode('Selected: ')); picked.appendChild(b); picked.appendChild(s);
    } else picked.hidden = true;
    validate();
  }
  function bucket(n) {
    if (!n && n !== 0) return '';
    if (n <= 5) return '1–5 trucks'; if (n <= 10) return '6–10 trucks'; if (n <= 19) return '11–19 trucks';
    if (n <= 50) return '20–50 trucks'; if (n <= 100) return '51–100 trucks'; if (n <= 200) return '101–200 trucks'; return '200+ trucks';
  }
  function render(list) {
    results.textContent = '';
    list.forEach(function (r, k) {
      var label = document.createElement('label'); label.className = 'tile tile--result';
      var input = document.createElement('input'); input.type = 'radio'; input.name = 'fm_pick'; input.value = String(k);
      var box = document.createElement('span'), t = document.createElement('strong'), m = document.createElement('small');
      t.textContent = r.legalName + (r.dbaName ? ' (' + r.dbaName + ')' : '');
      var loc = [r.city, r.state].filter(Boolean).join(', ');
      m.textContent = ['USDOT ' + r.dotNumber, loc, r.powerUnits != null ? r.powerUnits + ' power units' : '', r.allowedToOperate ? 'Active' : 'Not active'].filter(Boolean).join(' · ');
      box.appendChild(t); box.appendChild(m); label.appendChild(input); label.appendChild(box); results.appendChild(label);
      input.addEventListener('change', function () {
        manual.hidden = true;
        setCompany({ company: r.legalName, dot_number: r.dotNumber, mc_number: '', fmcsa_location: loc,
          fmcsa_power_units: r.powerUnits != null ? String(r.powerUnits) : '', fmcsa_status: r.allowedToOperate ? 'Active' : 'Not active' });
        var bk = bucket(r.powerUnits), tile = bk && form.querySelector('input[name="fleet_size"][value="' + bk + '"]');
        if (tile) { tile.checked = true; document.getElementById('fleet-hint').textContent = 'FMCSA lists ' + r.powerUnits + ' power units. Change it if that is out of date.'; }
      });
    });
  }
  // FMCSA public Company Census data (no key needed)
  function censusSearch(term) {
    var p = new URLSearchParams({ $limit: '10', $select: 'dot_number,legal_name,dba_name,phy_city,phy_state,power_units,status_code' });
    if (/^\d{1,8}$/.test(term)) p.set('dot_number', term); else { p.set('$q', term); p.set('$where', "status_code='A'"); }
    return fetch('https://data.transportation.gov/resource/az4n-8mr2.json?' + p, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined })
      .then(function (res) { if (!res.ok) throw new Error('census'); return res.json(); })
      .then(function (rows) {
        return rows.map(function (r) {
          return { legalName: r.legal_name || '', dbaName: r.dba_name || '', dotNumber: String(r.dot_number || ''), city: r.phy_city || '', state: r.phy_state || '',
            powerUnits: r.power_units ? Number(r.power_units) : null, allowedToOperate: r.status_code === 'A' };
        }).filter(function (r) { return r.dotNumber; });
      });
  }
  function search() {
    var term = q.value.trim();
    if (term.length < 2) { msg.textContent = 'Type at least 2 characters.'; return; }
    if (/^(mc|mx|ff)[\s#-]*\d+$/i.test(term)) { msg.textContent = 'MC search is not available here. Search by USDOT number or company name.'; manual.hidden = false; return; }
    msg.textContent = 'Searching FMCSA…'; results.textContent = '';
    censusSearch(term).then(function (list) {
      if (!list.length) { msg.textContent = 'No match. Try your USDOT number, or enter it manually below.'; manual.hidden = false; return; }
      msg.textContent = list.length + (list.length > 1 ? ' matches' : ' match') + '. Pick your company.'; render(list);
    }).catch(function () {
      msg.textContent = 'FMCSA search is not available right now. Enter your DOT number manually, or look it up on SAFER.'; manual.hidden = false;
    });
  }
  document.getElementById('fm-go').addEventListener('click', search);
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); search(); } });
  ['m-company', 'm-dot', 'm-mc'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      [].slice.call(form.querySelectorAll('input[name="fm_pick"]')).forEach(function (x) { x.checked = false; });
      setCompany({ company: fld('m-company'), dot_number: fld('m-dot').replace(/\D/g, ''), mc_number: fld('m-mc'), fmcsa_location: '', fmcsa_power_units: '', fmcsa_status: 'Entered manually' });
    });
  });

  /* ---- step 4: show the rate groups that apply ---- */
  function syncRates() {
    var t = val('pay_type');
    document.getElementById('rate-cpm').hidden = !(t === 'Cents per mile' || t === 'Both');
    document.getElementById('rate-gross').hidden = !(t === '% of gross' || t === 'Both');
    document.getElementById('cpm-other-wrap').hidden = val('cpm_rate') !== 'other';
    document.getElementById('gross-other-wrap').hidden = val('gross_rate') !== 'other';
  }

  /* ---- validation ---- */
  var dateInput = document.getElementById('call-date'), today = new Date();
  function pad(n) { return String(n).padStart(2, '0'); }
  dateInput.min = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
  var tzMap = { 'America/New_York': 'Eastern', 'America/Detroit': 'Eastern', 'America/Denver': 'Mountain', 'America/Phoenix': 'Mountain', 'America/Los_Angeles': 'Pacific' };
  try { var g = tzMap[Intl.DateTimeFormat().resolvedOptions().timeZone]; if (g) document.getElementById('tz').value = g; } catch (e) {}

  function rateOk() {
    var t = val('pay_type'), c = val('cpm_rate'), gr = val('gross_rate');
    var cOk = c && (c !== 'other' || fld('cpm-other')), gOk = gr && (gr !== 'other' || fld('gross-other'));
    return t === 'Both' ? cOk && gOk : t === '% of gross' ? gOk : cOk;
  }
  var checks = {
    1: function () { return company.company.length > 1 && /^\d{1,8}$/.test(company.dot_number); },
    2: function () { return !!val('fleet_size'); },
    3: function () { return !!val('pay_type'); },
    4: rateOk,
    5: function () { return vals('trailers').length > 0; },
    6: function () { return !!val('escrow'); },
    7: function () { return !!val('truck_year'); },
    8: function () { return vals('positions').length > 0 && !!val('drivers_needed'); },
    9: function () {
      return !!dateInput.value && !!val('call_time') && fld('c-name').length > 1 && fld('c-phone').replace(/\D/g, '').length >= 10 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fld('c-email')) && form.querySelector('input[name="call_consent"]').checked;
    }
  };
  var needs = {
    1: 'Pick your company, or enter your USDOT number.', 2: 'Choose your fleet size.', 3: 'Choose how you pay.', 4: 'Choose your pay rate.',
    5: 'Pick at least one trailer type.', 6: 'Choose yes or no.', 7: 'Choose the truck year.', 8: 'Pick the drivers you need and how many.',
    9: 'Add a day, time window, name, phone, e-mail and tick the call consent box.'
  };
  function validate() {
    var ok = checks[i + 1]();
    next.disabled = !ok;
    if (need) need.textContent = ok ? '' : needs[i + 1];
  }

  function show(n) {
    steps.forEach(function (s, k) { s.hidden = k !== n; });
    i = n; stepN.textContent = String(n + 1); bar.style.width = ((n + 1) / TOTAL * 100) + '%';
    back.style.visibility = n === 0 ? 'hidden' : 'visible';
    next.textContent = n === TOTAL - 1 ? 'Request my call' : 'Continue';
    status.hidden = true;
    if (n === 3) syncRates();
    validate();
    var h = steps[n].querySelector('.q');
    if (h && n > 0) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  form.addEventListener('change', function () { syncRates(); validate(); });
  form.addEventListener('input', validate);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  back.addEventListener('click', function () { if (i > 0) show(i - 1); });
  // single-choice steps move on by themselves
  [2, 3, 6, 7].forEach(function (n) {
    [].slice.call(form.querySelectorAll('.step[data-step="' + n + '"] input')).forEach(function (x) {
      x.addEventListener('click', function () { setTimeout(function () { if (i === n - 1 && checks[n]()) show(n); }, 200); });
    });
  });

  function payload() {
    var t = val('pay_type');
    var d = {
      form: 'call_request', submission_id: submissionId, source_page: location.pathname,
      company: company.company, dot_number: company.dot_number, mc_number: company.mc_number,
      fmcsa_location: company.fmcsa_location, fmcsa_power_units: company.fmcsa_power_units, fmcsa_status: company.fmcsa_status,
      fleet_size: val('fleet_size'), pay_type: t,
      cpm_rate: t === '% of gross' ? '' : (val('cpm_rate') === 'other' ? fld('cpm-other') : val('cpm_rate')),
      gross_rate: t === 'Cents per mile' ? '' : (val('gross_rate') === 'other' ? fld('gross-other') : val('gross_rate')),
      trailers: vals('trailers').join(', '), escrow: val('escrow'), truck_year: val('truck_year'),
      positions: vals('positions').join(', '), drivers_needed: val('drivers_needed'),
      call_date: dateInput.value, call_time: val('call_time'), timezone: document.getElementById('tz').value,
      contact_name: fld('c-name'), phone: fld('c-phone'), email: fld('c-email'), notes: fld('c-notes'),
      call_consent: form.querySelector('input[name="call_consent"]').checked ? 'yes' : 'no',
      sms_consent: form.querySelector('input[name="sms_consent"]').checked ? 'yes' : 'no'
    };
    return d;
  }
  function finish(msgText, mailHref) {
    steps.forEach(function (s) { s.hidden = true; });
    form.querySelector('.hire__nav').hidden = true; bar.style.width = '100%';
    done.hidden = false; form.querySelector('.js-done-msg').textContent = msgText;
    var act = form.querySelector('.done__actions');
    if (mailHref) { act.textContent = ''; var a = document.createElement('a'); a.className = 'btn btn--primary'; a.href = mailHref; a.textContent = 'Open the e-mail to send'; act.appendChild(a); }
    try { done.focus(); } catch (e) {}
  }
  next.addEventListener('click', function () {
    if (!checks[i + 1]()) return;
    if (i < TOTAL - 1) { show(i + 1); return; }
    if (form.querySelector('input[name="company_website"]').value) return; // honeypot
    var d = payload();
    if (!endpoint) {
      var lines = Object.keys(d).filter(function (k) { return d[k] && k !== 'submission_id'; }).map(function (k) { return k.replace(/_/g, ' ') + ': ' + d[k]; });
      var href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Carrier call request: ' + d.company) + '&body=' + encodeURIComponent(lines.join('\n'));
      finish('Your answers are ready. Send the e-mail to finish the request. We will confirm the time with you before the call.', href);
      return;
    }
    next.disabled = true; var label = next.textContent; next.textContent = 'Sending…';
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (r) { if (!res.ok || r.ok !== true) throw new Error(r.error || ''); return r; }); })
      .then(function (r) { finish(r.message || 'We will confirm the time with you before the call.'); })
      .catch(function (e) {
        status.hidden = false; status.textContent = (e && e.message) || ('We could not confirm your request. Please retry or e-mail ' + MAIL + '.');
        next.disabled = false; next.textContent = label;
      });
  });

  show(0);
})();
