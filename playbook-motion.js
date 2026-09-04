(()=>{
const profiles={
  flat_long_crosser:{
    method:'Pull-away example', attribution:'Don Currie / NSCA', source:'NSCA_LONG_CROSSER',
    target:'M 8 50 L 92 50', gun:'M 18 58 C 42 58 52 50 92 43',
    note:'Conceptual pull-away sequence: establish the target line, join and match pace, then separate smoothly. Relative timing and separation are illustrative only — not a lead value.'
  },
  low_fast_incomer_cutoff:{
    method:'Cutoff visibility-preserving approach', attribution:'Don Currie / NSCA', source:'NSCA_CUTOFF · NSCA_OCCLUSION',
    target:'M 10 28 C 38 32 58 40 70 50 C 80 60 85 72 92 82', gun:'M 38 84 C 52 72 67 62 86 70',
    note:'This shows the cited cutoff case only: an approach from below/offset can preserve target visibility near the final transition. It must not be inherited by every incomer.'
  },
  chandelle_apex:{
    method:'Descending-break approach example', attribution:'Don Currie / NSCA', source:'NSCA_CH · NSCA_OCCLUSION',
    target:'M 8 78 Q 50 8 92 78', gun:'M 54 82 C 64 70 75 60 86 60',
    note:'Method motion is shown only for a selected descending break phase, where the cited coaching supports an upward/offset approach that preserves visibility. Rise and apex remain different tasks.'
  },
  rising_teal_under_power:{
    method:'Under-power pass-through example', attribution:'Don Currie / NSCA', source:'NSCA_TEAL',
    target:'M 45 90 C 47 66 50 38 58 10', gun:'M 44 82 C 47 64 51 45 59 22',
    note:'This is the source-attributed outgoing-under-power teal example. The pass-through relationship is conceptual; displayed distances and timing are not ballistic prescriptions.'
  },
  crossing_rabbit:{
    method:'Crossing-rabbit example', attribution:'Don Currie / NSCA', source:'NSCA_RABBIT',
    target:'M 7 78 C 24 75 31 83 47 78 S 71 73 93 78', gun:'M 18 87 C 40 83 62 80 91 76',
    note:'The motion illustrates the cited crossing-rabbit sequence: allow the target to establish/beat the muzzle, then move to the nose/front-foot relationship. Bounce and exact separation are not prescribed.'
  },
  driven_incoming:{
    method:'Driven pass-through example', attribution:'Don Currie / NSCA', source:'NSCA_DRIVEN',
    target:'M 50 8 C 49 34 50 61 53 92', gun:'M 42 35 C 46 50 51 68 57 89',
    note:'This illustrates visual connection followed by the cited pass-through/swing-through move for a true incoming driven target. A passing-away overhead remains a different presentation.'
  },
  rising_quartering_outgoing:{
    method:'Rising-quarter vertical-intercept example', attribution:'Don Currie / NSCA', source:'NSCA_RISING_OUTGOING',
    target:'M 10 82 C 34 68 58 46 91 18', gun:'M 44 86 C 48 66 57 45 76 27',
    note:'This illustrates the source-attributed vertical-intercept approach toward the inside leading edge for the matching rising-quartering-outgoing presentation. Exact hold geometry, timing and separation are conceptual and must adapt to angle and handedness.'
  }
};
const noGeneric={
  quartering_away:'Multiple attributed methods are retained for quartering-away targets. ShotSight will not animate one generic gun path until a specific method/presentation is selected.',
  pair_planning:'Pairs contain two independent target geometries and may use different methods. ShotSight will not draw one generic gun path for the pair.'
};
function style(){if(document.querySelector('#pbMotionStyle'))return;const s=document.createElement('style');s.id='pbMotionStyle';s.textContent=`
.pb-method-motion{margin:12px 0 0;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:#0d141d;overflow:hidden}.pb-motion-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:12px 12px 6px}.pb-motion-head strong{font-size:.92rem}.pb-motion-head span{font-size:.65rem;letter-spacing:.08em;color:#ff9a61;text-align:right}.pb-method-motion svg{display:block;width:100%;height:auto;min-height:180px;background:linear-gradient(180deg,#101a25,#0b1118)}.pb-motion-target,.pb-motion-gun{fill:none;stroke-width:1.6;stroke-dasharray:3 2;opacity:.4}.pb-motion-target{stroke:#ff7a45}.pb-motion-gun{stroke:#e9eef4}.pb-motion-dot-target{fill:#ff7a45}.pb-motion-dot-gun{fill:#fff}.pb-motion-legend{display:flex;gap:14px;padding:8px 12px 0;font-size:.72rem;color:#b9c4d1}.pb-motion-legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}.pb-motion-legend .target{background:#ff7a45}.pb-motion-legend .gun{background:#fff}.pb-motion-note{margin:0;padding:8px 12px 12px;color:#b9c4d1;font-size:.78rem;line-height:1.45}.pb-motion-source{display:block;margin-top:4px;color:#8795a5}.pb-motion-hold{margin:12px 0 0;padding:12px;border:1px dashed rgba(255,255,255,.18);border-radius:12px;color:#b9c4d1;font-size:.8rem;line-height:1.45}.pb-motion-hold strong{display:block;color:#f3f6f9;margin-bottom:4px}@media (prefers-reduced-motion:reduce){.pb-method-motion animateMotion{display:none}}
`;document.head.appendChild(s)}
function motionHtml(id,p){const targetDur='4.2s';const gunDur='3.4s';return `<section class="pb-method-motion" data-motion-id="${id}"><div class="pb-motion-head"><strong>${p.method}</strong><span>ATTRIBUTED METHOD · CONCEPTUAL</span></div><svg viewBox="0 0 100 100" role="img" aria-label="Conceptual target and gun motion for ${p.method}"><path class="pb-motion-target" d="${p.target}"/><path class="pb-motion-gun" d="${p.gun}"/><circle class="pb-motion-dot-target" r="2.8"><animateMotion dur="${targetDur}" repeatCount="indefinite" path="${p.target}"/></circle><circle class="pb-motion-dot-gun" r="2.6"><animateMotion begin=".65s" dur="${gunDur}" repeatCount="indefinite" path="${p.gun}"/></circle></svg><div class="pb-motion-legend"><span><i class="target"></i>Target</span><span><i class="gun"></i>Gun / aim reference</span></div><p class="pb-motion-note">${p.note}<small class="pb-motion-source">${p.attribution} · ${p.source}</small></p></section>`}
function decorate(){style();document.querySelectorAll('.pb-visual[data-visual-id]').forEach(v=>{const id=v.dataset.visualId;if(v.parentElement?.querySelector(`[data-motion-id="${id}"]`))return;const p=profiles[id];if(p){v.insertAdjacentHTML('afterend',motionHtml(id,p));return}const hold=noGeneric[id];if(hold&&!v.parentElement?.querySelector(`[data-motion-hold="${id}"]`))v.insertAdjacentHTML('afterend',`<div class="pb-motion-hold" data-motion-hold="${id}"><strong>No generic gun-path animation</strong>${hold}</div>`)});}
const observer=new MutationObserver(decorate);
function init(){style();const body=document.querySelector('#playbookLessonBody');if(body)observer.observe(body,{childList:true,subtree:true});decorate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.ShotSightPlaybookMotion={decorate,profiles};
})();
