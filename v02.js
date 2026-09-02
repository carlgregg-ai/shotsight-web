(()=>{
const titles={homeView:'Today.',libraryView:'Train.',diagnoseView:'Diagnose.',learnView:'Learn.',progressView:'Progress.'};
function go(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));const h=document.querySelector('#pageTitle');if(h)h.textContent=titles[id]||'ShotSight.';if(id==='progressView'&&typeof window.renderProgress==='function')window.renderProgress();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('.tab').forEach(t=>{t.onclick=()=>go(t.dataset.view)});
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.querySelectorAll('[data-diagnose]').forEach(b=>b.addEventListener('click',()=>{if(typeof window.openShooterDiagnosis==='function')window.openShooterDiagnosis()}));
window.shotSightGo=go;
})();