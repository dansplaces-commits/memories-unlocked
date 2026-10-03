/* AI Photo Studio: an additive entry point in the existing private photo flow.
 * Processing deliberately stays unavailable until the authenticated, versioned
 * service described in docs/ai-photo-studio.md is connected and verified.
 */
(function () {
  'use strict';
  if (window.muPhotoStudio) return;
  const options = Object.freeze([
    { id: 'enhance', label: 'Enhance Photo', description: 'A gentle enhancement that keeps the people, place and feeling of the original.' },
    { id: 'restore', label: 'Sharpen & Restore', description: 'Recover clarity while preserving faces and the character of your photograph.' },
    { id: 'colour', label: 'Improve Colour & Lighting', description: 'Balance the light and colour without changing the moment.' },
    { id: 'crop', label: 'Smart Crop', description: 'Find a stronger composition while keeping your full original safe.' }
  ]);

  // Stable boundary: a future server adapter must return a new private version,
  // never call muUploadPhoto (which implements ordinary replacement), and never
  // expose a provider key or persist a signed URL. No image leaves this UI today.
  const service = Object.freeze({
    capabilities: () => Promise.resolve({ available: false, options: options.map(option => option.id) }),
    createVersion: async () => { throw new Error('AI photo processing is not connected yet.'); }
  });

  async function open(id, draftFile) {
    const record = muMediaRecord('memory', id);
    if (!record || !muMediaAvailable(record)) { toast('Open a memory in your signed-in account to use Photo Studio.'); return; }
    if (!draftFile && !record.photoPath) { muOpenPhotoPicker('memory', id); return; }
    const accountId = cloudUser.id;
    const modal = mountDialog('photoStudioModal', `
      <button class="close" type="button" aria-label="Close AI Photo Studio">×</button>
      <span class="eyebrow">KEEP THE MOMENT</span><h2>AI Photo Studio</h2>
      <p class="small">Every enhancement will be a separate version. Your original stays yours.</p>
      <div class="studio-comparison" aria-label="Before and after comparison">
        <figure><figcaption>Before · Original</figcaption><div class="studio-original" role="status">Opening your photo…</div></figure>
        <figure><figcaption>After · Enhanced version</figcaption><div class="studio-after">Your enhanced preview will appear here when AI processing is available.</div></figure>
      </div>
      <fieldset class="studio-options"><legend>Choose an enhancement</legend>${options.map((option, index) => `<label><input type="radio" name="studio-option" value="${option.id}" ${index === 0 ? 'checked' : ''}><span>${option.label}</span></label>`).join('')}</fieldset>
      <p class="studio-description">${options[0].description}</p>
      <p class="studio-status" role="status">AI processing is not connected to this app yet. No image has been sent for processing.</p>
      <button class="secondary" type="button" disabled>Create AI preview · Coming soon</button>
      <div class="action-row"><button class="secondary studio-keep" type="button">Keep Original</button><button class="save" type="button" disabled>Use Enhanced Version</button></div>
    `, 'photo-studio');
    let localUrl = '';
    const close = () => closeModal('photoStudioModal');
    const { data: authListener } = muSupabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id !== accountId && modal.isConnected) close();
    });
    modal.querySelector('.close').addEventListener('click', close);
    modal.querySelector('.studio-keep').addEventListener('click', close);
    modal.querySelector('.studio-options').addEventListener('change', event => {
      const selected = options.find(option => option.id === event.target.value);
      if (selected) modal.querySelector('.studio-description').textContent = selected.description;
    });
    const cleanup = new MutationObserver(() => {
      if (!modal.isConnected) { if (localUrl) URL.revokeObjectURL(localUrl); authListener?.subscription?.unsubscribe(); cleanup.disconnect(); }
    });
    cleanup.observe(document.body, { childList: true });
    try {
      const source = draftFile ? (localUrl = URL.createObjectURL(draftFile)) : await muMediaSignedUrl(record.photoPath);
      if (!modal.isConnected) { if (localUrl) URL.revokeObjectURL(localUrl); return; }
      if (!cloudUser || cloudUser.id !== accountId || !muMediaAvailable(record)) { close(); return; }
      if (!source) throw new Error('Photo unavailable');
      const image = document.createElement('img');
      image.src = source; image.alt = 'Your original memory photograph';
      image.addEventListener('error', () => { if (modal.isConnected) modal.querySelector('.studio-original').textContent = 'Your photo could not load. Close the studio and try again.'; });
      modal.querySelector('.studio-original').replaceChildren(image);
    } catch {
      if (modal.isConnected) modal.querySelector('.studio-original').textContent = 'Your photo could not load. Your memory is unchanged.';
    }
  }
  window.muPhotoStudio = Object.freeze({ open, service, options });
})();
