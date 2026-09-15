# Memories Unlocked

The existing static app at https://memories-unlocked.vercel.app/.
The marketing website remains a separate repository and deployment.

Every place has a story. Follow the footsteps. Unlock the memories.

## September 2026 update

- Accessible memory-detail dialogs replace browser alerts. Full-card taps, keyboard activation, escape/backdrop dismissal and focus restoration are supported.
- Leaflet 1.9.4 provides a real geographical map, numbered memory pins, per-journey filtering, chronological trails and stacked memories at the same coordinates.
- Locations are searched explicitly through Photon and confirmed by the user. Pins can be dragged, placed by tapping, or entered as coordinates. Existing memories are not automatically geocoded. Dotted trails connect dated stops; they are not directions.
- QR generation is local using vendored QRCode.js, with a quiet zone on downloaded PNGs and an A4 print layout.
- Navigation has matching vector icons, a clear active state and mobile safe-area spacing.
- “Make it yours” offers background themes, personal photo backgrounds, built-in font pairings, and local custom-font uploads. Preferences use localStorage; uploaded images/fonts use IndexedDB and never leave the device. They do not sync across devices.

## Data compatibility

The existing `mu_journeys`, `mu_memories`, Supabase client configuration and anonymous authentication are retained. A one-time local snapshot is stored as `mu_before_map_update_v1`. Cloud refresh merges records so device-only memories and legacy clues are retained.

New writes send `clue`, `latitude`, `longitude` and (for journeys) `share_code`. If PostgREST explicitly reports a missing optional column, the app retries with the supported fields. It never treats permission, validation or network failures as successful cloud saves. It shows when details are only on the device.

The optional additive SQL in `supabase/20260913_memory_positions.sql` is prepared, **not automatically applied**. It adds missing columns to the existing tables without changing data or RLS. Updating an existing pin requires an owner-scoped UPDATE policy; the app does not broaden access. After schema/permissions are ready, the memory-detail retry button can save a preserved clue/position.

There is no claim that the following are finished: cross-device account recovery or follow/sharing authorization, cloud photo storage, installation/PWA, automatic retry of device-only complete records. Anonymous sessions are browser-specific. Before public launch, finish stable account ownership and explicit family-sharing policies. A QR encodes a link; it does not grant access. Existing share codes are preserved on this device when the server has no code.

## Mapping services

- Leaflet distribution: https://leafletjs.com/download.html. The vendored JS is pinned to 1.9.4 and verified against the official SHA-256. Licences are in `vendor/`.
- Tiles: https://tile.openstreetmap.org/{z}/{x}/{y}.png, with visible attribution. The app loads only the map currently being viewed and relies on normal browser caching; no offline downloads or prefetching.
- Tile terms: https://operations.osmfoundation.org/policies/tiles/.
- Geocoder: https://github.com/komoot/photon and its documented `/api/` endpoint. Explicit searches only, five results, a bounded in-memory cache, abort/timeout handling, and no story/clue content sent with queries. Photon’s public server is best-effort, intended for reasonable usage; use a managed or self-hosted service before a high-volume launch.
- The defaults in `map.js` may be overridden by `window.MU_MAP_CONFIG` before that file loads.

## Local verification

For a manual preview, serve this folder with any static HTTP server.
With Node and Playwright (including Chromium) available, run `node tests/smoke.cjs`. The test starts its own isolated local HTTP server.
`MU_TEST_URL` and `MU_TEST_OUTPUT` override the local test URL and screenshot directory.

Tests isolate Supabase and map-tile traffic. They cover memory/journey click propagation, dialogs, QR generation, Leaflet pins/trails and coincident stops, search and confirmed coordinates, mobile layout, background upload/persistence, font/theme selection, missing-column compatibility, preservation of offline records and clues, and account-cache boundaries across sign-out and account switching. No test records are written to the live Supabase database.

Deployment remains the existing GitHub-to-Vercel flow. No build step, extra backend project, or service-role secret is introduced.
