(() => {
  const form=document.getElementById('patchRequestForm');if(!form)return;
  const result=document.getElementById('requestResult');
  const cfg=window.TY_SUPABASE_CONFIG||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey){result.textContent='Bağlantı kurulamadı. Lütfen daha sonra tekrar dene.';return}
  const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const values=new FormData(form);
    if(String(values.get('website')||'').trim()){result.textContent='İsteğin alındı, teşekkürler.';form.reset();return}
    const button=form.querySelector('[type="submit"]');button.disabled=true;result.textContent='İstek gönderiliyor...';
    try{
      const {data}=await sb.auth.getUser();
      const {error}=await sb.from('patch_requests').insert({user_id:data?.user?.id||null,contact_name:String(values.get('contact_name')).trim(),contact_email:String(values.get('contact_email')).trim(),game_name:String(values.get('game_name')).trim(),platform:String(values.get('platform')),details:String(values.get('details')).trim()});
      if(error){result.textContent='İstek gönderilemedi. Site yöneticisinin veritabanı güncellemesini uygulaması gerekiyor.';return}
      result.textContent='İsteğin alındı, teşekkürler.';form.reset();
    }catch(_){result.textContent='Bağlantı hatası. Lütfen tekrar dene.'}
    finally{button.disabled=false}
  });
})();
