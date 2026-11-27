/* ============================================================
   app.js - shared helpers (loaded first on every page)
   Data is saved in localStorage, so it persists after a refresh.
   ============================================================ */
const KEY_USERS = 'cl_users';
const KEY_SESSION = 'cl_session';
const STATUS_LABEL = { pending: 'Pending', ongoing: 'Ongoing', closed: 'Closed' };
const SPECIALIZATIONS = ['Civil & Commercial Law', 'Criminal Law', 'Family Law', 'Corporate Law'];

/* ---------- localStorage read/write ---------- */
function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ---------- users + session ---------- */
function getUsers() { return read(KEY_USERS, []); }
function getSession() { return localStorage.getItem(KEY_SESSION); }
function currentUser() {
  const email = getSession();
  return getUsers().find(u => u.email === email) || null;
}
function requireLogin() {            // if the page is opened without logging in, redirect to login.html
  const u = currentUser();
  if (!u) { window.location.replace('login.html'); return null; }
  return u;
}
function logout() { localStorage.removeItem(KEY_SESSION); }

/* ---------- profile ---------- */
function getProfile() {
  const u = currentUser();
  const saved = read('cl_profile_' + u.email, {});
  return Object.assign({
    name: u.name, bar: '', years: '', phone: '',
    spec: SPECIALIZATIONS[0], court: '', bio: '', areas: ''
  }, saved);
}
function saveProfile(p) { write('cl_profile_' + getSession(), p); }
function initials(name) {
  const parts = name.replace(/^adv\.?\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/* ---------- cases (each user has their own cases) ---------- */
function casesKey() { return 'cl_cases_' + getSession(); }
function getCases() {
  let c = read(casesKey(), null);
  if (c === null) { c = seedCases(); write(casesKey(), c); }   // sample data on first use
  return c;
}
function saveCases(c) { write(casesKey(), c); }
function countStatus(list) {
  return {
    total: list.length,
    pending: list.filter(x => x.status === 'pending').length,
    ongoing: list.filter(x => x.status === 'ongoing').length,
    closed: list.filter(x => x.status === 'closed').length
  };
}
/* Sample data - dates are calculated from today so "upcoming" always shows something.
   For a blank start, make seedCases() just `return [];`. */
function seedCases() {
  const plus = n => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d); };
  return [
    { id: 'c1', caseNo: 'CS/041/2025',  title: 'Sharma vs. Verma', client: 'Rakesh Sharma', court: 'District Court, Mathura', advocate: 'Adv. Neha Chauhan', hearing: plus(3),  status: 'pending' },
    { id: 'c2', caseNo: 'CRL/118/2025', title: 'State vs. Anil Kumar', client: 'Anil Kumar', court: 'Sessions Court, Agra', advocate: 'Adv. Deepak Prasad', hearing: plus(8),  status: 'ongoing' },
    { id: 'c3', caseNo: 'CIV/077/2024', title: 'Gupta Traders vs. Yadav Logistics', client: 'Mohit Gupta', court: 'Commercial Court, Mathura', advocate: 'Adv. Neha Chauhan', hearing: '', status: 'closed' },
    { id: 'c4', caseNo: 'MAT/019/2026', title: 'Singh vs. Singh', client: 'Priya Singh', court: 'Family Court, Mathura', advocate: 'Adv. Rohit Malhotra', hearing: plus(15), status: 'ongoing' },
    { id: 'c5', caseNo: 'CS/052/2026',  title: 'Bansal vs. Mathura Nagar Nigam', client: 'Sunil Bansal', court: 'District Court, Mathura', advocate: 'Adv. Deepak Prasad', hearing: plus(6),  status: 'pending' }
  ];
}

/* ---------- dates ---------- */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function toISO(d) {
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function fmtDate(iso) {              // 2026-09-24 -> 24 Sep 2026
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return d + ' ' + MONTHS[+m - 1] + ' ' + y;
}

/* ---------- small utilities ---------- */
function esc(s) {                    // to safely insert user text into HTML
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}
function toast(msg, type) {
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
}

/* Sign out link (in the navbar of every page) */
document.addEventListener('DOMContentLoaded', () => {
  const out = document.getElementById('signOut');
  if (out) out.addEventListener('click', logout);
});
