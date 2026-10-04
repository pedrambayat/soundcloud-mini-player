(function () {
  'use strict';
  if (document.getElementById('sc-mini-launcher')) return;
  const { parseTime, artworkURL, clamp, volumeY } = globalThis.SCMiniCore;
  const q = selector => document.querySelector(selector);
  const selectors = {
    play: '.playControls__play', previous: '.playControls__prev', next: '.playControls__next',
    like: '.playbackSoundBadge .sc-button-like',
    mute: '.volume__button', seek: '.playbackTimeline__progressWrapper', volume: '.volume__sliderWrapper'
  };
  function text(selector) {
    const el = q(selector);
    if (!el) return '';
    return (el.querySelector('[aria-hidden="true"]')?.textContent || el.getAttribute('title') || el.textContent || '').trim();
  }
  function available(el) { return !!el && !el.disabled && el.getAttribute('aria-disabled') !== 'true' && !el.classList.contains('m-disabled') && !el.classList.contains('disabled'); }
  function click(name) {
    const el = q(selectors[name]);
    if (!available(el)) return false;
    el.click(); return true;
  }
  function slide(name, ratio) {
    const wrapper = q(selectors[name]);
    if (!available(wrapper)) return false;
    // SoundCloud owns the audio and its queue. Drive its own controls so the two stay in sync.
    const bounds = (name === 'volume' ? q('.volume__sliderBackground') || wrapper : wrapper).getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    const value = clamp(ratio, 0, 1);
    const clientX = name === 'volume' ? bounds.left + bounds.width / 2 : bounds.left + bounds.width * value;
    const clientY = name === 'volume' ? volumeY(bounds, value) : bounds.top + bounds.height / 2;
    const options = { bubbles:true, cancelable:true, view:window, clientX, clientY, button:0 };
    wrapper.dispatchEvent(new MouseEvent('mousedown', { ...options, buttons:1 }));
    wrapper.dispatchEvent(new MouseEvent('mouseup', { ...options, buttons:0 }));
    return true;
  }
  const adapter = {
    read() {
      const title = text('.playbackSoundBadge__titleLink');
      const art = q('.playbackSoundBadge__avatar img') || q('.playbackSoundBadge__avatar [style*="background-image"]') || q('.playbackSoundBadge__avatar .image__full');
      const progress = q('.volume__sliderProgress');
      const volumeSlider = q('.volume__sliderWrapper');
      const max = Number(volumeSlider?.getAttribute('aria-valuemax')) || 1;
      const now = volumeSlider?.getAttribute('aria-valuenow');
      const volume = now !== null && now !== undefined ? Number(now) / max : (parseFloat(progress?.style.height) || 0) / 100;
      return {
        title,
        artist: text('.playbackSoundBadge__lightLink'),
        artwork: artworkURL(art?.currentSrc || art?.src || (art ? getComputedStyle(art).backgroundImage : '')),
        playing: !!q('.playControls__play.playing, .playControls__play[aria-label="Pause current"]'),
        liked: !!q(selectors.like)?.classList.contains('sc-button-selected') || q(selectors.like)?.getAttribute('aria-pressed') === 'true',
        elapsed: parseTime(text('.playbackTimeline__timePassed')) || 0,
        duration: parseTime(text('.playbackTimeline__duration')) || 0,
        volume: Number.isFinite(volume) ? clamp(volume, 0, 1) : 0,
        muted: !!q('.volume.muted, .volume__button[aria-label="Unmute"]') || volume === 0,
        controls: Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name, !!title && available(q(selector))]))
      };
    },
    play: () => click('play'), previous: () => click('previous'), next: () => click('next'), mute: () => click('mute'),
    like: () => click('like'),
    seek: value => slide('seek', value), volume: value => slide('volume', value)
  };
  const host = document.createElement('div');
  host.id = 'sc-mini-launcher';
  host.style.cssText = 'position:fixed;right:20px;bottom:62px;z-index:2147483646;';
  const shadow = host.attachShadow({ mode:'open' });
  shadow.innerHTML = `<style>
    :host { color-scheme:dark; } * { box-sizing:border-box; }
    button { display:flex; align-items:center; gap:8px; height:34px; padding:0 12px; border:1px solid #ffffff23; border-radius:9px; background:#202126; color:#eeeef0; font:500 11px -apple-system,BlinkMacSystemFont,sans-serif; cursor:pointer; box-shadow:0 3px 15px #0002; }
    button:hover { background:#303138; } button:focus-visible { outline:2px solid #ef986a; outline-offset:3px; }
    button svg { width:16px; height:16px; color:#ef986a; }
    p { max-width:260px; color:#eeeef0; background:#202126; padding:12px; border-radius:9px; font:12px/1.5 -apple-system,BlinkMacSystemFont,sans-serif; box-shadow:0 4px 24px #0003; } [hidden] { display:none!important; }
  </style><p role="status" hidden></p><button aria-label="Open mini-player">${globalThis.SCMiniPlayer.icon('pop')}<span>Mini-player</span></button>`;
  document.documentElement.append(host);
  const button = shadow.querySelector('button');
  const message = shadow.querySelector('p');
  let pip = null;
  let opening = false;
  button.addEventListener('click', async () => {
    if (pip && !pip.closed) { pip.close(); return; }
    if (opening) return;
    message.hidden = true;
    if (!window.documentPictureInPicture?.requestWindow) {
      message.textContent = 'This version of Dia doesn’t expose custom pop-out windows. Update Dia, then reload SoundCloud.';
      message.hidden = false; return;
    }
    opening = true;
    try {
      pip = await window.documentPictureInPicture.requestWindow({ width:320, height:238 });
      const active = pip;
      active.document.title = 'SoundCloud Mini';
      active.document.documentElement.style.cssText = 'background:#1b1c20;color-scheme:dark;';
      active.document.body.style.cssText = 'margin:0;background:#1b1c20;';
      const player = globalThis.SCMiniPlayer.mount(active.document, adapter, () => active.close());
      active.focus();
      button.querySelector('span').textContent = 'Hide player';
      button.setAttribute('aria-label', 'Hide mini-player');
      active.addEventListener('pagehide', () => {
        player.dispose();
        if (pip === active) pip = null;
        button.querySelector('span').textContent = 'Mini-player';
        button.setAttribute('aria-label', 'Open mini-player');
      }, { once:true });
    } catch (error) {
      if (pip && !pip.closed) pip.close();
      pip = null;
      message.textContent = 'Couldn’t open the player. Click Mini-player again. If it persists, update Dia and reload this tab.';
      message.hidden = false;
      console.warn('SoundCloud Mini:', error.name);
    } finally { opening = false; }
  });
})();
