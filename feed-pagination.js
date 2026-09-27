(() => {
  const pageSize = 6;
  const feed = document.querySelector('.ty-feed');
  if (!feed) return;
  const items = Array.from(feed.children).filter(el => el.classList.contains('ty-feed-item'));
  const totalPages = Math.ceil(items.length / pageSize);
  if (totalPages < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'ty-pagination';
  nav.setAttribute('aria-label', 'İçerik sayfaları');
  const allLink = feed.querySelector('.ty-feed-all');
  feed.insertBefore(nav, allLink || null);

  function currentPage() {
    const value = Number(new URLSearchParams(location.search).get('sayfa'));
    return Number.isInteger(value) && value >= 1 && value <= totalPages ? value : 1;
  }

  function pageURL(page) {
    const url = new URL(location.href);
    if (page === 1) url.searchParams.delete('sayfa');
    else url.searchParams.set('sayfa', String(page));
    return url.pathname + url.search + url.hash;
  }

  function render() {
    const page = currentPage();
    items.forEach((item, index) => { item.hidden = index < (page - 1) * pageSize || index >= page * pageSize; });
    nav.replaceChildren();
    const summary = document.createElement('span');
    summary.className = 'ty-pagination-summary';
    summary.textContent = `Sayfa ${page} / ${totalPages} · ${items.length} içerik`;
    nav.append(summary);

    function link(label, target, active = false) {
      const a = document.createElement('a');
      a.href = pageURL(target);
      a.textContent = label;
      a.className = 'ty-page-button' + (active ? ' is-active' : '');
      a.setAttribute('aria-label', label === '‹' ? 'Önceki sayfa' : label === '›' ? 'Sonraki sayfa' : `${target}. sayfa`);
      if (active) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        history.pushState(null, '', a.href);
        render();
        feed.querySelector('.ty-feed-heading')?.scrollIntoView({block: 'start'});
      });
      nav.append(a);
    }

    if (page > 1) link('‹', page - 1);
    for (let n = 1; n <= totalPages; n++) link(String(n), n, n === page);
    if (page < totalPages) link('›', page + 1);
  }

  addEventListener('popstate', render);
  render();
})();
