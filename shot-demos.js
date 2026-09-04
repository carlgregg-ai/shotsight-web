const shotDemos=[
  {id:'sustained',name:'Sustained lead',glyph:'→',desc:'Start below the line, join it at pickup, establish the gap, then maintain that relationship through the shot.',cue:'START → PICKUP → SET GAP → KEEP MOVING',mode:'sustained',break:.78,claySpeed:55,outcome:'hit',result:'HIT',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 82 C 24 73, 36 61, 46 53 C 61 47, 78 40, 95 33',hold:{x:16,y:79},pickup:{x:45,y:54},breakPt:{x:82,y:38},phases:['SEE THE LINE','MOVE FROM HOLD','PICK UP THE CLAY','SET & HOLD LEAD','FIRE — KEEP MOVING']},
  {id:'pullaway',name:'Pull-away',glyph:'↗',desc:'Move from the hold point to the clay line, match it briefly, then accelerate ahead along the same line.',cue:'HOLD → PICKUP → MATCH → PULL AWAY',mode:'pullaway',break:.80,claySpeed:55,outcome:'hit',result:'HIT',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 83 C 25 74, 36 63, 47 54 C 60 48, 78 40, 96 32',hold:{x:16,y:80},pickup:{x:46,y:55},breakPt:{x:82,y:37},phases:['SEE THE LINE','MOVE FROM HOLD','JOIN / MATCH','ACCELERATE AHEAD','FIRE — CONTINUE']},
  {id:'swingthrough',name:'Swing-through',glyph:'⇢',desc:'Start below and behind, pick the clay up from behind, pass through it and continue to the break.',cue:'BEHIND → PICKUP → THROUGH → FIRE',mode:'swingthrough',break:.79,claySpeed:55,outcome:'hit',result:'HIT',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 9 84 C 25 76, 36 67, 48 58 C 60 49, 78 39, 97 30',hold:{x:15,y:81},pickup:{x:47,y:58},breakPt:{x:82,y:36},phases:['SEE THE LINE','START BEHIND','PICKUP','SWING THROUGH','FIRE — KEEP SWINGING']},
  {id:'looper',name:'Looper convergence',glyph:'⌒',desc:'The clay arcs above while the barrel takes a flatter path underneath; sight line, barrel and clay converge at the chosen break point.',cue:'READ ARC → SWING UNDER → CONVERGE → FIRE',mode:'looper',break:.78,claySpeed:42,outcome:'hit',result:'HIT',
    target:'M 7 72 C 28 28, 60 22, 94 66',gun:'M 12 84 C 34 72, 56 61, 80 55 C 87 56, 91 59, 94 66',hold:{x:18,y:80},pickup:{x:49,y:64},breakPt:{x:94,y:66},phases:['READ THE ARC','MOVE UNDER THE FLIGHT','BUILD THE SWING','CONVERGE','FIRE AT CONVERGENCE']},
  {id:'behind',name:'Behind / under-led',glyph:'‹',desc:'The barrel finds the line, but never creates enough separation before release.',cue:'DIAGNOSIS: INSUFFICIENT LEAD',mode:'behind',break:.78,claySpeed:55,outcome:'miss',result:'MISS — BEHIND',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 83 C 26 74, 38 62, 49 55 C 62 49, 77 43, 91 38',hold:{x:16,y:80},pickup:{x:48,y:56},breakPt:{x:80,y:42},phases:['SEE THE LINE','MOVE FROM HOLD','JOIN LATE','GUN TRAILS','SHOT BEHIND']},
  {id:'ahead',name:'In front / over-led',glyph:'›',desc:'The barrel finds the line but creates too much separation before release.',cue:'DIAGNOSIS: EXCESS LEAD',mode:'ahead',break:.76,claySpeed:55,outcome:'miss',result:'MISS — IN FRONT',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 82 C 25 71, 38 59, 49 52 C 66 43, 82 34, 98 26',hold:{x:16,y:79},pickup:{x:47,y:53},breakPt:{x:82,y:33},phases:['SEE THE LINE','FAST APPROACH','JOIN','GAP GROWS','SHOT IN FRONT']},
  {id:'stopped',name:'Stopped gun',glyph:'■',desc:'The barrel approaches correctly, then stalls just before release while the clay carries on.',cue:'DIAGNOSIS: MOVEMENT STALL',mode:'stopped',break:.80,claySpeed:55,outcome:'miss',result:'MISS — GUN STOPPED',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 82 C 25 73, 38 61, 50 53 C 63 47, 72 43, 78 41 C 80 40, 80 40, 80 40',hold:{x:16,y:79},pickup:{x:48,y:54},breakPt:{x:80,y:40},phases:['SEE THE LINE','GOOD APPROACH','PICKUP','GUN STALLS','CLAY RUNS ON']},
  {id:'correction',name:'Over-correction',glyph:'≈',desc:'The barrel reaches the line but then makes repeated steering changes around the break point.',cue:'DIAGNOSIS: TOO MANY CORRECTIONS',mode:'correction',break:.80,claySpeed:55,outcome:'miss',result:'MISS — UNSTABLE RELEASE',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 82 C 25 73, 38 61, 50 53 C 61 47, 66 51, 72 43 C 77 38, 78 44, 84 37 C 88 34, 90 36, 95 32',hold:{x:16,y:79},pickup:{x:48,y:54},breakPt:{x:83,y:38},phases:['SEE THE LINE','JOIN','FIRST CORRECTION','SECOND CORRECTION','UNSTABLE RELEASE']},
  {id:'line',name:'Line error',glyph:'↕',desc:'The barrel never truly joins the clay flight line, so even acceptable timing produces an off-line shot.',cue:'DIAGNOSIS: WRONG LINE',mode:'line',break:.79,claySpeed:55,outcome:'miss',result:'MISS — OFF LINE',
    target:'M 7 67 C 30 58, 63 46, 95 33',gun:'M 10 88 C 30 78, 61 65, 95 52',hold:{x:16,y:84},pickup:{x:47,y:69},breakPt:{x:82,y:57},phases:['SEE THE LINE','APPROACH LOW','STAY LOW','LEAD LOOKS OK','SHOT OFF LINE']}
];

const demoSheet=document.querySelector('#demoSheet');
let demoIndex=0,demoRAF=null,demoStart=0;

function demoCard(d){return `<button class="demo-tile" data-demo="${d.id}"><span class="demo-tile-glyph">${d.glyph}</span><span><strong>${d.name}</strong><small>${d.desc}</small></span></button>`}
function renderShotDemoGrid(){const grid=document.querySelector('#demoGrid');if(grid)grid.innerHTML=shotDemos.map(demoCard).join('')}
window.renderShotDemoGrid=renderShotDemoGrid;
renderShotDemoGrid();

document.addEventListener('click',e=>{const b=e.target.closest('[data-demo]');if(!b)return;const idx=shotDemos.findIndex(d=>d.id===b.dataset.demo);if(idx>=0)openDemo(idx)});
document.querySelector('#demoClose')?.addEventListener('click',closeDemo);
document.querySelector('#demoReplay')?.addEventListener('click',replayDemo);
document.querySelector('#demoNext')?.addEventListener('click',()=>openDemo((demoIndex+1)%shotDemos.length));

function ensureOutcomeUI(){
  const stage=document.querySelector('#demoStage');
  if(!document.querySelector('#demoOutcome')){const el=document.createElement('div');el.id='demoOutcome';el.className='demo-outcome';stage.appendChild(el)}
  if(!document.querySelector('#demoFragments')){const el=document.createElement('div');el.id='demoFragments';el.className='demo-fragments';stage.appendChild(el)}
}
ensureOutcomeUI();

function openDemo(index){
  demoIndex=index;const d=shotDemos[index];
  document.querySelector('#demoTitle').textContent=d.name;
  document.querySelector('#demoDescription').textContent=d.desc;
  document.querySelector('#demoCue').textContent=d.cue;
  document.querySelector('#demoTargetPath').setAttribute('d',d.target);
  document.querySelector('#demoGunPath').setAttribute('d',d.gun);
  document.querySelector('#demoClaySpeed').textContent=d.claySpeed+' mph';
  document.querySelector('#demoGunSpeed').textContent='—';
  positionDemoLabel('#demoHoldLabel',d.hold);positionDemoLabel('#demoPickupLabel',d.pickup);positionDemoLabel('#demoBreakLabel',d.breakPt);
  demoSheet.classList.add('active');demoSheet.setAttribute('aria-hidden','false');replayDemo();
}

function closeDemo(){cancelAnimationFrame(demoRAF);demoRAF=null;demoSheet.classList.remove('active');demoSheet.setAttribute('aria-hidden','true')}
function positionDemoLabel(sel,p){const el=document.querySelector(sel);el.style.left=p.x+'%';el.style.top=p.y+'%'}
function pointOnPath(path,t){const len=path.getTotalLength();const p=path.getPointAtLength(Math.max(0,Math.min(1,t))*len);return{x:p.x,y:p.y}}
function setDemoElement(el,p){el.style.left=p.x+'%';el.style.top=p.y+'%'}
function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function clayProgress(t){return .03+.94*t}
function gunProgress(d,t){if(d.mode==='sustained')return clamp((t-.08)/.86);if(d.mode==='pullaway')return clamp((t-.10)/.82);if(d.mode==='swingthrough')return clamp((t-.08)/.82);if(d.mode==='looper')return clamp((t-.06)/.86);if(d.mode==='stopped')return t<.67?clamp((t-.08)/.72):.80;return clamp((t-.08)/.84)}

function breakClayAt(p){
  const clay=document.querySelector('#demoClay'),wrap=document.querySelector('#demoFragments');
  clay.classList.add('broken');wrap.innerHTML='';wrap.style.left=p.x+'%';wrap.style.top=p.y+'%';
  const vectors=[[-22,-17],[-9,-28],[12,-24],[25,-7],[18,18],[-15,20]];
  vectors.forEach((v,i)=>{const s=document.createElement('i');s.className='demo-fragment f'+i;s.style.setProperty('--dx',v[0]+'px');s.style.setProperty('--dy',v[1]+'px');s.style.setProperty('--rot',(i*57-85)+'deg');wrap.appendChild(s)});
  wrap.classList.remove('burst');void wrap.offsetWidth;wrap.classList.add('burst');
}
function showOutcome(d){const o=document.querySelector('#demoOutcome');o.textContent=d.result;o.className='demo-outcome show '+d.outcome}

function replayDemo(){
  cancelAnimationFrame(demoRAF);
  const d=shotDemos[demoIndex],clay=document.querySelector('#demoClay'),gun=document.querySelector('#demoGun'),shot=document.querySelector('#demoShot');
  const targetPath=document.querySelector('#demoTargetPath'),gunPath=document.querySelector('#demoGunPath'),phase=document.querySelector('#demoPhase'),leadLine=document.querySelector('#demoLeadLine'),gunSpeed=document.querySelector('#demoGunSpeed'),outcome=document.querySelector('#demoOutcome'),fragments=document.querySelector('#demoFragments');
  shot.classList.remove('show');clay.classList.remove('hit','broken');gun.classList.remove('fired');outcome.className='demo-outcome';outcome.textContent='';fragments.classList.remove('burst');fragments.innerHTML='';
  demoStart=performance.now();const duration=d.mode==='looper'?3000:2800;let fired=false,lastGunT=0,lastNow=demoStart,hitPoint=null;
  function frame(now){
    const t=clamp((now-demoStart)/duration),clayT=clayProgress(t),gunT=gunProgress(d,t);const cp=pointOnPath(targetPath,clayT),gp=pointOnPath(gunPath,gunT);
    if(!(d.outcome==='hit'&&fired)){setDemoElement(clay,cp)}setDemoElement(gun,gp);
    leadLine.setAttribute('x1',cp.x);leadLine.setAttribute('y1',cp.y);leadLine.setAttribute('x2',gp.x);leadLine.setAttribute('y2',gp.y);
    const dt=Math.max(16,now-lastNow),dg=Math.abs(gunT-lastGunT),relative=(dg/(dt/duration))/.94;gunSpeed.textContent=(d.mode==='stopped'&&t>.67?'0':Math.round(d.claySpeed*Math.max(.25,Math.min(1.8,relative))))+' mph';lastGunT=gunT;lastNow=now;
    const phaseIndex=Math.min(d.phases.length-1,Math.floor(t*d.phases.length));phase.textContent=d.phases[phaseIndex];
    if(t>=d.break&&!fired){
      fired=true;hitPoint={...cp};setDemoElement(shot,gp);shot.classList.add('show');gun.classList.add('fired');
      if(d.outcome==='hit'){setTimeout(()=>breakClayAt(hitPoint),70)}
      setTimeout(()=>showOutcome(d),180);
    }
    if(t<1)demoRAF=requestAnimationFrame(frame);else phase.textContent=d.phases.at(-1);
  }
  demoRAF=requestAnimationFrame(frame);
}
