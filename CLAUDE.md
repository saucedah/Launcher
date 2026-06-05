# Launcher — project context for Claude

Static single-page "My Apps" launcher. One bookmark on the phone home screen → tiles for every PWA the user has built (notes, workout, etc.). Source on HGFS via symlink: `~/projects/launcher/`.

## Files
- `index.html` — the entire app. The `const APPS = [ ... ]` array near the top defines every tile.
- `sw.js` — minimal service worker for offline.
- `manifest.json` — PWA manifest.
- `icon.svg` — app icon.

## Adding / editing an app tile
Edit `APPS` in `index.html`. Each entry:
```js
{ name, icon, desc, url, status: 'live' | 'wip' | 'soon', tint }
```
- `live` → clickable, opens `url`
- `wip` / `soon` → shown but disabled
- No build step.

## Deploy
GitHub Pages or any static host. Free tiers fine — there's no backend.

## Constraints
- Single-file PWA, no frameworks.
- Don't add a backend; the launcher is intentionally just a static page.
