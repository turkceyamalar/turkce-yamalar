(() => {
  'use strict';

  const patches = {
    'resident-evil-4-remake': {
      title: 'Resident Evil 4 Remake Türkçe Yama', file: 'RE4_Remake_Dosya_Yamasi.zip', size: '51,7 MB', type: 'ZIP • EXE içermez', image: 'assets/resident-evil-4-cover.jpg', detail: 'resident-evil-4-remake.html',
      links: [['MediaFire’dan İndir', 'https://www.mediafire.com/file/au6ispp4p8mpw8w/RE4_Remake_Dosya_Yamasi.zip/file']]
    },
    'resident-evil-2-remake': {
      title: 'Resident Evil 2 Remake Türkçe Yama', file: 'RE2_Remake_Dosya_Yamasi.zip', size: '11,5 MB', type: 'ZIP • EXE içermez', image: 'assets/resident-evil-2-cover.jpg', detail: 'resident-evil-2-remake.html',
      links: [['Siteden İndir', 'downloads/RE2_Remake_Dosya_Yamasi.zip']]
    },
    'resident-evil-village': {
      title: 'Resident Evil Village Türkçe Yama', file: 'RE_Village_Dosya_Yamasi.zip', size: '410 KB', type: 'ZIP • EXE içermez', image: 'assets/resident-evil-village-cover.jpg', detail: 'resident-evil-village.html',
      links: [['Siteden İndir', 'downloads/RE_Village_Dosya_Yamasi.zip']]
    },
    aniimo: {
      title: 'Aniimo Türkçe Yama', file: 'Aniimo_Turkce_ASCII_Yama_v4_English_Slot.zip', size: 'Dosya sunucusunda', type: 'ZIP • EXE içermez', image: 'assets/aniimo-cover.webp', detail: 'aniimo.html',
      links: [
        ['GoFile’dan İndir', 'https://gofile.io/d/gvwEiKwU'],
        ['Client Versiyonu (GoFile)', 'https://gofile.io/d/RDbP2plp'],
        ['MediaFire’dan İndir', 'https://www.mediafire.com/file/2haogl7cdelz0aw/Aniimo_Turkce_ASCII_Yama_v4_English_Slot.zip/file'],
        ['Dosya.co’dan İndir', 'https://dosya.co/dy2k5qz0dnjb/Aniimo_Turkce_ASCII_Yama_v4_English_Slot.zip.html']
      ]
    },
    cuphead: {
      title: 'Cuphead Türkçe Yama', file: 'Cuphead_Tam_Turkce_Yama_Kurucusuz.zip', size: 'Dosya sunucusunda', type: 'ZIP • EXE içermez', image: 'assets/cuphead-cover-small.jpg', detail: 'cuphead.html',
      links: [
        ['MediaFire’dan İndir', 'https://www.mediafire.com/file/yjol1ahtxq5k7q2/Cuphead_Tam_Turkce_Yama_Kurucusuz.zip/file'],
        ['Dosya.co’dan İndir', 'https://dosya.co/08do2jjb6536/Cuphead_Tam_Turkce_Yama_Kurucusuz.zip.html']
      ]
    },
    'silent-hill-townfall': {
      title: 'Silent Hill Townfall Türkçe Yama', file: 'SILENT_HILL_Townfall_TR_Yama_Dosya_Surumu.zip', size: 'Dosya sunucusunda', type: 'ZIP • EXE içermez', image: 'assets/silent-hill-townfall-cover.jpg', detail: 'silent-hill-townfall.html',
      links: [
        ['MediaFire’dan İndir', 'https://www.mediafire.com/file/a6onvm6ggut9j7k/SILENT_HILL_Townfall_TR_Yama_Dosya_Surumu.zip/file'],
        ['Dosya.co’dan İndir', 'https://dosya.co/4baixqcd4fzn/SILENT_HILL_Townfall_TR_Yama_Dosya_Surumu.zip.html']
      ]
    },
    mindseye: {
      title: 'MindsEye Türkçe Yama', file: 'MindsEye.rar', size: 'Dosya sunucusunda', type: 'RAR • EXE içermez', image: 'assets/mindseye-hero.jpg', detail: 'mindseye.html',
      links: [
        ['MediaFire’dan İndir', 'https://www.mediafire.com/file/docyw6u8obvbs5y/MindsEye.rar/file'],
        ['Dosya.co’dan İndir', 'https://dosya.co/qcyme724qg9l/MindsEye.rar.html']
      ]
    },
    'star-wars-outlaws': {
      title: 'Star Wars Outlaws Türkçe Yama', file: 'Star_Wars_Outlaws_Turkce_Yama_Dosyalari.zip', size: 'Dosya sunucusunda', type: 'ZIP • EXE içermez', image: 'assets/star-wars-outlaws-cover.png', detail: 'star-wars-outlaws.html',
      links: [['MediaFire’dan İndir', 'https://www.mediafire.com/file/hywywnkn18amoae/Star_Wars_Outlaws_Turkce_Yama_Dosyalari.zip/file']]
    },
    'prince-of-persia': {
      title: 'Prince of Persia: The Lost Crown Türkçe Yama', file: 'PrinceOfPersiaTheLostCrown.rar', size: 'Dosya sunucusunda', type: 'RAR • EXE içermez', image: 'assets/prince-of-persia-the-lost-crown-cover.png', detail: 'prince-of-persia-the-lost-crown.html',
      links: [['MediaFire’dan İndir', 'https://www.mediafire.com/file/td5v61jmgnv63bf/PrinceOfPersiaTheLostCrown.rar/file']]
    },
    'beast-of-reincarnation': { title: 'Beast of Reincarnation Türkçe Yama', file: 'Beast_of_Reincarnation_Turkce_Yama_Dosya.rar', size: '79,9 MB', type: 'RAR • EXE içermez', image: 'assets/beast-of-reincarnation-cover.jpg', detail: 'beast-of-reincarnation.html', links: [['MediaFire’dan İndir', 'https://www.mediafire.com/file/1wijszoks43wqwt/Beast_of_Reincarnation_Turkce_Yama_Dosya.rar/file']] },
    'gothic-1-remake': { title: 'Gothic 1 Remake Türkçe Yama', file: 'Gothic_1_Remake_Turkce_Yama_Dosya.rar', size: '41,9 MB', type: 'RAR • EXE içermez', image: 'assets/gothic-1-remake-cover.jpg', detail: 'gothic-1-remake.html', links: [['MediaFire’dan İndir', 'https://www.mediafire.com/file/q5blibw9dnu2d71/Gothic_1_Remake_Turkce_Yama_Dosya.rar/file']] },
    'mortal-shell-2': { title: 'Mortal Shell 2 Türkçe Yama', file: 'Mortal_Shell_2_Turkce_Yama_Dosya.rar', size: '3,4 MB', type: 'RAR • EXE içermez', image: 'assets/mortal-shell-2-cover.jpg', detail: 'mortal-shell-2.html', links: [['MediaFire’dan İndir', 'https://www.mediafire.com/file/ghtxfv0j9a330id/Mortal_Shell_2_Turkce_Yama_Dosya.rar/file']] }
  };

  const key = new URLSearchParams(location.search).get('yama') || '';
  const patch = patches[key];
  const $ = id => document.getElementById(id);
  if (!patch) {
    $('downloadTitle').textContent = 'Yama bulunamadı';
    $('downloadLead').textContent = 'Bağlantı hatalı veya bu yama arşivden kaldırılmış olabilir.';
    $('downloadButtons').innerHTML = '<a class="button secondary" href="yamalar.html">Tüm yamalara dön</a>';
    return;
  }

  document.title = `${patch.title} İndir | Türkçe Yamalar`;
  $('downloadTitle').textContent = patch.title;
  $('downloadLead').textContent = 'Dosya bilgilerini kontrol et ve tercih ettiğin sunucudan ücretsiz indir.';
  $('downloadFileName').textContent = patch.file;
  $('downloadSize').textContent = patch.size;
  $('downloadType').textContent = patch.type;
  $('downloadImage').src = patch.image;
  $('downloadImage').alt = patch.title;
  $('backToPatch').href = patch.detail;
  if (patch.parts || patch.links.length < 2) {
    const note = document.querySelector('.gateway-note');
    if (note) note.textContent = patch.parts ? 'Büyük ZIP dosyası indirme sırasında parçaları birleştirilerek tek dosya olarak kaydedilir.' : 'İndirme başlamazsa düğmeye yeniden tıkla.';
  }

  const cfg = window.TY_SUPABASE_CONFIG || {};
  const sb = window.supabase && cfg.url && cfg.anonKey ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  const count = $('downloadCount');
  async function loadCount() {
    if (!sb) { count.textContent = 'İndirme sayacı'; return; }
    const { data, error } = await sb.rpc('get_download_count', { p_patch_key: key });
    count.textContent = error ? 'Sayaç yakında' : `${Number(data || 0).toLocaleString('tr-TR')} indirme`;
  }
  async function registerAndGo(url, button) {
    button.classList.add('is-opening');
    button.textContent = 'Bağlantı açılıyor…';
    if (sb) {
      try { await Promise.race([sb.rpc('register_download', { p_patch_key: key }), new Promise(resolve => setTimeout(resolve, 1200))]); } catch (_) {}
    }
    location.href = url;
  }

  if (patch.parts) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button download-primary gateway-download-button';
    button.textContent = 'Siteden İndir';
    button.addEventListener('click', async () => {
      button.disabled = true;
      const chunks = [];
      try {
        for (let i = 0; i < patch.parts.length; i++) {
          button.textContent = `Dosya hazırlanıyor (${i + 1}/${patch.parts.length})…`;
          const response = await fetch(patch.parts[i]);
          if (!response.ok) throw new Error(`Parça ${i + 1} indirilemedi`);
          chunks.push(await response.blob());
        }
        if (sb) { try { await sb.rpc('register_download', { p_patch_key: key }); } catch (_) {} }
        const url = URL.createObjectURL(new Blob(chunks, { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = patch.file;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        button.textContent = 'İndirme başlatıldı';
      } catch (_) {
        button.textContent = 'İndirilemedi — tekrar dene';
      } finally {
        button.disabled = false;
      }
    });
    $('downloadButtons').appendChild(button);
  } else if (!patch.links.length) {
    $('downloadButtons').innerHTML = '<span class="button pending-download" aria-disabled="true">İndirme bağlantısı hazırlanıyor</span><p class="gateway-pending">Dosya hazır; genel indirme bağlantısı eklenince bu düğme otomatik olarak etkinleştirilecek.</p>';
  } else {
    patch.links.forEach(([label, url], index) => {
      const a = document.createElement('a');
      a.className = `button ${index === 0 ? 'download-primary' : 'blue-button'} gateway-download-button`;
      a.href = url;
      a.textContent = label;
      a.rel = 'noopener noreferrer nofollow';
      a.addEventListener('click', event => { event.preventDefault(); registerAndGo(url, a); });
      $('downloadButtons').appendChild(a);
    });
  }
  loadCount();
})();
