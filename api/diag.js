import { verifySession } from './_auth.js';
import { put, list } from '@vercel/blob';

// TEMPORARY diagnostic endpoint (admin-auth required). Delete after use.
export default async function handler(req, res) {
  if (!verifySession(req)) {
    res.status(401).json({ ok: false });
    return;
  }
  const out = {
    env: {
      blobTokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobStorePresent: !!process.env.BLOB_STORE_ID
    }
  };
  try {
    const l = await list({ prefix: 'events/' });
    out.listOk = true;
    out.blobCount = l.blobs.length;
  } catch (e) {
    out.listError = String((e && e.message) || e);
  }
  try {
    const p = await put('diag/test.json', JSON.stringify({ t: Date.now() }), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });
    out.putOk = true;
    out.putPathname = p.pathname;
  } catch (e) {
    out.putError = String((e && e.message) || e);
  }
  res.status(200).json(out);
}
