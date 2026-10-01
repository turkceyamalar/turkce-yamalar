(() => {
  'use strict';

  const footer = document.querySelector('footer .footer-inner');
  if (footer && !footer.querySelector('.js-legal-links')) {
    const links = document.createElement('div');
    links.className = 'footer-actions footer-links js-legal-links';
    links.innerHTML = '<a href="hakkimizda.html">Hakkımızda</a><a href="gizlilik.html">Gizlilik</a><a href="kullanim.html">Kullanım</a><a href="iletisim.html">İletişim</a><a href="destek.html">Destekle</a>';
    footer.appendChild(links);
  }

  document.querySelectorAll('link[rel*="icon"]').forEach(link => {
    link.type = 'image/svg+xml';
    link.href = 'favicon.svg?v=72';
  });

  const cfg = window.TY_SUPABASE_CONFIG || {};
  const pageKey = (document.body.dataset.page || '').replace(/\.html$/,'');
  const validKey = key => /^[a-z0-9-]{1,80}$/.test(key || '');
  const keyFromHref = href => {
    try {
      const u = new URL(href, location.href);
      if (u.origin !== location.origin) return '';
      const name = u.pathname.split('/').filter(Boolean).pop() || '';
      return name.replace(/\.html$/,'');
    } catch (_) { return ''; }
  };
  const tr = document.documentElement.lang !== 'en';
  const fmt = n => (Number(n) || 0).toLocaleString(tr ? 'tr-TR' : 'en-US');
  const viewText = n => '◉ ' + fmt(n) + (tr ? ' görüntüleme' : ' views');
  const downloadText = n => '⬇ ' + fmt(n) + (tr ? ' indirme' : ' downloads');

  function ensureStatsSlots() {
    document.querySelectorAll('.ty-feed-item').forEach(card => {
      const copy = card.querySelector('.ty-feed-copy');
      if (!copy) return;
      const link = copy.querySelector('a[href$=".html"]') || card.querySelector('a[href$=".html"]');
      if (!link) return;
      const key = keyFromHref(link.getAttribute('href'));
      if (!validKey(key) || ['index','yamalar','pc-oyunlari','emulator-oyunlari'].includes(key)) return;

      // Eski birleşik/mavi sayacı kaldır; yalnızca iki ayrı koyu rozet bırak.
      copy.querySelectorAll('.ty-views, .ty-download-count, .ty-card-stats').forEach(el => el.remove());

      const stats = document.createElement('div');
      stats.className = 'ty-card-stats';

      const view = document.createElement('span');
      view.className = 'ty-card-stat';
      view.dataset.statViewKey = key;
      view.textContent = viewText(0);

      const down = document.createElement('span');
      down.className = 'ty-card-stat';
      down.dataset.statDownloadKey = key;
      down.textContent = downloadText(0);

      stats.append(view, down);
      copy.appendChild(stats);
    });

    const intro = document.querySelector('.uniform-detail .uniform-intro');
    if (intro && validKey(pageKey)) {
      intro.querySelectorAll('.ty-detail-stats').forEach(el => el.remove());
      const stats = document.createElement('div');
      stats.className = 'ty-detail-stats';
      stats.innerHTML =
        '<span data-stat-view-key="' + pageKey + '">' + viewText(0) + '</span>' +
        '<span data-stat-download-key="' + pageKey + '">' + downloadText(0) + '</span>';
      intro.appendChild(stats);
    }
  }

  async function refreshPublicCounts() {
    if (!cfg.url || !cfg.anonKey) return;
    const base = cfg.url.replace(/\/$/,'');
    const headers = { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey };

    const viewNodes = [...document.querySelectorAll('[data-stat-view-key]')];
    if (viewNodes.length) {
      try {
        const r = await fetch(base + '/rest/v1/page_views?select=page_key,view_count', { headers });
        if (r.ok) {
          const rows = await r.json();
          const map = new Map((rows || []).map(x => [x.page_key, Number(x.view_count) || 0]));
          viewNodes.forEach(node => {
            const key = node.dataset.statViewKey;
            node.textContent = viewText(map.get(key) || 0);
          });
        }
      } catch (_) {}
    }

    const downloadNodes = [...document.querySelectorAll('[data-stat-download-key]')];
    if (downloadNodes.length) {
      try {
        const r = await fetch(base + '/rest/v1/rpc/public_site_stats', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: '{}'
        });
        if (r.ok) {
          const data = await r.json();
          const patches = data && typeof data.patches === 'object' && data.patches ? data.patches : {};
          downloadNodes.forEach(node => {
            const key = node.dataset.statDownloadKey;
            node.textContent = downloadText(Number(patches[key]) || 0);
          });
        }
      } catch (_) {}
    }
  }

  ensureStatsSlots();
  refreshPublicCounts();

  if (!cfg.url || !cfg.anonKey) return;

  function startRecorder() {
    const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

    document.querySelectorAll('script[data-after-sdk]').forEach(marker => {
      const script = document.createElement('script');
      script.src = marker.dataset.afterSdk + '?v=39';
      script.async = false;
      document.body.appendChild(script);
    });

    const legacyKeys = ['ppsspp','rpcs3','aniimo-android','naruto-ultimate-ninja-impact','aniimo','gta-5','shadow-of-the-tomb-raider','red-dead-redemption-2','resident-evil-4-remake','resident-evil-2-remake','resident-evil-village','beast-of-reincarnation','gothic-1-remake','mortal-shell-2','star-wars-outlaws','cuphead','mindseye','silent-hill-townfall','prince-of-persia-the-lost-crown'];
    const isDetailPage = !!document.querySelector('.uniform-detail') || legacyKeys.includes(pageKey);
    if (isDetailPage && validKey(pageKey)) {
      try {
        const seen = 'ty-view-v71-' + pageKey;
        if (!sessionStorage.getItem(seen)) {
          sessionStorage.setItem(seen,'1');
          sb.rpc('register_page_view',{p_page_key:pageKey}).then(({error}) => {
            if (error) sessionStorage.removeItem(seen);
            else setTimeout(refreshPublicCounts, 250);
          }).catch(() => sessionStorage.removeItem(seen));
        }
      } catch (_) {}
    }

    if (validKey(pageKey)) {
      document.querySelectorAll('#indir a[href], .download-options a[href]').forEach(link => {
        if (link.dataset.tyDownloadBound === '1') return;
        link.dataset.tyDownloadBound = '1';
        link.addEventListener('click', () => {
          const endpoint = cfg.url.replace(/\/$/,'') + '/rest/v1/rpc/register_download';
          fetch(endpoint, {
            method: 'POST',
            keepalive: true,
            headers: {
              apikey: cfg.anonKey,
              Authorization: 'Bearer ' + cfg.anonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({p_patch_key:pageKey})
          }).then(response => {
            if (!response.ok) throw new Error('İndirme sayacı kaydedilemedi: ' + response.status);
            document.dispatchEvent(new Event('ty-download-registered'));
            setTimeout(refreshPublicCounts, 250);
          }).catch(error => console.warn(error));
        });
      });
    }
  }

  if (window.supabase) {
    startRecorder();
    return;
  }
  const sdk = document.createElement('script');
  sdk.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  sdk.async = true;
  sdk.onload = () => { if (window.supabase) startRecorder(); };
  document.head.appendChild(sdk);
})();