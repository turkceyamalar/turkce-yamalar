(() => {
  const feed=document.querySelector('.ty-feed');
  if(!feed)return;
  const cards=[...feed.querySelectorAll('.ty-feed-item[data-year]')];
  const controls=feed.querySelector('.pc-year-controls');
  const nav=document.createElement('nav');nav.className='pc-pagination';nav.setAttribute('aria-label','PC oyunları sayfaları');feed.append(nav);
  let year='all',page=1;
  function draw(){
    const filtered=cards.filter(card=>year==='all'||card.dataset.year===year);
    const pages=Math.max(1,Math.ceil(filtered.length/6));page=Math.min(page,pages);
    cards.forEach(card=>card.hidden=!filtered.includes(card)||filtered.indexOf(card)<(page-1)*6||filtered.indexOf(card)>=page*6);
    nav.replaceChildren();
    const label=document.createElement('span');label.textContent=`Sayfa ${page} / ${pages} · ${filtered.length} oyun`;nav.append(label);
    for(let n=1;n<=pages;n++){const button=document.createElement('button');button.type='button';button.textContent=String(n);if(n===page)button.setAttribute('aria-current','page');button.onclick=()=>{page=n;draw();feed.scrollIntoView({block:'start'})};nav.append(button)}
  }
  for(const value of ['all','2026','2025','2024','2023','2022','2021','2020']){
    const button=document.createElement('button');button.type='button';button.textContent=value==='all'?'Tümü':value;
    button.setAttribute('aria-pressed',String(value===year));button.onclick=()=>{year=value;page=1;for(const b of controls.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));draw()};controls.append(button);
  }
  draw();
})();
