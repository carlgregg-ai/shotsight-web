import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.SHOTSIGHT_BASE_URL || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({headless:true});
let failed = false;
await fs.mkdir('artifacts/playbook-visuals',{recursive:true});
const motionLessons = new Set(['flat_long_crosser','low_fast_incomer_cutoff','chandelle_apex','rising_teal_under_power','crossing_rabbit','driven_incoming','rising_quartering_outgoing']);
const noGenericMotion = new Set(['quartering_away','pair_planning']);

async function run(label, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));

  try {
    const response = await page.goto(base, {waitUntil:'networkidle'});
    if (!response?.ok()) throw new Error(`${label}: page HTTP ${response?.status()}`);

    await page.locator('.tab[data-view="learnView"]').click();
    await page.locator('#playbookCount').waitFor({state:'visible'});
    await page.waitForFunction(() => /certified lessons/.test(document.querySelector('#playbookCount')?.textContent || ''));

    const lessonCount = await page.locator('.playbook-card').count();
    if (lessonCount !== 9) throw new Error(`${label}: expected 9 certified lessons after Stage 8 batch 1, got ${lessonCount}`);

    const demoCount = await page.locator('#demoGrid > *').count();
    if (demoCount < 1) throw new Error(`${label}: retained visual guides did not initialise`);

    for (let i = 0; i < lessonCount; i++) {
      const cards = page.locator('.playbook-card');
      const id = await cards.nth(i).getAttribute('data-playbook-id');
      await cards.nth(i).click();
      await page.locator('#playbookSheet.active').waitFor({state:'visible'});
      const visual = page.locator(`.pb-visual[data-visual-id="${id}"]`);
      if (await visual.count() !== 1) throw new Error(`${label}: lesson ${id} missing certified schematic host`);
      if (await visual.locator('svg .pb-target-path').count() < 1) throw new Error(`${label}: lesson ${id} missing target path`);
      if (!/SCHEMATIC/.test(await visual.locator('.pb-visual-head').innerText())) throw new Error(`${label}: lesson ${id} missing schematic/not-to-scale disclosure`);
      if (!(await visual.locator('figcaption').innerText()).trim()) throw new Error(`${label}: lesson ${id} missing novice explanatory caption`);

      if (motionLessons.has(id)) {
        const motion = page.locator(`.pb-method-motion[data-motion-id="${id}"]`);
        await motion.waitFor({state:'visible'});
        if (await motion.locator('.pb-motion-target').count() !== 1) throw new Error(`${label}: lesson ${id} missing motion target path`);
        if (await motion.locator('.pb-motion-gun').count() !== 1) throw new Error(`${label}: lesson ${id} missing attributed gun path`);
        const txt = await motion.innerText();
        if (!/ATTRIBUTED METHOD/.test(txt) || !/conceptual|illustrative/i.test(txt)) throw new Error(`${label}: lesson ${id} missing attribution/conceptual guardrail`);
      }
      if (noGenericMotion.has(id)) {
        const hold = page.locator(`[data-motion-hold="${id}"]`);
        await hold.waitFor({state:'visible'});
        if (!/No generic gun-path animation/.test(await hold.innerText())) throw new Error(`${label}: lesson ${id} did not retain method uncertainty`);
        if (await page.locator(`.pb-method-motion[data-motion-id="${id}"]`).count()) throw new Error(`${label}: lesson ${id} incorrectly received generic gun path`);
      }

      if(id==='rising_quartering_outgoing'){
        const txt=await page.locator('#playbookLessonBody').innerText();
        if(!/NSCA_RISING_OUTGOING/.test(txt))throw new Error(`${label}: Stage 8 direct source attribution missing`);
        if(!/SHOTSIGHT_HYPOTHESIS/.test(txt))throw new Error(`${label}: Stage 8 diagnostic hypothesis label missing`);
        if(!/Do not generalise/.test(txt))throw new Error(`${label}: Stage 8 geometry guardrail missing`);
      }

      await page.locator('#playbookLessonBody > .pb-section').first().screenshot({path:`artifacts/playbook-visuals/${label}-${id}.png`});
      await page.locator('#playbookClose').click();
      await page.waitForFunction(() => !document.querySelector('#playbookSheet')?.classList.contains('active'));
    }

    const search = page.locator('#playbookSearch');
    await search.fill('rising quartering outgoing');
    await page.locator('#playbookIntent:not(.diagnose)').waitFor({state:'visible'});
    if (await page.locator('.playbook-card[data-playbook-id="rising_quartering_outgoing"]').count() !== 1) throw new Error(`${label}: Stage 8 expansion query did not resolve to new lesson`);

    await search.fill('behind on a crosser');
    await page.locator('#playbookIntent.diagnose').waitFor({state:'visible'});
    if (!/Diagnose mode/.test(await page.locator('#playbookIntent').innerText())) throw new Error(`${label}: diagnose intent banner missing`);
    if (await page.locator('.playbook-card').count() < 1) throw new Error(`${label}: diagnose query returned no certified lesson`);

    await page.locator('.playbook-card').first().click();
    await page.locator('#playbookSheet.active').waitFor({state:'visible'});
    const firstSectionClass = await page.locator('#playbookLessonBody > section').first().getAttribute('class');
    if (!firstSectionClass?.includes('pb-diagnose')) throw new Error(`${label}: diagnosis-first lesson ordering failed`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#playbookSheet')?.classList.contains('active'));

    await search.fill('high looper');
    await page.locator('#playbookIntent:not(.diagnose)').waitFor({state:'visible'});
    if (!/Learn mode/.test(await page.locator('#playbookIntent').innerText())) throw new Error(`${label}: learn intent banner missing`);
    if (await page.locator('.playbook-card').count() < 1) throw new Error(`${label}: high looper returned no lesson`);

    await page.locator('.playbook-card').first().click();
    await page.locator('#playbookSheet.active').waitFor({state:'visible'});
    await page.locator('#playbookClose').click();
    await page.waitForFunction(() => !document.querySelector('#playbookSheet')?.classList.contains('active'));

    if (errors.length) throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);
    console.log(`PASS ${label}: ${lessonCount} certified lessons; nine schematics + seven source-safe method motions + two explicit no-generic-motion holds; Stage 8 search/evidence labels and existing Learn/Diagnose routing verified.`);
  } finally {
    await page.close();
  }
}

for (const [label, viewport] of [
  ['mobile-390x844', {width:390, height:844}],
  ['desktop-1280x800', {width:1280, height:800}],
]) {
  try { await run(label, viewport); }
  catch (err) { failed = true; console.error(`FAIL ${err.message}`); }
}

await browser.close();
if (failed) process.exit(1);