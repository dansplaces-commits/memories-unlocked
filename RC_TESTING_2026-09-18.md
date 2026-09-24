# Memories Unlocked — RC Device Test Sheet

**Release candidate date:** 18 September 2026  
**Source branch:** `polish/app-2026-09-16`  
**Protected recovery branches:** `locked/app-2026-09-16`, `locked/release-candidate-1-2026-09-17`

This pass is for release validation only. Do not redesign the approved Home screen during testing. Log defects, reproduce them, and patch only confirmed release blockers.

## 1. Mobile Home — visual gate

Test at approximately 360 px, 390 px and 430 px viewport widths.

- Home opens without blank/white flash after the branded boot screen.
- The two **My Journeys** cards each show artwork or the user's uploaded journey cover.
- The three **Recent Memories** cards each show artwork or the user's uploaded memory photo.
- No card artwork overlaps titles, location copy, dates or neighbouring cards.
- Uploaded photos replace fallback artwork cleanly.
- Bottom navigation does not cover the final Home content.
- Home, My Journeys, Memories scroll, Account and centre Add control all respond once per tap.
- No duplicate account modal or duplicate tool event is observed.

## 2. Existing account / clean-device gate

Use a real non-disposable test account that already contains journeys and memories.

- Sign out, close the app/browser and reopen.
- Sign back into the same account.
- Existing journeys return.
- Existing memories return under the correct journeys.
- Uploaded journey and memory photos return.
- Saved clue text returns.
- Saved map coordinates return and pins appear correctly.
- Private Story Key remains consistent after reload.
- No journey or memory is duplicated by reconnect/reload.

## 3. New story gate

- Create a new journey.
- Confirm it is labelled **Private** and there is no Family/Public visibility selector.
- Add a memory with title, date, story and clue/message.
- Choose an exact map point.
- Upload a memory photograph.
- Reload the app.
- Confirm all fields, map point and photo survive reload.
- Open the journey on a second device/browser signed into the same account.
- Confirm the journey and memory appear there with the same Story Key.

## 4. Map and location padlock gate

- Street map loads.
- Satellite map loads.
- Terrain map loads.
- Explorer map loads.
- Journey filtering works.
- A memory pin opens the intended memory.
- Location is requested only after an action that needs it.
- Padlock shows distance feedback.
- A test padlock unlocks inside its configured radius.
- The unlock remains recorded after reload.
- No background/Always-location behaviour is requested.

## 5. Editing and lifecycle gate

- Edit a journey title, location, story and dates.
- Journey remains Private after editing.
- Edit a memory title, location, date, story and clue/message.
- Move a memory map point.
- Replace a photo and verify the old photo no longer appears.
- Archive and restore a memory.
- Archive and restore a journey.
- Legacy views continue to open without follower-only wording.

## 6. Account and deletion gate

**Use a disposable account for deletion testing. Never use the main test account.**

- Create/sign into the disposable registered account.
- Add one journey, memory and uploaded photo.
- Open Account & Sync → Delete account & data.
- Incorrect confirmation text must not delete anything.
- Exact `DELETE MY ACCOUNT` confirmation completes deletion.
- Local Memories Unlocked caches are cleared after confirmed deletion.
- The deleted credentials can no longer sign in.
- Repeat the deletion flow once through `/delete-account.html` using another disposable account.

## 7. Offline / recovery gate

- Load the app once while online.
- Reopen with network disabled.
- App shell opens.
- Existing locally cached stories remain visible where expected.
- Cloud/media failures are reported without losing local content.
- Restore network and use Account & Sync → Reconnect & reload my cloud stories.
- Cloud data returns without duplication.

## 8. Install / platform gate

### Android
- Native project targets Android 16 / API 36 or higher.
- Foreground coarse/fine location permissions are present.
- Build signed test AAB/APK.
- Test fresh install and upgrade install.
- Test back navigation, keyboard, photo picker and location permission prompts.

### iOS
- Build with Xcode 26 or later using iOS 26 SDK or later.
- `NSLocationWhenInUseUsageDescription` is present.
- No background/Always location entitlement is requested.
- Test fresh install through Xcode/TestFlight.
- Test safe areas, keyboard, photo picker, map gestures and location prompt.

## 9. Store-readiness gate

Prepared:
- Privacy policy: `/privacy.html`
- Account deletion: `/delete-account.html`
- Support: `/support.html`
- Authenticated account deletion Edge Function
- Capacitor 8 wrapper scaffold
- Android API 36 direction
- iOS foreground-location usage description automation

Still required before submission:
- Confirm final application identifier before first signed store upload.
- Generate/approve the 1024 × 1024 Apple marketing icon from the approved app icon.
- Capture final phone screenshots after native QA.
- Complete Google Play Data Safety answers.
- Complete Apple App Privacy and updated age-rating answers.
- Enable Supabase leaked-password protection.
- Provide an App Review test account/instructions if requested.
- Complete signing, Play App Signing and Apple Developer/App Store Connect setup.

## Release decision

A defect is a **release blocker** if it causes data loss, wrong-account data visibility, sign-in failure, missing cloud content after clean-device sign-in, broken account deletion, a crash/unusable screen, or a repeatable broken primary navigation/action.

Minor cosmetic differences that do not obscure content or controls should be logged for the post-launch polish update unless they materially damage the approved Home presentation.
