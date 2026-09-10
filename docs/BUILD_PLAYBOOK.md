# Dan & Atlas | App-building playbook

Version 1 - 9 September 2026. A reusable working guide based on the Memories Unlocked setup. This is a dated checkpoint; the repository handover is the working record for future updates.

## 1. Start with the purpose and the real project

For each app, write one paragraph explaining who it helps, what they should achieve and what makes the idea distinctive. Name the first complete user journey. For Memories Unlocked: sign in, create a meaningful journey, add a written memory, then find it again after returning.

Preserve the product's identity. Memories Unlocked is a digital legacy and memory journey app inspired by leaving padlocks at meaningful places. Family may eventually retrace those footsteps. Its navy, gold and warm neutral design should support that emotional purpose.

Locate the actual source before rebuilding. Record the GitHub account, repository, default branch, active work branch, pull request, database project and live URL. Inspect the latest code and its history. A working-looking screenshot is not proof that its buttons save information.

Keep a clear distinction between a visual prototype, connected development build, tested preview and released app. Use those labels in progress updates. Do not call an app production-ready simply because its home screen opens.

For this project, the source was cut off halfway through the journey form. Earlier versions were also incomplete. Repairing that file was necessary before investigating cloud saving.

## 2. Connect accounts once, then verify access

GitHub holds the source code and change history. Supabase provides accounts and application data. Vercel is the existing hosting integration observed in this project. These are separate services: access to one does not grant access to another.

The GitHub issue we solved: ChatGPT Codex Connector appeared under Authorized GitHub Apps, but only Vercel appeared under Installed GitHub Apps. Reads worked; creating a branch returned 403, Resource not accessible by integration.

The route that worked for Dan: open Codex cloud; choose Select repository; choose Configure Repositories on GitHub; select the dansplaces-commits account; choose Only select repositories; select memories-unlocked; click Install & Authorize. The screen explicitly included read/write code access. Branch creation and a source update then succeeded.

For future apps, first check the existing installation and whether the new repository is selected. Do not repeatedly reconnect a working account. Authorisation and installation are different stages. Diagnose an actual failure before asking for permission changes.

For Supabase, record the project URL and public publishable key. An organisation-dashboard link is not an API connection URL. The project dashboard contains the project reference. Keep database passwords, secret keys and service-role keys out of chat, browser code and GitHub.

A successful authentication-settings request proves reachability and key acceptance for that endpoint. It does not prove that application tables exist or that saving works.

## 3. Build one complete, honest flow

Keep the existing stack when it fits. Memories Unlocked currently uses static HTML, CSS and JavaScript; changing frameworks is not required to connect its first forms. Use a version-pinned Supabase SDK and document its source. The current SDK is pinned to 2.116.0 with a matching integrity hash.

Build the smallest useful sequence: account access, create a private journey, open that journey, add a written memory and reload the saved collection. Support old dates without changing them through timezone conversion. Clearly label upcoming features; do not present demonstration memories as saved personal data.

Keep responsibilities clear: index.html is the page; styles.css is the brand/layout; config.js contains public configuration; data.js validates and saves; app.js manages screens and account state. SQL migrations define the actual database and its privacy rules.

Use the database as the source of truth for journeys and memories. Browser storage may hold SDK session state; it is not the authoritative collection. Render user-written titles and stories as text, not executable HTML.

Treat privacy as an enforced behaviour. Each record belongs to the signed-in user. Database row-level security controls reads and inserts. A memory's journey and owner must match through a database constraint. Hiding another person's records in the interface alone is insufficient.

Show loading, empty, success and error states. Keep form details when saving fails. Report success only after the database confirms it. Prevent repeated submission while saving and reuse a draft ID when retrying an uncertain write.

## 4. Check, save and release in separate steps

Check syntax and local asset references. Test important behaviours rather than creating tests that simply repeat every line of code: invalid dates, blank fields, unauthenticated writes, owner spoofing, failed saves and duplicate retries.

