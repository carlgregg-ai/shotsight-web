import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import process from 'node:process';

const ROOT=new URL('../',import.meta.url).pathname;
const OUT=new URL('../artifacts/p7-rendered-review/',import.meta.url).pathname;
await mkdir(OUT,{recursive:true});

function executable(){
  for(const name of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){
    const r=spawnSync('which',[name],{encoding:'utf8'});
    if(r.status===0&&r.stdout.trim())return r.stdout.trim();
  }
  throw new Error('No supported Chrome/Chromium executable found on runner');
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function pollJson(url,{attempts=80,delay=125}={}){
  let last;
  for(let i=0;i<attempts;i++){
    try{const r=await fetch(url);if(r.ok)return await r.json();last=`HTTP ${r.status}`;}catch(e){last=String(e);}
    await sleep(delay);
  }
  throw new Error(`Timed out waiting for ${url}: ${last}`);
}

const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
const chrome=spawn(executable(),[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking',
  '--remote-debugging-port=9222','--remote-allow-origins=*',`--user-data-dir=/tmp/shotsight-p7-chrome-${process.pid}`,'about:blank'
],{stdio:['ignore','pipe','pipe']});

let ws;
let seq=0;
const pending=new Map();
function cleanup(){try{ws?.close();}catch{} try{chrome.kill('SIGKILL');}catch{} try{server.kill('SIGKILL');}catch{}}
process.on('exit',cleanup);

try{
  await pollJson('http://127.0.0.1:8765/p7-debug.html');
  const pages=await pollJson('http://127.0.0.1:9222/json/list');
  const page=pages.find(p=>p.type==='page');
  if(!page?.webSocketDebuggerUrl)throw new Error('No debuggable Chrome page');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',ev=>{const msg=JSON.parse(ev.data);if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);msg.error?reject(new Error(JSON.stringify(msg.error))):resolve(msg.result);}});
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(`Browser evaluation failed: ${r.exceptionDetails.text}`);return r.result?.value;};
  const waitFor=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(75);}throw new Error(`Browser condition timed out: ${expression}`);};
  const setViewport=async(width,height,mobile=false)=>{await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});};
  const navigate=async()=>{await cdp('Page.navigate',{url:'http://127.0.0.1:8765/p7-debug.html'});await waitFor("document.readyState==='complete' && document.querySelector('#qaRows')?.children.length===5 && document.querySelector('#telemetry dd')");};
  const screenshot=async name=>{const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,fromSurface:true});await writeFile(`${OUT}${name}.png`,Buffer.from(r.data,'base64'));};

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await setViewport(1440,1200,false);await navigate();

  const desktop=await evaluate(`(()=>{const svg=document.querySelector('#projection').getBoundingClientRect();const qa=document.querySelector('#qaTableWrap');const target=document.querySelector('#targetMark');const bore=document.querySelector('#boreMark');return {docOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,qaScrollContained:qa.scrollWidth>=qa.clientWidth,cert:document.querySelector('#certLock').textContent,strategy:document.querySelector('#strategyLock').textContent,method:document.querySelector('#methodReference').textContent,holds:document.querySelector('#holds').textContent,svgWidth:svg.width,svgHeight:svg.height,targetCx:Number(target.getAttribute('cx')),targetCy:Number(target.getAttribute('cy')),boreTransform:bore.getAttribute('transform'),qa:[...document.querySelectorAll('#qaRows tr')].map(r=>[...r.cells].map(c=>c.textContent))};})()`);
  assert.equal(desktop.docOverflow,false,'desktop document must not horizontally overflow');
  assert.ok(desktop.cert.includes('NOT REALISTIC CLAY CERTIFICATION')&&desktop.cert.includes('NOT INSTRUCTIONAL'));
  assert.ok(desktop.strategy.includes('NOT_A_COACHING_METHOD'));
  assert.ok(desktop.method.includes('SOURCE_REFERENCE_ONLY')&&desktop.method.includes('HOLD_NOT_IMPLEMENTED'));
  assert.ok(desktop.holds.includes('ACQUISITION')&&desktop.holds.includes('CONNECTION')&&desktop.holds.includes('SPEED_MATCH'));
  assert.equal(desktop.qa.length,5);
  assert.ok(desktop.qa[2][5].includes('SHOT'),'shot QA row must expose SHOT');
  assert.ok(desktop.qa[3][5].includes('PELLET_ARRIVAL'),'arrival QA row must expose PELLET_ARRIVAL');
  await screenshot('desktop-start');

  const control=await evaluate(`(async()=>{const t=()=>Number([...document.querySelectorAll('#telemetry dt')].find(x=>x.textContent==='t (s)')?.nextElementSibling?.textContent);const stepF=document.querySelector('#stepForward'),stepB=document.querySelector('#stepBack'),scrub=document.querySelector('#scrub'),speed=document.querySelector('#speed'),play=document.querySelector('#playPause');stepF.click();const afterForward=t();stepB.click();const afterBack=t();scrub.value='0.4';scrub.dispatchEvent(new Event('input',{bubbles:true}));const afterScrub=t();const playback=[];for(const s of ['0.25','0.5','1','2']){scrub.value='0';scrub.dispatchEvent(new Event('input',{bubbles:true}));speed.value=s;speed.dispatchEvent(new Event('change',{bubbles:true}));play.click();await new Promise(r=>setTimeout(r,320));if(play.textContent==='Pause')play.click();playback.push([Number(s),t()]);}return {afterForward,afterBack,afterScrub,playback};})()`);
  assert.ok(Math.abs(control.afterForward-1/60)<1e-3,'+1 frame must advance one 60 Hz frame');
  assert.ok(Math.abs(control.afterBack)<1e-9,'-1 frame must return to start');
  assert.ok(Math.abs(control.afterScrub-0.8)<1/60+1e-6,'40% scrub must land on the 0.8 s shot frame');
  for(const [,t] of control.playback)assert.ok(t>0,'all playback rates must advance simulation time');
  for(let i=1;i<control.playback.length;i++)assert.ok(control.playback[i][1]>control.playback[i-1][1],`playback rate ${control.playback[i][0]}x must advance farther than ${control.playback[i-1][0]}x over equal screen time`);

  await evaluate(`(()=>{const scrub=document.querySelector('#scrub');scrub.value='0.4';scrub.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);await screenshot('desktop-shot');
  await evaluate(`(()=>{const row=document.querySelectorAll('#qaRows tr')[3];const t=Number(row.cells[1].textContent);const scrub=document.querySelector('#scrub');scrub.value=String(t/2);scrub.dispatchEvent(new Event('input',{bubbles:true}));return document.querySelector('#eventStrip').textContent;})()`);await screenshot('desktop-arrival');

  await setViewport(390,844,true);await navigate();
  const mobile=await evaluate(`(()=>{const qa=document.querySelector('#qaTableWrap');const controls=document.querySelector('.controls').getBoundingClientRect();const shell=document.querySelector('.debug-shell').getBoundingClientRect();return {docOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,qaHasInternalOverflow:qa.scrollWidth>qa.clientWidth,qaOverflowX:getComputedStyle(qa).overflowX,controlsRight:controls.right,shellRight:shell.right,viewport:innerWidth,cert:document.querySelector('#certLock').getBoundingClientRect(),projection:document.querySelector('#projection').getBoundingClientRect()};})()`);
  assert.equal(mobile.docOverflow,false,'mobile document must not horizontally overflow');
  assert.equal(mobile.qaOverflowX,'auto','mobile QA table must own horizontal overflow');
  assert.equal(mobile.qaHasInternalOverflow,true,'wide QA table should scroll inside its wrapper on mobile');
  assert.ok(mobile.controlsRight<=mobile.viewport+1&&mobile.shellRight<=mobile.viewport+1,'mobile controls/shell must remain inside viewport');
  assert.ok(mobile.cert.width<=mobile.viewport,'certification lock must fit mobile viewport');
  await screenshot('mobile-start');

  const report={suite:'ShotSight P7 rendered adversarial review',status:'PASS',desktop,control,mobile,notes:['Exact p7-debug.html rendered in headless Chrome on CI runner','Screenshots are engineering QA artefacts, not realistic clay certification','No BREAK is expected because no authorised hit predicate exists']};
  await writeFile(`${OUT}report.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({suite:report.suite,status:report.status,tests:{desktopLayout:true,mobileContainment:true,qaEvents:true,frameStep:true,scrub:true,playbackRates:true,certificationLocks:true}},null,2));
}finally{cleanup();}
