(()=>{
const state={lessons:[],filtered:[],selected:null,intent:null,ready:false};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
function labelClass(label){return `evidence-${String(label||'').toLowerCase().replace(/_/g,'-')}`}
function detectIntent(q=''){
 const text=q.toLowerCase();
 const diagnosis=/\b(miss(?:ing|ed)?|behind|in front|under(?:neath)?|below|above|over|late|early|stop(?:ping|ped)?|lost|losing|rushing|rush|wrong)\b/.test(text);
 return diagnosis?'diagnose':'learn';
}
function terms(q=''){return q.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(Boolean).filter(x=>!['on','a','an','the','i','keep','am','my','to','of','at'].includes(x))}
function setup(){
  if(state.ready)return;
  const root=$('#playbookRoot'); if(!root)return;
  state.ready=true;root.setAttribute('aria-busy','true');
  const list=$('#playbookList');if(list)list.innerHTML='<div class="playbook-empty">Loading certified Playbook lessons…</div>';
  fetch('data/playbook-representative-v1.json?v=20260903-2359',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(data=>{
    state.lessons=Array.isArray(data.lessons)?data.lessons:[];state.filtered=[...state.lessons];root.removeAttribute('aria-busy');renderList();bindSearch();
  }).catch(err=>{
    root.removeAttribute('aria-busy');state.ready=false;const count=$('#playbookCount');if(count)count.textContent='Playbook could not load';const target=$('#playbookList');if(target){target.innerHTML=`<div class="playbook-error" role="alert"><strong>Playbook unavailable</strong><span>${esc(err.message)}</span><button class="secondary-button" id="playbookRetry">Try again</button></div>`;$('#playbookRetry')?.addEventListener('click',setup)}
  });
}
function bindSearch(){
 const input=$('#playbookSearch'); if(!input||input.dataset.bound)return;input.dataset.bound='1';
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();state.intent=q?detectIntent(q):null;if(!q){state.filtered=[...state.lessons]}else{const ts=terms(q);state.filtered=state.lessons.map(l=>({l,score:scoreLesson(l,ts,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.l)}renderList(q)});
}
function haystack(l){return [l.name,...(l.aliases||[]),l.understand,...(l.coaching||[]).map(x=>x.text),...(l.diagnose||[]).flatMap(d=>[d.symptom,...(d.candidate_mechanisms||[]),d.question,d.interpretation,d.fix])].join(' ').toLowerCase()}
function scoreLesson(l,ts,q){const h=haystack(l);let score=0;if(h.includes(q))score+=20;for(const t of ts){if(h.includes(t))score+=3}const aliases=(l.aliases||[]).map(a=>a.toLowerCase());if(aliases.some(a=>q.includes(a)||a.includes(q)))score+=10;if(state.intent==='diagnose'&&(l.diagnose||[]).some(d=>ts.some(t=>haystack({name:'',aliases:[],understand:'',coaching:[],diagnose:[d]}).includes(t))))score+=5;return score}
function renderList(q=''){
 const list=$('#playbookList'); if(!list)return;const count=$('#playbookCount');if(count)count.textContent=q?`${state.filtered.length} ${state.intent==='diagnose'?'diagnostic':'lesson'} matches`:`${state.filtered.length} certified lessons`;
 const intent=$('#playbookIntent');if(intent){intent.hidden=!q;intent.classList.toggle('diagnose',state.intent==='diagnose');intent.innerHTML=q?(state.intent==='diagnose'?'<strong>Diagnose mode</strong><span>These lessons are ranked against the miss you described. Open one to check likely causes before applying a fix.</span>':'<strong>Learn mode</strong><span>Open the closest presentation to understand the target and available coaching approaches.</span>'):''}
 if(!state.filtered.length){list.innerHTML='<div class="playbook-empty"><strong>No certified match yet.</strong><span>Try a simpler presentation phrase such as “crosser”, “teal”, “rabbit” or “looper”. ShotSight will not invent advice for an unsupported target.</span></div>';return}
 list.innerHTML=state.filtered.map(l=>`<button class="playbook-card" data-playbook-id="${esc(l.id)}" data-focus="${state.intent==='diagnose'?'diagnose':'learn'}"><span class="playbook-family">${esc(prettySelector(l.selector))}</span><strong>${esc(l.name)}</strong><small>${esc(l.understand)}</small><span class="playbook-open">${state.intent==='diagnose'?'Diagnose':'Open'} →</span></button>`).join('');list.querySelectorAll('[data-playbook-id]').forEach(b=>b.addEventListener('click',()=>openLesson(b.dataset.playbookId,b.dataset.focus)));
}
function prettySelector(s={}){return [s.flight_family,s.phase,s.direction,s.sequence_context].filter(x=>x&&x!=='unknown').map(x=>x.replace(/_/g,' ')).join(' · ')||'presentation lesson'}
function openLesson(id,focus='learn'){state.selected=state.lessons.find(l=>l.id===id);if(!state.selected)return;renderLesson(state.selected,focus);const sheet=$('#playbookSheet');sheet.classList.add('active');sheet.setAttribute('aria-hidden','false');document.body.classList.add('sheet-open');setTimeout(()=>{if(focus==='diagnose')$('#playbookLessonBody .pb-diagnose')?.scrollIntoView({block:'start'})},80)}
function closeLesson(){const sheet=$('#playbookSheet');sheet?.classList.remove('active');sheet?.setAttribute('aria-hidden','true');document.body.classList.remove('sheet-open')}
function diagnosisHtml(diag){return diag?`<section class="pb-section pb-diagnose"><span class="pb-kicker">DIAGNOSE THIS MISS</span><h3>${esc(diag.symptom)}</h3><p><strong>Possible causes:</strong> ${esc((diag.candidate_mechanisms||[]).join(' · '))}</p><div class="pb-question"><span>CHECK</span><strong>${esc(diag.question)}</strong><p>${esc(diag.interpretation)}</p></div><p><strong>Try:</strong> ${esc(diag.fix)}</p><p><strong>Retest:</strong> ${esc(diag.retest)}</p></section>`:''}
function renderLesson(l,focus='learn'){$('#playbookLessonTitle').textContent=l.name;const body=$('#playbookLessonBody');const diag=(l.diagnose||[])[0];const diagBlock=diagnosisHtml(diag);const learn=`<section class="pb-section"><span class="pb-kicker">WHAT YOU'RE SEEING</span><p>${esc(l.understand)}</p></section><section class="pb-section"><span class="pb-kicker">COACHING OPTIONS</span>${(l.coaching||[]).map(c=>`<article class="pb-claim"><span class="evidence-pill ${labelClass(c.label)}">${esc(c.label)}</span><p>${esc(c.text)}</p>${c.attribution?`<small>${esc(c.attribution)}</small>`:''}</article>`).join('')}</section>${l.holds?.length?`<section class="pb-section pb-hold"><span class="pb-kicker">DO NOT OVERCLAIM</span>${l.holds.map(h=>`<p>${esc(h)}</p>`).join('')}</section>`:''}`;const rest=`<section class="pb-section"><span class="pb-kicker">VISUAL LESSON SPEC</span><p>${esc(l.visual_spec?.target||'')}</p><ul>${(l.visual_spec?.show||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${l.visual_spec?.warning?`<div class="pb-warning">${esc(l.visual_spec.warning)}</div>`:''}</section><section class="pb-section"><span class="pb-kicker">PRACTICE</span>${(l.drills||[]).map(d=>`<div class="pb-drill"><strong>${esc(d.name)}</strong><span class="evidence-pill ${labelClass(d.label)}">${esc(d.label)}</span></div>`).join('')}</section>`;body.innerHTML=focus==='diagnose'?diagBlock+learn+rest:learn+diagBlock+rest}
function bindSheet(){if($('#playbookSheet')?.dataset.bound)return;$('#playbookSheet')?.setAttribute('data-bound','1');$('#playbookClose')?.addEventListener('click',closeLesson);$('#playbookSheet')?.addEventListener('click',e=>{if(e.target.id==='playbookSheet')closeLesson()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#playbookSheet')?.classList.contains('active'))closeLesson()})}
function init(){bindSheet();setup()}
window.ShotSightPlaybook={init,openLesson};if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();