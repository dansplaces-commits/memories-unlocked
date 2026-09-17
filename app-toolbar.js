/* Memories Unlocked — website-style desktop application toolbar. */
(function(){
if(window.__muAppToolbarLoaded)return;
window.__muAppToolbarLoaded=true;

function toolbarMarkup(){return `
<header class="mu-app-toolbar" aria-label="Memories Unlocked app navigation">
  <button type="button" class="mu-toolbar-brand" data-mu-toolbar-view="home" aria-label="Memories Unlocked home">
    <span class="mu-toolbar-lock" aria-hidden="true"><svg viewBox="0 0 32 38"><path d="M8.5 15V11a7.5 7.5 0 0 1 15 0v4"/><rect x="5" y="15" width="22" height="18" rx="6" fill="currentColor" stroke="currentColor"/><path class="mu-keyhole" d="M16 21.2a2.4 2.4 0 0 1 1.25 4.45V29h-2.5v-3.35A2.4 2.4 0 0 1 16 21.2Z"/></svg></span>
    <span class="mu-toolbar-wordmark"><span>Memories</span><strong>Unlocked</strong></span>
  </button>
  <nav class="mu-toolbar-nav" aria-label="Main app sections">
    <button type="button" data-mu-toolbar-view="home">Home</button>
    <button type="button" data-mu-toolbar-view="map">My Map</button>
    <button type="button" data-mu-toolbar-view="journeys">Journeys</button>
    <button type="button" data-mu-toolbar-view="follow">Follow</button>
  </nav>
  <div class="mu-toolbar-actions">
    <button type="button" class="mu-toolbar-account" data-mu-toolbar-account>Account</button>
    <button type="button" class="mu-toolbar-personalise" data-mu-toolbar-personalise>✦ Make it yours</button>
  </div>
</header>`;}

function activeView(){return document.querySelector('.view.active')?.id||'home';}
function syncToolbar(){
  const id=activeView();
  document.querySelectorAll('.mu-app-toolbar [data-mu-toolbar-view]').forEach(button=>{
    if(button.dataset.muToolbarView===id)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
}
function installToolbar(){
  if(document.querySelector('.mu-app-toolbar')){syncToolbar();return;}
  document.body.insertAdjacentHTML('afterbegin',toolbarMarkup());
  document.querySelector('.mu-app-toolbar')?.addEventListener('click',event=>{
    const view=event.target.closest('[data-mu-toolbar-view]');
    if(view){event.preventDefault();if(typeof showView==='function')showView(view.dataset.muToolbarView);syncToolbar();return;}
    if(event.target.closest('[data-mu-toolbar-account]')){event.preventDefault();if(typeof openAccount==='function')openAccount();return;}
    if(event.target.closest('[data-mu-toolbar-personalise]')){event.preventDefault();if(typeof openAppearance==='function')openAppearance();}
  });
  const app=document.querySelector('.app');
  if(app)new MutationObserver(syncToolbar).observe(app,{subtree:true,attributes:true,attributeFilter:['class']});
  syncToolbar();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installToolbar,{once:true});else installToolbar();
})();
