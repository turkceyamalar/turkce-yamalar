(() => {
  'use strict';

  const footer = document.querySelector('footer .footer-inner');
  if (footer && !footer.querySelector('.js-legal-links')) {
    const links = document.createElement('div');
    links.className = 'footer-actions footer-links js-legal-links';
    links.innerHTML = '<a href="hakkimizda.html">Hakkımızda</a><a href="gizlilik.html">Gizlilik</a><a href="kullanim.html">Kullanım</a><a href="iletisim.html">İletişim</a><a href="destek.html">Destekle</a>';
    footer.appendChild(links);
  }

  // Owner-confirmed downloads before the server-side recorder was installed.
  // Nine of the 40 historical downloads have no per-game attribution.
  const baseline = { daily: {'2026-09-25':3, '2026-09-26':37}, patches: {aniimo:31}, total:40 };
  const dateKey = date => new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Istanbul'}).format(date);
  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now()-86400000));
  const writeStat = (name,value) => document.querySelectorAll(`[data-stat="${name}"]`).forEach(n=>n.textContent=Number(value).toLocaleString('tr-TR'));
  const paintPatch = (key,count) => document.querySelectorAll('[data-patch-downloads]').forEach(n=>{
    if(n.dataset.patchDownloads===key) n.textContent='↓ '+Number(count).toLocaleString('tr-TR')+' indirilme';
  });
  writeStat('total_patches',15);
  writeStat('total_downloads',baseline.total);
  writeStat('today_downloads',baseline.daily[today]||0);
  writeStat('yesterday_downloads',baseline.daily[yesterday]||0);
  document.querySelectorAll('[data-patch-downloads]').forEach(n=>{
    const key=n.dataset.patchDownloads;
    if(key in baseline.patches) paintPatch(key,baseline.patches[key]);
    else n.textContent='↓ İndirilme: henüz kayıt yok';
  });
  const cfg=window.TY_SUPABASE_CONFIG||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey)return;
  const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
  async function refresh(){
    const [patches,daily]=await Promise.all([
      sb.from('download_stats').select('patch_key,download_count'),
      sb.from('download_daily_stats').select('day,download_count').in('day',[today,yesterday])
    ]);
    if(!patches.error){
      const counts=new Map((patches.data||[]).map(r=>[r.patch_key,Number(r.download_count)||0]));
      document.querySelectorAll('[data-patch-downloads]').forEach(n=>{
        const key=n.dataset.patchDownloads;paintPatch(key,(baseline.patches[key]||0)+(counts.get(key)||0));
      });
      writeStat('total_downloads',baseline.total+[...counts.values()].reduce((a,b)=>a+b,0));
    }
    if(!daily.error){
      for(const [name,date] of [['today_downloads',today],['yesterday_downloads',yesterday]])
        writeStat(name,(baseline.daily[date]||0)+Number(daily.data?.find(r=>r.day===date)?.download_count||0));
    }
  }
  const patchKey=(document.body.dataset.page||'').replace(/\.html$/,'');
  if(/^[a-z0-9-]{1,80}$/.test(patchKey)){
    document.querySelectorAll('.uniform-grid #indir .download-options a[href]').forEach(link=>link.addEventListener('click',()=>{
      sb.rpc('register_download',{p_patch_key:patchKey}).then(({error})=>{if(!error)refresh();});
    }));
  }
  refresh().catch(()=>{});
})();
