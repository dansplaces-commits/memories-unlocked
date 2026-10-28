const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const code = readFileSync(require('node:path').join(__dirname, '..', 'photo-studio.js'), 'utf8');
function context() {
  const notices = [];
  const sandbox = { window: {}, muMediaRecord: () => ({ photoPath: 'private/original.jpg' }),
    muMediaAvailable: () => false, toast: value => notices.push(value),
    muMediaSignedUrl: () => { throw new Error('Private storage must not be reached'); },
    mountDialog: () => { throw new Error('A private preview must not be mounted'); } };
  vm.createContext(sandbox); vm.runInContext(code, sandbox);
  return { sandbox, notices };
}
test('the unconnected provider cannot send or save an image', async () => {
  const { sandbox } = context();
  const service = sandbox.window.muPhotoStudio.service;
  assert.equal((await service.capabilities()).available, false);
  await assert.rejects(service.createVersion({ photo: 'private/original.jpg' }), /not connected/);
});
test('unavailable or wrong-account memories never request a signed URL', async () => {
  const { sandbox, notices } = context();
  await sandbox.window.muPhotoStudio.open('foreign-memory');
  assert.equal(notices.length, 1);
});
test('a repeated script load does not initialize a second studio', () => {
  const { sandbox } = context();
  const initial = sandbox.window.muPhotoStudio;
  vm.runInContext(code, sandbox);
  assert.equal(sandbox.window.muPhotoStudio, initial);
});
