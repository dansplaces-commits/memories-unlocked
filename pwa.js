let deferredInstallPrompt=null;
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function pwaPlatform(){const ua=navigator.userAgent||'';if(/iphone|ipad|ipod/i.test(ua))return'ios';if(/android/i.test(ua))return'android';if(/windows/i.test(ua))return'windows';return'desktop';}
function installHelp(){
  const platform=pwaPlatform();
  let steps='Use your browser menu and choose Install app or Create shortcut.';
  if(platform==='ios')steps='In Safari, tap the Share button, choose Add to Home Screen, then tap Add.';
  if(platform==='android')steps='In Chrome, open the menu (⋮), choose Install app or Add to Home screen, then confirm.';
  if(platform==='windows')steps='In Edge or Chrome, use the Install icon in the address bar or open the browser menu and choose Install Memories Unlocked.';
  mountDialog('installModal',`<button class="close" onclick="closeModal('installModal')">×</button><div class="welcome">TAKE YOUR MEMORIES WITH YOU</div><h2>Install Memories Unlocked</h2><p class="intro">Open your journeys from your home screen like an app.</p><div class="install-steps"><strong>${esc(steps)}</strong><p class="small">Once installed, Memories Unlocked opens in its own app window. The app shell can start offline; cloud memories refresh when you are connected.</p></div>${deferredInstallPrompt?'<button class="save" onclick="installMemoriesUnlocked()">Install Memories Unlocked</button>':''}<button class="secondary" onclick="closeModal('installModal')">Not now</button>`,'install-panel');
}
async function installMemoriesUnlocked(){if(!deferredInstallPrompt){installHelp();return;}deferredInstallPrompt.prompt();const choice=await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;closeModal('installModal');if(choice.outcome==='accepted')toast('Memories Unlocked is being added to your device.');}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;document.querySelectorAll('[data-install-app]').forEach(el=>el.hidden=false);});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;document.querySelectorAll('[data-install-app]').forEach(el=>el.hidden=true);toast('Memories Unlocked is installed. Your journeys are now one tap away.');});
window.addEventListener('DOMContentLoaded',()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});if(!isStandalone()&&pwaPlatform()==='ios')document.querySelectorAll('[data-install-app]').forEach(el=>el.hidden=false);});