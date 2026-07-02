# launcher — info
_Migrated from global memory (reference_deployed_apps) on 2026-06-26._

---
name: reference_deployed_apps
description: "Quick index of the user's live app URLs (the launcher is the on-phone version of this list)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 133c4a8d-7add-4ce8-96ff-2e3757860466
---

Live apps as of 2026-06-06. The on-phone version of this list is the [[project_launcher]] at https://launcher-79q.pages.dev (tap to open, Copy button per app). Per [[feedback_register_apps_in_launcher]], add any newly-deployed app to the launcher + redeploy.

| App | URL | Host |
|-----|-----|------|
| MY ONE NOTES | https://my-one-notes.saucedah.workers.dev | CF Worker `my-one-notes` + D1 + R2 ([[project_my_one_notes]]) — OneNote-style notes, all block types, search, import/export; LIVE 2026-06-16 |
| Voice Dictation | https://voice-dictation.saucedah.workers.dev | CF Worker `voice-dictation` ([[project-voice-dictation]]) — tap/talk/copy, Groq Whisper |
| Sejong — Korean | https://korean.saucedah.workers.dev | CF Worker `korean` ([[project-korean]]) — Korean course, offline |
| Trainer | https://trainer.saucedah.workers.dev | Gym-trainer clients/schedule/payments PWA |
| Launcher ("My Apps") | https://launcher-79q.pages.dev | CF Pages `launcher` |
| GPS — My Places | https://gps.saucedah.workers.dev | CF Worker `gps` |
| Lunch Menu | https://lunch-menu.saucedah.workers.dev | CF Worker `lunch-menu` |
| Notes | https://notes.saucedah.workers.dev | CF Worker `notes` |
| PhotoText | https://phototext.saucedah.workers.dev | CF Worker (`text-from-photo` repo) |
| Workout | https://workout-8ol.pages.dev | CF Pages |
| Transcriber | https://home-linux.tailca46f1.ts.net | home box + Tailscale Funnel ([[project_transcriber]]) |
| Puente al Alma (podcast) | https://puentealalma.pages.dev | CF Pages `puentealalma` |
| Book Builder | https://book-builder.saucedah.workers.dev | CF Worker `book-builder` ([[project_book_builder]]) |
| Meditation | https://meditation-9fz.pages.dev | CF Pages `meditation` ([[project_meditation]]) |
| Template Library | https://design-templates.pages.dev | CF Pages `design-templates` ([[project_design_templates]]) — 200 React templates |

CF account `b56c54a445fb611a390dc0b86a8122a2`; deploys use the token in [[reference_credentials_index]] (`~/.cloudflare-token`). CF Pages projects auto-get a `-xxx` suffix on the `*.pages.dev` hostname when the bare name is taken — capture the real URL from the deploy output.


---

## Migrated from global memory (project_launcher) — 2026-06-26

---
name: ""
metadata: 
  node_type: memory
  originSessionId: 133c4a8d-7add-4ce8-96ff-2e3757860466
---

**Launcher** (`~/projects/launcher/`) — single-page "My Apps" hub the user bookmarks/adds to Home Screen. Each app is a card: tap to open, **Copy** button grabs the URL (the user's main ask — easy copy/paste of app addresses). Edit the `const APPS = [...]` array in `index.html`; `status: 'live'|'wip'|'soon'`.

**Live at:** https://launcher-79q.pages.dev/ (CF Pages project `launcher`, account b56c54a445fb611a390dc0b86a8122a2). Redeploy: `export CLOUDFLARE_API_TOKEN=$(cat ~/.cloudflare-token) && wrangler pages deploy . --project-name launcher --branch main --commit-dirty=true`. SW is network-first for the page so list updates show immediately.

**Convention going forward:** whenever a new app is deployed, add it to the launcher's APPS array and redeploy. Apps listed (2026-06-05): GPS, Lunch Menu, Notes, PhotoText, Workout, Transcriber, Puente al Alma (all live); Book Builder + Meditation (not deployed). See [[reference_credentials_index]] for the Cloudflare token, [[project_transcriber]].

## Domain consolidation — PENDING (paused 2026-06-27)
Goal: put the 16 live apps on saucedah.com (`<app>.saucedah.com`).
**Blocker = two separate Cloudflare accounts:**
- Apps (14 Workers + 7 Pages) live in **Saucedah@gmail.com** acct `b56c54a445fb611a390dc0b86a8122a2` (deploy token `~/claude-data/secrets/cloudflare-token` works here, no zones).
- Domain **saucedah.com** lives in **Pedrosauceda@hotmail.com** acct `176b2939730d54062c2b0107fad87131`, zone `6599c64a091ccc1f0131b3d651f50f65`, on **Cloudflare Registrar** (can't easily move out). Token `~/claude-data/shared/cf-domain-token.txt` works here (DNS+Workers+Pages edit), no apps.
**Decision (Jose, to execute later): CONSOLIDATE** — move the 21 apps INTO the hotmail/domain account, then bind native custom domains.
**To resume, need:** a deploy/edit API token for the hotmail acct `176b29…` (Workers Scripts + Pages + KV) → redeploy each app there (+ migrate KV/secrets) → bind `<app>.saucedah.com` → update this launcher's URLs + redeploy.
Excluded from public domain: **mail-archive** (tailnet-only, firm). jellyseerr already on `jellyseerr.saucedah.com` via Tunnel+Access (the template for any self-hosted ones).
