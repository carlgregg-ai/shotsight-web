import assert from 'node:assert/strict';
import {createShooterStandPrior,buildShooterVisiblePresentationContext,fitWaitInformationModel,chooseRunwayAwareObservationWait} from '../learning/presentation-context-v1.mjs';
import {runL2PresentationContextBenchmark} from '../learning/presentation-planning-evaluation-v1.mjs';

const prior=createShooterStandPrior({expectedDirection:'RIGHT'});
assert.equal(prior.schema,'SHOOTER_STAND_PRIOR_V1');
assert.match(prior.forbiddenInterpretation,/NOT CURRENT TARGET FUTURE/);
assert.throws(()=>createShooterStandPrior({expectedDirection:'RIGHT',range_m:30}),/|/);

const report=runL2PresentationContextBenchmark();
assert.equal(report.status,'L2_PRESENTATION_CONTEXT_RUNWAY_BENCHMARK_V1');
assert.equal(report.partitions.familyTraining,270);
assert.equal(report.partitions.waitCalibrationCrossers,100);
assert.equal(report.partitions.heldoutCrossers,160);
assert.match(report.boundary,/CURRENT TARGET XYZ/);

assert.ok(report.early.n>100);
assert.ok(report.early.waitRate>0&&report.early.waitRate<1,'runway-aware policy must both wait and commit');
assert.ok(report.early.meanWait_s>0&&report.early.meanWait_s<0.15,'mean wait should be selective rather than always max wait');
assert.ok(report.early.runwayAwareAccuracy>=report.early.immediateAccuracy,'selective extra information should not reduce held-out family reading accuracy');
assert.ok(report.early.meanSelectedConfidence>=report.early.meanInitialConfidence,'selected extra observation should improve confidence on average');

assert.ok(report.late.n>100);
assert.ok(report.late.meanRemainingToBreakEnd<report.early.meanRemainingToBreakEnd,'later observation should consume inferred presentation runway');
assert.ok(report.late.meanWait_s<=report.early.meanWait_s,'policy should become no more willing to wait when runway is reduced');

for(const wait of ['0.05','0.1','0.15'])assert.ok(report.waitModel.expectedConfidenceGain[wait]!==undefined);
console.log(JSON.stringify({status:'PASS',report},null,2));
