import { put, list, get } from '@vercel/blob';
import crypto from 'crypto';

// Receives lightweight analytics beacons from /assets/tracker.js.
// Events are appended to one JSON file per day in Blob storage: events/YYYY-MM-DD-<rand>.json
// Always answers 204 so tracking can never break the live site.

const TYPES = new Set(['pv', 'click', 'play']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  try {
    let ev = req.body || {};
    if (typeof ev === 'string') {
      try { ev = JSON.parse(ev || '{}'); } catch (e) { ev = {}; }
    }
    if (ev && TYPES.has(ev.t)) {
      const now = new Date();
      const day = now.toISOString().slice(0, 10);
      const prefix = `events/${day}-`;
      const { blobs } = await list({ prefix });
      let pathname;
      let events = [];
      if (blobs.length) {
        pathname = blobs[0].pathname;
        try {
          const got = await get(pathname, { access: 'private' });
          if (got && got.stream) {
            const text = await new Response(got.stream).text();
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) events = parsed;
          }
        } catch (e) { /* start fresh below */ }
      } else {
        pathname = `events/${day}-${crypto.randomBytes(4).toString('hex')}.json`;
      }
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const ua = String(req.headers['user-agent'] || '').slice(0, 140);
      const visitor = crypto.createHash('sha256').update(`${ip}|${ua}|${day}`).digest('hex').slice(0, 16);
      events.push({
        ts: now.toISOString(),
        t: ev.t,
        p: String(ev.p || '').slice(0, 300),
        u: String(ev.u || '').slice(0, 500),
        l: String(ev.l || '').slice(0, 140),
        r: String(ev.r || '').slice(0, 300),
        ctry: String(req.headers['x-vercel-ip-country'] || ''),
        v: visitor
      });
      if (events.length > 30000) events = events.slice(-30000);
      await put(pathname, JSON.stringify(events), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json'
      });
    }
  } catch (e) {
    // Swallow: analytics must never affect the site.
  }
  res.status(204).end();
}
