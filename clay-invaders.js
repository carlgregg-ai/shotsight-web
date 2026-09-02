// Arcade-style Clay Invaders override
const baseSetupModeForInvaders = setupMode;
const baseStopLoopsForInvaders = stopLoops;
let clayInvadersTimer = null;
let clayInvadersWave = 1;
let clayInvadersAlive = 0;
let clayInvadersX = 0;
let clayInvadersY = 0;
let clayInvadersDir = 1;
let clayInvadersSpeed = 0.72;
let clayInvadersFormation = null;
let clayInvadersHud = null;

const invaderActivity = activities.find(a=>a.id==='invaders');
if(invaderActivity){
  invaderActivity.desc='Clear a moving formation of clays, arcade style.';
  invaderActivity.tip='A formation of clays moves side to side and drops lower each time it reaches an edge. Tap individual clays to break them before the formation gets too low.';
  invaderActivity.note='Like the classic arcade game: clear the whole grid to start a faster wave. Each clay disappears when hit.';
  gameGrid.innerHTML=activities.filter(a=>a.type==='game').slice(0,4).map(card).join('');
  renderLibrary(document.querySelector('.chip.active')?.dataset.filter||'all');
}

setupMode = function(){
  if(current?.mode!=='invaders') return baseSetupModeForInvaders();
  resetStage();
  setupClayInvadersArcade();
};

stopLoops = function(){
  baseStopLoopsForInvaders();
  clearInterval(clayInvadersTimer);
  clayInvadersTimer=null;
  cleanupClayInvaders();
};

function setupClayInvadersArcade(){
  const stage=document.querySelector('#stage');
  ['#target','#target2','#target3'].forEach(sel=>document.querySelector(sel).style.display='none');
  document.querySelector('#scoreValue').textContent=score;
  document.querySelector('#interactionHint').textContent='TAP CLAYS TO BREAK THEM';
  clayInvadersWave=1;
  buildClayInvadersWave(stage);
}

function buildClayInvadersWave(stage){
  cleanupClayInvaders();
  clayInvadersX=0;
  clayInvadersY=0;
  clayInvadersDir=1;
  clayInvadersSpeed=0.62+Math.min(.62,(clayInvadersWave-1)*.12);

  clayInvadersFormation=document.createElement('div');
  clayInvadersFormation.className='clay-invaders-formation';
  clayInvadersFormation.setAttribute('aria-label',`Clay Invaders wave ${clayInvadersWave}`);

  const rows=4,cols=6;
  clayInvadersAlive=rows*cols;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const invader=document.createElement('button');
      invader.type='button';
      invader.className='clay-invader';
      invader.style.left=`${15+c*14}%`;
      invader.style.top=`${20+r*11}%`;
      invader.dataset.row=r;
      invader.dataset.col=c;
      invader.setAttribute('aria-label','Clay invader');
      invader.addEventListener('pointerdown',hitClayInvader,{passive:false});
      clayInvadersFormation.appendChild(invader);
    }
  }

  clayInvadersHud=document.createElement('div');
  clayInvadersHud.className='clay-invaders-hud';
  stage.appendChild(clayInvadersFormation);
  stage.appendChild(clayInvadersHud);
  updateClayInvadersHud();

  clayInvadersTimer=setInterval(stepClayInvaders,32);
}

function stepClayInvaders(){
  if(!running||paused||!clayInvadersFormation)return;
  clayInvadersX+=clayInvadersDir*clayInvadersSpeed;
  const edge=8.5;
  if(clayInvadersX>=edge||clayInvadersX<=-edge){
    clayInvadersX=Math.max(-edge,Math.min(edge,clayInvadersX));
    clayInvadersDir*=-1;
    clayInvadersY+=5.4;
    beep(260,.018);
  }
  clayInvadersFormation.style.transform=`translate(${clayInvadersX}%, ${clayInvadersY}%)`;

  if(clayInvadersY>43){
    score=Math.max(0,score-250);
    document.querySelector('#scoreValue').textContent=score;
    flashInvadersStatus('BREACH −250');
    clayInvadersWave=Math.max(1,clayInvadersWave);
    setTimeout(()=>{if(running&&current?.mode==='invaders')buildClayInvadersWave(document.querySelector('#stage'))},420);
    clearInterval(clayInvadersTimer);clayInvadersTimer=null;
  }
}

function hitClayInvader(e){
  e.preventDefault();
  e.stopPropagation();
  if(!running||paused)return;
  const invader=e.currentTarget;
  if(invader.classList.contains('destroyed'))return;
  invader.classList.add('destroyed');
  invader.disabled=true;
  score+=100;
  clayInvadersAlive--;
  document.querySelector('#scoreValue').textContent=score;
  beep(900,.035);
  updateClayInvadersHud();
  setTimeout(()=>invader.remove(),220);

  if(clayInvadersAlive===0){
    clearInterval(clayInvadersTimer);clayInvadersTimer=null;
    score+=500;
    document.querySelector('#scoreValue').textContent=score;
    flashInvadersStatus(`WAVE ${clayInvadersWave} CLEARED +500`);
    clayInvadersWave++;
    setTimeout(()=>{if(running&&current?.mode==='invaders')buildClayInvadersWave(document.querySelector('#stage'))},650);
  }
}

function updateClayInvadersHud(){
  if(clayInvadersHud)clayInvadersHud.textContent=`WAVE ${clayInvadersWave}  ·  ${clayInvadersAlive} LEFT`;
}

function flashInvadersStatus(text){
  const stage=document.querySelector('#stage');
  const msg=document.createElement('div');
  msg.className='clay-invaders-status';
  msg.textContent=text;
  stage.appendChild(msg);
  requestAnimationFrame(()=>msg.classList.add('show'));
  setTimeout(()=>msg.remove(),700);
}

function cleanupClayInvaders(){
  document.querySelectorAll('.clay-invaders-formation,.clay-invaders-hud,.clay-invaders-status').forEach(el=>el.remove());
  clayInvadersFormation=null;
  clayInvadersHud=null;
}
