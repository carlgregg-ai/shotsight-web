const shotDemos=[
  {id:'sustained',name:'Sustained lead',glyph:'→',desc:'Establish the gap, keep it constant, then fire without changing the relationship.',cue:'MATCH → SET GAP → KEEP MOVING',mode:'sustained',lead:.085,break:.78,claySpeed:55,phases:['SEE THE LINE','MATCH SPEED','ESTABLISH LEAD','HOLD THE GAP','FIRE — KEEP MOVING']},
  {id:'pullaway',name:'Pull-away',glyph:'↗',desc:'Match the clay first, then accelerate the gun away to create the lead.',cue:'MATCH → PULL AWAY → FIRE',mode:'pullaway',lead:.10,break:.80,claySpeed:55,phases:['SEE THE LINE','JOIN THE CLAY','MATCH SPEED','ACCELERATE AWAY','FIRE — CONTINUE']},
  {id:'swingthrough',name:'Swing-through',glyph:'⇢',desc:'Start behind, pass through the clay and fire as the gun moves through the required lead.',cue:'BEHIND → THROUGH → FIRE',mode:'swingthrough',lead:.09,break:.79,claySpeed:55,phases:['SEE THE LINE','START BEHIND','MOVE THROUGH','PASS THE CLAY','FIRE — KEEP SWINGING']},
  {id:'behind',name:'Behind / under-led',glyph:'‹',desc:'The gun is on the correct line but never creates enough separation, so the shot is released behind.',cue:'DIAGNOSIS: INSUFFICIENT LEAD',mode:'behind',lead:-.04,break:.78,claySpeed:55,phases:['SEE THE LINE','JOIN LATE','GUN TRAILS','GAP TOO SMALL','SHOT BEHIND']},
  {id:'ahead',name:'In front / over-led',glyph:'›',desc:'The gun is on the line but creates too much separation before release.',cue:'DIAGNOSIS: EXCESS LEAD',mode:'ahead',lead:.16,break:.76,claySpeed:55,phases:['SEE THE LINE','FAST APPROACH','OVERTAKE','GAP GROWS','SHOT IN FRONT']},
  {id:'stopped',name:'Stopped gun',glyph:'■',desc:'The gun gets to the correct line and lead, then loses movement before release.',cue:'DIAGNOSIS: MOVEMENT STALL',mode:'stopped',lead:.08,break:.80,claySpeed:55,phases:['SEE THE LINE','GOOD APPROACH','CORRECT GAP','GUN STALLS','SHOT FALLS BEHIND']},
  {id:'correction',name:'Over-correction',glyph:'≈',desc:'The gun repeatedly changes pace near the break point instead of making one committed move.',cue:'DIAGNOSIS: TOO MANY CORRECTIONS',mode:'correction',lead:.07,break:.80,claySpeed:55,phases:['SEE THE LINE','JOIN','FIRST CORRECTION','SECOND CORRECTION','UNSTABLE RELEASE']},
  {id:'line',name:'Line error',glyph:'↕',desc:'The timing may look acceptable, but the gun is displaced away from the clay flight line at release.',cue:'DIAGNOSIS: WRONG LINE',mode:'line',lead:.08,break:.79,claySpeed:55,phases:['SEE THE LINE','APPROACH LOW','MATCH SPEED','LEAD LOOKS OK','SHOT OFF LINE']}
];

const targetPathD='M 7 67 C 30 58, 63 46, 95 33';
const demoGrid=document.querySelector('#demoGrid');
const demoSheet=document.querySelector('#demoSheet');
let demoIndex=0,demoRAF=null,demoStart=0;

function demoCard(d){return `<button class="demo-tile" data-demo="${d.id}"><span class="demo-tile-glyph">${d.glyph}</span><span><strong>${d.name}</strong><small>${d.desc}</small></span></button>`}
if(demoGrid)demoGrid.innerHTML=shotDemos.map(demoCard).join('');

document.addEventListener('click',e=>{const b=e.target.closest('[data-demo]');if(!b)return;const idx=shotDemos.findIndex(d=>d.id===b.dataset.demo);if(idx>=0)openDemo(idx)});

document.querySelector('#demoClose')?.addEventListener('click',closeDemo);
document.querySelector('#demoReplay')?.addEventListener('click',replayDemo);
document.querySelector('#demoNext')?.addEventListener('click',()=>openDemo((demoIndex+1)%shotDemos.length));

