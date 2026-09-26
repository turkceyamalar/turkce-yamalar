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
  // The owner confirmed 40 earlier downloads before the click recorder existed.
  // The database stores subsequent clicks, so add that historical baseline once.
  const historicDownloads = 40;
  const writeStat = (name, value) => {
    const formatted = Number(value).toLocaleString('tr-TR');
    document.querySelectorAll(`[data-stat="${name}"]`).forEach(node => { node.textContent = formatted; });
  };
  if (statCards.length) writeStat('total_patches', 15);
  if (statCards.length) writeStat('total_downloads', historicDownloads);
  const cfg = window.TY_SUPABASE_CONFIG || {};
  if (!window.supabase || !cfg.url || !cfg.anonKey) return;
  const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

  // Open the existing target normally. Every actual download-button activation
  // registers against the same patch key used by the database dashboard.
  const patchKey = (document.body.dataset.page || '').replace(/\.html$/, '');
  if (/^[a-z0-9-]{1,80}$/.test(patchKey)) {
    document.querySelectorAll('.uniform-grid #indir a[href]').forEach(link => {
      link.addEventListener('click', () => {
        sb.rpc('register_download', { p_patch_key: patchKey }).then(({ error }) => {
          if (error) console.warn('İndirme sayacı kaydedilemedi:', error.message);
        });
      });
    });
  }

  if (!statCards.length) return;
  (async () => {
    const { data, error } = await sb.rpc('get_download_dashboard');
    if (!error && data && data.total_downloads != null) {
      writeStat('total_downloads', historicDownloads + Number(data.total_downloads));
      writeStat('today_downloads', data.today_downloads);
      writeStat('yesterday_downloads', data.yesterday_downloads);
      return;
    }
    const fallback = await sb.from('download_stats').select('download_count');
    if (!fallback.error) {
      writeStat('total_downloads', historicDownloads + (fallback.data || []).reduce((sum, row) => sum + Number(row.download_count || 0), 0));
    }
    const istanbulDate = date => {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
      const part = type => parts.find(item => item.type === type).value;
      return `${part('year')}-${part('month')}-${part('day')}`;
    };
    const today = istanbulDate(new Date());
    const daily = await sb.from('download_daily_stats').select('day,download_count').lte('day', today).order('day', { ascending: false }).limit(2);
    if (!daily.error) {
      const yesterday = istanbulDate(new Date(Date.now() - 86400000));
      writeStat('today_downloads', daily.data?.find(row => row.day === today)?.download_count ?? 0);
      writeStat('yesterday_downloads', daily.data?.find(row => row.day === yesterday)?.download_count ?? 0);
    }
  })();
})();
