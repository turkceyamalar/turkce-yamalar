(() => {
  const form=document.getElementById('patchRequestForm');if(!form)return;
  const note=document.getElementById('requestLoginNote'),result=document.getElementById('requestResult');
  const cfg=window.TY_SUPABASE_CONFIG||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey){note.textContent='Bağlantı kurulamadı.';return}
  const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
  async function refresh(){
    const {data}=await sb.auth.getUser();
    const user=data.user;
    form.hidden=!user;
    note.textContent=user?'Hesabınla isteğini gönderebilirsin.':'Yama isteği göndermek için üst menüden giriş yap veya kayıt ol.';
  }
  sb.auth.onAuthStateChange(()=>setTimeout(refresh,0));refresh();
  form.addEventListener('submit',async event=>{
    event.preventDefault();result.textContent='İstek gönderiliyor...';
    const {data}=await sb.auth.getUser();if(!data.user){result.textContent='Önce giriş yapmalısın.';refresh();return}
    const values=new FormData(form);
    const {error}=await sb.from('patch_requests').insert({user_id:data.user.id,game_name:String(values.get('game_name')).trim(),platform:String(values.get('platform')),details:String(values.get('details')).trim()});
    if(error){result.textContent='İstek gönderilemedi. ONCE-YAMA-ISTEKLERI-KUR.sql dosyasının uygulandığını kontrol et.';return}
    result.textContent='İsteğin kaydedildi, teşekkürler.';form.reset();
  });
})();
