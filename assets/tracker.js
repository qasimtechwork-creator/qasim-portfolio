/* Qasim Kayani portfolio — lightweight analytics beacon.
   Sends pageviews, link clicks and video plays to /api/track.
   No cookies, no personal data; purely anonymous counts. */
(function () {
  var EP = '/api/track';
  function send(d) {
    try {
      var body = JSON.stringify(d);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(EP, new Blob([body], { type: 'application/json' }));
      } else if (window.fetch) {
        fetch(EP, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* never break the page */ }
  }

  send({ t: 'pv', p: location.pathname, r: document.referrer || '' });

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a && a.href) {
      var label = (a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      send({ t: 'click', p: location.pathname, u: a.href, l: label });
    }
  }, true);

  function bindVideos(scope) {
    (scope || document).querySelectorAll('video').forEach(function (v) {
      if (v.dataset.qtrk) return;
      v.dataset.qtrk = '1';
      v.addEventListener('play', function () {
        if (v.dataset.qplayed) return;
        v.dataset.qplayed = '1';
        send({ t: 'play', p: location.pathname, u: v.getAttribute('src') || '', l: (v.getAttribute('aria-label') || '').slice(0, 120) });
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bindVideos(document); });
  } else {
    bindVideos(document);
  }
})();
