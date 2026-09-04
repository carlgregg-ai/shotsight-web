import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.SHOTSIGHT_BASE_URL || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({headless:true});
let failed = false;
await fs.mkdir('artifacts/playbook-visuals',{recursive:true});
const motionLessons = new Set(['flat_long_crosser','low_fast_incomer_cutoff','chandelle_apex','rising_teal_under_power','crossing_rabbit','driven_incoming','rising_quartering_outgoing','fast_flat_quartering_away','teal_near_apex']);
const noGenericMotion = new Set(['quartering_away','pair_planning']);
const expansionSources={rising_quartering_outgoing:'NSCA_RISING_OUTGOING',fast_flat_quartering_away:'NSCA_ALWAYS_BEHIND',teal_near_apex:'ORVIS_TEAL'};

async function run(label, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  try {
    const response = await page.goto(base, {waitUntil:'networkidle'});if (!response?.ok()) throw new Error(`${label}: page HTTP ${response?.status()}`);
    await page.locator('.tab[data-view="learnView"]').click();await page.locator('#playbookCount').waitFor({state:'visible'});await page.waitForFunction(() => /certified lessons/.test(document.querySelector('#playbookCount')?.textContent || ''));
    const lessonCount = await page.locator('.playbook-card').count();if (lessonCount !== 11) throw new Error(`${label}: expected 11 certified lessons after Stage 8 batch 3, got ${lessonCount}`);
    const demoCount = await page.locator('#demoGrid > *').count();if (demoCount < 1) throw new Error(`${label}: retained visual guides did not initialise`);
    for (let i = 0; i < lessonCount; i++) {
      const cards = page.locator('.playbook-card');const id = await cards.nth(i).getAttribute('data-playbook-id');await cards.nth(i).click();await page.locator('#playbookSheet.active').waitFor({state:'visible'});
      const visual = page.locator(`.pb-visual[data-visual-id="${id}"]`);if (await visual.count() !== 1) throw new Error(`${label}: lesson ${id} missing certified schematic host`);if (await visual.locator('svg .pb-target-path').count() < 1) throw new Error(`${label}: lesson ${id} missing target path`);if (!/SCHEMATIC/.test(await visual.locator('.pb-visual-head').innerText())) throw new Error(`${label}: lesson ${id} missing schematic disclosure`);if (!(await visual.locator('figcaption').innerText()).trim()) throw new Error(`${label}: lesson ${id} missing novice caption`);
      if (motionLessons.has(id)) {const motion = page.locator(`.pb-method-motion[data-motion-id="${id}"]`);await motion.waitFor({state:'visible'});if (await motion.locator('.pb-motion-target').count() !== 1 || await motion.locator('.pb-motion-gun').count() !== 1) throw new Error(`${label}: lesson ${id} missing attributed motion paths`);const txt = await motion.innerText();if (!/ATTRIBUTED METHOD/.test(txt) || !/conceptual|illustrative/i.test(txt)) throw new Error(`${label}: lesson ${id} missing method guardrail`)}
      if (noGenericMotion.has(id)) {const hold=page.locator(`[data-motion-hold="${id}"]`);await hold.waitFor({state:'visible'});if(!/No generic gun-path animation/.test(await hold.innerText()))throw new Error(`${label}: ${id} uncertainty hold missing`);if(await page.locator(`.pb-method-motion[data-motion-id="${id}"]`).count())throw new Error(`${label}: ${id} incorrectly received generic motion`)}
      if(expansionSources[id]){const txt=await page.locator('#playbookLessonBody').innerText();if(!txt.includes(expansionSources[id]))throw new Error(`${label}: ${id} direct source attribution missing`);if(!/SHOTSIGHT_HYPOTHESIS/.test(txt))throw new Error(`${label}: ${id} diagnostic hypothesis label missing`);if(!/Do not/.test(txt))throw new Error(`${label}: ${id} hold guardrail missing`)}
      await page.locator('#playbookLessonBody > .pb-section').first().screenshot({path:`artifacts/playbook-visuals/${label}-${id}.png`});await page.locator('#playbookClose').click();await page.waitForFunction(() => !document.querySelector('#playbookSheet')?.classList.contains('active'));
    }
    const search=page.locator('#playbookSearch');
    for(const [query,id] of [['rising quartering outgoing','rising_quartering_outgoing'],['fast flat quarterer','fast_flat_quartering_away'],['apex teal','teal_near_apex']]){await search.fill(query);await page.locator('#playbookIntent:not(.diagnose)').waitFor({state:'visible'});if(await page.locator(`.playbook-card[data-playbook-id="${id}"]`).count()!==1)throw new Error(`${label}: ${query} expansion search failed`)}
    await search.fill('behind on a crosser');await page.locator('#playbookIntent.diagnose').waitFor({state:'visible'});if (!/Diagnose mode/.test(await page.locator('#playbookIntent').innerText())) throw new Error(`${label}: diagnose intent banner missing`);await page.locator('.playbook-card').first().click();await page.locator('#playbookSheet.active').waitFor({state:'visible'});const firstSectionClass=await page.locator('#playbookLessonBody > section').first().getAttribute('class');if(!firstSectionClass?.includes('pb-diagnose'))throw new Error(`${label}: diagnosis-first ordering failed`);await page.keyboard.press('Escape');await page.waitForFunction(() => !document.querySelector('#playbookSheet')?.classList.contains('active'));
    await search.fill('high looper');await page.locator('#playbookIntent:not(.diagnose)').waitFor({state:'visible'});if(!/Learn mode/.test(await page.locator('#playbookIntent').innerText()))throw new Error(`${label}: learn intent missing`);if(errors.length)throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);
    console.log(`PASS ${label}: ${lessonCount} certified lessons, eleven schematics, nine source-safe motions, two explicit holds, Stage 8 expansion search/evidence and existing routing verified.`);
  } finally {await page.close()}
}
for (const [label, viewport] of [['mobile-390x844',{width:390,height:844}],['desktop-1280x800',{width:1280,height:800}]]) {try {await run(label,viewport)} catch(err){failed=true;console.error(`FAIL ${err.message}`)}}
await browser.close();if(failed)process.exit(1);