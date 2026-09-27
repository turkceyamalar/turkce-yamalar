(() => {
 const cfg=window.TY_SUPABASE_CONFIG||{};
 const nodes=[...document.querySelectorAll('[data-views]')];
 const setCount=(n,value)=>{let label=n.querySelector('.ty-view-label');if(!label){label=document.createElement('span');label.className='ty-view-label';const extra=n.querySelector('.ty-download-count');n.replaceChildren(label);if(extra)n.append(extra)}label.textContent=value};
 if(!nodes.length)return;
 if(!cfg.url||!cfg.anonKey){nodes.forEach(n=>setCount(n,'Görüntülenme bilgisi yok'));return;}
 fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/page_views?select=page_key,view_count',{headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey}})
 .then(r=>{if(!r.ok)throw Error('counter');return r.json()})
 .then(rows=>{const map=new Map(rows.map(x=>[x.page_key,Number(x.view_count)||0]));nodes.forEach(n=>setCount(n,'◉ '+(map.get(n.dataset.views)||0).toLocaleString('tr-TR')+' görüntülenme'))})
 .catch(()=>nodes.forEach(n=>setCount(n,'Görüntülenme bilgisi alınamadı')));
})();
