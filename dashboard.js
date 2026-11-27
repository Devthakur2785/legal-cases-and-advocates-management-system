(function () {
  const user = requireLogin(); if (!user) return;
  const $ = id => document.getElementById(id);

  // Greeting - based on time of day + profile name
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const first = getProfile().name.replace(/^adv\.?\s*/i, '').trim().split(/\s+/)[0];
  $('greeting').textContent = 'Good ' + part + ', ' + first;

  const cases = getCases();

  // Stats
  const c = countStatus(cases);
  $('statTotal').textContent = c.total;
  $('statPending').textContent = c.pending;
  $('statOngoing').textContent = c.ongoing;
  $('statClosed').textContent = c.closed;

  // Upcoming hearings: today or later, excluding closed cases, nearest first
  const today = toISO(new Date());
  const upcoming = cases
    .filter(x => x.hearing && x.hearing >= today && x.status !== 'closed')
    .sort((a, b) => a.hearing.localeCompare(b.hearing))
    .slice(0, 4);

  $('hearingList').innerHTML = upcoming.length ? upcoming.map(x => {
    const [, m, d] = x.hearing.split('-');
    return `
      <div class="hearing-row">
        <div class="date-chip">
          <div class="day">${d}</div>
          <div class="mon">${MONTHS[+m - 1].toUpperCase()}</div>
        </div>
        <div class="hearing-info">
          <div class="case-name">${esc(x.title)}</div>
          <div class="case-meta">${esc(x.court)} · ${esc(x.caseNo)}</div>
        </div>
      </div>`;
  }).join('') : '<div class="empty">No upcoming hearings.</div>';

  // Recent cases: newest first
  const recent = cases.slice().reverse().slice(0, 4);
  $('recentList').innerHTML = recent.length ? recent.map(x => `
      <div class="case-row">
        <div>
          <div class="case-name">${esc(x.title)}</div>
          <div class="case-meta">${esc(x.client)}</div>
        </div>
        <span class="badge ${x.status}">${STATUS_LABEL[x.status]}</span>
      </div>`).join('') : '<div class="empty">No cases yet. Add your first case.</div>';
})();
