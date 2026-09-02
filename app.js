const activities=[
{id:'diagnostic',name:'Shot Diagnostic',type:'drill',glyph:'⌖',desc:'Use touch as the gun, fire, then follow the diagnostic tree.',seconds:30,mode:'diagnostic',tip:'Drag your finger anywhere on the training area to represent the gun. Follow the orange clay, then lift your finger to fire.',note:'For this browser prototype, your finger is standing in for ShotSight Sense. The result looks at release error, approach smoothness, corrections and whether the movement stalled.'},
{id:'three',name:'Three Bullet',type:'drill',glyph:'•••',desc:'Peripheral awareness without chasing the target.',seconds:45,mode:'three',tip:'Keep your eyes softly centred and become aware of all three dots at once. Do not flick your eyes from dot to dot.',note:'The aim is broad peripheral awareness: see the whole visual field rather than chasing individual targets.'},
{id:'saccade',name:'Saccade Ladder',type:'drill',glyph:'↔',desc:'Fast, clean eye movements between fixed points.',seconds:40,mode:'saccade',tip:'Move only your eyes to each new point. Let the target arrive in clear vision before the next jump.',note:'Keep the head quiet. We are training fast, deliberate visual acquisition rather than gun movement.'},
{id:'pursuit',name:'Smooth Pursuit',type:'drill',glyph:'∿',desc:'Track movement smoothly without jumping ahead.',seconds:45,mode:'pursuit',tip:'Follow the moving dot continuously. Avoid jumping ahead, dropping behind or making repeated catch-up movements.',note:'Think smooth visual connection with the target, not prediction.'},
{id:'quiet',name:'Quiet Eye',type:'drill',glyph:'◎',desc:'Settle gaze and build a calm visual hold.',seconds:40,mode:'quiet',tip:'Settle your gaze around the centre without staring hard. Keep the eyes quiet, relaxed and receptive.',note:'This is about visual stability before movement starts: calm attention rather than intense fixation.'},
{id:'whack',name:'Whack a Clay',type:'game',glyph:'◉',desc:'Acquire random targets quickly. Tap to score.',seconds:30,mode:'whack',tip:'Acquire the orange clay and tap it as soon as you see it clearly. A new clay appears immediately.',note:'This game emphasises fast acquisition. Later the tap will be replaced by ShotSight Sense detecting the gun and shot.'},
{id:'invaders',name:'Clay Invaders',type:'game',glyph:'⌄',desc:'Clear moving clays before they cross the screen.',seconds:35,mode:'invaders',tip:'Track the moving clay and tap it before it reaches the bottom. Missing one costs a point.',note:'Stay controlled as the pace changes. Speed without visual control is not the goal.'},
{id:'stay',name:'Stay on Your Bird',type:'game',glyph:'⊙',desc:'Ignore distractions and stay with the live target.',seconds:40,mode:'stay',tip:'Stay visually connected to the orange target while the white distractors move around it.',note:'Do not chase the distractions. This trains target commitment and resistance to visual interference.'},
{id:'reaction',name:'Flash Point',type:'game',glyph:'✦',desc:'React to brief appearances without anticipating.',seconds:30,mode:'reaction',tip:'Tap the orange target before it fades. Wait to see it; do not guess where it will appear.',note:'The objective is clean reaction to real visual information rather than anticipation.'}
];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const drillGrid=$('#drillGrid'),gameGrid=$('#gameGrid'),libraryList=$('#libraryList');
let current=null,timer=null,mover=null,remaining=0,score=0,running=false,paused=false,soundOn=true;
let dailyQueue=null,dailyIndex=0,pendingActivity=null,pendingDaily=false;
let aimPath=[],aimStart=0,diagnosticResult=null,targetXY={x:50,y:50};

function card(a){return `<button class="activity-card" data-id="${a.id}"><span class="glyph">${a.glyph}</span><span><strong>${a.name}</strong><small>${a.desc}</small></span></button>`}
drillGrid.innerHTML=activities.filter(a=>a.type==='drill').slice(0,4).map(card).join('');
gameGrid.innerHTML=activities.filter(a=>a.type==='game').slice(0,4).map(card).join('');
function renderLibrary(filter='all'){libraryList.innerHTML=activities.filter(a=>filter==='all'||a.type===filter).map(a=>`<button class="library-item" data-id="${a.id}"><span class="library-icon">${a.glyph}</span><span><strong>${a.name}</strong><small>${a.type==='drill'?'DRILL':'GAME'} · ${a.seconds}s</small></span><span class="arrow">›</span></button>`).join('')}
renderLibrary();

