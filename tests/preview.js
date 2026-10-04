'use strict';
const tracks = [
  { title:'Weightless', artist:'Sunday evening radio', duration:284 },
  { title:'A very long title for a very slow Sunday evening mix', artist:'After hours', duration:3723 }
];
let track = 0;
let empty = false;
let elapsed = 94;
let playing = true;
let volume = .65;
let muted = false;
let pip;
const status = document.querySelector('#status');
const adapter = {
  read: () => ({ ...tracks[track], title:empty ? '' : tracks[track].title, artist:empty ? '' : tracks[track].artist, artwork:'', elapsed:empty ? 0 : elapsed, duration:empty ? 0 : tracks[track].duration, playing:!empty && playing, volume, muted,
    controls:Object.fromEntries(['play','previous','next','mute','seek','volume'].map(k=>[k,!empty])) }),
  play() { playing = !playing; status.textContent = playing ? 'Playing (demo)' : 'Paused (demo)'; },
  previous() { track = (track + 1) % tracks.length; elapsed = 0; },
  next() { track = (track + 1) % tracks.length; elapsed = 0; },
  seek(value) { elapsed = value * tracks[track].duration; },
  volume(value) { volume = value; muted = value === 0; },
  mute() { muted = !muted; }
};
const preview = SCMiniPlayer.mount(document, adapter, () => {
  preview.host.hidden = true;
  status.textContent = 'Hidden. Playback state is unchanged. Click Pop out to restore.';
});
document.body.insertBefore(preview.host, document.querySelector('footer'));
document.querySelector('#pop').onclick = async () => {
  preview.host.hidden = false;
  if (pip && !pip.closed) { pip.focus(); return; }
  if (!window.documentPictureInPicture) { status.textContent = 'Document Picture-in-Picture is unavailable in this browser.'; return; }
  try {
    pip = await documentPictureInPicture.requestWindow({width:320,height:238});
    const active = pip;
    active.document.title = 'SoundCloud Mini';
    active.document.documentElement.style.cssText = 'background:#1b1c20;color-scheme:dark';
    active.document.body.style.margin = '0';
    const component = SCMiniPlayer.mount(active.document, adapter, () => active.close());
    active.addEventListener('pagehide', () => {
      component.dispose();
      status.textContent = `Player hidden; demo is still ${playing ? 'playing' : 'paused'}.`;
    }, {once:true});
    status.textContent = 'Always-on-top window opened. Hide it with − or Escape.';
  } catch (error) { status.textContent = `Pop-out failed: ${error.name}.`; }
};
document.querySelector('#empty').onclick = () => { empty = !empty; preview.update(); };
document.querySelector('#check').onclick = () => {
  const results = [];
  const assert = (condition, name) => { results.push(`${condition ? 'PASS' : 'FAIL'} ${name}`); };
  const $ = selector => preview.host.shadowRoot.querySelector(selector);
  empty = false; playing = true; track = 0; elapsed = 94; preview.update();
  $('.play').click(); preview.update();
  assert(!playing && $('.play').getAttribute('aria-label') === 'Play', 'Play/pause updates the adapter and accessible label');
  $('.next').click(); preview.update();
  assert($('.title').textContent.includes('A very long title') && $('.duration').textContent === '1:02:03', 'Track changes refresh title and long duration');
  $('.seek').value = 500; $('.seek').dispatchEvent(new Event('change')); preview.update();
  assert(elapsed === 1861.5, 'Seek sends the correct fraction to the adapter');
  $('.seek').focus(); elapsed = 100; preview.update();
  assert(Number($('.seek').value) === 27, 'Progress keeps updating after using the seek bar');
  $('.seek').blur();
  $('.level').value = 30; $('.level').dispatchEvent(new Event('change')); preview.update();
  assert(volume === .3, 'Volume changes reach the adapter');
  muted = false; $('.mute').click(); preview.update();
  assert(muted && $('.mute').getAttribute('aria-label') === 'Unmute', 'Mute label follows playback state');
  empty = true; preview.update();
  assert($('.play').disabled && $('.seek').disabled && $('.title').textContent === 'Choose a track', 'Empty state disables unavailable controls');
  empty = false; playing = true; preview.update(); $('.hide').click();
  assert(playing && preview.host.hidden, 'Hide keeps playback running');
  preview.host.hidden = false;
  track = 0; elapsed = 94; volume = .65; muted = false; preview.update();
  document.querySelector('#results').textContent = results.join('\n');
  status.textContent = `${results.filter(r => r.startsWith('PASS')).length}/${results.length} component checks passed.`;
};
