import { list } from '@vercel/blob';
import { verifySession } from './_auth.js';

// Aggregates the daily event files written by /api/track into dashboard stats.
// Requires a valid admin session cookie.

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

function emptyBucket() {
  return { pageviews: 0, visitors: new Set(), clicks: 0, plays: 0 };
}

function bucketSummary(b) {
  return { pageviews: b.pageviews, visitors: b.visitors.size, clicks: b.clicks, plays: b.plays };
}

export default async function handler(req, res) {
  const user = verifySession(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Not signed in.' });
    return;
  }
  try {
    const now = new Date();
    const today = dayKey(now);
    const d7 = dayKey(new Date(now.getTime() - 6 * 864e5));
    const d30 = dayKey(new Date(now.getTime() - 29 * 864e5));

    const { blobs } = await list({ prefix: 'events/' });
    const byDay = new Map(); // day -> blob[]
    let trackedSince = null;
    for (const b of blobs) {
      const m = /events\/(\d{4}-\d{2}-\d{2})-/.exec(b.pathname);
      if (!m) continue;
      const day = m[1];
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(b);
      if (!trackedSince || day < trackedSince) trackedSince = day;
    }

    const buckets = { today: emptyBucket(), last7d: emptyBucket(), last30d: emptyBucket(), allTime: emptyBucket() };
    const dailyMap = new Map();
    const topPages = new Map();
    const topClicks = new Map();
    const topPlays = new Map();
    const countries = new Map();

    const days = [...byDay.keys()].sort();
    for (const day of days) {
      const dayBucket = emptyBucket();
      for (const blob of byDay.get(day)) {
        let events = [];
        try {
          const r = await fetch(blob.url);
          if (r.ok) {
            const parsed = await r.json();
            if (Array.isArray(parsed)) events = parsed;
          }
        } catch (e) { /* skip unreadable day file */ }
        for (const ev of events) {
          const targets = [buckets.allTime, dayBucket];
          if (day === today) targets.push(buckets.today);
          if (day >= d7) targets.push(buckets.last7d);
          if (day >= d30) targets.push(buckets.last30d);
          const in30 = day >= d30;
          if (ev.t === 'pv') {
            targets.forEach((b) => { b.pageviews += 1; if (ev.v) b.visitors.add(`${day}:${ev.v}`); });
            if (in30) {
              topPages.set(ev.p, (topPages.get(ev.p) || 0) + 1);
              if (ev.ctry) countries.set(ev.ctry, (countries.get(ev.ctry) || 0) + 1);
            }
          } else if (ev.t === 'click') {
            targets.forEach((b) => { b.clicks += 1; });
            if (in30 && ev.u) {
              const key = ev.u;
              const cur = topClicks.get(key) || { url: ev.u, label: ev.l || '', count: 0 };
              cur.count += 1;
              if (!cur.label && ev.l) cur.label = ev.l;
              topClicks.set(key, cur);
            }
          } else if (ev.t === 'play') {
            targets.forEach((b) => { b.plays += 1; });
            if (in30) {
              const key = ev.u || ev.l || 'unknown';
              const cur = topPlays.get(key) || { file: ev.u || '', label: ev.l || '', count: 0 };
              cur.count += 1;
              topPlays.set(key, cur);
            }
          }
        }
      }
      dailyMap.set(day, dayBucket);
    }

    const daily = [];
    for (let i = 29; i >= 0; i -= 1) {
      const day = dayKey(new Date(now.getTime() - i * 864e5));
      const b = dailyMap.get(day);
      daily.push({ date: day, ...(b ? bucketSummary(b) : { pageviews: 0, visitors: 0, clicks: 0, plays: 0 }) });
    }

    const sortDesc = (arr) => arr.sort((a, b) => b.count - a.count);
    res.status(200).json({
      ok: true,
      generatedAt: now.toISOString(),
      trackedSince,
      today: bucketSummary(buckets.today),
      last7d: bucketSummary(buckets.last7d),
      last30d: bucketSummary(buckets.last30d),
      allTime: bucketSummary(buckets.allTime),
      daily,
      topPages: [...topPages.entries()].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 15),
      topClicks: sortDesc([...topClicks.values()]).slice(0, 15),
      topPlays: sortDesc([...topPlays.values()]).slice(0, 15),
      countries: [...countries.entries()].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count).slice(0, 10)
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Could not load stats yet.' });
  }
}
