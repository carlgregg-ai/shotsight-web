import assert from 'node:assert/strict';
import {runL2PlanningAdaptationBenchmark} from '../learning/planning-evaluation-v1.mjs';

const report=runL2PlanningAdaptationBenchmark();
assert.equal(report.status,'L2_PLANNING_ADAPTATION_HELDOUT_V1');
assert.equal(report.partitions.training,270);
assert.equal(report.partitions.heldoutCrossers,120);
assert.match(report.boundary,/NO ORACLE INTERCEPT\/LEAD SCORE/);

const {clear,poor}=report.conditions;
assert.ok(clear.nPlans>0&&poor.nPlans>0);
assert.ok(clear.meanBeliefConfidence>poor.meanBeliefConfidence,'degraded observations should lower held-out belief confidence');

for(const method of ['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']){
  for(const c of [clear,poor]){
    const s=c.byMethod[method].source,b=c.byMethod[method].blank;
    for(const p of [s,b]){
      assert.ok(p.holdProgress<p.connectionProgress&&p.connectionProgress<p.breakProgress);
      assert.ok(p.controlProxy>=0&&p.controlProxy<=1);
    }
  }
  assert.ok(poor.byMethod[method].source.connectionProgress>=clear.byMethod[method].source.connectionProgress,'source prior should preserve more reading before connection under poorer perception');
  assert.ok(poor.byMethod[method].source.breakProgress>=clear.byMethod[method].source.breakProgress,'source prior should not become falsely earlier under poorer perception');
  assert.equal(poor.byMethod[method].blank.connectionProgress,clear.byMethod[method].blank.connectionProgress,'blank control should remain perception-insensitive at initialisation');
}

assert.notEqual(clear.byMethod.SWING_THROUGH.source.holdProgress,clear.byMethod.MAINTAINED_LEAD.source.holdProgress,'source-informed method plans must remain method-distinct');
assert.equal(clear.byMethod.SWING_THROUGH.blank.holdProgress,clear.byMethod.MAINTAINED_LEAD.blank.holdProgress,'blank-slate control must remain method-agnostic at initialisation');

console.log(JSON.stringify({status:'PASS',report},null,2));
