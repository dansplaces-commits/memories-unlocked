# Memories Unlocked - handover

Updated: 9 September 2026. Owner: Dan (Daniel Sales). Assistant working name: Atlas.

## Product intent

A meaningful digital legacy app inspired by leaving padlocks at special places. Preserve journeys, photographs, dates, personal messages and clues; ultimately let family retrace someone's footsteps. Do not reduce this to a generic travel tracker.

## Confirmed identifiers

- GitHub account: `dansplaces-commits`
- Repository: https://github.com/dansplaces-commits/memories-unlocked
- Default branch: `main`
- Development branch: `fix/incomplete-journey-form`
- Draft pull request: https://github.com/dansplaces-commits/memories-unlocked/pull/1
- Supabase organisation: `uydsbrackcdfsebpogka`
- Supabase project: `fdjzelcqilupxibqsqep`
- Dashboard: https://supabase.com/dashboard/project/fdjzelcqilupxibqsqep
- API URL: https://fdjzelcqilupxibqsqep.supabase.co
- Hosting: existing Vercel project; keep this host and GitHub repository, do not create a replacement Site.
- Draft preview: https://memories-unlocked-git-fix-incomplete-jou-3a0a68-dansplaces-3897.vercel.app
- Production URL: https://memories-unlocked.vercel.app (older main version; draft not merged).

## Confirmed progress

The original repository contained a truncated single HTML file. The first repair completed the form, added a native dialog and labelled mock memories honestly. GitHub initially returned 403 when creating a branch. Dan installed and authorised ChatGPT Codex Connector for the app repository; branch creation, source update and draft PR creation then succeeded.

This development update adds email/password sign-up and sign-in, private journey creation/loading, written memory creation/loading within a journey, backdated calendar dates, paginated collections, safe text rendering and sign-out clearing of private UI state. Draft IDs are reused to avoid duplicate records after a network failure with uncertain commit outcome. User input is retained when persistence fails.

## Verification completed

- Supabase authentication settings: HTTP 200 using the previously supplied public publishable key. Email sign-up enabled and email confirmation required.
- Earlier PGRST205 is resolved: later zero-row REST probes found both tables and returned 42501 permission denied for anonymous access, as intended.
- Dan confirmed live account sign-in, journey and written-memory creation, persistence after full refresh, cross-device access, and clearing/restoring the collection on sign-out/sign-in. No private story content is copied into this public repository.
- Dan changed Supabase Site URL from localhost to the draft preview above and confirmed saving it. A fresh confirmation round-trip remains untested.
- Eleven Node data tests cover creation plus owner-scoped editing, immutable relationship/ownership fields, stale-edit conflicts, signed-out update rejection and permission failures.
- Five isolated UI-controller tests cover email-request cooldown, rate-limit messaging, password confirmation/current-password verification, recovery events and session loss (16 focused tests total). These use fake elements/services, not browser automation.
- Extended isolated PostgreSQL/PGlite checks passed for migration 002: own-record edits work; cross-owner updates return no rows; ownership, visibility and journey reparenting writes are denied; invalid dates are rejected; rerunning 002 preserves data.
- Isolated PostgreSQL/PGlite: schema applied; owner writes allowed; another owner cannot read rows; spoofed owner writes rejected; foreign-owned journey memory rejected; date constraints enforced; anonymous select/insert denied; rerun fails without removing existing records.
- JavaScript syntax and static HTML/local-asset checks passed.

## Current development slice

- Added password change under My account with current-password verification, new-password confirmation and 12-character minimum. Recovery sessions open a dedicated new-password form.
- Added Forgot password and Resend confirmation with a shared in-page cooldown and clear email-limit guidance. Requests use the configured Supabase Site URL. No emails are sent until the user explicitly requests one.
- Added Edit journey and Edit memory. Edits compare original field values before updating, report conflicts, and retain form input on failure. No delete, reparenting or ownership changes are exposed.
- New migration `supabase/002_owner_editing.sql` grants only editable columns and adds owner-only UPDATE policies. It preserves all existing rows and is rerunnable. It is NOT applied to live Supabase by this code update.

## Still pending - do not claim complete

- Apply ONLY `supabase/002_owner_editing.sql` in the live project's SQL Editor, then test editing and refreshing. Do not rerun 001 or delete existing tables.
- Test new password change and full reset-email round trip; secure-password settings may require additional reauthentication. Never request the user's password or confirmation links in chat.
- Second-account live privacy check is blocked by the project's email sending rate limit. Keep confirmation enabled. Custom SMTP/service setup is needed before wider sign-ups; this requires owner setup, not a code-only fix.
- Fresh confirmation redirect verification and independent browser/mobile QA of this slice remain pending. Automated tests do not create real accounts, send emails or modify live memories.
- Review and merge the development update, then verify the existing host's deployment. Main/live app has not been changed by this update.

## Next session

Read this file and the latest PR state first. Do not repeat account installation or initial database setup. Help Dan apply migration 002 and verify new edit/password flows, then review release readiness. Preserve the current brand and legacy purpose.

After this slice is verified: remaining account lifecycle, delete and export/backup workflows, photographs with private storage rules, real map/location pins, invitations and revocable family access, then optional clue/time/location unlocking. Treat each as a separate tested phase; do not imply these are already available.
