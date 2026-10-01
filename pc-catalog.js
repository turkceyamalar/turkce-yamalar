(() => {
  const feed=document.querySelector('.ty-feed');
  if(!feed)return;
  const cards=[...feed.querySelectorAll('.ty-feed-item[data-year]')];
  const controls=feed.querySelector('.pc-year-controls');
  const nav=document.createElement('nav');nav.className='pc-pagination';nav.setAttribute('aria-label','PC oyunları sayfaları');feed.append(nav);
  let year='all',page=1;

  function pageButton(label,target,options={}){
    const button=document.createElement('button');
    button.type='button';
    button.textContent=label;
    if(options.current)button.setAttribute('aria-current','page');
    if(options.disabled){button.disabled=true;button.setAttribute('aria-disabled','true');}
    if(options.arrow)button.classList.add('pc-page-arrow');
    button.onclick=()=>{
      if(button.disabled)return;
      page=target;draw();feed.scrollIntoView({block:'start',behavior:'smooth'});
    };
    return button;
  }

  function draw(){
    const filtered=cards.filter(card=>year==='all'||card.dataset.year===year);
    const pages=Math.max(1,Math.ceil(filtered.length/6));page=Math.min(Math.max(1,page),pages);
    cards.forEach(card=>card.hidden=!filtered.includes(card)||filtered.indexOf(card)<(page-1)*6||filtered.indexOf(card)>=page*6);
    nav.replaceChildren();

    const label=document.createElement('span');
    label.className='pc-page-label';
    label.textContent=`Sayfa ${page} / ${pages} · ${filtered.length} oyun`;
    nav.append(label);

    const controlsWrap=document.createElement('span');
    controlsWrap.className='pc-page-buttons';

    controlsWrap.append(pageButton('‹',page-1,{disabled:page===1,arrow:true}));

    let start=Math.max(1,page-1);
    let end=Math.min(pages,start+2);
    if(end-start<2)start=Math.max(1,end-2);

    for(let n=start;n<=end;n++){
      controlsWrap.append(pageButton(String(n),n,{current:n===page}));
    }

    controlsWrap.append(pageButton('›',page+1,{disabled:page===pages,arrow:true}));
    nav.append(controlsWrap);
  }

  for(const value of ['all','2026','2025','2024','2023','2022','2021','2020']){
    const button=document.createElement('button');button.type='button';button.textContent=value==='all'?'Tümü':value;
    button.setAttribute('aria-pressed',String(value===year));button.onclick=()=>{year=value;page=1;for(const b of controls.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));draw()};controls.append(button);
  }
  draw();
})();