(() => {
  'use strict';
  const cfg=window.TY_SUPABASE_CONFIG||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey)return;
  const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
  const slug=(document.body.dataset.page||location.pathname.split('/').pop()||'').replace(/\.html$/,'');
  if(!slug||['index','yamalar','haberler','apklar','destek','hakkimizda','gizlilik','kullanim','iletisim','admin','profile'].includes(slug))return;
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const main=document.querySelector('main'); if(!main)return;
  const section=document.createElement('section'); section.className='ty-comments-section';
  section.innerHTML=`<div class="container ty-comments-wrap"><h2>CEVAP VER</h2><form id="tyCommentForm" class="ty-comment-form"><textarea id="tyCommentText" maxlength="1500" required placeholder="Yorum:"></textarea><div class="ty-comment-fields"><input id="tyCommentName" maxlength="40" required placeholder="İsim:*"><input id="tyCommentEmail" type="email" placeholder="E-Posta:"></div><input id="tyParentId" type="hidden"><div id="tyReplying" class="ty-replying" hidden></div><button type="submit">Yorum Gönder</button><span id="tyCommentMsg"></span></form><h3><span id="tyCommentCount">0</span> YORUMLAR</h3><div id="tyCommentList" class="ty-comment-list"><p>Yorumlar yükleniyor...</p></div></div>`;
  main.appendChild(section);
  const list=section.querySelector('#tyCommentList'), count=section.querySelector('#tyCommentCount'), form=section.querySelector('#tyCommentForm'), msg=section.querySelector('#tyCommentMsg');
  const parentInput=section.querySelector('#tyParentId'), replying=section.querySelector('#tyReplying');
  async function load(){
    const {data,error}=await sb.from('comments').select('id,name,comment,parent_id,created_at').eq('game_slug',slug).order('created_at',{ascending:true});
    if(error){list.innerHTML='<p>Yorumlar şu anda yüklenemedi.</p>';console.error(error);return}
    const rows=data||[]; count.textContent=rows.length;
    if(!rows.length){list.innerHTML='<p>Henüz yorum yok. İlk yorumu sen yap.</p>';return}
    const roots=rows.filter(x=>!x.parent_id), children=id=>rows.filter(x=>x.parent_id===id);
    const card=(c,reply=false)=>`<article class="ty-comment ${reply?'ty-comment-reply':''}"><div class="ty-comment-avatar">${esc((c.name||'?').charAt(0).toUpperCase())}</div><div class="ty-comment-body"><div class="ty-comment-head"><strong>${esc(c.name)}</strong><time>${new Date(c.created_at).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'})}</time></div><p>${esc(c.comment).replace(/\n/g,'<br>')}</p>${!reply?`<button class="ty-reply-btn" data-reply="${c.id}" data-name="${esc(c.name)}">Yorumu Cevapla</button>`:''}</div></article>`;
    list.innerHTML=roots.map(r=>card(r)+children(r.id).map(x=>card(x,true)).join('')).join('');
  }
  list.addEventListener('click',e=>{const b=e.target.closest('[data-reply]');if(!b)return;parentInput.value=b.dataset.reply;replying.hidden=false;replying.innerHTML=`<b>${esc(b.dataset.name)}</b> adlı yoruma cevap veriyorsun. <button type="button" id="tyCancelReply">İptal</button>`;section.querySelector('#tyCommentText').focus();});
  replying.addEventListener('click',e=>{if(e.target.id==='tyCancelReply'){parentInput.value='';replying.hidden=true;replying.textContent='';}});
  form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='Gönderiliyor...';const payload={game_slug:slug,name:section.querySelector('#tyCommentName').value.trim(),email:section.querySelector('#tyCommentEmail').value.trim()||null,comment:section.querySelector('#tyCommentText').value.trim(),parent_id:parentInput.value?Number(parentInput.value):null};const {error}=await sb.from('comments').insert(payload);if(error){msg.textContent='Yorum gönderilemedi.';console.error(error);return}section.querySelector('#tyCommentText').value='';parentInput.value='';replying.hidden=true;replying.textContent='';msg.textContent='Yorum gönderildi.';await load();});
  load();
})();
