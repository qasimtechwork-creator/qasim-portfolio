import { verifySession } from './_auth.js';
import { list, del } from '@vercel/blob';

// TEMPORARY diagnostic endpoint (admin-auth required). Delete after use.
// GET /api/diag?action=wipe&day=YYYY-MM-DD deletes that day's event files (test cleanup).
export default async function handler(req, res) {
  if (!verifySession(req)) {
    res.status(401).json({ ok: false });
    return;
  }
  const action = req.query && req.query.action;
  const day = (req.query && req.query.day) || '';
  const out = { env: { blobTokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN } };
  try {
    const l = await list({ prefix: 'events/' });
    out.listOk = true;
    out.blobCount = l.blobs.length;
    out.pathnames = l.blobs.map((b) => b.pathname);
  } catch (e) {
    out.listError = String((e && e.message) || e);
  }
  if (action === 'wipe' && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
    try {
      const l = await list({ prefix: `events/${day}-` });
      const paths = l.blobs.map((b) => b.pathname);
      if (paths.length) await del(paths);
      out.wiped = paths;
    } catch (e) {
      out.wipeError = String((e && e.message) || e);
    }
  }
  res.status(200).json(out);
}
