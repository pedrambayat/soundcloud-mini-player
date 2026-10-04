# SoundCloud Mini

This is a standalone private browser-extension repository at `~/soundcloud-mini-player`. It is not part of the Obsidian second-brain vault.

- Manifest V3; no dependencies, build pipeline, backend, or account credentials.
- `content.js` adapts SoundCloud's existing DOM controls. `player.js` renders the shared mini-player. `core.js` contains pure helpers.
- Keep permissions limited to the SoundCloud content-script match patterns.
- Run `npm test` and JavaScript syntax checks after functional changes. Use `tests/preview.html` for component checks.
- Live checks are opt-in: `node tests/toggle-live-checks.cjs --enable`. They change playback. Disable them before committing or shipping and reload the extension.
- Never commit logged-in browser screenshots, private metadata, credentials, or fetched third-party bundles. Keep local evidence in `.local/` (ignored).
- Keep the GitHub repository private.
