# KLBB 2027 — Festival Playground

Source snapshot of the KLBB 2027 public microsite, originally developed with ChatGPT Sites.

- Source revision: ChatGPT Sites version 19, commit `4ea4977de38b1098ef1d6200c562bd41f57c24b5`
- Original live site: https://klbb-2027-festival-playground.aviyansah.chatgpt.site/
- Website files: `dist/` (static HTML, CSS, JavaScript, images, and video)
- Deployment: deploy `dist/` as a static directory (for example, Cloudflare Pages with build output directory `dist` and no build command).

This repository is a separate working copy. The original ChatGPT Sites project remains unchanged and online.

## Current preview state

- Rundown: two-day interactive schedule with proposed WIB time slots; organizer confirmation is still required before treating the schedule as final.
- Food Market: one-row scrolling tenant carousel on the home page, linking to `dist/tenants.html` with searchable 39-tenant index.
- Tenant names/logos: reference assets from KLBB 2026 Figma; **not a confirmed 2027 tenant lineup**. Three original wordmarks were provided as text rather than image logos. Order links are intentionally not published until official URLs are confirmed.
- Source: continue editing `dist/`. Cloudflare Pages should use `dist` as its output directory.
