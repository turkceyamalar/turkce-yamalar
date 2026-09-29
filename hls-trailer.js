document.querySelectorAll('video[data-hls]').forEach(video=>{
  const url=video.dataset.hls;
  if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url;return}
  if(window.Hls && Hls.isSupported()){
    const player=new Hls();player.loadSource(url);player.attachMedia(video);
    player.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal){player.destroy();video.outerHTML='<p>Fragman şu anda yüklenemedi.</p>'}});
  }else video.outerHTML='<p>Bu tarayıcı fragmanı oynatamıyor.</p>';
});
