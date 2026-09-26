// Cloudflare Pages Function: news proxy with a short cache for the public Steam feed.
const GAMES = [
  { id: 2050650, name: 'Resident Evil 4' },
  { id: 1196590, name: 'Resident Evil Village' },
  { id: 883710, name: 'Resident Evil 2' },
  { id: 2680010, name: 'Silent Hill: Townfall' }
];
const origin = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/';
const clean = value => String(value || '').replace(/<[^>]*>|\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();

export async function onRequestGet({ request, waitUntil }) {
  const key = new Request(new URL('/api/haberler', request.url).toString(), { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return hit;
  const result = await Promise.allSettled(GAMES.map(async game => {
    const url = `${origin}?appid=${game.id}&count=5&maxlength=500&format=json`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Steam ${response.status}`);
      const data = await response.json();
      return (data?.appnews?.newsitems || []).filter(item => item.title && item.date && /^https:\/\//.test(item.url || '')).map(item => ({
        baslik: clean(item.title).slice(0, 180),
        kategori: /\b(dlc|expansion|season pass)\b/i.test(item.title) ? 'DLC' : /\b(release|launch|available now)\b/i.test(item.title) ? 'Yeni Oyun' : 'Güncelleme',
        tarih: new Date(Number(item.date) * 1000).toISOString().slice(0, 10),
        ozet: `${game.name}: ${clean(item.contents).slice(0, 260)}`,
        kaynak: item.url,
        gorsel: ''
      }));
    } finally { clearTimeout(timer); }
  }));
  const items = result.filter(x => x.status === 'fulfilled').flatMap(x => x.value).filter(x => x.baslik);
  if (!items.length) return Response.json({ news: [] }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const unique = [...new Map(items.map(item => [item.kaynak, item])).values()].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 24);
  const response = Response.json({ news: unique }, { headers: { 'Cache-Control': 'public, max-age=900', 'X-Content-Type-Options': 'nosniff' } });
  waitUntil(cache.put(key, response.clone()));
  return response;
}
