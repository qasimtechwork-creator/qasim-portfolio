import crypto from 'crypto';
import { signSession } from './_auth.js';

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a == null ? '' : a)).digest();
  const hb = crypto.createHash('sha256').update(String(b == null ? '' : b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }
  const U = process.env.ADMIN_USER;
  const P = process.env.ADMIN_PASS;
  if (!U || !P || !process.env.ADMIN_SECRET) {
    res.status(500).json({ ok: false, error: 'Admin login is not configured yet.' });
    return;
  }
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
  }
  const ok = safeEqual(body.u, U) && safeEqual(body.p, P);
  if (!ok) {
    res.status(401).json({ ok: false, error: 'Wrong username or password.' });
    return;
  }
  const token = signSession(U);
  res.setHeader('Set-Cookie', `qa_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  res.status(200).json({ ok: true });
}
