(function () {
  const user = requireLogin(); if (!user) return;
  const $ = id => document.getElementById(id);
  const body = $('caseBody');

  function render() {
    const all = getCases();
    const c = countStatus(all);
    $('statTotal').textContent = c.total;
    $('statPending').textContent = c.pending;
    $('statOngoing').textContent = c.ongoing;
    $('statClosed').textContent = c.closed;

    const q = $('searchBox').value.trim().toLowerCase();
    const f = $('statusFilter').value;
    const list = all.filter(x =>
      (f === 'all' || x.status === f) &&
      (!q || [x.caseNo, x.title, x.client].some(v => v.toLowerCase().includes(q))));

    body.innerHTML = list.length ? list.map(x => `
      <tr>
        <td>
          <span class="case-no">${esc(x.caseNo)}</span>
          <span class="case-title">${esc(x.title)}</span>
          <span class="case-court">${esc(x.court)}</span>
        </td>
        <td>${esc(x.client)}</td>
        <td>${esc(x.advocate)}</td>
        <td>${fmtDate(x.hearing)}</td>
        <td><span class="badge ${x.status}">${STATUS_LABEL[x.status]}</span></td>
        <td><button type="button" class="link-btn" data-id="${x.id}">Remove</button></td>
      </tr>`).join('')
      : '<tr><td colspan="6" class="empty">No cases found.</td></tr>';
  }

  /* ---------- Search + filter ---------- */
  $('searchBox').addEventListener('input', render);
  $('statusFilter').addEventListener('change', render);

  /* ---------- Remove ---------- */
  body.addEventListener('click', e => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    if (!confirm('Are you sure you want to delete this case?')) return;
    saveCases(getCases().filter(x => x.id !== btn.dataset.id));
    render();
    toast('Case removed.');
  });

  /* ---------- Add case form ---------- */
  function showMsg(text, type) { const m = $('formMsg'); m.textContent = text; m.className = 'form-msg ' + type; }
  function clearForm() {
    ['fCaseNo', 'fTitle', 'fClient', 'fCourt', 'fAdvocate', 'fDate'].forEach(id => $(id).value = '');
    $('fStatus').value = 'pending';
    $('formMsg').className = 'hidden';
  }

  $('saveCase').addEventListener('click', () => {
    const data = {
      caseNo: $('fCaseNo').value.trim(),
      title: $('fTitle').value.trim(),
      client: $('fClient').value.trim(),
      court: $('fCourt').value.trim(),
      advocate: $('fAdvocate').value.trim(),
      hearing: $('fDate').value,
      status: $('fStatus').value
    };
    if (!data.caseNo || !data.title || !data.client || !data.court || !data.advocate)
      return showMsg('Case number, title, client, court and advocate are required.', 'error');
    if (data.status !== 'closed' && !data.hearing)
      return showMsg('Please enter the next hearing date (optional only for closed cases).', 'error');

    const all = getCases();
    if (all.some(x => x.caseNo.toLowerCase() === data.caseNo.toLowerCase()))
      return showMsg('This case number already exists.', 'error');

    data.id = 'c' + Date.now();
    all.push(data);
    saveCases(all);
    clearForm();
    render();
    toast('Case saved.');
  });

  $('cancelCase').addEventListener('click', clearForm);

  // The toolbar "Add case" button scrolls to the form
  function goToForm() {
    $('newCaseForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('fCaseNo').focus({ preventScroll: true });
  }
  $('addCaseBtn').addEventListener('click', goToForm);
  if (location.hash === '#new') goToForm();

  render();
})();
