(function () {
  if (currentUser()) { location.replace('dashboard.html'); return; }   // already logged in

  const $ = id => document.getElementById(id);
  const loginForm = $('loginForm'), regForm = $('registerForm');
  const tabLogin = $('tabLogin'), tabReg = $('tabRegister');

  function showMsg(el, text, type) {
    el.textContent = text;
    el.className = 'form-msg ' + type;
  }
  function clearMsgs() { $('loginMsg').className = 'hidden'; $('regMsg').className = 'hidden'; }

  function showTab(which) {
    const isLogin = which === 'login';
    loginForm.classList.toggle('hidden', !isLogin);
    regForm.classList.toggle('hidden', isLogin);
    $('oauthBlock').classList.toggle('hidden', !isLogin);
    tabLogin.classList.toggle('active', isLogin);
    tabReg.classList.toggle('active', !isLogin);
    $('formTitle').textContent = isLogin ? 'Welcome Back' : 'Create Account';
    $('formSub').textContent = isLogin ? 'Sign in to your account' : 'Register to start managing your cases';
    clearMsgs();
  }
  tabLogin.addEventListener('click', e => { e.preventDefault(); showTab('login'); });
  tabReg.addEventListener('click', e => { e.preventDefault(); showTab('register'); });
  $('goRegister').addEventListener('click', e => { e.preventDefault(); showTab('register'); });

  // Remember me - keep the email
  const remembered = localStorage.getItem('cl_remember');
  if (remembered) { $('email').value = remembered; $('remember').checked = true; }

  /* ---------- LOGIN ---------- */
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const pass = $('password').value;
    const user = getUsers().find(u => u.email === email && u.password === pass);
    if (!user) {
      showMsg($('loginMsg'), 'Incorrect email or password. New user? Please register first.', 'error');
      return;
    }
    localStorage.setItem(KEY_SESSION, user.email);
    if ($('remember').checked) localStorage.setItem('cl_remember', user.email);
    else localStorage.removeItem('cl_remember');
    location.href = 'dashboard.html';
  });

  /* ---------- REGISTER ---------- */
  regForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('rName').value.trim();
    const email = $('rEmail').value.trim().toLowerCase();
    const pass = $('rPassword').value;
    const pass2 = $('rConfirm').value;
    const msg = $('regMsg');

    if (name.length < 2) return showMsg(msg, 'Please enter your full name.', 'error');
    if (pass.length < 6) return showMsg(msg, 'Password must be at least 6 characters.', 'error');
    if (pass !== pass2) return showMsg(msg, 'Passwords do not match.', 'error');

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return showMsg(msg, 'This email is already registered. Please log in.', 'error');
    }
    users.push({ name: name, email: email, password: pass });
    write(KEY_USERS, users);

    regForm.reset();
    showTab('login');
    $('email').value = email;
    showMsg($('loginMsg'), 'Account created! Please log in.', 'success');
  });

  $('forgotLink').addEventListener('click', e => { e.preventDefault(); toast('This feature is not available in the demo.', 'error'); });
  document.querySelectorAll('.oauth-btn').forEach(b =>
    b.addEventListener('click', () => toast('Social login is not available in the demo.', 'error')));
})();
