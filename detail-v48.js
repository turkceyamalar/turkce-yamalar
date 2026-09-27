document.addEventListener('DOMContentLoaded', () => {
  const detail = document.querySelector('main.uniform-page .uniform-detail');
  if (!detail) return;
  const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
  const videos = {
    'aniimo':'6HRiu1seQzo', 'cuphead':'NN-9SQXoi50', 'gta-5':'hvoD7ehZPcM',
    'red-dead-redemption-2':'Dw_oH5oiUSE', 'resident-evil-4-remake':'XnIDTnKUScQ',
    'shadow-of-the-tomb-raider':'D1kTu2hacaI', 'silent-hill-townfall':'iO-_SEeVZs4',
    'mortal-shell-2':'cPSE1yrooT4', 'prince-of-persia-the-lost-crown':'dlFHOknWioI',
    'star-wars-outlaws':'cMqqfkLhuZk', 'beast-of-reincarnation':'H0r-Kap8kWI'
  };
  const extraImages = {
    aniimo:['assets/aniimo-detail.png','assets/aniimo-trailer-poster.jpg'],
    cuphead:['assets/cuphead-trailer-poster.jpg'], mindseye:['assets/mindseye-hero.jpg']
  };
  const entries = [
    ['aniimo.html','Aniimo','assets/aniimo-cover.webp'],
    ['resident-evil-4-remake.html','Resident Evil 4 Remake','assets/resident-evil-4-cover.jpg'],
    ['cuphead.html','Cuphead','assets/cuphead-cover-small.jpg'],
    ['gta-5.html','Grand Theft Auto V','assets/gta-5-cover.png'],
    ['star-wars-outlaws.html','Star Wars Outlaws','assets/star-wars-outlaws-cover.png']
  ].filter(([url]) => url !== slug + '.html');
  const intro = detail.querySelector('.uniform-intro');
  const media = detail.querySelector('.uniform-media');
  const grid = detail.querySelector('.uniform-grid');
  if (!intro || !grid) return;
  const column = document.createElement('div');
  column.className = 'detail-article';
  detail.insertBefore(column, intro);
  column.append(intro);
  const originalCover = media?.querySelector('.detail-art img, .direct-cover img, .media-banner img, .v38-video-card > img');
  const coverSrc = originalCover?.getAttribute('src') || entries.find(([url]) => url === slug+'.html')?.[2];
  if (coverSrc) {
    const cover = document.createElement('img');
    cover.className = 'detail-lead-image'; cover.src = coverSrc;
    cover.alt = intro.querySelector('h1')?.textContent || '';
    column.insertBefore(cover,intro);
  }
  const download = grid.querySelector('#indir');
  if (download) {
    download.classList.add('detail-download');
    const links = download.querySelectorAll('.download-options a');
    links.forEach(a => {
      a.textContent = a.textContent.trim().replace(/’dan İndir|’den İndir| Sürümü \(MediaFire\)/g,'').trim() + ' → İndir';
      if (a.hostname.includes('mediafire.com')) a.textContent = '⬇ ' + a.textContent.replace('MediaFire →','MediaFire üzerinden');
    });
  }
  column.append(grid);
  const about = [...grid.querySelectorAll('.uniform-card')].find(a => a.querySelector('h2')?.textContent.trim().toLowerCase() === 'yama hakkında');
  const install = grid.querySelector('#kurulum');
  const articles=[...grid.querySelectorAll('article.uniform-card')];
  const ordered=[about,download,install,...articles.filter(a=>![about,download,install].includes(a))].filter(Boolean);
  grid.replaceChildren(...ordered);
  if (media) media.remove(); // Giriş kapağı üstte, kurulum videosu altta ayrı gösterilir.
  const gallery = document.createElement('section');
  gallery.className = 'detail-gallery';
  const gh = document.createElement('h2'); gh.textContent = 'OYUNDAN GÖRSELLER'; gallery.append(gh);
  const galleryItems = [...new Set([coverSrc,...(extraImages[slug] || [])])].filter(Boolean);
  if (videos[slug]) galleryItems.push('https://i.ytimg.com/vi/'+videos[slug]+'/hqdefault.jpg');
  galleryItems.slice(0,3).forEach((src,i) => {
    const img = document.createElement('img'); img.src = src; img.alt = intro.querySelector('h1')?.textContent + ' görsel ' + (i+1);
    img.loading = 'lazy'; if(src.includes('ytimg.com')) img.onerror=()=>img.remove(); gallery.append(img);
  });
  column.append(gallery);
  const trailer = document.createElement('section'); trailer.className = 'detail-trailers';
  const th = document.createElement('h2'); th.textContent = 'OYUN FRAGMANI / OYNANIŞ'; trailer.append(th);
  if (videos[slug]) {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/'+videos[slug];
    frame.title = th.textContent; frame.loading = 'lazy'; frame.allowFullscreen = true;
    frame.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    trailer.append(frame);
    const link=document.createElement('a');link.href='https://www.youtube.com/watch?v='+videos[slug];link.target='_blank';link.rel='noopener noreferrer';link.textContent='YouTube’da aç →';trailer.append(link);
  } else {
    const link=document.createElement('a');link.href='https://www.youtube.com/results?search_query='+encodeURIComponent(intro.querySelector('h1')?.textContent.replace('TÜRKÇE YAMA','')+' oynanış fragmanı');link.target='_blank';link.rel='noopener noreferrer';link.textContent='Bu oyunun fragmanlarını YouTube’da bul →';trailer.append(link);
  }
  column.append(trailer);
  const howto=document.createElement('section');howto.className='detail-howto';
  const hh=document.createElement('h2');hh.textContent='YAMA KURULUM VİDEOSU';howto.append(hh);
  if (slug==='aniimo') {
    const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/ZTV0lfE5z_I?start=12';frame.title='Aniimo Türkçe Yama Kurulumu';frame.loading='lazy';frame.allowFullscreen=true;howto.append(frame);
  } else {const note=document.createElement('p');note.textContent='Yama kurulum videosu yakında gelecek.';howto.append(note)}
  column.append(howto);
  const aside=document.createElement('aside');aside.className='detail-related';
  const heading=document.createElement('h2');heading.textContent='DİĞER İÇERİKLER';aside.append(heading);
  for (const [url,title,src] of entries) {
    const a=document.createElement('a');a.href=url;
    const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';
    const label=document.createElement('span');label.textContent=title;a.append(img,label);aside.append(a);
  }
  detail.append(aside);
});
