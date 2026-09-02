const activities=[
{id:'three',name:'Three Bullet',type:'drill',glyph:'•••',desc:'Peripheral awareness without chasing the target.',seconds:45,mode:'three'},
{id:'saccade',name:'Saccade Ladder',type:'drill',glyph:'↔',desc:'Fast, clean eye movements between fixed points.',seconds:40,mode:'saccade'},
{id:'pursuit',name:'Smooth Pursuit',type:'drill',glyph:'∿',desc:'Track movement smoothly without jumping ahead.',seconds:45,mode:'pursuit'},
{id:'quiet',name:'Quiet Eye',type:'drill',glyph:'◎',desc:'Settle gaze and build a calm visual hold.',seconds:40,mode:'quiet'},
{id:'whack',name:'Whack a Clay',type:'game',glyph:'◉',desc:'Acquire random targets quickly. Tap to score.',seconds:30,mode:'whack'},
{id:'invaders',name:'Clay Invaders',type:'game',glyph:'⌄',desc:'Clear moving clays before they cross the screen.',seconds:35,mode:'invaders'},
{id:'stay',name:'Stay on Your Bird',type:'game',glyph:'⊙',desc:'Ignore distractions and stay with the live target.',seconds:40,mode:'stay'},
{id:'reaction',name:'Flash Point',type:'game',glyph:'✦',desc:'React to brief appearances without anticipating.',seconds:30,mode:'reaction'}
];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const drillGrid=$('#drillGrid'),gameGrid=$('#gameGrid'),libraryList=$('#libraryList');
let current=null,timer=null,mover=null,remaining=0,score=0,running=false,paused=false,sequenceIndex=0,soundOn=true;
function card(a){return `<button class="activity-card" data-id="${a.id}"><span class="glyph">${a.glyph}</span><span><strong>${a.name}</strong><small>${a.desc}</small></span></button>`}
drillGrid.innerHTML=activities.filter(a=>a.type==='drill').slice(0,4).map(card).join('');
gameGrid.innerHTML=activities.filter(a=>a.type==='game').slice(0,4).map(card).join('');
function renderLibrary(filter='all'){libraryList.innerHTML=activities.filter(a=>filter==='all'||a.type===filter).map(a=>`<button class="library-item" data-id="${a.id}"><span class="library-icon">${a.glyph}</span><span><strong>${a.name}</strong><small>${a.type==='drill'?'DRILL':'GAME'} · ${a.seconds}s</small></span><span class="arrow">›</span></button>`).join('')}
renderLibrary();
function navTo(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));$('#pageTitle').textContent=id==='homeView'?'Train your eyes.':id==='libraryView'?'Choose your work.':'See the trend.';if(id==='progressView')renderProgress()}
$$('.tab').forEach(t=>t.addEventListener('click',()=>navTo(t.dataset.view)));
$$('.chip').forEach(c=>c.addEventListener('click',()=>{$$('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');renderLibrary(c.dataset.filter)}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)openPlayer(activities.find(a=>a.id===b.dataset.id));});
$('[data-start="daily"]').addEventListener('click',()=>openPlayer(activities[0],true));
function openPlayer(a,daily=false){current={...a,daily};remaining=a.seconds;score=0;sequenceIndex=0;running=false;paused=false;$('#playerView').classList.add('active');$('#playerView').setAttribute('aria-hidden','false');$('#playerType').textContent=a.type.toUpperCase();$('#playerName').textContent=a.name;$('#scoreLabel').textContent=a.type==='game'?'SCORE':'CUE';$('#scoreValue').textContent=a.type==='game'?'0':'READY';$('#timeValue').textContent=formatTime(remaining);$('#actionButton').textContent='Begin';$('#pausePlayer').textContent='Ⅱ';resetStage();}
function closePlayer(){stopLoops();$('#playerView').classList.remove('active');$('#playerView').setAttribute('aria-hidden','true');running=false}
$('#closePlayer').addEventListener('click',closePlayer);
$('#actionButton').addEventListener('click',()=>{if(!running)countIn();else finishActivity()});
$('#pausePlayer').addEventListener('click',()=>{if(!running)return;paused=!paused;$('#playerView').classList.toggle('paused',paused);$('#pausePlayer').textContent=paused?'▶':'Ⅱ'});
$('#soundToggle').addEventListener('click',()=>{soundOn=!soundOn;$('#soundToggle').style.opacity=soundOn?1:.35});
function beep(freq=540,d=.045){if(!soundOn)return;try{const ac=new (window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function countIn(){let n=3;$('#countdown').textContent=n;$('#actionButton').disabled=true;const c=setInterval(()=>{n--;if(n>0){$('#countdown').textContent=n;beep()}else{clearInterval(c);$('#countdown').textContent='';$('#actionButton').disabled=false;startActivity()}},600)}
function startActivity(){running=true;$('#actionButton').textContent='Finish';setupMode();timer=setInterval(()=>{if(paused)return;remaining--;$('#timeValue').textContent=formatTime(remaining);if(remaining<=0)finishActivity()},1000)}
function resetStage(){stopLoops();const ts=[$('#target'),$('#target2'),$('#target3')];ts.forEach((t,i)=>{t.style.display=i?'none':'block';t.style.left='50%';t.style.top='50%';t.style.transform='translate(-50%,-50%)';t.style.opacity='1'});$('#crosshair').style.display='none'}
function setupMode(){resetStage();const t=$('#target'),t2=$('#target2'),t3=$('#target3'),stage=$('#stage');
 if(current.mode==='three'){[t,t2,t3].forEach(x=>x.style.display='block');place(t,25,50);place(t2,50,50);place(t3,75,50);$('#scoreValue').textContent='SOFT EYES';mover=setInterval(()=>{if(paused)return;const y=35+Math.random()*30;place(t,22,y);place(t2,50,100-y);place(t3,78,y)},2800)}
 else if(current.mode==='saccade'){t.style.display='block';const pts=[[18,25],[82,25],[18,75],[82,75],[50,50]];let i=0;place(t,...pts[0]);$('#scoreValue').textContent='EYES ONLY';mover=setInterval(()=>{if(paused)return;i=(i+1)%pts.length;place(t,...pts[i]);beep(700,.025)},900)}
 else if(current.mode==='pursuit'){t.style.display='block';$('#scoreValue').textContent='SMOOTH';let x=10,dir=1;mover=setInterval(()=>{if(paused)return;x+=dir*.35;if(x>90||x<10)dir*=-1;place(t,x,50+18*Math.sin(x/10))},16)}
 else if(current.mode==='quiet'){t.style.display='block';$('#crosshair').style.display='block';$('#scoreValue').textContent='SETTLE';t.style.width='12px';t.style.height='12px'}
 else if(current.mode==='whack'||current.mode==='reaction'){t.style.display='block';randomTarget();$('#scoreValue').textContent='0';t.addEventListener('pointerdown',hitTarget)}
 else if(current.mode==='invaders'){t.style.display='block';$('#scoreValue').textContent='0';let x=10,y=18,dx=.45;mover=setInterval(()=>{if(paused)return;x+=dx;if(x>90||x<10){dx*=-1;y+=10}if(y>88){y=18;score=Math.max(0,score-1);$('#scoreValue').textContent=score}place(t,x,y)},18);t.addEventListener('pointerdown',hitTarget)}
 else if(current.mode==='stay'){[t,t2,t3].forEach(x=>x.style.display='block');t.style.background='var(--accent)';$('#scoreValue').textContent='LOCK ON';let q=0;mover=setInterval(()=>{if(paused)return;q+=.04;place(t,50+32*Math.sin(q),50+22*Math.sin(q*.7));place(t2,50+35*Math.sin(q+2),50+25*Math.cos(q));place(t3,50+30*Math.cos(q*.8),50+28*Math.sin(q+4))},16)}
}
function hitTarget(e){e.preventDefault();if(!running||paused)return;score++;$('#scoreValue').textContent=score;beep(850,.035);randomTarget()}
function randomTarget(){place($('#target'),12+Math.random()*76,14+Math.random()*72);if(current.mode==='reaction'){const t=$('#target');t.style.opacity='1';setTimeout(()=>{if(running)t.style.opacity='.08'},520)}}
function place(el,x,y){el.style.left=x+'%';el.style.top=y+'%'}
function stopLoops(){clearInterval(timer);clearInterval(mover);timer=mover=null;$('#target').removeEventListener('pointerdown',hitTarget)}
function finishActivity(){if(!running){closePlayer();return}running=false;stopLoops();saveSession(current,Math.max(1,current.seconds-remaining),score);beep(900,.1);if(current.daily&&sequenceIndex<2){sequenceIndex++;const seq=[activities[0],activities[1],activities[2]];const next=seq[sequenceIndex];setTimeout(()=>openPlayer({...next},true),350)}else{closePlayer();renderProgress()}}
function formatTime(s){return `00:${String(Math.max(0,s)).padStart(2,'0')}`}
function saveSession(a,secs,points){const h=JSON.parse(localStorage.getItem('shotsight-history')||'[]');h.unshift({name:a.name,type:a.type,secs,points,date:new Date().toISOString()});localStorage.setItem('shotsight-history',JSON.stringify(h.slice(0,30)))}
function renderProgress(){const h=JSON.parse(localStorage.getItem('shotsight-history')||'[]');$('#statSessions').textContent=h.length;$('#statMinutes').textContent=Math.round(h.reduce((n,x)=>n+x.secs,0)/60);const games=h.filter(x=>x.type==='game');$('#statBest').textContent=games.length?Math.max(...games.map(x=>x.points)):'—';$('#historyList').innerHTML=h.length?h.slice(0,8).map(x=>`<div class="history-row"><strong>${x.name}</strong><span>${x.type==='game'?x.points+' pts':x.secs+' sec'}</span></div>`).join(''):'<div class="empty">Complete a drill or game and it will appear here.</div>'}
$('#clearHistory').addEventListener('click',()=>{localStorage.removeItem('shotsight-history');renderProgress()});
renderProgress();
