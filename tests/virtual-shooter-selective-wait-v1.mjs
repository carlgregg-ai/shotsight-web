import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runL1SelectiveWaitBenchmark} from '../learning/selective-wait-v1.mjs';

const learnerSource=await readFile(new URL('../learning/multifamily-belief-v1.mjs',import.meta.url),'utf8');
for(const forbiddenImport of ['../physics/','oracle-evaluation','multifamily-evaluation','selective-wait'])assert.equal(learnerSource.includes(forbiddenImport),false,`learner must not import ${forbiddenImport}`);

const report=runL1SelectiveWaitBenchmark();
assert.equal(report.status,'L1_SELECTIVE_WAIT_HELDOUT_BENCHMARK_V1');
assert.deepEqual(report.partitions,{training:270,calibration:360,heldout:720});
assert.ok(report.temperatureFit.temperature>=0.35&&report.temperatureFit.temperature<=3.0);
assert.equal(report.policy.runtimeInputs.length,1);
assert.equal(report.policy.runtimeInputs[0],'CALIBRATED_FAMILY_PROBABILITIES');
assert.ok(report.policy.meanWait_s<=0.105+1e-12,'calibration policy must respect wait budget');

const r=report.heldout;
for(const m of [r.immediate,r.wait50,r.wait100,r.wait150,r.selective]){
  assert.ok(Number.isFinite(m.accuracy)&&m.accuracy>=0&&m.accuracy<=1);
  assert.ok(Number.isFinite(m.crosserQuartererAccuracy)&&m.crosserQuartererAccuracy>=0&&m.crosserQuartererAccuracy<=1);
  assert.ok(Number.isFinite(m.azRmse_rad)&&Number.isFinite(m.elRmse_rad));
}
assert.ok(report.heldoutInitialReliability.ece<0.30,`held-out calibrated ECE too poor: ${report.heldoutInitialReliability.ece}`);
assert.ok(r.wait100.crosserQuartererAccuracy>r.immediate.crosserQuartererAccuracy+0.10,`100ms additional observation should materially improve difficult C/Q discrimination: ${r.immediate.crosserQuartererAccuracy} -> ${r.wait100.crosserQuartererAccuracy}`);
assert.ok(r.selective.crosserQuartererAccuracy>r.immediate.crosserQuartererAccuracy+0.05,`selective waiting should improve C/Q discrimination: ${r.immediate.crosserQuartererAccuracy} -> ${r.selective.crosserQuartererAccuracy}`);
assert.ok(r.selective.meanWait_s<=0.12,'held-out selective policy should not wait excessively');
assert.ok(r.selective.waitRate>0&&r.selective.waitRate<1,'selective policy must both wait and commit immediately on some targets');
assert.ok(r.selective.azRmse_rad<=r.immediate.azRmse_rad*1.10,'selective waiting must not materially degrade future azimuth prediction');

console.log(JSON.stringify({status:'PASS',temperatureFit:report.temperatureFit,policy:report.policy,calibrationReliability:report.calibrationReliability,heldoutInitialReliability:report.heldoutInitialReliability,heldout:report.heldout},null,2));
