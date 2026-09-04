import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base=(process.env.SHOTSIGHT_BASE_URL||'https://carlgregg-ai.github.io/shotsight-web/').replace(/\/?$/,'/');
const productionFiles=[
  'index.html','app.js','styles.css','v02.js','v02.css',
  'playbook.js','playbook.css','playbook-motion.js',
  'shot-demos.js','shot-demos.css','shooter-diagnosis.js','shooter-diagnosis.css',
  'clay-invaders.js','clay-invaders.css','manifest.webmanifest',
  'data/playbook-representative-v1.json','data/playbook-expansion-stage8-v1.json'
];
const sha=b=>createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function fetchBytes(path){
  const join=new URL(path,base);join.searchParams.set('_audit',Date.now().toString());
  const r=await fetch(join,{cache:'no-store',headers:{'cache-control':'no-cache'}});
  if(!r.ok)throw new Error(`${path}: hosted HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
async function parity(){
  const deadline=Date.now()+120000;let last=[];
  while(Date.now()<deadline){
    last=[];
    for(const path of productionFiles){
      const local=await readFile(path);let remote;
      try{remote=await fetchBytes(path)}catch(e){last.push(`${path}: ${e.message}`);continue}
      if(sha(local)!==sha(remote))last.push(`${path}: deployed bytes differ from checkout`);
    }
    if(!last.length)return;
    await sleep(5000);
  }
  throw new Error(`Hosted/source parity timed out: ${last.join(' | ')}`);
}

await parity();

const browser=await chromium.launch({headless:true});let failed=false;
for(const [label,viewport] of [['hosted-mobile-390x844',{width:390,height:844}],['hosted-desktop-1280x800',{width:1280,height:800}]]){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  try{
    await page.addInitScript(()=>localStorage.clear());
    const r=await page.goto(`${base}?_audit=${Date.now()}`,{waitUntil:'networkidle'});
    if(!r?.ok())throw new Error(`${label}: hosted shell HTTP ${r?.status()}`);
    const manifestHref=await page.locator('link[rel="manifest"]').getAttribute('href');
    if(!manifestHref)throw new Error(`${label}: manifest link missing`);
    const manifest=await page.evaluate(async href=>{const r=await fetch(href,{cache:'no-store'});if(!r.ok)throw new Error(`manifest HTTP ${r.status}`);return r.json()},manifestHref);
    for(const k of ['name','short_name','start_url','display','theme_color'])if(!manifest[k])throw new Error(`${label}: manifest missing ${k}`);
    if(manifest.display!=='standalone')throw new Error(`${label}: manifest display is not standalone`);
    const pwa=await page.evaluate(()=>({appleCapable:document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.content||'',theme:document.querySelector('meta[name="theme-color"]')?.content||'',serviceWorkerSupported:'serviceWorker' in navigator}));
    if(pwa.appleCapable!=='yes'||!pwa.theme)throw new Error(`${label}: mobile/PWA metadata incomplete`);
    for(const [view,title] of [['homeView','Today.'],['libraryView','Train.'],['diagnoseView','Diagnose.'],['learnView','Playbook.'],['progressView','Progress.']]){
      await page.locator(`.tab[data-view="${view}"]`).click();await page.locator(`#${view}.active`).waitFor({state:'visible'});
      if((await page.locator('#pageTitle').innerText()).trim()!==title)throw new Error(`${label}: hosted ${view} title mismatch`);
    }
    await page.locator('.tab[data-view="learnView"]').click();
    await page.waitForFunction(()=>/11 certified lessons/.test(document.querySelector('#playbookCount')?.textContent||''));
    if(errors.length)throw new Error(`${label}: hosted browser errors: ${errors.join(' | ')}`);
    console.log(`PASS ${label}: exact production-file parity, hosted navigation, manifest/mobile metadata and browser console gate verified; service-worker capability=${pwa.serviceWorkerSupported}.`);
  }catch(e){failed=true;console.error(`FAIL ${e.message}`)}finally{await page.close()}
}
await browser.close();if(failed)process.exit(1);
