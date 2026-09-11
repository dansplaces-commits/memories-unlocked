# Memories Unlocked

A personal memory and legacy app: preserve meaningful places, journeys and stories so loved ones can eventually follow in your footsteps. Keep the emotional purpose central.

## Current development

The working branch adds Supabase email/password accounts, private journeys and written memories. It preserves the navy/gold visual identity, supports past dates and future dream destinations, and links a private map to the chronological timeline. Journey and memory pins can use validated downloadable/importable colour packs. Memories can also carry an optional owner-only clue for someone following the journey later. Photos, invitations, location/time unlocking and deletion remain separate phases.

**This is a development build, not a production-ready release.** The live Supabase migration and authenticated end-to-end saving are still pending. See [project status](docs/PROJECT_STATUS.md).

## Files

- `index.html`, `styles.css`: accessible forms, collection views and existing brand.
- `config.js`: project URL and public publishable key; never use a secret/service-role key.
- `data.js`: validation and owner-scoped persistence operations.
- `app.js`: Supabase SDK integration, session state, dialogs and safe text rendering.
- `supabase/001_private_collection.sql`: first database migration; private ownership rules.
- `supabase/004_location_pins.sql`, `supabase/005_journey_status.sql`, `supabase/006_private_clues.sql`, `supabase/007_private_photo_deletion.sql`: optional coordinates, journey states, owner-only memory clues and photo deletion.
- `map.js`, `pin-packs.js`, `timeline.js`: Leaflet map, validated pin packs and linked timeline rendering.
- `tests/data.test.cjs`: dependency-free Node tests for validation and persistence failures.
- `tests/pins.test.cjs`, `tests/pins-schema.test.cjs`: pin-pack and isolated migration checks.
- `tests/schema.test.cjs`: optional isolated PostgreSQL security/constraint checks using PGlite.
- `docs/BUILD_PLAYBOOK.md`: reusable setup and handover process.

## Run and check

This is a static website; there is no framework build step. Serve the repository root over HTTP for local development, or HTTPS on the existing host. Opening `index.html` as a local file is not a supported authentication workflow.

Run `node --test tests/data.test.cjs tests/app.test.cjs tests/export.test.cjs tests/book.test.cjs tests/photos.test.cjs tests/timeline.test.cjs tests/pins.test.cjs`, then `node --check app.js`, `node --check data.js`, `node --check map.js`, `node --check pin-packs.js` and `git diff --check`.

For the optional SQL tests, install `@electric-sql/pglite` in an isolated development directory and point `MEMORIES_PGLITE_MODULE` at its absolute package directory before running `node tests/schema.test.cjs`, `node tests/photos-schema.test.cjs` or `node tests/pins-schema.test.cjs`. These tests do not access live Supabase or send email.

## One-time Supabase setup

1. Open the correct project: `fdjzelcqilupxibqsqep`.
2. Inspect the table list. If `journeys` or `memories` already exists, inspect its schema before proceeding. Do not drop existing tables.
3. In SQL Editor, run the complete contents of `supabase/001_private_collection.sql` once. It creates both tables, indexes, constraints and ownership policies in a transaction. A second run intentionally fails safely rather than silently modifying existing tables.
4. Apply the reviewed follow-on migrations in order: `002_owner_editing.sql`, `003_private_photos.sql`, `004_location_pins.sql`, `005_journey_status.sql`, `006_private_clues.sql`, then `007_private_photo_deletion.sql`. Inspect existing schema/buckets before applying; do not delete tables or replace a bucket with different settings.
5. Keep email confirmation enabled. Set Authentication URL Configuration > Site URL to the verified application URL before testing account confirmation. A GitHub repository URL is not an application URL.
6. Use a preview deployment to create two test accounts, confirm email, save and reload each collection, then test account isolation before releasing. Verify a journey pin, future-trip state, timeline jump and pin-pack download/import on desktop and mobile.

GitHub source writes and Supabase database administration are separate permissions. No database password or admin token is stored here. The publishable key does not grant database-administration access.
# Latest draft update — 10 September 2026

See `docs/PROJECT_STATUS.md` for the current handover. Dan has verified original sign-in, saving, refresh, cross-device access and sign-out behavior. The local draft now includes password change/recovery, editing, exports, private photo handling with owner-only deletion, map pins, future-trip states, linked timeline navigation and private legacy clues; live verification still depends on applying the reviewed migrations and publishing the branch.

To enable the full current slice, apply the reviewed migrations in order after the existing initial setup: `002_owner_editing.sql`, `003_private_photos.sql`, `004_location_pins.sql`, `005_journey_status.sql`, `006_private_clues.sql`, and `007_private_photo_deletion.sql`. Do not rerun 001 or delete existing tables. The draft includes focused application tests and isolated PGlite schema checks. Live second-account privacy testing remains blocked by email rate limits; confirmation must remain enabled. This update is not a production release.
