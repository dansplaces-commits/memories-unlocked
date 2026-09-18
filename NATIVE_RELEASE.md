# Memories Unlocked — Native Release Notes

This repository remains the source of truth for the approved web/PWA experience. Capacitor packages the same release UI and Supabase-backed data layer for Google Play and the Apple App Store.

## Current wrapper baseline

- Capacitor: 8.5.2 (pinned)
- Node: 22+
- Android: Capacitor 8 defaults compile/target SDK 36
- iOS submission: build with Xcode 26+ and the iOS 26 SDK for current App Store Connect requirements
- Web bundle: generated into `www/` with `npm run native:web`
- Provisional application ID: `com.dansplaces.memoriesunlocked`

**Confirm the application ID before the first signed store upload.** Package/bundle identifiers become costly or impossible to change after store registration.

## First native-project creation

```bash
npm install
npm run cap:add:android
npm run cap:add:ios
```

After the native projects exist, use:

```bash
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

## Permissions to verify before signed builds

Memories Unlocked uses device location only when the user requests location-based features. `npm run cap:add:*` and `npm run cap:sync` now run `scripts/configure-native-permissions.mjs`, which adds Android coarse/fine foreground location permissions and the iOS `NSLocationWhenInUseUsageDescription`. No background/Always location permission is requested.

Android should target API 36 for the 2026 Google Play requirement. iOS builds submitted now must use Xcode 26 or later with the iOS 26 SDK.

## Store URLs already prepared

- Privacy policy: `/privacy.html`
- Account deletion: `/delete-account.html`
- Support: `/support.html`

## Release gates still requiring platform accounts/hardware

- Google Play application registration, signing key and Play App Signing
- Android release AAB build and closed/internal testing
- Apple Developer/App Store Connect app registration
- iOS signing certificates/profiles and Xcode archive
- App Store / Play screenshots, descriptions, age/content ratings and data-safety/privacy declarations
- Enable Supabase leaked-password protection before public launch
