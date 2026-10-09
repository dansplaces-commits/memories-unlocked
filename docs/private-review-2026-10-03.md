# Private review handover — 3 October 2026

The approved private website is a separate Sites/React implementation from this
Supabase app. Do not deploy this app's older homepage over the approved website.

Private review: https://memories-unlocked-private-review.dansplaces.chatgpt.site

The updated private website was successfully deployed from Sites source commit
`dce8bf5045f31b941ff52e3c241b780adfe0ca44`, on development branch
`finish/private-review-2026-10-03`. The exact source is retained in that site's
source repository. Deployment: `appgdep_6ac13298589c8191b57c3beb904fa7b7`.
Only the owner can access the site; no sharing settings were expanded.

Visual baseline: deployed Sites version 6,
`cccef26cc71d83efc307a3cbfcc07a728f448331`. Editing continued from saved version 7,
`03a1fef26063a1e2c9dc58b269e65793f978ed05`, preserving its additive photo-editor
work as well as the approved homepage, Explore and landmark imagery.

Both `locked/website-explore-2026-10-02` and
`website/explore-vibrant-imagery-2026-10-01` resolved to
`03d307ead0c1267283f1767f52f33df00dcf25b5`. This development branch starts there.
Neither baseline was changed and no older PR was merged.

## Website changes

- Homepage controls now open creation, memory, map, Story Key, explainer, Explore
  and privacy screens.
- Five actual product screenshots form a responsive homepage preview section.
- AI Photo Studio includes the four requested options, honest unavailable state,
  Before/After, original/enhanced choices and a server integration boundary.
  Manual adjustments work without calling AI.
- Photo removal/replacement retains earlier references and allows restoration.
- Phone-only hero crops in Paris, London and Rome keep landmarks in frame.

## App changes in this branch

- Added Photo Studio entries to saved memory photos and the existing secure
  upload picker. It uses the existing signed-URL and account checks.
- Added scoped studio styling, accessible options, an explicit unavailable state
  and a documented server/versioning contract. No fake result or provider call.
- Included the new assets in the existing service worker with a new cache version.
- Existing ordinary upload/replace/remove behavior, RLS, storage configuration,
  account boundaries and approved Explore files remain unchanged.

## Checks and release limits

The website was inspected at a 1363 × 936 desktop viewport and 390, 320 and 768
pixel CSS viewports. Navigation, six destinations, galleries, journey/memory
creation, Story Key, maps, product previews, photo selection, manual enhancement,
remove/restore and failed-upload draft retention were checked. No app JavaScript
errors, duplicate script URLs or horizontal overflow were observed in checked
screens. Browser-extension diagnostics are unrelated to application code.

Website TypeScript/build and isolated photo/AI security tests passed; provider
responses were test fixtures and no paid image request was made. App regression
tests (38) and studio boundary checks passed. These do not replace real
two-account and physical-device acceptance.

AI processing is intentionally off: no provider environment values are
configured. It needs a verified model, server-only key, explicit activation and
authenticated acceptance before enabling. Real signed-in photo upload/view/
replace/remove acceptance is still pending because the local review preview has
no hosting identity; authentication was never bypassed for testing.

The private website keeps stories on this browser and photos in owner-scoped
private storage. Live Supabase account integration, cross-device story sync and
family sharing are not connected there. Story Key only opens an existing local
review journey; it grants no access. This is ready for private review, not a public
launch sign-off. The app changes in this branch have not been publicly deployed.
