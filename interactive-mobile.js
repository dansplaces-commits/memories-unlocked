/* Memories Unlocked — mobile quick tools for the Interactive Dashboard Pack. */
(function(){
const tools=[['discover','⌖','Discover'],['capture','▣','Capture'],['footsteps','👣','Footsteps'],['share','↗','Share'],['legacy','♡','Legacy']];
function ensure(){
  const home=document.getElementById('home');if(!home||home.querySelector('.mu-mobile-tools'))return;
  const bar=document.createElement('section');bar.className='mu-mobile-tools';bar.setAttribute('aria-label','Quick tools');
  bar.innerHTML=`<span class="mu-mobile-tools-label">QUICK TOOLS</span><div>${tools.map(([key,icon,label])=>`<button type="button" data-mu-tool="${key}"><span>${icon}</span><b>${label}</b></button>`).join('')}</div>`;
  const anchor=home.querySelector('.mobile-explainer-launch')||home.querySelector('.home-hero');
  if(anchor)anchor.insertAdjacentElement('afterend',bar);else home.prepend(bar);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
new MutationObserver(ensure).observe(document.documentElement,{childList:true,subtree:true});
})();
