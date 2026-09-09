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
- Hosting: Vercel installation observed in Dan's GitHub screenshots. Exact live URL and deployment configuration have not been verified.

## Confirmed progress

The original repository contained a truncated single HTML file. The first repair completed the form, added a native dialog and labelled mock memories honestly. GitHub initially returned 403 when creating a branch. Dan installed and authorised ChatGPT Codex Connector for the app repository; branch creation, source update and draft PR creation then succeeded.

This development update adds email/password sign-up and sign-in, private journey creation/loading, written memory creation/loading within a journey, backdated calendar dates, paginated collections, safe text rendering and sign-out clearing of private UI state. Draft IDs are reused to avoid duplicate records after a network failure with uncertain commit outcome. User input is retained when persistence fails.

## Verification completed

- Supabase authentication settings: HTTP 200 using the previously supplied public publishable key. Email sign-up enabled and email confirmation required.
- Zero-row REST probe: `/rest/v1/journeys?select=*&limit=0` returned PGRST205 (table not found in schema cache). No personal records were retrieved. This does not establish the entire database's contents.
- Seven Node tests: backdating/private defaults, date validity/range, required/length constraints, signed-out rejection, server-derived owner ID, failed persistence and duplicate retry reconciliation.
- Isolated PostgreSQL/PGlite: schema applied; owner writes allowed; another owner cannot read rows; spoofed owner writes rejected; foreign-owned journey memory rejected; date constraints enforced; anonymous select/insert denied; rerun fails without removing existing records.
- JavaScript syntax and static HTML/local-asset checks passed.

## Still pending - do not claim complete

- Apply the SQL migration to the actual Supabase project through an authorised administration route. No Supabase management connector or admin credential is available in this session.
- Confirm the application's preview/live URL and configure Supabase email-confirmation Site URL.
- Live confirmed-email signup/sign-in, save, reload and second-account privacy checks. No real accounts were created and no emails sent during automated tests.
- Browser/mobile interaction testing and deployment checks. The Sites workflow did not permit unsolicited browser QA; it was not performed.
- Review and merge the development update, then verify the existing host's deployment. Main/live app has not been changed by this update.

## Next session

Read this file and the latest PR state first. Do not repeat account installation. Guide Dan through applying the supplied SQL migration; check for existing tables first. Verify configuration and live behaviour, then review release readiness. Preserve the current brand and legacy purpose.

After reliable private saving: password recovery and account lifecycle, edit/delete and export/backup workflows, photographs with private storage rules, real map/location pins, invitations and revocable family access, then optional clue/time/location unlocking. Treat each as a separate tested phase; do not imply these are already available.
