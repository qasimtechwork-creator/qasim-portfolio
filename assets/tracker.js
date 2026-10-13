/* Qasim Kayani portfolio — analytics beacon (DISABLED 2026-10-13).
   The per-pageview/click/play POSTs to /api/track were each a Vercel
   serverless invocation plus a Blob write, and burned through the Hobby
   plan's 2,000 monthly Advanced Requests — the account was due to pause
   on 2026-10-14. Tracking is switched off so the sites stay live on the
   free quota. The admin panel, /api/track and all historical stats in the
   Blob store are untouched; only new events stop arriving. Re-enable by
   restoring the beacon version from git history once a free off-Vercel
   analytics option (e.g. Cloudflare Web Analytics) is in place. */
(function () {
  window.__qtrk_disabled = true;
})();
