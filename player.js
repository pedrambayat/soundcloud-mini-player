(function () {
  'use strict';
  const { formatTime, fraction } = globalThis.SCMiniCore;
  const paths = {
    play: '<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M9 5v14M16 5v14" stroke-width="3.5"/>',
    previous: '<path d="M6 5v14"/><path d="m18 5-10 7 10 7Z" fill="currentColor" stroke="none"/>',
    next: '<path d="M18 5v14"/><path d="m6 5 10 7-10 7Z" fill="currentColor" stroke="none"/>',
    volume: '<path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="M17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    muted: '<path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/>',
    hide: '<path d="M6 12h12"/>',
    pop: '<rect x="3" y="4" width="18" height="16" rx="3"/><rect x="11" y="11" width="7" height="6" rx="1" fill="currentColor" stroke="none"/>',
    wave: '<path d="M4 10v4m4-7v10m4-13v16m4-13v10m4-7v4"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const css = `
    :host { display:block; color-scheme:dark; }
    * { box-sizing:border-box; }
    .mini { --ink:#f0f0f2; --muted:#a3a5ad; --accent:#ef986a; color:var(--ink); background:#1b1c20; font:13px/1.4 -apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif; padding:15px 20px 19px; min-width:260px; width:100%; min-height:220px; }
    .top { display:flex; align-items:center; justify-content:space-between; margin-bottom:13px; height:20px; }
    .brand { display:flex; align-items:center; gap:7px; color:var(--muted); font-size:11px; font-weight:500; }
    .brand svg { width:15px; height:15px; color:var(--accent); }
    button { border:0; background:transparent; color:var(--muted); padding:0; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; cursor:pointer; flex-shrink:0; }
    button:hover { color:var(--ink); background:#ffffff0c; }
    button:focus-visible, input:focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
    button:disabled, input:disabled { opacity:.32; cursor:default; }
    .track { display:flex; align-items:center; gap:13px; min-width:0; }
    .art { width:62px; height:62px; border-radius:9px; overflow:hidden; background:#292b32; color:#777b87; flex-shrink:0; display:grid; place-items:center; }
    .art img { width:100%; height:100%; object-fit:cover; grid-area:1/1; }
    .art>svg { grid-area:1/1; width:29px; height:29px; }
    .info { min-width:0; }
    .title { font-size:15px; line-height:1.35; font-weight:600; letter-spacing:-.25px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0 0 5px; }
    .artist { color:var(--muted); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0; }
    .timeline { margin-top:15px; }
    input[type=range] { appearance:none; -webkit-appearance:none; margin:0; display:block; width:100%; height:16px; background:transparent; cursor:pointer; --progress:0%; }
    input[type=range]::-webkit-slider-runnable-track { height:3px; border-radius:10px; background:linear-gradient(to right,var(--accent) 0 var(--progress),#ffffff20 var(--progress) 100%); }
    input[type=range]::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:9px; height:9px; border-radius:50%; background:var(--accent); margin-top:-3px; opacity:0; }
    input[type=range]:hover::-webkit-slider-thumb, input[type=range]:focus-visible::-webkit-slider-thumb { opacity:1; }
    .times { display:flex; justify-content:space-between; color:var(--muted); font-size:10px; font-variant-numeric:tabular-nums; margin-top:-1px; }
    .bottom { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
    .transport { display:flex; align-items:center; gap:9px; }
    .play { background:#eeeef0; color:#1b1c20; width:36px; height:36px; }
    .play:hover { background:white; color:#1b1c20; }
    .play svg { width:21px; height:21px; }
    .volume { display:flex; align-items:center; gap:5px; width:91px; }
    .volume button { width:24px; height:30px; }
    .volume svg { width:16px; height:16px; }
    .volume input { --accent:#b4b6be; }
    .notice { color:#e9b89e; font-size:11px; margin:12px 0 0; }
    [hidden] { display:none!important; }
    @media (min-height:280px) { .mini { padding-top:22px; padding-bottom:24px; } .art { width:76px; height:76px; } .top { margin-bottom:18px; } .timeline { margin-top:20px; } .bottom { margin-top:15px; } }
    @media (prefers-reduced-motion:no-preference) { button { transition:background .12s,color .12s; } }
  `;
  function mount(doc, adapter, onHide) {
    const host = doc.createElement('div');
    const shadow = host.attachShadow({ mode:'open' });
    shadow.innerHTML = `<style>${css}</style><section class="mini" aria-label="SoundCloud mini-player">
      <header class="top"><span class="brand">${icon('wave')}SoundCloud</span><button class="hide" title="Hide player · music keeps playing" aria-label="Hide player">${icon('hide')}</button></header>
      <div class="track"><div class="art">${icon('wave')}<img hidden alt="" referrerpolicy="no-referrer"></div><div class="info"><h1 class="title">Choose a track</h1><p class="artist">Start listening on SoundCloud</p></div></div>
      <div class="timeline"><input class="seek" type="range" min="0" max="1000" value="0" aria-label="Seek" disabled><div class="times"><span class="elapsed">0:00</span><span class="duration">0:00</span></div></div>
      <div class="bottom"><div class="transport"><button class="previous" aria-label="Previous track" title="Previous track">${icon('previous')}</button><button class="play" aria-label="Play" title="Play">${icon('play')}</button><button class="next" aria-label="Next track" title="Next track">${icon('next')}</button></div><div class="volume"><button class="mute" aria-label="Mute" title="Mute">${icon('volume')}</button><input class="level" type="range" min="0" max="100" value="50" aria-label="Volume"></div></div>
      <p class="notice" role="status" hidden></p>
    </section>`;
    doc.body.append(host);
    const $ = selector => shadow.querySelector(selector);
    let noticeTimer;
    function notify(message) {
      $('.notice').textContent = message;
      $('.notice').hidden = !message;
      doc.defaultView.clearTimeout(noticeTimer);
      if (message) noticeTimer = doc.defaultView.setTimeout(() => notify(''), 5500);
    }
    function act(action, value) {
      try {
        if (adapter[action](value) === false) notify('This control is unavailable. Try it in the SoundCloud tab.');
      } catch { notify('Couldn’t update playback. Check the SoundCloud tab.'); }
    }
    $('.hide').onclick = onHide;
    for (const action of ['previous','next','play','mute']) $('.'+action).onclick = () => act(action);
    const seek = $('.seek');
    const level = $('.level');
    const editing = new Set();
    for (const el of [seek, level]) {
      for (const event of ['pointerdown', 'keydown']) el.addEventListener(event, () => editing.add(el));
      for (const event of ['pointerup', 'pointercancel', 'keyup', 'change', 'blur']) el.addEventListener(event, () => editing.delete(el));
    }
    for (const el of [seek, level]) el.addEventListener('input', () => el.style.setProperty('--progress', `${Number(el.value) / Number(el.max) * 100}%`));
    seek.addEventListener('change', () => act('seek', Number(seek.value) / 1000));
    level.addEventListener('change', () => act('volume', Number(level.value) / 100));
    doc.addEventListener('keydown', event => {
      if (event.key === 'Escape') onHide();
      if (event.code === 'Space' && event.composedPath()[0]?.tagName !== 'INPUT' && event.composedPath()[0]?.tagName !== 'BUTTON') {
        event.preventDefault(); act('play');
      }
    });
    $('.art img').onerror = () => { $('.art img').hidden = true; };
    let oldArt = null;
    let oldPlaying = null;
    let oldMuted = null;
    function update() {
      const state = adapter.read();
      $('.title').textContent = state.title || 'Choose a track';
      $('.title').title = state.title || '';
      $('.artist').textContent = state.artist || 'Start listening on SoundCloud';
      if (state.artwork !== oldArt) {
        oldArt = state.artwork;
        $('.art img').hidden = !oldArt;
        if (oldArt) $('.art img').src = oldArt;
        else $('.art img').removeAttribute('src');
      }
      if (state.playing !== oldPlaying) {
        oldPlaying = state.playing;
        $('.play').innerHTML = icon(state.playing ? 'pause' : 'play');
        $('.play').ariaLabel = $('.play').title = state.playing ? 'Pause' : 'Play';
      }
      if (state.muted !== oldMuted) {
        oldMuted = state.muted;
        $('.mute').innerHTML = icon(state.muted ? 'muted' : 'volume');
        $('.mute').ariaLabel = $('.mute').title = state.muted ? 'Unmute' : 'Mute';
      }
      for (const name of ['play','previous','next','mute']) $('.'+name).disabled = !state.controls?.[name];
      seek.disabled = !state.controls?.seek || !(state.duration > 0);
      level.disabled = !state.controls?.volume;
      if (!editing.has(seek)) {
        seek.value = Math.round(fraction(state.elapsed, state.duration) * 1000);
        seek.style.setProperty('--progress', `${Number(seek.value)/10}%`);
      }
      seek.setAttribute('aria-valuetext', `${formatTime(state.elapsed)} of ${formatTime(state.duration)}`);
      if (!editing.has(level)) {
        level.value = state.muted ? 0 : Math.round(state.volume * 100);
        level.style.setProperty('--progress', `${level.value}%`);
      }
      $('.elapsed').textContent = formatTime(state.elapsed);
      $('.duration').textContent = formatTime(state.duration);
    }
    update();
    const timer = doc.defaultView.setInterval(update, 400);
    return { host, update, dispose() { doc.defaultView.clearInterval(timer); doc.defaultView.clearTimeout(noticeTimer); host.remove(); } };
  }
  globalThis.SCMiniPlayer = { mount, icon };
})();
