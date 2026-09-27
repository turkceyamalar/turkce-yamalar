(() => {
 const cfg=window.TY_SUPABASE_CONFIG||{};
 const nodes=[...document.querySelectorAll('[data-views]')];
 if(!nodes.length)return;
 if(!cfg.url||!cfg.anonKey){nodes.forEach(n=>n.textContent='Görüntülenme bilgisi yok');return;}
 fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/page_views?select=page_key,view_count',{headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey}})
 .then(r=>{if(!r.ok)throw Error('counter');return r.json()})
 .then(rows=>{const map=new Map(rows.map(x=>[x.page_key,Number(x.view_count)||0]));nodes.forEach(n=>n.textContent='◉ '+(map.get(n.dataset.views)||0).toLocaleString('tr-TR')+' görüntülenme')})
 .catch(()=>nodes.forEach(n=>n.textContent='Görüntülenme bilgisi alınamadı'));
})();
