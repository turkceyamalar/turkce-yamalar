(() => {
  const storageKey = 'turkce-yamalar-theme';
  const root = document.documentElement;
  const header = document.querySelector('.site-header .v29-nav-wrap');
  if (!header) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  const sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z"/></svg>';

  function paint() {
    const dark = root.dataset.theme === 'dark';
    button.innerHTML = dark ? sun : moon;
    button.setAttribute('aria-label', dark ? 'Aydınlık moda geç' : 'Karanlık moda geç');
    button.setAttribute('title', dark ? 'Aydınlık mod' : 'Karanlık mod');
    button.setAttribute('aria-pressed', String(dark));
  }

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(storageKey, root.dataset.theme); } catch (_) {}
    paint();
  });
  header.append(button);
  paint();
})();
