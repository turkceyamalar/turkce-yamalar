(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const cfg=window.TY_SUPABASE_CONFIG||{};
  const configured=cfg.url && cfg.anonKey && !cfg.url.includes('PASTE_') && !cfg.anonKey.includes('PASTE_') && window.supabase;
  const sb=configured ? window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
  let currentUser=null, currentProfile=null;
  const page=document.body.dataset.page||location.pathname.split('/').pop()||'index.html';
  const authReturnUrl='https://turkce-yamalar.pages.dev/index.html';

  function ensureFooterLinks(){
    const footer=document.querySelector('footer .footer-inner');
    if(!footer||footer.querySelector('.js-legal-links'))return;
    const links=document.createElement('div');
    links.className='footer-actions footer-links js-legal-links';
    links.innerHTML='<a href="hakkimizda.html">Hakkımızda</a><a href="gizlilik.html">Gizlilik</a><a href="kullanim.html">Kullanım</a><a href="iletisim.html">İletişim</a><a href="destek.html">Destekle</a>';
    footer.appendChild(links);
  }

  function toast(msg,type='ok'){
    let box=$('#tyToast'); if(!box){box=document.createElement('div');box.id='tyToast';box.className='ty-toast';document.body.appendChild(box)}
    box.textContent=msg;box.className=`ty-toast show ${type}`;clearTimeout(box._t);box._t=setTimeout(()=>box.classList.remove('show'),2600);
  }
  function setupRequired(){toast('Supabase bağlantısı henüz yapılandırılmadı. README-SUPABASE.txt dosyasındaki 2 değeri ekleyin.','warn')}
  async function getProfile(){
    if(!sb||!currentUser){currentProfile=null;return null}
    const {data,error}=await sb.from('profiles').select('*').eq('id',currentUser.id).maybeSingle();
    if(error){console.error(error);return null} currentProfile=data; return data;
  }
  async function refreshSession(){
    if(!sb){currentUser=null;currentProfile=null;renderNav();return}
    const {data}=await sb.auth.getSession(); currentUser=data.session?.user||null;
    await getProfile(); renderNav();
  }
  function renderNav(){
    $$('.js-login').forEach(a=>{
      if(currentUser){
        const name=currentProfile?.display_name||currentUser.email?.split('@')[0]||'Profilim';
        const avatar=currentProfile?.avatar_url;
        a.classList.add('nav-user');
        a.innerHTML=avatar
          ? `<img class="nav-user-avatar" src="${esc(avatar)}" alt=""><span>${esc(name)}</span>`
          : `<span class="nav-user-avatar-fallback">${esc(name.charAt(0).toUpperCase())}</span><span>${esc(name)}</span>`;
        a.href='profile.html';a.onclick=null
      }
      else {a.textContent='Giriş';a.href='#';a.onclick=e=>{e.preventDefault();openAuth('login')}}
    });
    $$('.js-register').forEach(a=>{a.style.display=currentUser?'none':'';a.onclick=e=>{e.preventDefault();openAuth('register')}});
    $$('.admin-nav-link').forEach(a=>a.remove());

  }

  // Auth modal
  const modal=document.createElement('div'); modal.className='auth-modal'; modal.innerHTML=`
    <div class="auth-backdrop" data-close></div><div class="auth-box"><button class="auth-close" data-close aria-label="Kapat">×</button>
      <div class="auth-tabs"><button class="auth-tab active" data-tab="login">Giriş Yap</button><button class="auth-tab" data-tab="register">Kayıt Ol</button></div>
      <form id="loginForm" class="auth-form active"><label>E-posta<input name="email" type="email" required autocomplete="email"></label><label>Şifre<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><button class="button primary" type="submit">Giriş Yap</button><button class="auth-text-button" type="button" id="forgotPassword">Şifremi unuttum</button><button class="auth-text-button" type="button" id="resendConfirmation">Doğrulama e-postasını yeniden gönder</button><p class="form-msg"></p></form>
      <form id="registerForm" class="auth-form"><label>Kullanıcı adı<input name="username" required maxlength="24" autocomplete="nickname"></label><label>E-posta<input name="email" type="email" required autocomplete="email"></label><label>Şifre<input name="password" type="password" required minlength="6" autocomplete="new-password"></label><button class="button primary" type="submit">Kayıt Ol</button><p class="form-msg"></p></form>
      <form id="recoverForm" class="auth-form"><h3>Şifreni sıfırla</h3><label>E-posta<input name="email" type="email" required autocomplete="email"></label><button class="button primary" type="submit">Sıfırlama bağlantısı gönder</button><p class="form-msg"></p></form><form id="newPasswordForm" class="auth-form"><h3>Yeni şifre belirle</h3><label>Yeni şifre<input name="password" type="password" required minlength="6" autocomplete="new-password"></label><button class="button primary" type="submit">Şifreyi kaydet</button><p class="form-msg"></p></form><p class="auth-note">Hesaplar güvenli şekilde Supabase Auth ile tutulur. Şifreler site kodunda saklanmaz.</p>
    </div>`; document.body.appendChild(modal);
  function openAuth(){toast('Giriş ve kayıt işlemleri kapalı.','warn')}
  function closeAuth(){modal.classList.remove('open');document.body.classList.remove('modal-open')}
  function switchTab(tab){$$('.auth-tab',modal).forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$$('.auth-form',modal).forEach(f=>f.classList.toggle('active',f.id===`${tab}Form`))}
  modal.addEventListener('click',e=>{if(e.target.matches('[data-close]'))closeAuth();if(e.target.matches('.auth-tab'))switchTab(e.target.dataset.tab)});
  $('#forgotPassword',modal).addEventListener('click',()=>{const email=$('#loginForm input[name=email]',modal).value;switchTab('recover');$('#recoverForm input[name=email]',modal).value=email});
  $('#recoverForm',modal).addEventListener('submit',async e=>{
    e.preventDefault();const m=$('.form-msg',e.currentTarget),email=new FormData(e.currentTarget).get('email').trim();m.textContent='Bağlantı gönderiliyor...';
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:authReturnUrl});
    m.textContent=error?'Bağlantı gönderilemedi: '+error.message:'Hesap varsa sıfırlama bağlantısı e-postana gönderildi. Gerekiyorsa gereksiz postayı da kontrol et.';
  });
  $('#resendConfirmation',modal).addEventListener('click',async () => {
    const email=$('#loginForm input[name=email]',modal).value.trim();
    const m=$('#loginForm .form-msg',modal);
    if(!email){m.textContent='Önce e-posta adresini yaz.';return}
    m.textContent='Doğrulama e-postası gönderiliyor...';
    const {error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:authReturnUrl}});
    m.textContent=error?'E-posta gönderilemedi: '+error.message:'Hesap doğrulanmamışsa yeni bağlantı gönderildi. Gelen kutunu kontrol et.';
  });
  $('#newPasswordForm',modal).addEventListener('submit',async e=>{
    e.preventDefault();const m=$('.form-msg',e.currentTarget),password=new FormData(e.currentTarget).get('password');
    const {error}=await sb.auth.updateUser({password});m.textContent=error?'Şifre kaydedilemedi: '+error.message:'Yeni şifren kaydedildi. Artık giriş yapabilirsin.';
    if(!error)setTimeout(()=>switchTab('login'),1200);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAuth()});
  $('#registerForm',modal).addEventListener('submit',async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget),username=f.get('username').trim(),email=f.get('email').trim(),password=f.get('password'),m=$('.form-msg',e.currentTarget);m.textContent='Kayıt oluşturuluyor...';
    const {data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:username},emailRedirectTo:authReturnUrl}});
    if(error){m.textContent=error.message;return} m.textContent=data.session?'Kayıt tamamlandı.':'Kayıt tamamlandı. E-posta doğrulaması açıksa gelen kutunu kontrol et.'; await refreshSession(); setTimeout(closeAuth,900);
  });
  $('#loginForm',modal).addEventListener('submit',async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget),m=$('.form-msg',e.currentTarget);m.textContent='Giriş yapılıyor...';
    const {error}=await sb.auth.signInWithPassword({email:f.get('email').trim(),password:f.get('password')});
    if(error){m.textContent=error.message?.toLowerCase().includes('email not confirmed')?'E-postanı doğrulaman gerekiyor; gelen kutunu kontrol et.':'Giriş yapılamadı. Hesap oluşturmadıysan Kayıt Ol’a bas; şifreni unuttuysan sıfırla.';return}m.textContent='Giriş başarılı.';await refreshSession();await renderComments();if(currentProfile?.role==='admin' && page!=='admin.html'){location.href='admin.html';return}setTimeout(closeAuth,450);
  });

  // Poll - one vote per logged in user
  const poll=$('#patchPoll');
  const pollOptions=['Little Nightmares','Amenti','Throne and Liberty','Assassin’s Creed Valhalla','Diğer'];
  async function renderPoll(){
    if(!poll)return;
    if(!sb){$('#pollOptions').innerHTML='<p class="empty-comments">Oylama için Supabase bağlantısı gerekli.</p>';$('#pollTotal').textContent='';return}
    const {data,error}=await sb.from('poll_votes').select('choice'); if(error){console.error(error);return}
    const votes=Object.fromEntries(pollOptions.map(x=>[x,0]));(data||[]).forEach(v=>{if(votes[v.choice]!==undefined)votes[v.choice]++});
    let mine=null;if(currentUser){const {data:m}=await sb.from('poll_votes').select('choice').eq('user_id',currentUser.id).maybeSingle();mine=m?.choice||null}
    const total=Object.values(votes).reduce((a,b)=>a+b,0);
    $('#pollOptions').innerHTML=pollOptions.map(o=>{const pct=total?Math.round(votes[o]*100/total):0;return `<button class="poll-option ${mine===o?'selected':''}" data-vote="${esc(o)}"><span><b>${esc(o)}</b><em>${votes[o]} oy • %${pct}</em></span><i style="width:${pct}%"></i></button>`}).join('');
    $('#pollTotal').textContent=`Toplam ${total} oy${currentUser?'':' • Oy vermek için giriş yap'}`;
  }
  poll?.addEventListener('click',async e=>{
    const b=e.target.closest('[data-vote]');if(!b)return;if(!sb){setupRequired();return}if(!currentUser){openAuth('login');return}
    const {error}=await sb.from('poll_votes').upsert({user_id:currentUser.id,choice:b.dataset.vote},{onConflict:'user_id'});if(error){toast('Oy kaydedilemedi.','warn');return}renderPoll();
  });

  // Comments
  async function renderComments(){
    const box=$('#commentsBox');if(!box)return;const list=$('#commentList'),hint=$('#commentHint'),ta=$('#commentText'),btn=$('#commentSubmit');
    if(!sb){list.innerHTML='<p class="empty-comments">Yorum sistemi için Supabase bağlantısı gerekli.</p>';hint.textContent='Bağlantı yapılandırılmadı.';ta.disabled=true;btn.disabled=true;return}
    const {data,error}=await sb.from('comments').select('id,body,created_at,user_id,profiles(display_name,avatar_url)').eq('page',page).is('deleted_at',null).order('created_at',{ascending:false}).limit(100);
    if(error){console.error(error);list.innerHTML='<p class="empty-comments">Yorumlar yüklenemedi.</p>';return}
    list.innerHTML=(data||[]).length?(data||[]).map(c=>{const name=c.profiles?.display_name||'Kullanıcı',ava=c.profiles?.avatar_url;return `<div class="comment"><div class="comment-avatar">${ava?`<img src="${esc(ava)}" alt="">`:esc(name.charAt(0).toUpperCase())}</div><div><div class="comment-head"><strong>${esc(name)}</strong><span>${new Date(c.created_at).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'})}</span></div><p>${esc(c.body)}</p></div></div>`}).join(''):'<p class="empty-comments">Henüz yorum yok. İlk yorumu sen yap.</p>';
    const banned=currentProfile?.banned, muted=currentProfile?.muted_until && new Date(currentProfile.muted_until)>new Date();
    hint.textContent=!currentUser?'Yorum yapmak için giriş yap.':banned?'Hesabın yorum yapmaktan yasaklandı.':muted?`Yorumların ${new Date(currentProfile.muted_until).toLocaleString('tr-TR')} tarihine kadar susturuldu.`:`${currentProfile?.display_name||'Kullanıcı'} olarak yorum yapıyorsun.`;
    ta.disabled=!currentUser||banned||muted;btn.disabled=ta.disabled;
  }
  $('#commentForm')?.addEventListener('submit',async e=>{
    e.preventDefault();if(!sb){setupRequired();return}if(!currentUser){openAuth('login');return}
    const t=$('#commentText').value.trim();if(!t)return;
    const {error}=await sb.from('comments').insert({page,user_id:currentUser.id,body:t});
    if(error){toast(error.message.includes('row-level security')?'Yorum gönderme yetkin yok.':'Yorum gönderilemedi.','warn');return}
    $('#commentText').value='';await renderComments();
  });
  $('#commentHint')?.addEventListener('click',()=>{if(!currentUser)openAuth('login')});

  // Presence - anonymous session heartbeat via RPC
  const active=$('#activeUsers');
  async function heartbeat(){
    if(!sb||!active)return;let sid=sessionStorage.getItem('ty_presence_id');if(!sid){sid=crypto.randomUUID();sessionStorage.setItem('ty_presence_id',sid)}
    const {data,error}=await sb.rpc('heartbeat_presence',{p_session_id:sid});if(!error&&data!=null)active.textContent=data;
  }

  // Profile page
  async function initProfilePage(){
    if(!$('#profileApp'))return;
    if(!sb){$('#profileApp').innerHTML='<div class="community-card"><h2>Supabase bağlantısı gerekli</h2><p>README-SUPABASE.txt dosyasındaki adımları tamamla.</p></div>';return}
    if(!currentUser){location.href='index.html';return}
    const p=currentProfile||{}, app=$('#profileApp');
    app.innerHTML=`<div class="profile-grid"><section class="community-card"><span class="mini-label">Hesabım</span><h1>Profilim</h1><div class="profile-avatar-lg" id="profileAvatar">${p.avatar_url?`<img src="${esc(p.avatar_url)}" alt="">`:esc((p.display_name||currentUser.email||'K').charAt(0).toUpperCase())}</div><form id="profileForm" class="profile-form"><label>Kullanıcı adı<input name="display_name" maxlength="24" value="${esc(p.display_name||'')}"></label><label>Profil fotoğrafı URL'si<input name="avatar_url" type="url" value="${esc(p.avatar_url||'')}" placeholder="https://..."></label><button class="button primary" type="submit">Profili Kaydet</button></form><div class="profile-meta"><span>E-posta</span><b>${esc(currentUser.email||'')}</b><span>Rol</span><b>${p.role==='admin'?'Yönetici':'Üye'}</b><span>Kayıt</span><b>${p.created_at?new Date(p.created_at).toLocaleDateString('tr-TR'):'-'}</b></div><button id="logoutBtn" class="button secondary danger-soft">Çıkış Yap</button></section><section class="community-card"><span class="mini-label">Geçmiş</span><h2>Yorumlarım</h2><div id="myComments" class="comment-list"></div></section></div>`;
    $('#profileForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {error}=await sb.from('profiles').update({display_name:f.get('display_name').trim(),avatar_url:f.get('avatar_url').trim()||null}).eq('id',currentUser.id);if(error){toast('Profil kaydedilemedi.','warn');return}toast('Profil güncellendi.');await refreshSession();initProfilePage()});
    $('#logoutBtn').onclick=async()=>{await sb.auth.signOut();location.href='index.html'};
    const {data}=await sb.from('comments').select('id,page,body,created_at,deleted_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(50);
    $('#myComments').innerHTML=(data||[]).length?data.map(c=>`<div class="comment simple"><div><div class="comment-head"><strong>${esc(c.page)}</strong><span>${new Date(c.created_at).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'})}</span></div><p>${esc(c.body)}${c.deleted_at?' <em>(silinmiş)</em>':''}</p></div></div>`).join(''):'<p class="empty-comments">Henüz yorum yapmadın.</p>';
  }

  // Admin page
  async function initAdminPage(){
    const app=$('#adminApp');if(!app)return;if(!sb){app.innerHTML='<div class="community-card"><h2>Supabase bağlantısı gerekli</h2></div>';return}
    if(!currentUser){
      app.innerHTML='<section class="community-card admin-private-login"><h2>Yönetici girişi</h2><form id="privateAdminLogin"><label>E-posta<input name="email" type="email" autocomplete="username" required></label><label>Şifre<input name="password" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">Giriş yap</button><p class="form-msg" role="status"></p></form></section>';
      $('#privateAdminLogin').addEventListener('submit',async e=>{
        e.preventDefault();const form=e.currentTarget,button=form.querySelector('button'),msg=form.querySelector('.form-msg'),data=new FormData(form);
        button.disabled=true;msg.textContent='Kontrol ediliyor...';
        const {error}=await sb.auth.signInWithPassword({email:String(data.get('email')).trim(),password:String(data.get('password'))});
        button.disabled=false;
        if(error){msg.textContent='Giriş yapılamadı. E-posta ve şifreni kontrol et.';return}
        await refreshSession();
        if(currentProfile?.role!=='admin'){await sb.auth.signOut();currentUser=null;currentProfile=null;msg.textContent='Bu hesabın yönetici yetkisi yok.';return}
        initAdminPage();
      });
      return;
    }
    if(currentProfile?.role!=='admin'){app.innerHTML='<section class="community-card"><h2>Erişim reddedildi</h2><p>Bu hesap yönetici değil.</p><button class="button secondary" id="adminSignOut">Çıkış yap</button></section>';$('#adminSignOut').onclick=async()=>{await sb.auth.signOut();currentUser=null;currentProfile=null;initAdminPage()};return}

    app.innerHTML=`<button class="button secondary" id="adminLogout" type="button">Çıkış yap</button><section class="community-card" style="margin-bottom:20px"><span class="mini-label">Yalnızca yönetici</span><h2>İndirme istatistikleri</h2><div class="admin-stats" id="downloadAdminStats"></div><div id="downloadPatchStats"></div></section><div class="admin-stats" id="adminStats"></div><div class="admin-grid"><section class="community-card"><div class="section-row"><div><span class="mini-label">Yönetim</span><h2>Kullanıcılar</h2></div><input id="userSearch" class="admin-search" placeholder="Kullanıcı ara..."></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Kullanıcı</th><th>E-posta</th><th>Durum</th><th>Kayıt</th><th>İşlem</th></tr></thead><tbody id="usersTbody"></tbody></table></div></section><section class="community-card"><span class="mini-label">Moderasyon</span><h2>Son Yorumlar</h2><div id="adminComments" class="admin-comments"></div></section></div>`;
    $('#adminLogout').onclick=async()=>{await sb.auth.signOut();currentUser=null;currentProfile=null;initAdminPage()};
    const {data:downloads,error:downloadError}=await sb.rpc('admin_download_stats');
    if(downloadError){$('#downloadAdminStats').textContent='İstatistikler alınamadı. ÖNCE-INDIRME-GIZLILIGI.sql dosyasını Supabase SQL Editor içinde çalıştır.'}
    else {
      const cards=[['Toplam Yama',15],['Toplam İndirme',Number(downloads.total_downloads||0)],['Bugünkü İndirme',Number(downloads.today_downloads||0)],['Dünkü İndirme',Number(downloads.yesterday_downloads||0)]];
      $('#downloadAdminStats').innerHTML=cards.map(([label,n])=>`<div class="stat-card"><b>${n.toLocaleString('tr-TR')}</b><span>${label}</span></div>`).join('');
      const counts=new Map((downloads.patches||[]).map(x=>[x.patch_key,Number(x.download_count)||0]));
      $('#downloadPatchStats').innerHTML='<h3>Yama bazında</h3><div class="admin-stats">'+[...counts].sort((a,b)=>b[1]-a[1]).map(([name,n])=>`<div class="stat-card"><b>${n.toLocaleString('tr-TR')}</b><span>${esc(name)}</span></div>`).join('')+'</div>';
    }
    await loadAdminData();
    $('#userSearch').addEventListener('input',()=>loadAdminData($('#userSearch').value.trim()));
  }
  async function loadAdminData(search=''){
    const {data:users,error}=await sb.rpc('admin_list_users',{p_search:search}); if(error){toast('Admin kullanıcı listesi alınamadı.','warn');console.error(error);return}
    const {data:comments}=await sb.rpc('admin_list_comments',{p_limit:100});
    const banned=(users||[]).filter(u=>u.banned).length;$('#adminStats').innerHTML=`<div class="stat-card"><b>${users?.length||0}</b><span>Kullanıcı</span></div><div class="stat-card"><b>${banned}</b><span>Banlı</span></div><div class="stat-card"><b>${comments?.length||0}</b><span>Son yorum</span></div>`;
    $('#usersTbody').innerHTML=(users||[]).map(u=>`<tr><td><strong>${esc(u.display_name||'Kullanıcı')}</strong>${u.role==='admin'?'<small class="admin-badge">ADMIN</small>':''}</td><td>${esc(u.email||'')}</td><td>${u.banned?'<span class="status-pill bad">Banlı</span>':u.muted_until&&new Date(u.muted_until)>new Date()?'<span class="status-pill warn">Susturuldu</span>':'<span class="status-pill good">Aktif</span>'}</td><td>${new Date(u.created_at).toLocaleDateString('tr-TR')}</td><td class="admin-actions">${u.id===currentUser.id?'<span class="muted">Sen</span>':`<button data-admin-action="mute" data-id="${u.id}">24s sustur</button><button data-admin-action="ban" data-id="${u.id}" data-ban="${u.banned?'false':'true'}">${u.banned?'Banı aç':'Banla'}</button>`}</td></tr>`).join('');
    $('#adminComments').innerHTML=(comments||[]).length?(comments||[]).map(c=>`<div class="admin-comment"><div><strong>${esc(c.display_name||'Kullanıcı')}</strong><span>${esc(c.page)} • ${new Date(c.created_at).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'})}</span><p>${esc(c.body)}</p></div><button data-delete-comment="${c.id}">Sil</button></div>`).join(''):'<p class="empty-comments">Yorum yok.</p>';
  }
  document.addEventListener('click',async e=>{
    const a=e.target.closest('[data-admin-action]');if(a){const id=a.dataset.id,action=a.dataset.adminAction;let args={p_user_id:id,p_banned:null,p_muted_until:null};if(action==='ban')args.p_banned=a.dataset.ban==='true';if(action==='mute')args.p_muted_until=new Date(Date.now()+86400000).toISOString();const {error}=await sb.rpc('admin_set_user_status',args);if(error)toast('İşlem başarısız.','warn');else{toast('Kullanıcı güncellendi.');loadAdminData($('#userSearch')?.value||'')}}
    const d=e.target.closest('[data-delete-comment]');if(d){if(!confirm('Bu yorumu silmek istiyor musun?'))return;const {error}=await sb.rpc('admin_delete_comment',{p_comment_id:Number(d.dataset.deleteComment)});if(error)toast('Yorum silinemedi.','warn');else{toast('Yorum silindi.');loadAdminData($('#userSearch')?.value||'')}}
  });

  async function init(){
    ensureFooterLinks();
    if(sb){sb.auth.onAuthStateChange(async(event)=>{if(event==='PASSWORD_RECOVERY'){openAuth('newPassword');return}await refreshSession();renderPoll();renderComments()});}
    await refreshSession(); await renderPoll(); await renderComments(); await initProfilePage(); await initAdminPage(); heartbeat(); if(active)setInterval(heartbeat,30000);
  }
  init();
})();
