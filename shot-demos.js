const shotDemos=[
  {
    id:'sustained',name:'Sustained lead',glyph:'→',
    desc:'Establish the gap, keep it, then fire without changing the relationship.',
    cue:'MATCH → SET GAP → KEEP MOVING',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 77 C 30 67, 63 51, 94 41',
    hold:{x:18,y:70},pickup:{x:40,y:56},break:{x:78,y:39},
    timing:{pickup:.28,break:.78},lead:7,
    phases:['SEE THE LINE','MATCH SPEED','ESTABLISH LEAD','HOLD THE GAP','FIRE — KEEP MOVING']
  },
  {
    id:'pullaway',name:'Pull-away',glyph:'↗',
    desc:'Match the clay first, then accelerate the gun away to create the lead.',
    cue:'MATCH → PULL AWAY → FIRE',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 76 C 37 63, 63 48, 94 36',
    hold:{x:18,y:70},pickup:{x:44,y:52},break:{x:80,y:37},
    timing:{pickup:.36,break:.80},lead:9,
    phases:['SEE THE LINE','JOIN THE CLAY','MATCH SPEED','ACCELERATE AWAY','FIRE — CONTINUE']
  },
  {
    id:'swingthrough',name:'Swing-through',glyph:'⇢',
    desc:'Start behind, pass through the clay and fire as the gun moves through the required lead.',
    cue:'BEHIND → THROUGH → FIRE',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 84 C 35 71, 62 49, 94 31',
    hold:{x:18,y:78},pickup:{x:48,y:55},break:{x:79,y:34},
    timing:{pickup:.42,break:.77},lead:8,
    phases:['SEE THE LINE','START BEHIND','MOVE THROUGH','PASS THE CLAY','FIRE — KEEP SWINGING']
  },
  {
    id:'behind',name:'Behind / under-led',glyph:'‹',
    desc:'The gun never creates enough separation, so the shot is released behind the clay.',
    cue:'DIAGNOSIS: INSUFFICIENT LEAD',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 78 C 32 67, 64 54, 94 46',
    hold:{x:18,y:71},pickup:{x:43,y:58},break:{x:77,y:48},
    timing:{pickup:.34,break:.76},lead:-5,
    phases:['SEE THE LINE','JOIN LATE','GUN TRAILS','GAP TOO SMALL','SHOT BEHIND']
  },
  {
    id:'ahead',name:'In front / over-led',glyph:'›',
    desc:'The gun creates too much separation before release, sending the shot in front.',
    cue:'DIAGNOSIS: EXCESS LEAD',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 76 C 35 60, 65 40, 94 25',
    hold:{x:18,y:69},pickup:{x:40,y:51},break:{x:76,y:29},
    timing:{pickup:.30,break:.74},lead:14,
    phases:['SEE THE LINE','FAST APPROACH','OVERTAKE','GAP GROWS','SHOT IN FRONT']
  },
  {
    id:'stopped',name:'Stopped gun',glyph:'■',
    desc:'The gun arrives correctly, then loses movement before or during the release.',
    cue:'DIAGNOSIS: MOVEMENT STALL',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 77 C 35 65, 58 50, 74 43 C 77 42, 78 42, 79 42',
    hold:{x:18,y:70},pickup:{x:43,y:56},break:{x:78,y:42},
    timing:{pickup:.34,break:.79},lead:2,
    phases:['SEE THE LINE','GOOD APPROACH','CORRECT GAP','GUN STALLS','SHOT FALLS BEHIND']
  },
  {
    id:'correction',name:'Over-correction',glyph:'≈',
    desc:'Repeated changes of direction near the break point reveal chasing rather than one committed move.',
    cue:'DIAGNOSIS: TOO MANY CORRECTIONS',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 78 C 34 64, 52 54, 63 45 C 70 39, 67 49, 74 42 C 79 37, 76 44, 86 35',
    hold:{x:18,y:71},pickup:{x:43,y:56},break:{x:80,y:39},
    timing:{pickup:.33,break:.81},lead:5,
    phases:['SEE THE LINE','JOIN','FIRST CORRECTION','SECOND CORRECTION','UNSTABLE RELEASE']
  },
  {
    id:'line',name:'Line error',glyph:'↕',
    desc:'Lead may be acceptable, but the gun is displaced above or below the clay line at release.',
    cue:'DIAGNOSIS: WRONG LINE',
    target:'M 8 62 C 32 52, 66 42, 94 34',
    gun:'M 8 83 C 34 74, 65 61, 94 52',
    hold:{x:18,y:77},pickup:{x:43,y:66},break:{x:78,y:56},
    timing:{pickup:.35,break:.78},lead:5,
    phases:['SEE THE LINE','APPROACH LOW','MATCH SPEED','LEAD LOOKS OK','SHOT OFF LINE']
  }
];

