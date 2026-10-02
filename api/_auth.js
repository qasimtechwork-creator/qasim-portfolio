import crypto from 'crypto';

// Shared session helpers for the admin panel.
// Session cookie: qa_admin = base64url(username|expiryMs) + "." + HMAC-SHA256(secret, payload)

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > -1) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

export function signSession(username) {
  const secret = process.env.ADMIN_SECRET;
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${username}|${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifySession(req) {
  const secret = process.env.ADMIN_SECRET;
  const expectedUser = process.env.ADMIN_USER;
  if (!secret || !expectedUser) return null;
  const token = parseCookies(req).qa_admin;
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  let payload;
  try {
    payload = Buffer.from(token.slice(0, dot), 'base64url').toString('utf8');
  } catch (e) {
    return null;
  }
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const [user, expStr] = payload.split('|');
  const exp = Number(expStr);
  if (user !== expectedUser) return null;
  if (!exp || Date.now() > exp) return null;
  return user;
}
