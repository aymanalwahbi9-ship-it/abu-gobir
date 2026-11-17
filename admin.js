(() => {
  const loginButton = document.getElementById('loginBtn');
  const loginStatus = document.getElementById('loginStatus');
  const togglePin = document.getElementById('togglePin');
  const loginPin = document.getElementById('loginPin');
  const projectForm = document.getElementById('projectForm');
  const saveAndPublish = document.getElementById('saveAndPublish');
  const logoutButton = document.getElementById('logoutBtn');

  // Keep the original admin page visible, but disable all server-backed actions temporarily.
  if (loginButton) {
    loginButton.disabled = true;
    loginButton.setAttribute('aria-disabled', 'true');
    loginButton.title = 'سيتم تفعيل الإدارة لاحقاً';
    loginButton.addEventListener('click', () => {
      if (loginStatus) {
        loginStatus.textContent = 'الإدارة غير مفعّلة مؤقتاً. هذه الصفحة محفوظة بنفس شكل لوحة الإدارة الأصلية.';
        loginStatus.className = 'status';
      }
    });
  }
  if (togglePin && loginPin) togglePin.onclick = () => {
    const visible = loginPin.type === 'text';
    loginPin.type = visible ? 'password' : 'text';
    togglePin.textContent = visible ? '◉' : '◌';
  };
  if (projectForm) {
    projectForm.querySelectorAll('input, select, textarea, button').forEach((field) => { field.disabled = true; });
  }
  if (saveAndPublish) saveAndPublish.disabled = true;
  if (logoutButton) logoutButton.disabled = true;
})();