const demoGrid=document.querySelector('#demoGrid');
const demoSheet=document.querySelector('#demoSheet');
let demoIndex=0,demoRAF=null,demoStart=0,demoRunning=false;

function demoCard(d){return `<button class="demo-tile" data-demo="${d.id}"><span class="demo-tile-glyph">${d.glyph}</span><span><strong>${d.name}</strong><small>${d.desc}</small></span></button>`}
if(demoGrid)demoGrid.innerHTML=shotDemos.map(demoCard).join('');

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-demo]');
  if(!b)return;
  const idx=shotDemos.findIndex(d=>d.id===b.dataset.demo);
  if(idx>=0)openDemo(idx);
});

function openDemo(index){
  demoIndex=index;
  const d=shotDemos[index];
  document.querySelector('#demoTitle').textContent=d.name;
  document.querySelector('#demoDescription').textContent=d.desc;
  document.querySelector('#demoCue').textContent=d.cue;
  document.querySelector('#demoTargetPath').setAttribute('d',d.target);
  document.querySelector('#demoGunPath').setAttribute('d',d.gun);
  positionDemoLabel('#demoHoldLabel',d.hold);
  positionDemoLabel('#demoPickupLabel',d.pickup);
  positionDemoLabel('#demoBreakLabel',d.break);
  demoSheet.classList.add('active');
  demoSheet.setAttribute('aria-hidden','false');
  replayDemo();
}

function closeDemo(){
  cancelAnimationFrame(demoRAF);demoRAF=null;demoRunning=false;
  demoSheet.classList.remove('active');demoSheet.setAttribute('aria-hidden','true');
}
function positionDemoLabel(sel,p){const el=document.querySelector(sel);el.style.left=p.x+'%';el.style.top=p.y+'%'}

document.querySelector('#demoClose')?.addEventListener('click',closeDemo);
document.querySelector('#demoReplay')?.addEventListener('click',replayDemo);
document.querySelector('#demoNext')?.addEventListener('click',()=>openDemo((demoIndex+1)%shotDemos.length));

function pointOnPath(path,t){
  const len=path.getTotalLength();
  const p=path.getPointAtLength(Math.max(0,Math.min(1,t))*len);
  return {x:p.x,y:p.y};
}
function setDemoElement(el,p){el.style.left=p.x+'%';el.style.top=p.y+'%'}

function replayDemo(){
  cancelAnimationFrame(demoRAF);
  const d=shotDemos[demoIndex],clay=document.querySelector('#demoClay'),gun=document.querySelector('#demoGun'),shot=document.querySelector('#demoShot');
  const targetPath=document.querySelector('#demoTargetPath'),gunPath=document.querySelector('#demoGunPath'),phase=document.querySelector('#demoPhase');
  shot.classList.remove('show');clay.classList.remove('hit');gun.classList.remove('fired');
  demoStart=performance.now();demoRunning=true;
  const duration=5200;
  function frame(now){
    const raw=(now-demoStart)/duration;
    const t=Math.max(0,Math.min(1,raw));
    const clayT=.04+.92*t;
    let gunT;
    if(d.id==='stopped'&&t>.72)gunT=.74; else gunT=Math.max(0,Math.min(1,(t-.08)/.84));
    setDemoElement(clay,pointOnPath(targetPath,clayT));
    setDemoElement(gun,pointOnPath(gunPath,gunT));
    const phaseIndex=Math.min(d.phases.length-1,Math.floor(t*d.phases.length));
    phase.textContent=d.phases[phaseIndex];
    if(t>=d.timing.break&&!shot.classList.contains('show')){
      const gp=pointOnPath(gunPath,gunT);setDemoElement(shot,gp);shot.classList.add('show');gun.classList.add('fired');
      if(['sustained','pullaway','swingthrough'].includes(d.id))clay.classList.add('hit');
    }
    if(t<1){demoRAF=requestAnimationFrame(frame)}else{demoRunning=false;phase.textContent=d.phases.at(-1)}
  }
  demoRAF=requestAnimationFrame(frame);
}
