/* AI Photo Studio — Memories Unlocked 2.0.
 * The original is always preserved. AI processing remains deliberately disabled
 * until the authenticated, append-only server adapter is connected and verified.
 */
(function () {
  'use strict';
  if (window.muPhotoStudio) return;
  const options = Object.freeze([
    { id: 'original', label: 'Original', description: 'Keep the photograph exactly as you captured it. Nothing is changed and nothing is sent for AI processing.' },
    { id: 'enhance', label: 'Enhance', description: 'Gently improve clarity, lighting and colour while keeping the people, place and feeling authentic.' },
    { id: 'reimagine', label: 'Reimagine', description: 'Create an optional artistic version of the memory — for example cinematic, golden-hour, editorial or illustrated — while keeping the original safe.' },
    { id: 'restore', label: 'Restore', description: 'Repair fading, softness and age-related damage while preserving faces, detail and the character of the original photograph.' }
  ]);

  // Stable boundary: a future server adapter must create a new private version,
  // never overwrite/delete the source, never expose a provider key and never
  // persist a signed URL. No image leaves this UI for AI processing today.
  const service = Object.freeze({
    capabilities: () => Promise.resolve({ available: false, options: options.filter(option => option.id !== 'original').map(option => option.id) }),
    createVersion: async () => { throw new Error('AI photo processing is not connected yet.'); }
  });

  async function open(id, draftFile) {
    const record = muMediaRecord('memory', id);
    if (!record || !muMediaAvailable(record)) { toast('Open a memory in your signed-in account to use Photo Studio.'); return; }
    if (!draftFile && !record.photoPath) { muOpenPhotoPicker('memory', id); return; }
    const accountId = cloudUser.id;
    const modal = mountDialog('photoStudioModal', `
      <button class="close" type="button" aria-label="Close AI Photo Studio">×</button>
      <span class="eyebrow">YOUR MEMORY · YOUR CHOICE</span><h2>AI Photo Studio</h2>
      <p class="small">Choose how you want the memory to look. Your original photograph is always kept safely and never overwritten.</p>
      <div class="studio-comparison" aria-label="Original and optional edited version comparison">
        <figure><figcaption>Original</figcaption><div class="studio-original" role="status">Opening your photo…</div></figure>
        <figure><figcaption>Chosen version</figcaption><div class="studio-after">Original selected — your photograph stays exactly as it is.</div></figure>
      </div>
      <fieldset class="studio-options"><legend>Choose your image style</legend>${options.map((option, index) => `<label><input type="radio" name="studio-option" value="${option.id}" ${index === 0 ? 'checked' : ''}><span>${option.label}</span></label>`).join('')}</fieldset>
      <p class="studio-description">${options[0].description}</p>
      <p class="studio-status" role="status">Original selected. No AI processing is needed.</p>
      <button class="secondary studio-preview" type="button" disabled>Create AI preview · Coming soon</button>
      <div class="action-row"><button class="secondary studio-keep" type="button">Use Original</button><button class="save studio-use-ai" type="button" disabled>Use AI Version</button></div>
    `, 'photo-studio');
    let localUrl = '';
    const close = () => closeModal('photoStudioModal');
    const status = modal.querySelector('.studio-status');
    const after = modal.querySelector('.studio-after');
    const preview = modal.querySelector('.studio-preview');
    const useAI = modal.querySelector('.studio-use-ai');
    const { data: authListener } = muSupabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id !== accountId && modal.isConnected) close();
    });
    modal.querySelector('.close').addEventListener('click', close);
    modal.querySelector('.studio-keep').addEventListener('click', close);
    modal.querySelector('.studio-options').addEventListener('change', event => {
      const selected = options.find(option => option.id === event.target.value);
      if (!selected) return;
      modal.querySelector('.studio-description').textContent = selected.description;
      if (selected.id === 'original') {
        after.textContent = 'Original selected — your photograph stays exactly as it is.';
        status.textContent = 'Original selected. No AI processing is needed.';
        preview.disabled = true;
        useAI.disabled = true;
        return;
      }
      after.textContent = `${selected.label} preview will appear here when secure AI processing is connected.`;
      status.textContent = `${selected.label} is part of Memories Unlocked 2.0. AI processing is not connected yet, so your image has not been sent anywhere.`;
      preview.disabled = true;
      useAI.disabled = true;
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
