import { chromium } from 'playwright';

const base = process.env.SHOTSIGHT_BASE_URL || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({headless:true});
let failed=false;

async function choose(page,value){
  const b=page.locator(`#diagnosisBody [data-answer="${value}"]`);await b.waitFor({state:'visible'});await b.click();
}

async function run(label,viewport){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  try{
    const response=await page.goto(base,{waitUntil:'networkidle'});if(!response?.ok())throw new Error(`${label}: page HTTP ${response?.status()}`);
    await page.locator('.tab[data-view="diagnoseView"]').click();
    await page.locator('[data-diagnose]').click();
    await page.locator('#diagnosisSheet.active').waitFor({state:'visible'});
    await page.waitForFunction(()=>document.querySelectorAll('#diagnosisBody [data-answer]').length>=9);
    if(!/PRESENTATION/.test(await page.locator('#diagnosisBody').innerText()))throw new Error(`${label}: presentation-first step missing`);

    await choose(page,'flat_long_crosser');
    if(!/OBSERVED RESULT/.test(await page.locator('#diagnosisBody').innerText()))throw new Error(`${label}: observed-result step missing`);
    await choose(page,'behind');
    if(!/WHAT YOU SAW \/ FELT/.test(await page.locator('#diagnosisBody').innerText()))throw new Error(`${label}: context/self-report step missing`);
    await choose(page,'clear');
    if(!/DISCRIMINATING TEST/.test(await page.locator('#diagnosisBody').innerText()))throw new Error(`${label}: discriminator step missing`);
    await choose(page,'supports');
    const supported=await page.locator('#diagnosisBody').innerText();
    if(!/SUPPORTED COACHING HYPOTHESIS/.test(supported))throw new Error(`${label}: supported-hypothesis result missing`);
    if(!/Branch supported — not proven/.test(supported))throw new Error(`${label}: uncertainty guardrail missing`);
    if(!/CANDIDATE MECHANISMS/.test(supported)||!/CORRECTION/.test(supported)||!/Retest:/.test(supported))throw new Error(`${label}: mechanism/fix/retest chain incomplete`);
    if(/Strong match|Likely diagnosis/.test(supported))throw new Error(`${label}: legacy overconfident diagnosis leaked into result`);

    await page.locator('#diagnosisAgain').click();
    await choose(page,'flat_long_crosser');
    await choose(page,'ahead');
    const uncertain=await page.locator('#diagnosisBody').innerText();
    if(!/UNCERTAINTY RETAINED/.test(uncertain)||!/Insufficient evidence/.test(uncertain))throw new Error(`${label}: unmatched symptom did not retain uncertainty`);
    if(!/will not borrow its fix/i.test(uncertain))throw new Error(`${label}: unsupported-fix guardrail missing`);

    await page.locator('#diagnosisAgain').click();
    await choose(page,'chandelle_apex');
    await choose(page,'vertical');
    await choose(page,'clear');
    await choose(page,'against');
    const alternative=await page.locator('#diagnosisBody').innerText();
    if(!/BRANCH NOT CONFIRMED/.test(alternative)||!/Evidence points away/.test(alternative))throw new Error(`${label}: failed discriminator did not reduce confidence`);

    if(errors.length)throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);
    console.log(`PASS ${label}: presentation-first decision process, supported branch, unmatched uncertainty, and failed-discriminator confidence reduction verified.`);
  }finally{await page.close()}
}

for(const [label,viewport] of [['diagnosis-mobile-390x844',{width:390,height:844}],['diagnosis-desktop-1280x800',{width:1280,height:800}]]){
  try{await run(label,viewport)}catch(e){failed=true;console.error(`FAIL ${e.message}`)}
}
await browser.close();if(failed)process.exit(1);
