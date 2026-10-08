import { put } from '@vercel/blob';
import crypto from 'crypto';

// Receives lightweight analytics beacons from /assets/tracker.js.
// OPTIMIZED 2026-10-07: single put() per event (1 Blob operation instead of 4+).
// Each event is written as its own tiny file: events/YYYY-MM-DD/<random>.json
// The stats reader (api/stats.js) already aggregates all files under events/ prefix,
// so this append-only format is fully compatible.
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
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const ua = String(req.headers['user-agent'] || '').slice(0, 140);
      const visitor = crypto.createHash('sha256').update(`${ip}|${ua}|${day}`).digest('hex').slice(0, 16);
      const record = {
        eid: crypto.randomBytes(8).toString('hex'),
        ts: now.toISOString(),
        t: ev.t,
        p: String(ev.p || '').slice(0, 300),
        u: String(ev.u || '').slice(0, 500),
        l: String(ev.l || '').slice(0, 140),
        r: String(ev.r || '').slice(0, 300),
        ctry: String(req.headers['x-vercel-ip-country'] || ''),
        v: visitor
      };
      // Single operation: write this event as its own file. No list, no read, no verify.
      const pathname = `events/${day}/${record.eid}.json`;
      await put(pathname, JSON.stringify([record]), {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json'
      });
    }
  } catch (e) {
    // Swallow: analytics must never affect the site.
  }
  res.status(204).end();
}
