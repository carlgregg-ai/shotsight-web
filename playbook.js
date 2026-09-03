(()=>{
const state={lessons:[],filtered:[],selected:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
function labelClass(label){return `evidence-${String(label||'').toLowerCase().replace(/_/g,'-')}`}
function setup(){
  const root=$('#playbookRoot'); if(!root)return;
  fetch('data/playbook-representative-v1.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(data=>{
    state.lessons=Array.isArray(data.lessons)?data.lessons:[];state.filtered=[...state.lessons];renderList();bindSearch();
  }).catch(err=>{root.innerHTML=`<div class="playbook-error"><strong>Playbook unavailable</strong><span>${esc(err.message)}</span></div>`});
  document.querySelector('[data-view="learnView"]')?.addEventListener('click',()=>{const t=$('#pageTitle');if(t)t.textContent='Playbook.'});
}
function bindSearch(){
 const input=$('#playbookSearch'); if(!input)return;
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();state.filtered=!q?[...state.lessons]:state.lessons.filter(l=>haystack(l).includes(q));renderList(q)});
}
function haystack(l){return [l.name,...(l.aliases||[]),l.understand,...(l.coaching||[]).map(x=>x.text),...(l.diagnose||[]).flatMap(d=>[d.symptom,...(d.candidate_mechanisms||[])])].join(' ').toLowerCase()}
function renderList(q=''){
 const list=$('#playbookList'); if(!list)return;
 $('#playbookCount').textContent=`${state.filtered.length} certified lessons`;
 if(!state.filtered.length){list.innerHTML='<div class="playbook-empty">No certified lesson matches that description yet.</div>';return}
 list.innerHTML=state.filtered.map(l=>`<button class="playbook-card" data-playbook-id="${esc(l.id)}"><span class="playbook-family">${esc(prettySelector(l.selector))}</span><strong>${esc(l.name)}</strong><small>${esc(l.understand)}</small><span class="playbook-open">Open →</span></button>`).join('');
 list.querySelectorAll('[data-playbook-id]').forEach(b=>b.addEventListener('click',()=>openLesson(b.dataset.playbookId)));
}
function prettySelector(s={}){return [s.flight_family,s.phase,s.direction,s.sequence_context].filter(x=>x&&x!=='unknown').map(x=>x.replace(/_/g,' ')).join(' · ')||'presentation lesson'}
function openLesson(id){state.selected=state.lessons.find(l=>l.id===id);if(!state.selected)return;renderLesson(state.selected);const sheet=$('#playbookSheet');sheet.classList.add('active');sheet.setAttribute('aria-hidden','false');document.body.classList.add('sheet-open')}
function closeLesson(){const sheet=$('#playbookSheet');sheet?.classList.remove('active');sheet?.setAttribute('aria-hidden','true');document.body.classList.remove('sheet-open')}
function renderLesson(l){
 $('#playbookLessonTitle').textContent=l.name;
 const body=$('#playbookLessonBody');
 const diag=(l.diagnose||[])[0];
 body.innerHTML=`
  <section class="pb-section"><span class="pb-kicker">WHAT YOU'RE SEEING</span><p>${esc(l.understand)}</p></section>
  <section class="pb-section"><span class="pb-kicker">COACHING OPTIONS</span>${(l.coaching||[]).map(c=>`<article class="pb-claim"><span class="evidence-pill ${labelClass(c.label)}">${esc(c.label)}</span><p>${esc(c.text)}</p>${c.attribution?`<small>${esc(c.attribution)}</small>`:''}</article>`).join('')}</section>
  ${l.holds?.length?`<section class="pb-section pb-hold"><span class="pb-kicker">DO NOT OVERCLAIM</span>${l.holds.map(h=>`<p>${esc(h)}</p>`).join('')}</section>`:''}
  ${diag?`<section class="pb-section"><span class="pb-kicker">DIAGNOSE THIS MISS</span><h3>${esc(diag.symptom)}</h3><p><strong>Possible causes:</strong> ${esc((diag.candidate_mechanisms||[]).join(' · '))}</p><div class="pb-question"><span>CHECK</span><strong>${esc(diag.question)}</strong><p>${esc(diag.interpretation)}</p></div><p><strong>Try:</strong> ${esc(diag.fix)}</p><p><strong>Retest:</strong> ${esc(diag.retest)}</p></section>`:''}
  <section class="pb-section"><span class="pb-kicker">VISUAL LESSON SPEC</span><p>${esc(l.visual_spec?.target||'')}</p><ul>${(l.visual_spec?.show||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${l.visual_spec?.warning?`<div class="pb-warning">${esc(l.visual_spec.warning)}</div>`:''}</section>
  <section class="pb-section"><span class="pb-kicker">PRACTICE</span>${(l.drills||[]).map(d=>`<div class="pb-drill"><strong>${esc(d.name)}</strong><span class="evidence-pill ${labelClass(d.label)}">${esc(d.label)}</span></div>`).join('')}</section>`;
}
window.addEventListener('DOMContentLoaded',()=>{
 setup();
 $('#playbookClose')?.addEventListener('click',closeLesson);
 $('#playbookSheet')?.addEventListener('click',e=>{if(e.target.id==='playbookSheet')closeLesson()});
});
})();
