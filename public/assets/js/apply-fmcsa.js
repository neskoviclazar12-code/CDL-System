/* CDL System: carrier path on /apply/. Looks the company up in FMCSA's public Company Census (no key needed, called from the browser),
   fills the USDOT number, a read-only FMCSA record line and the company name of the next step. If the lookup is unavailable the
   carrier simply types the USDOT number. */
(function () {
  'use strict';
  var q = document.getElementById('fm-q'), go = document.getElementById('fm-go'), msg = document.getElementById('fm-msg'), results = document.getElementById('fm-results');
  var dot = document.getElementById('a-dot'), rec = document.getElementById('a-fm'), company = document.getElementById('p-company');
  if (!q || !go || !dot) return;
  function fire(el) { el.dispatchEvent(new Event('input', { bubbles: true })); }
  function censusSearch(term) {
    var p = new URLSearchParams({ $limit: '10', $select: 'dot_number,legal_name,dba_name,phy_city,phy_state,power_units,status_code' });
    if (/^\d{1,8}$/.test(term)) p.set('dot_number', term); else { p.set('$q', term); p.set('$where', "status_code='A'"); }
    return fetch('https://data.transportation.gov/resource/az4n-8mr2.json?' + p, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined })
      .then(function (res) { if (!res.ok) throw new Error('census'); return res.json(); })
      .then(function (rows) {
        return rows.map(function (r) { return { name: r.legal_name || '', dba: r.dba_name || '', dot: String(r.dot_number || ''), city: r.phy_city || '', state: r.phy_state || '', units: r.power_units ? Number(r.power_units) : null, active: r.status_code === 'A' }; }).filter(function (r) { return r.dot; });
      });
  }
  function render(list) {
    results.textContent = '';
    list.forEach(function (r, k) {
      var label = document.createElement('label'); label.className = 'tile tile--result';
      var input = document.createElement('input'); input.type = 'radio'; input.name = 'fm_pick'; input.value = String(k);
      var box = document.createElement('span'), inner = document.createElement('span'), t = document.createElement('strong'), m = document.createElement('small');
      var loc = [r.city, r.state].filter(Boolean).join(', ');
      t.textContent = r.name + (r.dba ? ' (' + r.dba + ')' : '');
      m.textContent = ['USDOT ' + r.dot, loc, r.units != null ? r.units + ' power units' : '', r.active ? 'Active' : 'Not active'].filter(Boolean).join(' \u00b7 ');
      inner.appendChild(t); inner.appendChild(m); box.appendChild(inner); label.appendChild(input); label.appendChild(box); results.appendChild(label);
      input.addEventListener('change', function () {
        dot.value = r.dot; fire(dot);
        rec.value = r.name + ' \u00b7 USDOT ' + r.dot + (loc ? ' \u00b7 ' + loc : '') + (r.units != null ? ' \u00b7 ' + r.units + ' power units' : '') + ' \u00b7 ' + (r.active ? 'Active' : 'Not active'); fire(rec);
        if (company) { company.value = r.name; fire(company); }
      });
    });
  }
  function search() {
    var term = q.value.trim();
    if (term.length < 2) { msg.textContent = 'Type at least 2 characters.'; return; }
    if (/^(mc|mx|ff)[\s#-]*\d+$/i.test(term)) { msg.textContent = 'MC search is not available here. Search by USDOT number or company name.'; return; }
    msg.textContent = 'Searching FMCSA\u2026'; results.textContent = '';
    censusSearch(term).then(function (list) {
      if (!list.length) { msg.textContent = 'No match. Try your USDOT number, or type it in the field below.'; return; }
      msg.textContent = list.length + (list.length > 1 ? ' matches' : ' match') + '. Pick your company.'; render(list);
    }).catch(function () { msg.textContent = 'FMCSA search is not available right now. Type your USDOT number in the field below.'; });
  }
  go.addEventListener('click', search);
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); search(); } });
})();
