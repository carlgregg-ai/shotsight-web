import { chromium } from 'playwright';

const base=process.env.SHOTSIGHT_BASE_URL||'http://127.0.0.1:8000/';
const browser=await chromium.launch({headless:true});let failed=false;
async function choose(page,value){const b=page.locator(`#diagnosisBody [data-answer="${value}"]`);await b.waitFor({state:'visible'});await b.click()}
async function assertNoOverflow(page,label,where){const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:window.innerWidth}));if(dims.sw>dims.iw+2)throw new Error(`${label}: horizontal overflow in ${where}: ${dims.sw}>${dims.iw}`)}

async function run(label,viewport){
 const page=await browser.newPage({viewport});const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
 try{
  await page.addInitScript(()=>localStorage.clear());const r=await page.goto(base,{waitUntil:'networkidle'});if(!r?.ok())throw new Error(`${label}: HTTP ${r?.status()}`);
  // Navigation shell: all five destinations stay reachable without overflow.
  for(const [view,title] of [['homeView','Today.'],['libraryView','Train.'],['diagnoseView','Diagnose.'],['learnView','Playbook.'],['progressView','Progress.']]){
   await page.locator(`.tab[data-view="${view}"]`).click();await page.locator(`#${view}.active`).waitFor({state:'visible'});if((await page.locator('#pageTitle').innerText()).trim()!==title)throw new Error(`${label}: ${view} title mismatch`);await assertNoOverflow(page,label,view);
  }
  // Today → Train journey; an activity must explain itself before opening and be closable.
  await page.locator('.tab[data-view="homeView"]').click();await page.locator('.quick-card[data-go="libraryView"]').click();await page.locator('#libraryView.active').waitFor();
  if(await page.locator('#libraryList .library-item').count()<8)throw new Error(`${label}: training catalogue unexpectedly sparse`);
  await page.locator('#libraryList .library-item').first().click();await page.locator('#tipSheet.active').waitFor({state:'visible'});if(!(await page.locator('#tipBody').innerText()).trim())throw new Error(`${label}: training tip missing instructions`);await page.locator('#tipContinue').click();await page.locator('#playerView.active').waitFor({state:'visible'});await page.locator('#closePlayer').click();await page.waitForFunction(()=>!document.querySelector('#playerView')?.classList.contains('active'));
  // Playbook learn journey: ordinary target query, evidence and geometry before practice.
  await page.locator('.tab[data-view="learnView"]').click();await page.waitForFunction(()=>/certified lessons/.test(document.querySelector('#playbookCount')?.textContent||''));const search=page.locator('#playbookSearch');await search.fill('apex teal');await page.locator('.playbook-card[data-playbook-id="teal_near_apex"]').click();await page.locator('#playbookSheet.active').waitFor({state:'visible'});const lesson=await page.locator('#playbookLessonBody').innerText();if(!/DIRECT/.test(lesson)||!/ORVIS_TEAL/.test(lesson)||!/Do not present the apex/.test(lesson)||!/SCHEMATIC/.test(lesson))throw new Error(`${label}: Playbook evidence/hold/visual journey incomplete`);await assertNoOverflow(page,label,'Playbook lesson');await page.locator('#playbookClose').click();
  // Miss-language journey must enter Diagnose mode, then a supported branch remains explicitly a hypothesis.
  await search.fill('behind on a crosser');await page.locator('#playbookIntent.diagnose').waitFor({state:'visible'});await page.locator('.playbook-card').first().click();if(!(await page.locator('#playbookLessonBody > section').first().getAttribute('class'))?.includes('pb-diagnose'))throw new Error(`${label}: miss query did not open diagnosis first`);await page.locator('#playbookClose').click();
  await page.locator('.tab[data-view="diagnoseView"]').click();const hero=await page.locator('#diagnoseView .diagnose-hero').innerText();if(!/target presentation/i.test(hero)||!/keep uncertainty visible/i.test(hero))throw new Error(`${label}: Diagnose entry copy does not match presentation-first engine`);await page.locator('[data-diagnose]').click();await page.waitForFunction(()=>document.querySelectorAll('#diagnosisBody [data-answer]').length>=12);await choose(page,'fast_flat_quartering_away');await choose(page,'behind');await choose(page,'clear');await choose(page,'supports');const supported=await page.locator('#diagnosisBody').innerText();if(!/SUPPORTED COACHING HYPOTHESIS/.test(supported)||!/Branch supported — not proven/.test(supported)||!/Retest:/.test(supported))throw new Error(`${label}: supported diagnosis lost uncertainty/retest`);
  // Re-enter with a deliberately unsupported outcome. It must refuse a borrowed fix.
  await page.locator('#diagnosisAgain').click();await choose(page,'fast_flat_quartering_away');await choose(page,'ahead');const stopped=await page.locator('#diagnosisBody').innerText();if(!/UNCERTAINTY RETAINED/.test(stopped)||!/will not borrow its fix/i.test(stopped))throw new Error(`${label}: unsupported branch did not stop safely`);await page.locator('#diagnosisClose').click();
  // Progress remains reachable after the above journeys.
  await page.locator('.tab[data-view="progressView"]').click();await page.locator('#progressView.active').waitFor();for(const id of ['statSessions','statMinutes','statBest','historyList'])if(await page.locator(`#${id}`).count()!==1)throw new Error(`${label}: progress element ${id} missing`);
  // Mobile tap-target sanity for persistent navigation. Use the Playwright viewport value here: this assertion runs in Node, not in the page context.
  if(viewport.width<600){const boxes=await page.locator('.tabbar .tab').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,left:r.left,right:r.right}}));if(boxes.length!==5||boxes.some(b=>b.w<44||b.h<44||b.left<0||b.right>viewport.width+1))throw new Error(`${label}: persistent nav tap targets do not fit mobile viewport`)}
  if(errors.length)throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);console.log(`PASS ${label}: realistic Today/Train/Playbook/Diagnose/Progress journeys, evidence holds, safe uncertainty, navigation fit and console gate verified.`);
 }finally{await page.close()}
}
for(const [label,viewport] of [['journey-mobile-390x844',{width:390,height:844}],['journey-desktop-1280x800',{width:1280,height:800}]]){try{await run(label,viewport)}catch(e){failed=true;console.error(`FAIL ${e.message}`)}}
await browser.close();if(failed)process.exit(1);