Test database rules in isolation before applying a migration. For this update, PostgreSQL/PGlite tests confirmed owner isolation, anonymous denial, same-owner memory links, date constraints and a safe migration rerun failure. This is useful evidence, but does not replace checking the live Supabase configuration.

Apply database changes through an authorised administration route. Inspect any existing tables first. The supplied first migration runs in a transaction and deliberately stops if its table names already exist. Never delete a table simply to make setup work.

Verify the real app URL before configuring confirmation-email redirects. Keep email confirmation enabled. Create test accounts through the app, confirm email, save a journey and memory, refresh, sign out and return. Use a second account to check privacy. Check mobile layout, keyboard controls and recoverable failures before release.

Save development work on a branch and open or update a pull request. Record what changed, why, what passed and what remains untested. A draft PR is saved work, not a live release. Review it, complete the remaining gates, merge when authorised and verify the host deployed the intended commit.

If a release fails, inspect the specific error. Use the last working version as the reference. Record whether a database migration was already applied before attempting a rollback or retry.

## 5. Current checkpoint and next actions

GitHub: dansplaces-commits/memories-unlocked. Default branch: main. Development branch: fix/incomplete-journey-form. Draft update: https://github.com/dansplaces-commits/memories-unlocked/pull/1

Supabase project: fdjzelcqilupxibqsqep. API URL: https://fdjzelcqilupxibqsqep.supabase.co. Dashboard: https://supabase.com/dashboard/project/fdjzelcqilupxibqsqep

Completed: GitHub write access confirmed; truncated form repaired; sign-up/sign-in and private journey/written-memory integration prepared; seven data-layer tests passed; isolated PostgreSQL privacy and constraint checks passed; syntax and static-reference checks passed.

Pending: the actual Supabase API cannot currently find the journeys table. Run the prepared migration after inspecting existing tables. Then verify the application URL, confirmation-email configuration and live authenticated save/reload flow. Browser QA and deployment verification have not yet been completed. The draft has not changed the live app.

The migration is stored at supabase/001_private_collection.sql. The detailed handover is docs/PROJECT_STATUS.md. Future sessions should start with that handover and the latest PR rather than repeat installation steps.

Completed in the current local draft: account recovery, editing, exports, photographs with owner-only deletion (using separate storage migrations), owner-scoped map pins, future-trip states, linked timeline navigation, validated pin-pack import/export and owner-only legacy clues. Still planned: journey/memory deletion controls, family invitations, shared legacy journeys and time/location unlocking. Treat each as a separately verified phase.

## 6. Reuse this process for the next app

Create a project record containing: app name; owner; audience; purpose; first complete flow; visual references; source repository; database project; hosting URL; public configuration location; current branch/PR; latest tested commit; deployed commit; outstanding checks; next action.

Copy patterns, not identities. Reuse the flow, visual conventions, validation approach and tests where appropriate. Create separate repositories and projects for separate apps. Replace project URLs and public keys deliberately; never accidentally connect a new product to another app's customer data.

At the end of each work session, update five things: what changed; where it was saved; what was actually tested; known blockers; the next concrete step. Preserve the current instructions and decisions alongside the code. Export a dated PDF checkpoint when a printable handover is useful.

Suggested restart request: Continue [app name]. Read its PROJECT_STATUS and BUILD_PLAYBOOK, inspect the latest code and PR, verify the recorded access, and complete the next unfinished step. Preserve the existing product purpose and show me any action that genuinely requires my account access.

What we learned: install the connector, not just authorise it; select the correct repository; verify writes with a real reversible change; distinguish dashboard links from API URLs; inspect incomplete files early; prove database saving separately from a successful connection; save decisions outside the conversation.

Official references: https://learn.chatgpt.com/docs/cloud ; https://supabase.com/docs/guides/getting-started/api-keys ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/reference/javascript/auth-signup