function openDemo(index){
  demoIndex=index;const d=shotDemos[index];
  document.querySelector('#demoTitle').textContent=d.name;
  document.querySelector('#demoDescription').textContent=d.desc;
  document.querySelector('#demoCue').textContent=d.cue;
  document.querySelector('#demoTargetPath').setAttribute('d',targetPathD);
  document.querySelector('#demoGunPath').setAttribute('d',targetPathD);
  document.querySelector('#demoClaySpeed').textContent=d.claySpeed+' mph';
  document.querySelector('#demoGunSpeed').textContent='—';
  positionDemoLabel('#demoHoldLabel',{x:18,y:63});
  positionDemoLabel('#demoPickupLabel',{x:43,y:53});
  positionDemoLabel('#demoBreakLabel',{x:81,y:38});
  demoSheet.classList.add('active');demoSheet.setAttribute('aria-hidden','false');replayDemo();
}

function closeDemo(){cancelAnimationFrame(demoRAF);demoRAF=null;demoSheet.classList.remove('active');demoSheet.setAttribute('aria-hidden','true')}
function positionDemoLabel(sel,p){const el=document.querySelector(sel);el.style.left=p.x+'%';el.style.top=p.y+'%'}
function pointOnPath(path,t){const len=path.getTotalLength();const p=path.getPointAtLength(Math.max(0,Math.min(1,t))*len);return{x:p.x,y:p.y}}
function setDemoElement(el,p){el.style.left=p.x+'%';el.style.top=p.y+'%'}
function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}

function gunProgress(d,t,clayT){
  if(d.mode==='sustained') return clamp(clayT + (t<.28?(-.12 + t/.28*(.12+d.lead)):d.lead));
  if(d.mode==='pullaway'){
    if(t<.38)return clamp(clayT-.035);
    const u=clamp((t-.38)/.34);return clamp(clayT-.035 + u*(d.lead+.035));
  }
  if(d.mode==='swingthrough'){
    const u=clamp((t-.12)/.58);return clamp(clayT-.16 + u*(d.lead+.16));
  }
  if(d.mode==='behind')return clamp(clayT-.055);
  if(d.mode==='ahead')return clamp(clayT + (t<.28?0.01:.04+(t-.28)*.20));
  if(d.mode==='stopped'){
    const normal=clamp(clayT + (t<.34?-.06+t/.34*(.06+d.lead):d.lead));
    return t<.68?normal:clamp(.735);
  }
  if(d.mode==='correction'){
    const base=clayT + .055;const wobble=t>.48?Math.sin((t-.48)*38)*.035:0;return clamp(base+wobble);
  }
  if(d.mode==='line')return clamp(clayT+d.lead);
  return clayT;
}

function replayDemo(){
  cancelAnimationFrame(demoRAF);
  const d=shotDemos[demoIndex],clay=document.querySelector('#demoClay'),gun=document.querySelector('#demoGun'),shot=document.querySelector('#demoShot');
  const targetPath=document.querySelector('#demoTargetPath'),gunPath=document.querySelector('#demoGunPath'),phase=document.querySelector('#demoPhase'),leadLine=document.querySelector('#demoLeadLine'),gunSpeed=document.querySelector('#demoGunSpeed');
  shot.classList.remove('show');clay.classList.remove('hit');gun.classList.remove('fired');
  demoStart=performance.now();
  const duration=3200;
  let fired=false,lastGunT=0,lastNow=demoStart;
  function frame(now){
    const t=clamp((now-demoStart)/duration);
    const clayT=.035+.93*t;
    const gunT=gunProgress(d,t,clayT);
    const cp=pointOnPath(targetPath,clayT);
    let gp=pointOnPath(gunPath,gunT);
    if(d.mode==='line')gp={x:gp.x,y:gp.y+10};
    setDemoElement(clay,cp);setDemoElement(gun,gp);
    leadLine.setAttribute('x1',cp.x);leadLine.setAttribute('y1',cp.y);leadLine.setAttribute('x2',gp.x);leadLine.setAttribute('y2',gp.y);
    const dt=Math.max(16,now-lastNow),dg=Math.abs(gunT-lastGunT);const relative=(dg/(dt/duration))/.93;
    const displayGun=Math.round(d.claySpeed*Math.max(.25,Math.min(1.75,relative)));
    gunSpeed.textContent=(d.mode==='stopped'&&t>.68?'0':displayGun)+' mph';
    lastGunT=gunT;lastNow=now;
    const phaseIndex=Math.min(d.phases.length-1,Math.floor(t*d.phases.length));phase.textContent=d.phases[phaseIndex];
    if(t>=d.break&&!fired){fired=true;setDemoElement(shot,gp);shot.classList.add('show');gun.classList.add('fired');if(['sustained','pullaway','swingthrough'].includes(d.id))clay.classList.add('hit')}
    if(t<1)demoRAF=requestAnimationFrame(frame);else phase.textContent=d.phases.at(-1);
  }
  demoRAF=requestAnimationFrame(frame);
}
