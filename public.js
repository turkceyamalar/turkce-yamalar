(() => {
  'use strict';

  const footer = document.querySelector('footer .footer-inner');
  if (footer && !footer.querySelector('.js-legal-links')) {
    const links = document.createElement('div');
    links.className = 'footer-actions footer-links js-legal-links';
    links.innerHTML = '<a href="hakkimizda.html">Hakkımızda</a><a href="gizlilik.html">Gizlilik</a><a href="kullanim.html">Kullanım</a><a href="iletisim.html">İletişim</a><a href="destek.html">Destekle</a>';
    footer.appendChild(links);
  }

  const statCards = [...document.querySelectorAll('.js-site-stats')];
  if (!statCards.length) return;

  const writeStat = (name, value) => {
    const formatted = Number(value || 0).toLocaleString('tr-TR');
    document.querySelectorAll(`[data-stat="${name}"]`).forEach(node => { node.textContent = formatted; });
  };
  writeStat('total_patches', 12);

  const cfg = window.TY_SUPABASE_CONFIG || {};
  if (!window.supabase || !cfg.url || !cfg.anonKey) return;
  const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

  (async () => {
    const { data, error } = await sb.rpc('get_download_dashboard');
    if (!error && data) {
      writeStat('total_downloads', data.total_downloads);
      writeStat('today_downloads', data.today_downloads);
      writeStat('yesterday_downloads', data.yesterday_downloads);
      return;
    }
    const fallback = await sb.from('download_stats').select('download_count');
    if (!fallback.error) {
      writeStat('total_downloads', (fallback.data || []).reduce((sum, row) => sum + Number(row.download_count || 0), 0));
    }
  })();
})();
