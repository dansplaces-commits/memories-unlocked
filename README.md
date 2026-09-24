# Memories Unlocked

Memories Unlocked is a digital memory, travel and legacy app built around one idea:

> Every place has a story.

The app lets people create journeys, pin meaningful places, capture memories, leave clues and messages, and allow family or followers to retrace those footsteps later.

## Current product baseline

This branch is the design-and-function readiness pass that aligns the app with the approved Memories Unlocked website baseline while preserving the existing Supabase-backed journeys, memories, map, follow and account flows.

### Desktop

- Approved split scenic hero and typography
- Start Your Journey CTA
- Watch the Video animated explainer
- Explore / Capture / Share / Leave a legacy benefit strip
- Five-step How It Works flow
- Live journey, memory and map data beneath the master composition
- Compact movable dock
- Premium cosmetic polish across navigation, journey cards, memory rows, forms and account surfaces
- Upgraded Memory Map with Street, Satellite, Terrain and Explorer modes
- Optional My Location map control that only requests browser location when the user presses it
- Top-right latest-place chip linking back into the relevant memory/journey map

### Mobile / tablet

The existing mobile-first app UI remains in place so core app behaviour is not destabilised. A responsive “See how Memories Unlocked works” launcher gives mobile users the same animated explainer experience as desktop. The map style controls and latest-place chip also adapt to smaller screens.

### Account safety

This work sits on top of the account-boundary branch, keeping account-scoped cache protection and the current sign-in / sign-out safety work in place.

## Product build additions — 16 September 2026

The working branch `polish/app-2026-09-16` now includes additive product layers on top of the approved shell:

- Secure journey cover photos and memory photos using private Supabase Storage paths and signed URLs.
- JPEG, PNG and WebP validation with an 8 MB maximum upload size.
- Photo preview, replace and remove controls without changing existing journey or memory records when media is unavailable.
- Journey and memory editing with cloud-first save confirmation.
- A premium Create Journey / Add Memory flow with guidance, character counters and optional photo selection before creation.
- Reversible Archive / Restore controls and an Archived Stories manager. Archived content is hidden from the normal lists, map and counters rather than permanently deleted.
- Updated PWA/service-worker caching for the additive product layers.

### Supabase activation completed — 16 September 2026

The existing `Memories Unlocked` Supabase project (`fdjzelcqilupxibqsqep`) has now been updated with both additive migrations:

1. `media_storage`
   - added `journeys.cover_photo_path` and `memories.photo_path`.
   - created the private `memory-media` bucket.
   - set the bucket to an 8 MB maximum and JPEG/PNG/WebP only.
   - added owner-folder scoped SELECT/INSERT/UPDATE/DELETE storage policies.
2. `archive_support`
   - added nullable `archived_at` timestamps to journeys and memories.
   - added owner/archive indexes for both tables.

Post-migration verification confirmed that existing records were not rewritten: no existing journeys or memories were marked archived and no media paths were populated automatically. Existing journey and memory RLS remains enabled with owner-scoped policies.

The migrations are recorded in Supabase migration history as `media_storage` and `archive_support`.

## Readiness rule

Do not treat visual polish as a replacement for functional testing. Before promotion to the main app branch, verify:

1. Existing-account sign-in loads the correct journeys and memories.
2. Clean-device sign-in restores the correct cloud data.
3. Direct account switching does not expose the prior account’s cached records.
4. Create Journey, Add Memory, Map and Follow flows still work.
5. Desktop and mobile explainer experiences open, advance, replay and close correctly.
6. Map mode switching works on Street, Satellite, Terrain and Explorer without disturbing saved pins/trails.
7. The latest-place chip opens the correct saved place or journey.
8. A journey cover can be uploaded, replaced and removed.
9. A memory photo can be uploaded, replaced and removed.
10. Journey and memory edits persist after a full sign-out/sign-in cycle.
11. Archived journeys and memories remain hidden after signing in on another device and can be restored.
12. Creation forms remain usable at 320px, 390px, tablet and desktop widths.

The approved website remains the visual source of truth for future refinement.

## Safe polish review — 16 September 2026

Continue only on `polish/app-2026-09-16`. The approved source is
`locked/app-2026-09-16`; do not merge or promote without Dan's visual approval.

This pass gives passport stamps their own card/detail space, displays genuine
saved dates (or “Undated”), and keeps complete location names outside the stamp.
Map controls gain Escape/outside-click dismissal, matching expanded state,
visible keyboard focus, and protection from obsolete tile-load errors.

Run the isolated logic regressions with `node --test tests/polish-unit.cjs`.
They cover escaped stamp text, dates, record preservation, cache boundaries,
all four map styles, disclosure state, and safe tile fallback. They are unit
tests, not a replacement for browser or real-account verification.

For local visual QA, run `node tests/preview-server.cjs` and open
`http://127.0.0.1:4173/__qa`. This local-only harness seeds fictional records,
omits the Supabase SDK/config, blocks external API connections, and disables
service workers. Do not use it to assess cloud connectivity or sign-in.
Check 320px, 390px, 768px, 1024px, 1180px and desktop widths, including long
titles/places, missing dates, card/detail navigation and keyboard access.

Desktop/mobile visual approval and the real-device account checks above remain
release gates. Keep the marketing website and production app unchanged until approved.
