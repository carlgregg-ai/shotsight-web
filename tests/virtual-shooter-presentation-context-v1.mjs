import assert from 'node:assert/strict';
import {createShooterStandPrior} from '../learning/presentation-context-v1.mjs';
import {runL2PresentationContextBenchmark} from '../learning/presentation-planning-evaluation-v1.mjs';

const prior=createShooterStandPrior({expectedDirection:'RIGHT'});
assert.equal(prior.schema,'SHOOTER_STAND_PRIOR_V1');
assert.match(prior.forbiddenInterpretation,/NOT CURRENT TARGET FUTURE/);
assert.ok(!('range_m' in prior)&&!('targetVelocity_W' in prior)&&!('exactIntercept' in prior));

const report=runL2PresentationContextBenchmark();
assert.equal(report.status,'L2_PRESENTATION_CONTEXT_RUNWAY_BENCHMARK_V1');
assert.equal(report.partitions.familyTraining,270);
assert.equal(report.partitions.waitCalibrationCrossers,100);
assert.equal(report.partitions.heldoutCrossers,160);
assert.match(report.boundary,/CURRENT TARGET XYZ/);
assert.match(report.waitModel.fitBoundary,/CALIBRATION LABELS MAY FIT EXPECTED VALUE/);

assert.ok(report.early.n>100&&report.late.n>100);
assert.ok(report.early.waitRate>0,'poor early reads should sometimes justify more information');
assert.ok(report.early.meanWait_s>0&&report.early.meanWait_s<=0.15);
assert.ok(report.early.runwayAwareAccuracy>report.early.immediateAccuracy,'decision-quality-valued extra information should improve held-out family reading');

assert.ok(report.late.meanRemainingToBreakStart<report.early.meanRemainingToBreakStart,'cumulative visible progress must consume pre-break runway');
assert.ok(report.late.meanRemainingToBreakEnd<report.early.meanRemainingToBreakEnd,'cumulative visible progress must consume overall inferred opportunity');
assert.ok(report.late.meanWait_s<report.early.meanWait_s,'the same information-seeking tendency should be suppressed as break opportunity is consumed');
assert.ok(report.late.waitRate<report.early.waitRate,'runway-aware policy should commit more often later in the presentation');

for(const wait of ['0.05','0.1','0.15']){
  assert.ok(report.waitModel.expectedConfidenceGain[wait]!==undefined);
  assert.ok(report.waitModel.expectedDecisionQualityGain[wait]!==undefined);
}
console.log(JSON.stringify({status:'PASS',report},null,2));
