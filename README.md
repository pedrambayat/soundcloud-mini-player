# SoundCloud Mini

A compact, charcoal SoundCloud controller for desktop Chromium browsers, designed for Dia. Artwork, track and artist, play/pause, previous/next, seeking, volume, a like/unlike heart, and a hide button.

## Install in Dia

1. Open `chrome://extensions` in Dia (Dia may rewrite the address).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this `soundcloud-mini-player` folder, the one containing `manifest.json`.
4. Reload your SoundCloud tab.
5. Start a track, then click **Mini-player** above SoundCloud’s bottom playback bar.

The window stays on top of other apps using the browser’s Document Picture-in-Picture API. Drag its title bar to move it and resize it from its edges. The browser supplies the title bar and controls its position.

Click the **heart** to like or unlike the current track. A filled orange heart means it is liked; it stays in sync with SoundCloud as you change tracks. Sign in through SoundCloud if prompted.

Click **−**, press **Escape** inside the player, or close the player window to hide it. Playback continues in the original tab. Return to SoundCloud and click **Mini-player** to restore it. The extension icon also contains these instructions and a link to SoundCloud.

The SoundCloud tab must remain open. Reloading or closing that tab also closes its pop-out window. The browser only allows one Document Picture-in-Picture window at a time, so another PiP session may replace this one. OS full-screen spaces may affect which desktop displays it.

## Privacy and compatibility

The extension runs only on `https://soundcloud.com` and `https://www.soundcloud.com`. It has no analytics, account access, API keys, external scripts, or backend. It reads the existing player and operates SoundCloud’s controls. Artwork loads from SoundCloud’s CDN.

Uses Manifest V3. The preview successfully opened a Document Picture-in-Picture window in the installed Dia browser on October 4, 2026. If unavailable or blocked on another version, the launcher shows a message. SoundCloud’s player markup can change and require an adapter update; no private API or audio extraction is used.

## Development and verification

No build step or dependencies. `core.js` provides data helpers, `player.js` renders the UI, and `content.js` connects it to SoundCloud.

Run helper tests with `npm test`. Open `tests/preview.html` for an interactive demo of the actual player component and browser PiP support. The preview uses sample metadata; it does not play audio or connect to SoundCloud.

For a live check after installation: play/pause, previous/next, seek, change volume, change tracks in the original tab, hide without interrupting playback, restore, and switch to another app. Check both long track titles and a long mix.

Verified in the installed Dia browser on October 4, 2026: five Node tests, thirteen interactive component checks, and sixteen live SoundCloud checks passed. Live checks cover artwork, metadata, play/pause, seeking, precise volume, mute/unmute, next/previous, like/unlike state synchronization, and hiding without stopping playback. The final test leaves playback paused.

For explicit live testing, run `node tests/toggle-live-checks.cjs --enable`, reload the extension in Dia, then reload SoundCloud. Click **Run live checks** in the temporary panel. This changes playback, seek position, volume, and the current queue track and its like state while testing; it attempts to restore the starting track, position, volume, and like state and leaves playback paused. Use only when you are ready for playback to change. Run `node tests/toggle-live-checks.cjs --disable` and reload both the extension and SoundCloud afterward. The normal manifest never loads the test panel.

The preview and tests require no third-party dependencies. Serve the project on localhost to test `tests/preview.html`. No server is needed for normal extension use.

The browser controls PiP positioning and behavior across macOS full-screen spaces. Normal PiP operation was verified; behavior on every display/Space configuration is not guaranteed.
