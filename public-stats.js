(() => {
  const box=document.querySelector('[data-public-stats]');
  if(!box)return;
  const cfg=window.TY_SUPABASE_CONFIG||{};
  const fields={total_views:'Toplam görüntülenme',total_downloads:'Toplam indirme',today_downloads:'Bugünkü indirme',yesterday_downloads:'Dünkü indirme'};
  const catalog={patch_pages:[59,'Yama sayfası'],available_patches:[28,'İndirilebilir yama'],pc_games:[86,'Toplam PC oyunu'],emulator_games:[58,'Toplam emülatör oyunu']};
  const render=(data) => {
    box.innerHTML=Object.entries(fields).map(([key,label])=>`<div class="public-stat-card"><strong>${data[key]==null?'—':(Number(data[key])||0).toLocaleString('tr-TR')}</strong><span>${label}</span></div>`).join('')+
      Object.values(catalog).map(([count,label])=>`<div class="public-stat-card"><strong>${count.toLocaleString('tr-TR')}</strong><span>${label}</span></div>`).join('');
  };
  render({});
  if(!cfg.url||!cfg.anonKey)return;
  const refresh=()=>fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/public_site_stats',{method:'POST',headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey,'Content-Type':'application/json'},body:'{}'})
    .then(r=>{if(!r.ok)throw new Error('stats');return r.json()})
    .then(render)
    .catch(()=>{render({});});
  refresh();
  document.addEventListener('ty-download-registered',refresh);
})();