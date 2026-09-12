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
{ name, icon, desc, url, status: 'live' | 'wip' | 'soon', tint, retired? }
```
- `live` → clickable, opens `url`
- `wip` / `soon` → shown but disabled
- No build step.

## Tabs: Active / Retired
Two views, switched by the top segmented control (the sort seg below it applies
within whichever view is showing).

**To retire an app, add `retired: true` to its entry** — that is the only change
needed. It leaves the Active grid, appears under Retired (greyed out, RETIRED
chip, still openable if the URL is still up) and bumps the count badge on the
tab. Un-retiring is just removing the flag; nothing is ever deleted.

Retired tiles are deliberately **not pinnable** — the pin badge and the status
chip share the same top-left slot, so rendering both would overlap. Pins only
drive the Active "Top" order, which is why retired tiles skip the pin button and
the long-press/right-click handler.

The view is **not persisted**: the launcher always opens on Active, so the
graveyard is never what you land on. The sort choice *is* persisted, as before.

## Deploy
GitHub Pages or any static host. Free tiers fine — there's no backend.

## Constraints
- Single-file PWA, no frameworks.
- Don't add a backend; the launcher is intentionally just a static page.
