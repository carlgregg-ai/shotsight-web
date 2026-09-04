import { chromium } from 'playwright';

const base = process.env.SHOTSIGHT_BASE_URL || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({headless:true});
let failed = false;

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
    if (lessonCount !== 8) throw new Error(`${label}: expected 8 certified lessons, got ${lessonCount}`);

    const demoCount = await page.locator('#demoGrid > *').count();
    if (demoCount < 1) throw new Error(`${label}: retained visual guides did not initialise`);

    // Stage 6 visual gate: every representative lesson must render an explicitly
    // labelled schematic with a target path and explanatory caption. This is a
    // structural/novice-legibility gate, not certification of ballistic geometry.
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
      await page.locator('#playbookClose').click();
      await page.waitForFunction(() => !document.querySelector('#playbookSheet')?.classList.contains('active'));
    }

    const search = page.locator('#playbookSearch');
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
    console.log(`PASS ${label}: ${lessonCount} lessons; all representative lesson schematics; ${demoCount} retained visual guides; Learn/Diagnose routing and sheet interactions verified.`);
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
