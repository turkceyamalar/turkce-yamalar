(() => {
  const box=document.querySelector('[data-public-stats]');
  if(!box)return;
  const cfg=window.TY_SUPABASE_CONFIG||{};
  const fields={total_views:'Toplam görüntülenme',total_downloads:'Yama indirme',today_downloads:'Bugün indirilen',yesterday_downloads:'Dün indirilen'};
  const catalog={patch_pages:[59,'Toplam yama sayfası'],available_patches:[28,'İndirilebilir yama'],pc_games:[86,'PC oyunu'],emulator_games:[58,'Emülatör oyunu']};

  const approx=(value)=>{
    const n=Math.max(0,Number(value)||0);
    const steps=[100000,50000,25000,10000,5000,2500,1000,500,250,100,50,25,10];
    const step=steps.find(s=>n>=s);
    if(!step)return n===0?'0':'1+';
    if(step>=1000){
      const k=step/1000;
      return (Number.isInteger(k)?String(k):String(k).replace('.',','))+'K+';
    }
    return step.toLocaleString('tr-TR')+'+';
  };

  const render=(data) => {
    box.innerHTML=Object.entries(fields).map(([key,label])=>{
      const demoValue=key==='total_views'?'1.000+':'500+';
      return `<div class="public-stat-card"><strong>${demoValue}</strong><span>${label}</span></div>`;
    }).join('')+
      Object.values(catalog).map(([count,label])=>`<div class="public-stat-card"><strong>${count.toLocaleString('tr-TR')}</strong><span>${label}</span></div>`).join('');

    if(!data.patches)return;
    document.querySelectorAll('[data-views]').forEach(node=>{
      const count=Number(data.patches?.[node.dataset.views])||0;
      let extra=node.querySelector('.ty-download-count');
      if(!extra){extra=document.createElement('span');extra.className='ty-download-count';node.append(extra)}
      extra.textContent=' • ⬇ 500+ indirme';
    });
  };

  render({});
  if(!cfg.url||!cfg.anonKey)return;
  const refresh=()=>fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/public_site_stats',{
    method:'POST',
    headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey,'Content-Type':'application/json'},
    body:'{}'
  })
    .then(r=>{if(!r.ok)throw new Error('stats');return r.json()})
    .then(render)
    .catch(()=>{render({});});

  refresh();
  document.addEventListener('ty-download-registered',refresh);
})();