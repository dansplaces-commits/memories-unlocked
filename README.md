# Memories Unlocked

A personal memory and legacy app: preserve meaningful places, journeys and stories so loved ones can eventually follow in your footsteps. Keep the emotional purpose central.

## Current development

The working branch adds Supabase email/password accounts, private journeys and written memories. It preserves the navy/gold visual identity, supports past journey dates, and replaces demo memories with account data. Maps, photos, invitations, location/time unlocking, editing/deletion and account recovery are not implemented yet.

**This is a development build, not a production-ready release.** The live Supabase migration and authenticated end-to-end saving are still pending. See [project status](docs/PROJECT_STATUS.md).

## Files

- `index.html`, `styles.css`: accessible forms, collection views and existing brand.
- `config.js`: project URL and public publishable key; never use a secret/service-role key.
- `data.js`: validation and owner-scoped persistence operations.
- `app.js`: Supabase SDK integration, session state, dialogs and safe text rendering.
- `supabase/001_private_collection.sql`: first database migration; private ownership rules.
- `tests/data.test.cjs`: dependency-free Node tests for validation and persistence failures.
- `tests/schema.test.cjs`: optional isolated PostgreSQL security/constraint checks using PGlite.
- `docs/BUILD_PLAYBOOK.md`: reusable setup and handover process.

## Run and check

This is a static website; there is no framework build step. Serve the repository root over HTTP for local development, or HTTPS on the existing host. Opening `index.html` as a local file is not a supported authentication workflow.

Run `node --test tests/data.test.cjs`, `node --check app.js`, `node --check data.js` and `git diff --check`.

For the optional SQL test, install `@electric-sql/pglite` in an isolated development directory and point `MEMORIES_PGLITE_MODULE` at its absolute package directory before running `node tests/schema.test.cjs`. The test does not access live Supabase or send email.

## One-time Supabase setup

1. Open the correct project: `fdjzelcqilupxibqsqep`.
2. Inspect the table list. If `journeys` or `memories` already exists, inspect its schema before proceeding. Do not drop existing tables.
3. In SQL Editor, run the complete contents of `supabase/001_private_collection.sql` once. It creates both tables, indexes, constraints and ownership policies in a transaction. A second run intentionally fails safely rather than silently modifying existing tables.
4. Keep email confirmation enabled. Set Authentication URL Configuration > Site URL to the verified application URL before testing account confirmation. A GitHub repository URL is not an application URL.
5. Use a preview deployment to create two test accounts, confirm email, save and reload each collection, then test account isolation before releasing.

GitHub source writes and Supabase database administration are separate permissions. No database password or admin token is stored here. The publishable key does not grant database-administration access.
# Latest draft update — 9 September 2026

See `docs/PROJECT_STATUS.md` for the current handover. Dan has verified original sign-in, saving, refresh, cross-device access and sign-out behavior. The next draft slice adds password change/recovery and editing; those new flows still need live verification.

To enable editing, run **only** `supabase/002_owner_editing.sql` after the existing initial setup. Do not rerun 001 or delete tables. The draft includes 16 focused tests (`node --test tests/data.test.cjs tests/app.test.cjs`) and an extended isolated schema test. Live second-account privacy testing remains blocked by email rate limits; confirmation must remain enabled. This update is not a production release.
