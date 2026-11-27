(function () {
  const user = requireLogin(); if (!user) return;
  const $ = id => document.getElementById(id);

  function showMsg(text, type) { const m = $('formMsg'); m.textContent = text; m.className = 'form-msg ' + type; }

  // Fill the page from saved data
  function fillForm() {
    const p = getProfile();
    $('fName').value = p.name;
    $('fBar').value = p.bar;
    $('fYears').value = p.years;
    $('fEmail').value = user.email;
    $('fPhone').value = p.phone;
    $('fSpec').value = p.spec;
    $('fCourt').value = p.court;
    $('fAreas').value = p.areas;
    $('fBio').value = p.bio;
  }

  // Top summary card + practice areas + caseload
  function renderSummary() {
    const p = getProfile();
    $('avatar').textContent = initials(p.name);
    $('sumName').textContent = p.name;
    $('sumRole').textContent = p.spec + ' Advocate';

    const meta = [];
    if (p.bar) meta.push('Bar Registration No. ' + p.bar);
    if (p.years) meta.push(p.years + ' years of practice');
    $('sumMeta').textContent = meta.length ? meta.join(' · ') : 'Add your bar registration and experience';

    const areas = p.areas.split(',').map(s => s.trim()).filter(Boolean);
    $('areaList').innerHTML = areas.length
      ? areas.map(a => `<span class="tag-pill">${esc(a)}</span>`).join('')
      : '<span class="empty">No practice areas added yet.</span>';

    const c = countStatus(getCases());
    $('mTotal').textContent = c.total;
    $('mPending').textContent = c.pending;
    $('mOngoing').textContent = c.ongoing;
    $('mClosed').textContent = c.closed;
  }

  $('saveProfile').addEventListener('click', () => {
    const p = {
      name: $('fName').value.trim(),
      bar: $('fBar').value.trim(),
      years: $('fYears').value.trim(),
      phone: $('fPhone').value.trim(),
      spec: $('fSpec').value,
      court: $('fCourt').value.trim(),
      areas: $('fAreas').value.trim(),
      bio: $('fBio').value.trim()
    };
    if (p.name.length < 2) return showMsg('Name cannot be empty.', 'error');
    if (p.phone && !/^[+]?[0-9\s-]{10,15}$/.test(p.phone))
      return showMsg('Enter a valid phone number (10–15 digits).', 'error');
    if (p.years && !/^\d{1,2}$/.test(p.years))
      return showMsg('Years of practice must be a number.', 'error');

    saveProfile(p);
    renderSummary();
    $('formMsg').className = 'hidden';
    toast('Profile updated.');
  });

  $('cancelProfile').addEventListener('click', () => {
    fillForm();
    $('formMsg').className = 'hidden';
  });

  fillForm();
  renderSummary();
})();
