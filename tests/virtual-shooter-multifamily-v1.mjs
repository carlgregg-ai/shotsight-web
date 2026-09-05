import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runL1MultiFamilyBenchmark} from '../learning/multifamily-evaluation-v1.mjs';
import {assertNoPrivilegedShooterData} from '../learning/virtual-shooter-boundary-v1.mjs';

const learnerSource=await readFile(new URL('../learning/multifamily-belief-v1.mjs',import.meta.url),'utf8');
for(const forbiddenImport of ['../physics/','oracle-evaluation','multifamily-evaluation'])assert.equal(learnerSource.includes(forbiddenImport),false,`learner must not import ${forbiddenImport}`);

const report=runL1MultiFamilyBenchmark();
assert.equal(report.status,'L1_MULTIFAMILY_HELDOUT_BENCHMARK_V1');
assert.equal(report.training.total,270);assert.equal(report.heldout.total,540);assertNoPrivilegedShooterData(report.model,{path:'trainedFamilyModel'});

const full=report.conditions.FULL_300MS,short=report.conditions.SHORT_240MS,partial=report.conditions.PARTIAL_220MS;
for(const c of [full,short,partial]){
  assert.equal(c.validN,540,'all held-out episodes should form a belief');
  assert.ok(Number.isFinite(c.multiclassBrier)&&Number.isFinite(c.azRmse_rad)&&Number.isFinite(c.elRmse_rad));
  assert.ok(c.meanConfidence>=0&&c.meanConfidence<=1);
}

// L1 is not allowed to hide ambiguity behind a perfect classifier. The curved looper family
// should be legible, while crosser-v-quarterer is expected to remain materially harder.
assert.ok(full.accuracy>=0.64,`full-view held-out family accuracy too low: ${full.accuracy}`);
assert.ok(full.byFamily.LOOPER.recall>=0.90,`looper recall too low: ${full.byFamily.LOOPER.recall}`);
assert.ok(full.crosserQuartererAccuracy>=0.48,`crosser/quarterer discrimination below useful information: ${full.crosserQuartererAccuracy}`);
assert.ok(short.accuracy>=0.50,`240ms held-out accuracy too low: ${short.accuracy}`);
assert.ok(partial.meanConfidence<full.meanConfidence,'partial acquisition must reduce confidence');
assert.ok(short.meanConfidence<full.meanConfidence,'240ms view must reduce confidence');
assert.ok(partial.multiclassBrier>full.multiclassBrier*0.90,'degraded partial view must not look spuriously better calibrated than full view');

console.log(JSON.stringify({status:'PASS',full300ms:full,short240ms:short,partial220ms:partial},null,2));
