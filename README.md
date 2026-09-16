# Memories Unlocked

Memories Unlocked is a digital memory, travel and legacy app built around one idea:

> Every place has a story.

The app lets people create journeys, pin meaningful places, capture memories, leave clues and messages, and allow family or followers to retrace those footsteps later.

## Current product baseline

This branch is the design-and-function readiness pass that aligns the app with the approved Memories Unlocked website baseline while preserving the existing Supabase-backed journeys, memories, map, follow and account flows.

### Desktop

- Approved split scenic hero and typography
- Start Your Journey CTA
- Watch the Video animated explainer
- Explore / Capture / Share / Leave a legacy benefit strip
- Five-step How It Works flow
- Live journey, memory and map data beneath the master composition
- Compact movable dock
- Premium cosmetic polish across navigation, journey cards, memory rows, forms and account surfaces
- Upgraded Memory Map with Street, Satellite, Terrain and Explorer modes
- Optional My Location map control that only requests browser location when the user presses it
- Top-right latest-place chip linking back into the relevant memory/journey map

### Mobile / tablet

The existing mobile-first app UI remains in place so core app behaviour is not destabilised. A responsive “See how Memories Unlocked works” launcher gives mobile users the same animated explainer experience as desktop. The map style controls and latest-place chip also adapt to smaller screens.

### Account safety

This work sits on top of the account-boundary branch, keeping account-scoped cache protection and the current sign-in / sign-out safety work in place.

## Readiness rule

Do not treat visual polish as a replacement for functional testing. Before promotion to the main app branch, verify:

1. Existing-account sign-in loads the correct journeys and memories.
2. Clean-device sign-in restores the correct cloud data.
3. Direct account switching does not expose the prior account’s cached records.
4. Create Journey, Add Memory, Map and Follow flows still work.
5. Desktop and mobile explainer experiences open, advance, replay and close correctly.
6. Map mode switching works on Street, Satellite, Terrain and Explorer without disturbing saved pins/trails.
7. The latest-place chip opens the correct saved place or journey.

The approved website remains the visual source of truth for future refinement.
