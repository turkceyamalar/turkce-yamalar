document.addEventListener('DOMContentLoaded', () => {
  const detail = document.querySelector('main.uniform-page .uniform-detail');
  if (!detail) return;
  const entries = [
    ['resident-evil-4-remake.html','Resident Evil 4 Remake','assets/resident-evil-4-cover.jpg'],
    ['cuphead.html','Cuphead','assets/cuphead-cover-small.jpg'],
    ['gta-5.html','Grand Theft Auto V','assets/gta-5-cover.png'],
    ['aniimo.html','Aniimo','assets/aniimo-detail.png'],
    ['star-wars-outlaws.html','Star Wars Outlaws','assets/star-wars-outlaws-cover.png']
  ].filter(([url]) => url !== location.pathname.split('/').pop());
  const aside = document.createElement('aside');
  aside.className = 'detail-related';
  const heading = document.createElement('h2');
  heading.textContent = 'DİĞER İÇERİKLER';
  aside.append(heading);
  for (const [url, title, src] of entries) {
    const link = document.createElement('a');
    link.href = url;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = title;
    link.append(img, label);
    aside.append(link);
  }
  detail.append(aside);
  const intro = detail.querySelector('.uniform-intro');
  const media = detail.querySelector('.uniform-media');
  const grid = detail.querySelector('.uniform-grid');
  if (intro && media && grid) {
    const column = document.createElement('div');
    column.className = 'detail-article';
    detail.insertBefore(column, intro);
    column.append(intro, grid, media);
    const cover = media.querySelector('.detail-art img, .direct-cover img, .media-banner img, .v38-video-card > img');
    if (cover) {
      const top = document.createElement('img');
      top.className = 'detail-lead-image';
      top.src = cover.getAttribute('src');
      top.alt = cover.getAttribute('alt') || intro.querySelector('h1')?.textContent || '';
      column.insertBefore(top, intro);
    }
  }
});
