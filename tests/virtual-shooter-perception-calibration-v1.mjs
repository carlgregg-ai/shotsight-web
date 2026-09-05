import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createL1PartitionedCrosserBank,fitL1UncertaintyCalibration,evaluateL1HeldoutCalibration} from '../learning/perception-calibration-v1.mjs';

const learnerSource=fs.readFileSync(new URL('../learning/crosser-belief-v1.mjs',import.meta.url),'utf8');
assert.equal(/\.\.\/physics\//.test(learnerSource),false,'learner belief imports privileged physics');
assert.equal(/oracle-evaluation|perception-evaluation|perception-calibration/.test(learnerSource),false,'learner belief imports referee/evaluation module');

const bank=createL1PartitionedCrosserBank({seed:20260905,calibrationN:120,heldoutN:240});
assert.equal(bank.calibration.length,120);assert.equal(bank.heldout.length,240);
const calibration=fitL1UncertaintyCalibration({bank,seedBase:710000});
assert.equal(calibration.schema,'L1_UNCERTAINTY_CALIBRATION_V1');
const result=evaluateL1HeldoutCalibration({bank,calibration,seedBase:910000});
assert.equal(result.status,'L1_HELDOUT_CALIBRATION_EVALUATION_V1');

for(const name of ['CLEAR','SHORT','NOISY','PARTIAL']){
  const m=result.out[name];
  assert.equal(m.n,240,`${name} held-out sample count`);
  assert(Number.isFinite(m.calibratedAzCoverage95));assert(Number.isFinite(m.calibratedElCoverage95));
  assert(m.calibratedAzCoverage95>=0.86&&m.calibratedAzCoverage95<=0.995,`${name} az coverage remains badly calibrated: ${m.calibratedAzCoverage95}`);
  assert(m.calibratedElCoverage95>=0.86&&m.calibratedElCoverage95<=0.995,`${name} el coverage remains badly calibrated: ${m.calibratedElCoverage95}`);
  assert(Number.isFinite(m.calibratedAzMeanNll));assert(Number.isFinite(m.calibratedElMeanNll));
  assert(m.meanConfidence>=0&&m.meanConfidence<1);
}
assert(result.out.SHORT.meanConfidence<result.out.CLEAR.meanConfidence,'SHORT must reduce confidence');
assert(result.out.NOISY.meanConfidence<result.out.CLEAR.meanConfidence,'NOISY must reduce confidence');
assert(result.out.PARTIAL.meanConfidence<result.out.CLEAR.meanConfidence,'PARTIAL must reduce confidence');
assert(result.out.NOISY.azRmse_rad>result.out.CLEAR.azRmse_rad,'NOISY should degrade point prediction');
assert(result.out.PARTIAL.meanConfidence<=result.out.SHORT.meanConfidence,'partial acquisition should not look more certain than short clean acquisition');

console.log(JSON.stringify({suite:'ShotSight virtual shooter L1 held-out uncertainty calibration v1',status:'PASS',result},null,2));
