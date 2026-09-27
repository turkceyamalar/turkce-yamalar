(() => {
  'use strict';

  const footer = document.querySelector('footer .footer-inner');
  if (footer && !footer.querySelector('.js-legal-links')) {
    const links = document.createElement('div');
    links.className = 'footer-actions footer-links js-legal-links';
    links.innerHTML = '<a href="hakkimizda.html">Hakkımızda</a><a href="gizlilik.html">Gizlilik</a><a href="kullanim.html">Kullanım</a><a href="iletisim.html">İletişim</a><a href="destek.html">Destekle</a>';
    footer.appendChild(links);
  }

  const cfg=window.TY_SUPABASE_CONFIG||{};
  if(!cfg.url||!cfg.anonKey)return;
  function startRecorder(){
  const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
  document.querySelectorAll('script[data-after-sdk]').forEach(marker=>{
    const script=document.createElement('script');script.src=marker.dataset.afterSdk+'?v=39';script.async=false;document.body.appendChild(script);
  });
  const patchKey=(document.body.dataset.page||'').replace(/\.html$/,'');
  // Görüntülenme sayısı, yalnızca oyun sayfası açıldığında oturum başına bir kez artar.
  const gameKeys=['ppsspp','rpcs3','aniimo-android','naruto-ultimate-ninja-impact','aniimo','gta-5','shadow-of-the-tomb-raider','red-dead-redemption-2','resident-evil-4-remake','resident-evil-2-remake','resident-evil-village','beast-of-reincarnation','gothic-1-remake','mortal-shell-2','star-wars-outlaws','cuphead','mindseye','silent-hill-townfall','prince-of-persia-the-lost-crown'];
  if(gameKeys.includes(patchKey)){
    try{
      const seen='ty-view-v39-'+patchKey;
      if(!sessionStorage.getItem(seen)){
        sessionStorage.setItem(seen,'1');
        sb.rpc('register_page_view',{p_page_key:patchKey}).then(({error})=>{
          if(error)sessionStorage.removeItem(seen);
        }).catch(()=>sessionStorage.removeItem(seen));
      }
    }catch(_){}
  }
  if(document.querySelector('[data-views]')){
    sb.from('page_views').select('page_key,view_count').then(({data,error})=>{
      if(error){document.querySelectorAll('[data-views]').forEach(node=>node.textContent='Görüntülenme bilgisi alınamadı');return;}
      const counts=new Map((data||[]).map(row=>[row.page_key,Number(row.view_count)||0]));
      document.querySelectorAll('[data-views]').forEach(node=>{
        node.textContent='◉ '+(counts.get(node.dataset.views)||0).toLocaleString('tr-TR')+' görüntülenme';
      });
    });
  }
  if(/^[a-z0-9-]{1,80}$/.test(patchKey)){
    document.querySelectorAll('.uniform-grid #indir .download-options a[href]').forEach(link=>link.addEventListener('click',()=>{
      sb.rpc('register_download',{p_patch_key:patchKey});
    }));
  }
  }
  if(window.supabase){startRecorder();return;}
  const sdk=document.createElement('script');
  sdk.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  sdk.async=true;
  sdk.onload=()=>{if(window.supabase)startRecorder();};
  document.head.appendChild(sdk);
})();
