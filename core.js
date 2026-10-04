(function (root) {
  'use strict';
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function parseTime(value) {
    const text = String(value ?? '').trim();
    if (!/^\d+:\d{2}(?::\d{2})?$/.test(text)) return null;
    return text.split(':').reduce((n, part) => n * 60 + Number(part), 0);
  }
  function formatTime(value) {
    const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = String(seconds % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  }
  function fraction(value, duration) {
    return Number.isFinite(value) && Number.isFinite(duration) && duration > 0
      ? clamp(value / duration, 0, 1) : 0;
  }
  function volumeY(bounds, ratio) {
    // SoundCloud subtracts 4 CSS pixels before converting a drag position to volume.
    return bounds.bottom - bounds.height * clamp(ratio, 0, 1) + 4;
  }
  function artworkURL(value) {
    const text = String(value ?? '').trim();
    const match = /^url\(["']?(.*?)["']?\)$/.exec(text);
    try {
      const url = new URL(match ? match[1] : text);
      return url.protocol === 'https:' && /(^|\.)sndcdn\.com$/.test(url.hostname) ? url.href : '';
    } catch { return ''; }
  }
  const api = { clamp, parseTime, formatTime, fraction, artworkURL, volumeY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SCMiniCore = api;
})(globalThis);
