const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

test('reads elapsed times without interpreting missing values as a song', () => {
  assert.equal(core.parseTime('3:24'), 204);
  assert.equal(core.parseTime('1:02:03'), 3723);
  assert.equal(core.parseTime(''), null);
  assert.equal(core.parseTime('Live'), null);
});

test('formats a long mix and rejects invalid duration', () => {
  assert.equal(core.formatTime(3723), '1:02:03');
  assert.equal(core.formatTime(204.9), '3:24');
  assert.equal(core.formatTime(NaN), '0:00');
});

test('keeps seeking inside the track and rejects unknown duration', () => {
  assert.equal(core.fraction(300, 200), 1);
  assert.equal(core.fraction(-5, 200), 0);
  assert.equal(core.fraction(30, 120), 0.25);
  assert.equal(core.fraction(30, 0), 0);
});

test('accepts only SoundCloud artwork, not arbitrary or executable URLs', () => {
  assert.equal(core.artworkURL('url("https://i1.sndcdn.com/artworks-example-t50x50.jpg")'), 'https://i1.sndcdn.com/artworks-example-t50x50.jpg');
  assert.equal(core.artworkURL('https://i1.sndcdn.com/art.jpg'), 'https://i1.sndcdn.com/art.jpg');
  assert.equal(core.artworkURL('javascript:alert(1)'), '');
  assert.equal(core.artworkURL('https://example.com/track.jpg'), '');
  assert.equal(core.artworkURL('none'), '');
});

test('volume pointer aligns with SoundCloud’s four-pixel drag offset', () => {
  const bounds = { top: 500, bottom: 620, height: 120 };
  assert.equal(core.volumeY(bounds, 0.3), 588);
  assert.equal(core.volumeY(bounds, 0), 624);
  assert.equal(core.volumeY(bounds, 1), 504);
  assert.equal(core.volumeY(bounds, 2), 504);
});
