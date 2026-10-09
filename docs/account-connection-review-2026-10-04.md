# Private account connection — 4 October 2026

The approved Sites source remains the visual baseline. This change builds on private version 8, commit dce8bf5045f31b941ff52e3c241b780adfe0ca44, on development branch finish/account-sync-2026-10-03.

## Changed

- Existing Supabase email/password account sign-in, local sign-out and refresh, behind the unchanged owner-only Sites gate.
- Account journeys and memories load and save through the existing owner RLS policies. Samples remain browser-local and are never automatically imported.
- Account data stays in memory; only the account session and per-account bucket-list/followed preferences use browser storage. Authentication changes clear drafts, photos, selected records and pending read results.
- Existing places and coordinates are retained. Custom places without coordinates remain in the trail without invented pins or destination photographs.
- Memory photo upload, replacement, removal, restoration and manual enhancements use private memory-media storage with short-lived signed URLs. Originals and each version get separate object paths; active images are separate copies for compatibility with the legacy app's replace/remove behaviour. No objects are deleted by this interface.
- Journey covers can be uploaded and removed while retaining copies in owner-private metadata.
- Story Keys resolve only journeys already owned by the signed-in user. They do not grant access or enable family sharing.
- Account & privacy is available in the mobile menu as well as the desktop header and journey workspace.
- AI Photo Studio stays honest: account AI processing is disabled; manual adjustments and before/after are functional.

## Database change

Supabase project fdjzelcqilupxibqsqep. Applied migration review_account_details adds object-constrained review_details JSONB columns to journeys and memories. Existing columns, grants, RLS policies, storage privacy and ownership predicates were not changed. No existing records were imported, rewritten or deleted. This additive change remains compatible with the current app.

## Verification

- TypeScript passed.
- 25 repository contract checks cover owner filtering, unrelated accounts, rejected session changes, save failure, replay prevention, stale photo-version updates, original byte preservation, replace/remove/restore, private covers and real coordinates. These use isolated fixtures, not live user accounts.
- Existing private photo and AI contract suites passed. AI provider results are mocked; no live AI request was made.
- Live database queries confirmed RLS remains enabled. Anonymous and synthetic unrelated-account roles each returned zero journeys, memories and storage objects. Transactions rolled back.
- Browser checks: desktop 1363px; phone iframe viewports 390px and 320px. Account panel, homepage actions, custom journey/memory creation, map behaviour, Explore and Las Vegas detail were checked. No app console errors, failed destination images or horizontal overflow were found in the checked screens. Existing approved desktop/mobile tests from version 8 remain documented in the app repository.
- The temporary viewport harness was removed before publication.

## Remaining release gates

- Real existing-account sign-in, account switching, clean-device restore and live photo save/readback need a user-controlled authenticated session. Automated fixtures and negative RLS checks do not claim to replace that acceptance test.
- AI generation remains disabled pending its account-aware backend, provider configuration and billing approval. No API credentials were requested or exposed.
- Family sharing remains disabled. Bucket-list/followed markers remain device-local preferences.
- Existing Supabase advisors are unchanged: anonymous authenticated accounts are supported by the legacy app's owner-scoped policies, and leaked-password protection is disabled. Review the latter before public launch: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No ownership boundary was weakened to suppress advisor notices.
- The public site/app was not deployed. The locked rollback branch remains outside this source checkout and must remain unchanged.

## Deployed private review

URL: https://memories-unlocked-private-review.dansplaces.chatgpt.site

Sites source commit: 9aba56eea736a2d5b6e6f8ec3e09a229c14aba97

Development branch: finish/account-sync-2026-10-03

The approved React/Vinext source remains in the existing Sites source repository. The vanilla/Capacitor app homepage was not used to replace it. This GitHub branch records the schema migration and review handoff without deploying the public app.

Protected branch locked/website-explore-2026-10-02 was verified unchanged at 03d307ead0c1267283f1767f52f33df00dcf25b5 on 4 October 2026.
