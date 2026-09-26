(function () {
  const grid = document.getElementById('newsGrid');
  const empty = document.getElementById('newsEmpty');
  const buttons = [...document.querySelectorAll('[data-category]')];
  let news = Array.isArray(window.oyunHaberleri) ? [...window.oyunHaberleri] : [];
  const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }

  function makeCard(item) {
    const card = element('article', 'news-card');
    if (item.gorsel && /^assets\/[\w./-]+$/.test(item.gorsel)) {
      const img = element('img');
      img.src = item.gorsel;
      img.alt = item.baslik || '';
      img.loading = 'lazy';
      card.append(img);
    }
    const content = element('div', 'news-card-body');
    const meta = element('div', 'news-meta');
    meta.append(element('span', 'news-tag', item.kategori || 'Haber'));
    const parsedDate = new Date(item.tarih + 'T00:00:00Z');
    if (!Number.isNaN(parsedDate.getTime())) meta.append(element('time', '', dateFormatter.format(parsedDate)));
    content.append(meta, element('h2', '', item.baslik), element('p', '', item.ozet));
    if (item.metin) content.append(element('p', 'news-body', item.metin));
    if (item.kaynak && /^https:\/\//.test(item.kaynak)) {
      const link = element('a', '', 'Resmî kaynağı aç ↗');
      link.href = item.kaynak;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      content.append(link);
    }
    card.append(content);
    return card;
  }

  function render(category) {
    buttons.forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const visible = news.filter(item => category === 'Tümü' || item.kategori === category)
      .sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
    grid.replaceChildren(...visible.map(makeCard));
    empty.hidden = visible.length > 0;
  }

  async function loadSteamNews() {
    try {
      const res = await fetch('/api/haberler', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      const steam = Array.isArray(data.news) ? data.news : [];
      const seen = new Set();
      news = [...steam, ...news].filter(x => {
        const key = (x.baslik || '') + (x.kaynak || '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      render(document.querySelector('[data-category].active')?.dataset.category || 'Tümü');
    } catch (_) { /* Resmî kaynak geçici olarak erişilemezse yerel haberleri göster. */ }
  }

  buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.category)));
  render('Tümü');
  loadSteamNews();
})();
