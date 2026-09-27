(() => {
  const box=document.getElementById('adminRequestsPanel');if(!box)return;
  const cfg=window.TY_SUPABASE_CONFIG||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey)return;
  const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  (async()=>{
    const {data:user}=await sb.auth.getUser();if(!user.user)return;
    const {data:profile}=await sb.from('profiles').select('role').eq('id',user.user.id).maybeSingle();if(profile?.role!=='admin')return;
    const {data,error}=await sb.from('patch_requests').select('game_name,platform,details,created_at,profiles(display_name)').order('created_at',{ascending:false}).limit(100);
    box.innerHTML='<h2>Gelen yama istekleri</h2>'+(error?'<p>İstekler alınamadı. ONCE-YAMA-ISTEKLERI-KUR.sql dosyasını çalıştır.</p>':data.length?data.map(r=>'<article class="ty-admin-request"><strong>'+esc(r.game_name)+'</strong><small>'+esc(r.platform)+' • '+esc(r.profiles?.display_name||'Üye')+' • '+new Date(r.created_at).toLocaleString('tr-TR')+'</small><p>'+esc(r.details)+'</p></article>').join(''):'<p>Henüz istek yok.</p>');
  })();
})();
