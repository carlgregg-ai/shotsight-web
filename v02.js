(()=>{
const titles={homeView:'Today.',libraryView:'Train.',diagnoseView:'Diagnose.',learnView:'Playbook.',progressView:'Progress.'};
function ensurePlaybookAssets(){
 if(!document.querySelector('link[data-playbook-css]')){const l=document.createElement('link');l.rel='stylesheet';l.href='playbook.css?v=20260903-2359';l.dataset.playbookCss='1';document.head.appendChild(l)}
 if(!document.querySelector('script[data-playbook-js]')){const s=document.createElement('script');s.src='playbook.js?v=20260903-2359';s.dataset.playbookJs='1';document.body.appendChild(s)}
}
function integratePlaybook(){
 const learn=document.querySelector('#learnView');if(!learn||learn.dataset.playbookIntegrated)return;
 learn.dataset.playbookIntegrated='1';
 learn.innerHTML=`<div id="playbookRoot"><div class="playbook-intro"><span class="diag-badge">LEARN → DIAGNOSE → PRACTICE</span><h2>ShotSight Playbook</h2><p>Describe the target — or the miss. ShotSight will show only lessons whose coaching evidence has been certified.</p></div><div class="playbook-search"><label for="playbookSearch" class="sr-only">Search the Playbook</label><input id="playbookSearch" type="search" inputmode="search" autocomplete="off" placeholder="Try ‘high looper’ or ‘behind on a crosser’"></div><div id="playbookIntent" class="playbook-intent" hidden></div><div class="playbook-meta"><span id="playbookCount">Loading certified lessons…</span><span>Evidence-labelled</span></div><div class="playbook-list" id="playbookList" aria-live="polite"></div></div><section class="demo-section playbook-guides"><div class="section-heading"><h3>Visual shot guides</h3><span>Animated</span></div><p class="playbook-guide-note">These existing demonstrations remain available as visual guides while target-specific Playbook animations are validated.</p><div class="demo-grid" id="demoGrid"></div></section>`;
 if(!document.querySelector('#playbookSheet')){const sheet=document.createElement('section');sheet.id='playbookSheet';sheet.className='playbook-sheet';sheet.setAttribute('aria-hidden','true');sheet.innerHTML=`<div class="playbook-shell" role="dialog" aria-modal="true" aria-labelledby="playbookLessonTitle"><div class="playbook-top"><h2 id="playbookLessonTitle">Playbook lesson</h2><button class="icon-button" id="playbookClose" aria-label="Close Playbook lesson">×</button></div><div class="playbook-body" id="playbookLessonBody"></div></div>`;document.body.appendChild(sheet)}
 const learnTab=document.querySelector('.tab[data-view="learnView"]');if(learnTab)learnTab.innerHTML='<span>◌</span>Playbook';
 ensurePlaybookAssets();
}
function go(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));const h=document.querySelector('#pageTitle');if(h)h.textContent=titles[id]||'ShotSight.';if(id==='progressView'&&typeof window.renderProgress==='function')window.renderProgress();if(id==='learnView'&&window.ShotSightPlaybook?.init)window.ShotSightPlaybook.init();window.scrollTo({top:0,behavior:'smooth'})}
integratePlaybook();
document.querySelectorAll('.tab').forEach(t=>{t.onclick=()=>go(t.dataset.view)});
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.querySelectorAll('[data-diagnose]').forEach(b=>b.addEventListener('click',()=>{if(typeof window.openShooterDiagnosis==='function')window.openShooterDiagnosis()}));
window.shotSightGo=go;
})();