# AI Photo Studio integration boundary

The first layer is available from a saved memory photograph and from the secure
photo picker after selecting a file. It uses the existing `muMediaAvailable`
account check and `muMediaSignedUrl`; drafts use a temporary object URL. Closing
the studio or changing accounts clears its preview. No provider request is made.

The Version 2 user choices are `Original`, `Enhance`, `Reimagine`, and `Restore`.
`Original` is not an AI operation and never leaves the client. The server adapter
will expose stable AI operations for `enhance`, `reimagine`, and `restore` without
changing the ordinary media picker.

`window.muPhotoStudio.service` deliberately reports `available: false` and rejects
`createVersion`. Do not switch this on with a client flag or call `muUploadPhoto`
to save an AI result: ordinary replacement currently deletes the replaced object.

Before connecting a provider, the server adapter must:

1. Authenticate with the existing Supabase session. Recheck memory ownership and
   the source storage path on the server; never trust a client-supplied owner.
2. Accept a stable operation, memory ID, immutable original-version ID and an
   idempotency key. Keep provider credentials exclusively on the server.
3. Create an append-only photo-version record and a unique private object with
   `upsert: false`. Retain the original bytes and every accepted prior version.
   No RLS or private-bucket policy may be relaxed.
4. Return an owned job ID with queued/processing/succeeded/failed states. Apply
   size, type, duration, concurrency and spend limits before sending an image.
5. Expose original and result only through short-lived signed URLs. Store object
   paths, not signed URLs. Accepting a result changes the selected version ID;
   Keep Original leaves the source untouched. Never delete original storage.
6. Render Before/After only for the real result. Enable Use Enhanced Version only
   after the result has loaded and ownership has been rechecked. Announce actual
   processing and errors accessibly, and preserve the draft on failure.

Release gates: two-account isolation, signed-out denial, stale sessions, provider
failure/retry, original-byte preservation, cross-device version selection, upload/
view/replace/remove regression checks and mobile comparison checks.

The private Sites review has a separate owner-scoped photo adapter and a working
manual Before/After editor. Its AI provider is also deliberately disabled until a
server key, a verified model and explicit activation are configured. Do not point
the Supabase app at the Sites adapter: their account identities are different.
