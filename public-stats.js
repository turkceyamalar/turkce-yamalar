(() => {
  const box=document.querySelector('[data-public-stats]');
  if(!box)return;
  const cfg=window.TY_SUPABASE_CONFIG||{};
  const fields={total_views:'Toplam görüntülenme',total_downloads:'Toplam indirme',today_downloads:'Bugünkü indirme',yesterday_downloads:'Dünkü indirme'};
  const render=(data) => {
    box.innerHTML=Object.entries(fields).map(([key,label])=>`<div class="public-stat-card"><strong>${(Number(data[key])||0).toLocaleString('tr-TR')}</strong><span>${label}</span></div>`).join('');
    document.querySelectorAll('[data-views]').forEach(node=>{
      const count=Number(data.patches?.[node.dataset.views])||0;
      let extra=node.querySelector('.ty-download-count');
      if(!extra){extra=document.createElement('span');extra.className='ty-download-count';node.append(extra)}
      extra.textContent=' • ⬇ '+count.toLocaleString('tr-TR')+' indirme';
    });
  };
  if(!cfg.url||!cfg.anonKey){box.textContent='İstatistikler yüklenemedi';return}
  fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/public_site_stats',{method:'POST',headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey,'Content-Type':'application/json'},body:'{}'})
    .then(r=>{if(!r.ok)throw new Error('stats');return r.json()})
    .then(render)
    .catch(()=>{box.textContent='İstatistikler şu an yüklenemedi.'});
})();
