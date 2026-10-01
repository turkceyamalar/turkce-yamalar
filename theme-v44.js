(() => {
  const themeKey = 'turkce-yamalar-theme';
  const langKey = 'serpentgame-lang';
  const root = document.documentElement;
  const header = document.querySelector('.site-header .v29-nav-wrap');
  if (!header) return;

  const nav = header.querySelector('.v29-main-nav');
  const brand = header.querySelector('.v45-logo');

  if (brand) {
    const n = brand.querySelector('.brand-name');
    if (n) n.innerHTML = 'Serpent<strong>Game</strong>';
    brand.setAttribute('aria-label','SerpentGame Home');
  }

  header.querySelectorAll('.header-dragon').forEach(el => el.remove());
  if (brand) {
    const leftDragon = document.createElement('span');
    leftDragon.className = 'header-dragon header-serpent-left';
    leftDragon.setAttribute('aria-hidden','true');
    leftDragon.innerHTML = '<img src="assets/serpentgame-gold-logo.jpg?v=20261001-real-gold-dragon" alt="">';
    header.prepend(leftDragon);
    const rightDragon = leftDragon.cloneNode(true);
    rightDragon.className = 'header-dragon header-serpent-right';
    header.append(rightDragon);
  }

  if (nav && !nav.querySelector('.nav-support')) {
    const support = document.createElement('a');
    support.className = 'oi-nav-item v29-pill nav-support';
    support.href = '/destek';
    support.innerHTML = '<span class="support-heart" aria-hidden="true">♥</span><span>DESTEKLE</span>';
    nav.appendChild(support);
  }

  let langWrap = header.querySelector('.language-switch');
  if (!langWrap) {
    langWrap = document.createElement('div');
    langWrap.className = 'language-switch';
    langWrap.innerHTML = '<button type="button" data-lang="tr">TR</button><button type="button" data-lang="en">EN</button>';
    header.appendChild(langWrap);
  }

  let auth = header.querySelector('.nav-auth');
  if (!auth) {
    auth = document.createElement('div');
    auth.className = 'nav-auth';
    auth.innerHTML = '<a class="js-login" href="#">Giriş Yap</a><a class="js-register" href="#">Kayıt Ol</a>';
    header.appendChild(auth);
  }

  let button = header.querySelector('.theme-toggle');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    header.append(button);
  }

  const sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z"/></svg>';

  function paintTheme() {
    const dark = root.dataset.theme === 'dark';
    button.innerHTML = dark ? sun : moon;
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
  }

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(themeKey, root.dataset.theme); } catch (_) {}
    paintTheme();
  });

  const trToEn = {
    'ANA SAYFA':'HOME',
    'TÜRKÇE YAMA':'TURKISH PATCHES',
    'PC OYUNLARI':'PC GAMES',
    'EMÜLATÖR OYUNLARI':'EMULATOR GAMES',
    'DESTEKLE':'SUPPORT',
    'Giriş Yap':'Sign In',
    'Kayıt Ol':'Sign Up',
    'Çıkış Yap':'Sign Out',
    'Yama hakkında':'About the patch',
    'Kurulum ve İndirme':'Installation & Download',
    'Kurulum':'Installation',
    'Önemli not':'Important note',
    'İndir':'Download',
    'İNDİR':'DOWNLOAD',
    'Tüm yamalara dön':'Back to all patches',
    'OYUN ARŞİVİ':'GAME ARCHIVE',
    'EN YENİ İÇERİKLER':'LATEST CONTENT',
    'Yeni eklenen oyun yamaları, indirme bağlantıları ve kurulum rehberleri.':'New game patches, download links and installation guides.',
    'Yama sayfası →':'Patch page →',
    'Yama isteği gönder':'Request a patch',
    'Projeyi Destekle':'Support the project',
    'Bugün':'Today',
    'Dün':'Yesterday',
    'Toplam':'Total',
    'İndirme':'Downloads',
    'Görüntülenme':'Views',
    'Yamalar':'Patches',
    'Oyunlar':'Games',
    'Ana Sayfa':'Home',
    'Türkçe Yama':'Turkish Patches',
    'PC Oyunları':'PC Games',
    'Emülatör Oyunları':'Emulator Games',
    'Destekle':'Support',
    'Yama İsteği Gönder':'Request a Patch',
    'Proje Destek':'Support Project',
    'Arama':'Search',
    'Ara':'Search',
    'Tümü':'All',
    'Sayfa':'Page',
    'Önceki':'Previous',
    'Sonraki':'Next'
  };
  const enToTr = Object.fromEntries(Object.entries(trToEn).map(([k,v]) => [v,k]));

  function replaceTextNode(node, map) {
    const raw = node.nodeValue;
    const t = raw.trim();
    if (!t || !map[t]) return;
    node.nodeValue = raw.replace(t, map[t]);
  }

  function translateElementText(map) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const p = node.parentElement;
      if (!p || p.closest('script,style,textarea,input,select,option')) return;
      replaceTextNode(node, map);
    });
  }

  function applyLang(lang) {
    const current = root.lang || 'tr';
    if (lang === current) {
      langWrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      return;
    }
    translateElementText(lang === 'en' ? trToEn : enToTr);
    root.lang = lang;
    try { localStorage.setItem(langKey, lang); } catch (_) {}
    langWrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.title = document.title
      .replace('Oyunlar İçin Türkçe Çeviriler','Game Translations')
      .replace('Türkçe Yamalar','Turkish Patches');
  }

  langWrap.addEventListener('click', e => {
    const b = e.target.closest('button[data-lang]');
    if (!b) return;
    applyLang(b.dataset.lang);
  });

  paintTheme();

  let initialLang = 'tr';
  try { initialLang = localStorage.getItem(langKey) || 'tr'; } catch (_) {}
  root.lang = 'tr';
  if (initialLang === 'en') setTimeout(() => applyLang('en'), 0);
  else langWrap.querySelector('[data-lang="tr"]')?.classList.add('active');
})();