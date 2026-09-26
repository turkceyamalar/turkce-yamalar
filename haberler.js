(function () {
  const grid = document.getElementById('newsGrid');
  const empty = document.getElementById('newsEmpty');
  const buttons = [...document.querySelectorAll('[data-category]')];
  let news = Array.isArray(window.oyunHaberleri) ? [...window.oyunHaberleri] : [];
  const STEAM_APPS = [
    { id: 2050650, ad: 'Resident Evil 4' },
    { id: 1196590, ad: 'Resident Evil Village' },
    { id: 883710, ad: 'Resident Evil 2' },
    { id: 2680010, ad: 'Silent Hill: Townfall' }
  ];
  const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const nonLatinScript = /[\u0400-\u052f\u2de0-\u2dff\ua640-\ua69f\u0600-\u06ff\u0370-\u03ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;

  function isReadableNews(item) {
    return !nonLatinScript.test(`${item.title || ''} ${item.contents || ''}`);
  }

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
    const requests = STEAM_APPS.map(async game => {
      const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${game.id}&count=20&maxlength=260&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(game.ad);
      const data = await res.json();
      return (data?.appnews?.newsitems || []).filter(isReadableNews).slice(0, 4).map(x => ({
        baslik: x.title,
        kategori: /dlc|expansion/i.test(x.title) ? 'DLC' : 'Güncelleme',
        tarih: new Date(x.date * 1000).toISOString().slice(0,10),
        ozet: `${game.ad}: ${String(x.contents || '').replace(/\[[^\]]*\]|<[^>]*>/g, ' ').replace(/\s+/g,' ').trim().slice(0,260)}`,
        metin: '', gorsel: '', kaynak: x.url
      }));
    });
    try {
      const groups = await Promise.allSettled(requests);
      const steam = groups.filter(x => x.status === 'fulfilled').flatMap(x => x.value);
      const seen = new Set();
      news = [...steam, ...news].filter(x => { const k=(x.baslik||'')+(x.kaynak||''); if(seen.has(k)) return false; seen.add(k); return true; });
      render(document.querySelector('[data-category].active')?.dataset.category || 'Tümü');
    } catch (_) {}
  }

  buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.category)));
  render('Tümü');
  loadSteamNews();
})();
