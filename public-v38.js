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
    const script=document.createElement('script');script.src=marker.dataset.afterSdk+'?v=37';script.async=false;document.body.appendChild(script);
  });
  const patchKey=(document.body.dataset.page||'').replace(/\.html$/,'');
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
