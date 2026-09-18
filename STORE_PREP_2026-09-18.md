# Memories Unlocked — Store Preparation Draft

**Prepared:** 18 September 2026  
**Release direction:** first public release, private journeys and memories

## Product positioning

**App name**  
Memories Unlocked

**Core line**  
Every place has a story.

**Supporting line**  
Remember the places that matter. Build journeys, pin memories, add photos and stories, and return to them through your personal map.

## Google Play draft

**Short description**  
Save journeys, pin memories, add photos and revisit the places that matter.

**Long description**

Memories Unlocked turns the places in your life into a personal story you can return to.

Create a journey for a holiday, a family chapter, a favourite place or somewhere you dream of visiting. Add memories with photographs, dates, stories, clues and exact map locations, then watch the journey take shape across your personal memory map.

Use location padlocks to create memories that can be unlocked when you return to the place. Keep private Story Keys and QR codes with journals, photographs or keepsakes so a journey can be reopened on your signed-in devices.

Features in the first release include:

- Private journeys and memories
- Photo-backed journey and memory cards
- Personal memory map with Street, Satellite, Terrain and Explorer views
- Location search and exact memory pins
- Location padlocks with configurable unlock radius
- Journey Story Keys and printable QR padlocks
- Cloud account sync across your own signed-in devices
- Appearance customisation
- Discover and place context tools
- Footsteps walking sessions
- Legacy and archive views
- In-app account deletion and a public deletion portal

Memories Unlocked is designed around one idea: every place has a story worth keeping.

**Suggested Play category**  
Travel & Local or Lifestyle — final choice should match the positioning used in Play Console.

## Apple App Store draft

**Subtitle**  
Your journeys. Your memories. Your map.

**Promotional text**  
Turn meaningful places into a personal trail of journeys, photographs, memories and stories you can return to.

**Keywords draft**  
memories,travel,journal,journey,map,photos,places,story,legacy,trips

**Description**

Every place has a story.

Memories Unlocked gives you a beautiful place to preserve the journeys and locations that matter to you. Create a journey, add photographs and stories, pin exact places on your map and build a lasting personal trail.

Your journeys stay private in the first release. Sign into the same Memories Unlocked account on another device to reconnect with your cloud-saved journeys, memories, photos, clues and map locations.

Location padlocks let you attach a memory to a real place and unlock it when you return. Private Story Keys and QR padlocks give you a physical bridge back to the digital journey — ideal for journals, albums and keepsakes.

The first release includes private journeys, memory photos, multiple map styles, exact place pins, location padlocks, cloud sync, appearance controls, discovery tools, walking sessions, archive/legacy views and secure account deletion.

## Screenshot plan

Capture final native screenshots only after the RC passes device QA.

Recommended sequence:

1. Home — approved mobile Home showing My Journeys and Recent Memories.
2. Journey detail — travel stamp, story, photo and memory trail.
3. Memory detail — photograph, story, clue/message and map position.
4. Memory Map — several numbered pins with map-style selector visible.
5. Location Padlock — locked/unlocked experience.
6. Account & Sync — cloud-connected state.
7. Appearance — wallpaper/font customisation if visually strong enough for launch.

Use real-looking test content but no private personal information.

## Privacy / deletion URLs

Use the production app domain once the release branch is promoted:

- Privacy Policy: `https://memories-unlocked.vercel.app/privacy.html`
- Account deletion: `https://memories-unlocked.vercel.app/delete-account.html`
- Support: `https://memories-unlocked.vercel.app/support.html`

Verify all three URLs after the Vercel build-rate limit clears and before entering them in either store console.

## Google Play Data Safety working notes

Review these against the final signed Android build before submission.

Likely data categories used by the app:
- Account information: email address / authenticated user identifier
- User content: journey text, memory text, photographs and clues/messages
- Location-related content: user-selected place names and saved coordinates
- App activity/content state: unlock records such as time, distance and reported accuracy
- Files/photos: images the user explicitly chooses to upload

Current design notes:
- Exact live device position used for an unlock check is processed on-device for the check and is not stored as raw latitude/longitude by the unlock record.
- Uploaded photographs are stored privately and served with time-limited signed links.
- No advertising SDK is currently included.
- No sale of personal information is intended.
- Account deletion removes the Auth user, owned cloud records and owned media.

Do not submit the Data Safety form from these notes alone. Confirm the final native dependencies and actual network behaviour first.

## Apple App Privacy working notes

Review the final signed iOS build before submission.

Potential disclosure areas:
- Contact info: email for registered accounts
- User content: photos and other user-entered content
- Location: saved memory coordinates and location functionality
- Identifiers: authenticated Supabase user ID
- Other usage data: memory unlock record details if Apple categorises them as product interaction

The app should request location only when the user invokes a location-dependent feature and should offer manual place/coordinate entry where available.

## Age rating

Complete the current Apple and Google rating questionnaires in their consoles. The app is not designed around gambling, violence, sexual content or user-to-user social posting in this release.

## Review notes draft

Memories Unlocked can be used without registering an email account. A registered account enables cross-device cloud sync for the user's own private journeys and memories.

Location permission is requested only when the user deliberately uses a location-dependent feature such as unlocking a location padlock. The app does not request background location.

For App Review, provide a dedicated test account containing:
- at least two journeys;
- at least three memories;
- one uploaded journey cover;
- one uploaded memory photo;
- at least one memory with a saved map position;
- at least one location padlock.

Do not provide the main personal testing account to reviewers.

## Remaining store actions

1. Confirm the final application identifier before first signed upload.
2. Produce the 1024 × 1024 Apple marketing icon from the approved app icon.
3. Generate Android/iOS native projects from the Capacitor scaffold.
4. Build and test signed Android and iOS candidates.
5. Capture final native screenshots.
6. Complete Play Data Safety and account-deletion fields.
7. Complete Apple App Privacy, age-rating and review information.
8. Enable Supabase leaked-password protection.
9. Configure Google Play signing and Apple signing/provisioning.
10. Submit first to internal/closed testing and TestFlight before production review.
