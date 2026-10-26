// Vercel serverless function: proxies Steam's store API (which has no CORS headers)
// and returns a trimmed list of discounted games.
const REGIONS = ['us', 'gb', 'de', 'ph', 'ca', 'au'];
const CATEGORIES = ['specials', 'top_sellers', 'new_releases'];

module.exports = async (req, res) => {
  const cc = REGIONS.includes(req.query && req.query.cc) ? req.query.cc : 'us';
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(`https://store.steampowered.com/api/featuredcategories?cc=${cc}&l=english`, {
      signal: ctl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Steamwave/1.0)', Accept: 'application/json' },
    });
    if (!r.ok) throw new Error('Steam responded ' + r.status);
    const data = await r.json();
    const seen = new Set();
    const items = [];
    for (const key of CATEGORIES) {
      for (const g of (data[key] && data[key].items) || []) {
        if (!g.discounted || !(g.discount_percent > 0) || seen.has(g.id)) continue;
        seen.add(g.id);
        const id = Number(g.id);
        items.push({
          id,
          name: String(g.name),
          pct: Number(g.discount_percent),
          orig: Number(g.original_price),
          price: Number(g.final_price),
          cur: String(g.currency || 'USD'),
          img: /^https:\/\//.test(g.header_image || '')
            ? g.header_image
            : `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`,
          end: g.discount_expiration ? g.discount_expiration * 1000 : 0,
          win: !!g.windows_available,
          mac: !!g.mac_available,
          linux: !!g.linux_available,
        });
      }
    }
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    res.status(200).json({ updated: Date.now(), cc, items });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'Steam is unavailable right now' });
  } finally {
    clearTimeout(timer);
  }
};