function navTo(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));$('#pageTitle').textContent=id==='homeView'?'Train your eyes.':id==='libraryView'?'Choose your work.':'See the trend.';if(id==='progressView')renderProgress()}
$$('.tab').forEach(t=>t.addEventListener('click',()=>navTo(t.dataset.view)));
$$('.chip').forEach(c=>c.addEventListener('click',()=>{$$('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');renderLibrary(c.dataset.filter)}));

document.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)requestOpen(activities.find(a=>a.id===b.dataset.id));});
$('[data-start="daily"]').addEventListener('click',()=>{dailyQueue=['three','saccade','pursuit'].map(id=>activities.find(a=>a.id===id));dailyIndex=0;requestOpen(dailyQueue[0],true)});

function requestOpen(a,daily=false){
  pendingActivity=a;pendingDaily=daily;
  if(localStorage.getItem(`shotsight-hide-tip-${a.id}`)==='1'){openPlayer(a,daily);return}
  $('#tipIcon').textContent=a.glyph;$('#tipTitle').textContent=a.name;$('#tipBody').textContent=a.tip;$('#tipNote').textContent=a.note;$('#tipHide').checked=false;
  $('#tipSheet').classList.add('active');$('#tipSheet').setAttribute('aria-hidden','false');
}
$('#tipContinue').addEventListener('click',()=>{
  if($('#tipHide').checked&&pendingActivity)localStorage.setItem(`shotsight-hide-tip-${pendingActivity.id}`,'1');
  $('#tipSheet').classList.remove('active');$('#tipSheet').setAttribute('aria-hidden','true');
  if(pendingActivity)openPlayer(pendingActivity,pendingDaily);
});

function openPlayer(a,daily=false){
  current={...a,daily};remaining=a.seconds;score=0;running=false;paused=false;diagnosticResult=null;
  $('#playerView').classList.add('active');$('#playerView').setAttribute('aria-hidden','false');$('#playerType').textContent=a.type.toUpperCase();$('#playerName').textContent=a.name;
  $('#scoreLabel').textContent=a.type==='game'?'SCORE':'CUE';$('#scoreValue').textContent=a.type==='game'?'0':'READY';$('#timeValue').textContent=formatTime(remaining);$('#actionButton').textContent='Begin';$('#actionButton').style.display='block';$('#pausePlayer').textContent='Ⅱ';$('#pausePlayer').style.visibility='visible';resetStage();
  $('#interactionHint').textContent=a.mode==='diagnostic'?'DRAG TO AIM · LIFT TO FIRE':'';
}
function closePlayer(){stopLoops();removeDiagnosticInput();$('#playerView').classList.remove('active');$('#playerView').setAttribute('aria-hidden','true');running=false}
$('#closePlayer').addEventListener('click',closePlayer);
$('#actionButton').addEventListener('click',()=>{if(!running)countIn();else finishActivity()});
$('#pausePlayer').addEventListener('click',()=>{if(!running)return;paused=!paused;$('#playerView').classList.toggle('paused',paused);$('#pausePlayer').textContent=paused?'▶':'Ⅱ'});
$('#soundToggle').addEventListener('click',()=>{soundOn=!soundOn;$('#soundToggle').style.opacity=soundOn?1:.35});
function beep(freq=540,d=.045){if(!soundOn)return;try{const ac=new (window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function countIn(){let n=3;$('#countdown').textContent=n;$('#actionButton').disabled=true;const c=setInterval(()=>{n--;if(n>0){$('#countdown').textContent=n;beep()}else{clearInterval(c);$('#countdown').textContent='';$('#actionButton').disabled=false;startActivity()}},600)}
function startActivity(){running=true;$('#actionButton').textContent='Finish';setupMode();timer=setInterval(()=>{if(paused)return;remaining--;$('#timeValue').textContent=formatTime(remaining);if(remaining<=0)finishActivity()},1000)}

function resetStage(){
  stopLoops();removeDiagnosticInput();$('#diagnosticPanel').classList.remove('active');$('#trace').innerHTML='';$('#aimDot').style.display='none';$('#shotMark').style.display='none';
  const ts=[$('#target'),$('#target2'),$('#target3')];ts.forEach((t,i)=>{t.style.display=i?'none':'block';t.style.left='50%';t.style.top='50%';t.style.width='28px';t.style.height='28px';t.style.transform='translate(-50%,-50%)';t.style.opacity='1';t.style.background=i?'#f2f5f7':'var(--accent)'});$('#crosshair').style.display='none';
}
function setupMode(){
  resetStage();const t=$('#target'),t2=$('#target2'),t3=$('#target3');
  if(current.mode==='diagnostic'){setupDiagnostic()}
  else if(current.mode==='three'){[t,t2,t3].forEach(x=>x.style.display='block');place(t,25,50);place(t2,50,50);place(t3,75,50);$('#scoreValue').textContent='SOFT EYES';mover=setInterval(()=>{if(paused)return;const y=35+Math.random()*30;place(t,22,y);place(t2,50,100-y);place(t3,78,y)},2800)}
  else if(current.mode==='saccade'){t.style.display='block';const pts=[[18,25],[82,25],[18,75],[82,75],[50,50]];let i=0;place(t,...pts[0]);$('#scoreValue').textContent='EYES ONLY';mover=setInterval(()=>{if(paused)return;i=(i+1)%pts.length;place(t,...pts[i]);beep(700,.025)},900)}
  else if(current.mode==='pursuit'){t.style.display='block';$('#scoreValue').textContent='SMOOTH';let x=10,dir=1;mover=setInterval(()=>{if(paused)return;x+=dir*.35;if(x>90||x<10)dir*=-1;place(t,x,50+18*Math.sin(x/10))},16)}
  else if(current.mode==='quiet'){t.style.display='block';$('#crosshair').style.display='block';$('#scoreValue').textContent='SETTLE';t.style.width='12px';t.style.height='12px'}
  else if(current.mode==='whack'||current.mode==='reaction'){t.style.display='block';randomTarget();$('#scoreValue').textContent='0';t.addEventListener('pointerdown',hitTarget)}
  else if(current.mode==='invaders'){t.style.display='block';$('#scoreValue').textContent='0';let x=10,y=18,dx=.45;mover=setInterval(()=>{if(paused)return;x+=dx;if(x>90||x<10){dx*=-1;y+=10}if(y>88){y=18;score=Math.max(0,score-1);$('#scoreValue').textContent=score}place(t,x,y)},18);t.addEventListener('pointerdown',hitTarget)}
  else if(current.mode==='stay'){[t,t2,t3].forEach(x=>x.style.display='block');t.style.background='var(--accent)';$('#scoreValue').textContent='LOCK ON';let q=0;mover=setInterval(()=>{if(paused)return;q+=.04;place(t,50+32*Math.sin(q),50+22*Math.sin(q*.7));place(t2,50+35*Math.sin(q+2),50+25*Math.cos(q));place(t3,50+30*Math.cos(q*.8),50+28*Math.sin(q+4))},16)}
}

function setupDiagnostic(){
  const t=$('#target');t.style.display='block';$('#scoreValue').textContent='FOLLOW';$('#actionButton').style.display='none';$('#pausePlayer').style.visibility='hidden';
  let q=0;mover=setInterval(()=>{if(paused)return;q+=.025;const x=50+34*Math.sin(q),y=50+22*Math.sin(q*.63+.8);place(t,x,y);targetXY={x,y}},16);
  addDiagnosticInput();
}
function addDiagnosticInput(){const s=$('#stage');s.addEventListener('pointerdown',aimDown);s.addEventListener('pointermove',aimMove);s.addEventListener('pointerup',aimUp);s.addEventListener('pointercancel',aimCancel)}
function removeDiagnosticInput(){const s=$('#stage');s.removeEventListener('pointerdown',aimDown);s.removeEventListener('pointermove',aimMove);s.removeEventListener('pointerup',aimUp);s.removeEventListener('pointercancel',aimCancel)}
function pointFromEvent(e){const r=$('#stage').getBoundingClientRect();return{x:Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)),time:performance.now(),px:e.clientX-r.left,py:e.clientY-r.top}}
function aimDown(e){if(!running||paused||current.mode!=='diagnostic'||$('#diagnosticPanel').classList.contains('active'))return;e.preventDefault();try{$('#stage').setPointerCapture(e.pointerId)}catch(_){}aimPath=[];aimStart=performance.now();const p=pointFromEvent(e);aimPath.push(p);showAim(p);drawTrace()}
function aimMove(e){if(!aimPath.length||!running||paused)return;e.preventDefault();const p=pointFromEvent(e);const last=aimPath[aimPath.length-1];if(Math.hypot(p.px-last.px,p.py-last.py)>2){aimPath.push(p);if(aimPath.length>80)aimPath.shift();showAim(p);drawTrace()}}
function aimUp(e){if(!aimPath.length||!running||paused)return;e.preventDefault();const p=pointFromEvent(e);aimPath.push(p);showAim(p);fireDiagnostic(p)}
function aimCancel(){aimPath=[];$('#aimDot').style.display='none';$('#trace').innerHTML=''}
function showAim(p){const d=$('#aimDot');d.style.display='block';d.style.left=p.x+'%';d.style.top=p.y+'%'}
function drawTrace(){if(aimPath.length<2)return;const pts=aimPath.map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');$('#trace').innerHTML=`<polyline points="${pts}" />`}

function fireDiagnostic(p){
  clearInterval(mover);mover=null;removeDiagnosticInput();beep(880,.06);const mark=$('#shotMark');mark.style.display='block';mark.style.left=p.x+'%';mark.style.top=p.y+'%';
  const stage=$('#stage').getBoundingClientRect();const dx=(p.x-targetXY.x)/100*stage.width,dy=(p.y-targetXY.y)/100*stage.height,errorPx=Math.hypot(dx,dy);const errorPct=Math.hypot(p.x-targetXY.x,p.y-targetXY.y);
  let pathLen=0,direct=0,corrections=0,lastSign=0;for(let i=1;i<aimPath.length;i++){pathLen+=Math.hypot(aimPath[i].px-aimPath[i-1].px,aimPath[i].py-aimPath[i-1].py)}if(aimPath.length>1)direct=Math.hypot(aimPath.at(-1).px-aimPath[0].px,aimPath.at(-1).py-aimPath[0].py);
  const smooth=pathLen>0?Math.max(0,Math.min(100,direct/pathLen*100)):100;
  for(let i=Math.max(2,aimPath.length-24);i<aimPath.length;i++){const vx=aimPath[i].px-aimPath[i-1].px;const s=Math.sign(vx);if(s&&lastSign&&s!==lastSign)corrections++;if(s)lastSign=s}
  const elapsed=Math.max(1,performance.now()-aimStart);let tailDist=0;const start=Math.max(1,aimPath.length-6);for(let i=start;i<aimPath.length;i++)tailDist+=Math.hypot(aimPath[i].px-aimPath[i-1].px,aimPath[i].py-aimPath[i-1].py);const stalled=aimPath.length>5&&tailDist<8;
  let title='Clean release',branch='On line',motion='Smooth',cue='Good visual connection and a controlled release. Repeat it and look for the same simple movement.';
  if(errorPct>13&&elapsed<450){title='Rushed release';branch='Off line',motion='Early trigger',cue='You released before the aim path had settled onto the target. See it clearly first, then complete the movement.'}
  else if(errorPct>13&&stalled){title='Stopped gun';branch='Off line',motion='Stall before shot',cue='The approach slowed sharply just before release. Keep the movement alive through the shot rather than arriving and stopping.'}
  else if(corrections>=3||smooth<55){title='Over-correction';branch=errorPct<=13?'On line':'Off line',motion='Multiple corrections',cue='The path contains repeated direction changes. Trust the first committed move and reduce steering at the end.'}
  else if(errorPct>13){title='Release off target';branch='Off line',motion=smooth>70?'Smooth':'Uneven',cue='The movement was reasonably controlled, but the release point was away from the target. Stay visually connected for a fraction longer.'}
  diagnosticResult={title,errorPx,errorPct,smooth,elapsed,corrections,stalled,branch,motion,cue};showDiagnostic();
}
function showDiagnostic(){
  const r=diagnosticResult;$('#diagTitle').textContent=r.title;$('#diagError').textContent=r.errorPct.toFixed(1)+'%';$('#diagSmooth').textContent=Math.round(r.smooth)+'%';$('#diagTime').textContent=Math.round(r.elapsed)+' ms';$('#diagCue').textContent=r.cue;
  $('#diagTree').innerHTML=`<div class="tree-row"><span>1 · RELEASE</span><strong>${r.branch}</strong></div><div class="tree-row active"><span>2 · MOTION</span><strong>${r.motion}</strong></div><div class="tree-row"><span>3 · PATTERN</span><strong>${r.corrections} correction${r.corrections===1?'':'s'}${r.stalled?' · stall detected':''}</strong></div>`;
  $('#scoreValue').textContent='REVIEW';$('#diagnosticPanel').classList.add('active');
}
$('#diagnosticAgain').addEventListener('click',()=>{if(!current||current.mode!=='diagnostic')return;$('#diagnosticPanel').classList.remove('active');remaining=current.seconds;$('#timeValue').textContent=formatTime(remaining);score=0;running=true;setupMode();timer=setInterval(()=>{if(paused)return;remaining--;$('#timeValue').textContent=formatTime(remaining);if(remaining<=0)finishActivity()},1000)});
$('#diagnosticDone').addEventListener('click',()=>{if(current&&current.mode==='diagnostic'){score=diagnosticResult?Math.round(Math.max(0,100-diagnosticResult.errorPct*3)):0;finishActivity()}});

function hitTarget(e){e.preventDefault();if(!running||paused)return;score++;$('#scoreValue').textContent=score;beep(850,.035);randomTarget()}
function randomTarget(){place($('#target'),12+Math.random()*76,14+Math.random()*72);if(current.mode==='reaction'){const t=$('#target');t.style.opacity='1';setTimeout(()=>{if(running)t.style.opacity='.08'},520)}}
function place(el,x,y){el.style.left=x+'%';el.style.top=y+'%';if(el.id==='target')targetXY={x,y}}
function stopLoops(){clearInterval(timer);clearInterval(mover);timer=mover=null;$('#target').removeEventListener('pointerdown',hitTarget)}
function finishActivity(){
  if(!running){closePlayer();return}running=false;stopLoops();removeDiagnosticInput();saveSession(current,Math.max(1,current.seconds-remaining),score);beep(900,.1);
  if(current.daily&&dailyQueue&&dailyIndex<dailyQueue.length-1){dailyIndex++;const next=dailyQueue[dailyIndex];closePlayer();setTimeout(()=>requestOpen(next,true),250)}else{dailyQueue=null;dailyIndex=0;closePlayer();renderProgress()}
}
function formatTime(s){return `00:${String(Math.max(0,s)).padStart(2,'0')}`}
function saveSession(a,secs,points){const h=JSON.parse(localStorage.getItem('shotsight-history')||'[]');h.unshift({name:a.name,type:a.type,secs,points,date:new Date().toISOString()});localStorage.setItem('shotsight-history',JSON.stringify(h.slice(0,30)))}
function renderProgress(){const h=JSON.parse(localStorage.getItem('shotsight-history')||'[]');$('#statSessions').textContent=h.length;$('#statMinutes').textContent=Math.round(h.reduce((n,x)=>n+x.secs,0)/60);const games=h.filter(x=>x.type==='game');$('#statBest').textContent=games.length?Math.max(...games.map(x=>x.points)):'—';$('#historyList').innerHTML=h.length?h.slice(0,8).map(x=>`<div class="history-row"><strong>${x.name}</strong><span>${x.type==='game'?x.points+' pts':x.secs+' sec'}</span></div>`).join(''):'<div class="empty">Complete a drill or game and it will appear here.</div>'}
$('#clearHistory').addEventListener('click',()=>{localStorage.removeItem('shotsight-history');renderProgress()});
renderProgress();
