import assert from 'node:assert/strict';
import {runL2PresentationShotPlanHeldout} from '../learning/presentation-shot-plan-evaluation-v1.mjs';

const report=runL2PresentationShotPlanHeldout();
assert.equal(report.status,'L2_PRESENTATION_SHOT_PLAN_HELDOUT_V1');
assert.equal(report.partitions.familyTraining,270);
assert.equal(report.partitions.heldoutCrossers,180);
assert.match(report.boundary,/ORACLE USED ONLY TO GENERATE HIDDEN TEST TARGETS/);

for(const method of ['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']){
  const clear=report.earlyClear.byMethod[method],poor=report.earlyPoor.byMethod[method],late=report.latePoor.byMethod[method];
  assert.ok(clear.n>150&&poor.n>150&&late.n>150);
  assert.equal(clear.sourceIntendedBreak,poor.sourceIntendedBreak,'poor perception must not drag the intended break later');
  assert.equal(poor.sourceIntendedBreak,late.sourceIntendedBreak,'late observed progress must not fabricate a later ideal break point');
  assert.ok(poor.meanConfidence<clear.meanConfidence,'poor condition should genuinely reduce belief confidence');
  assert.ok(late.meanCurrentProgress>poor.meanCurrentProgress,'later condition must retain more cumulative presentation progress');
  assert.ok(late.sourceConnectionPassedRate>=poor.sourceConnectionPassedRate,'consumed presentation should not reduce connection-passed rate');
  assert.ok(late.sourceCompressedOrCriticalRate>=poor.sourceCompressedOrCriticalRate,'consumed presentation should increase or preserve runway pressure');
  assert.ok(poor.sourceInformationNeedRate>=clear.sourceInformationNeedRate,'poor early perception should create at least as much information need');
  assert.ok(late.sourceInformationNeedRate<=poor.sourceInformationNeedRate,'late runway should suppress indefinite information seeking');
  assert.ok(clear.sourceIntendedBreak>=0.70&&clear.sourceIntendedBreak<=0.90);
}

assert.notEqual(report.earlyClear.byMethod.SWING_THROUGH.sourcePlannedConnection,report.earlyClear.byMethod.PULL_AWAY.sourcePlannedConnection);
assert.notEqual(report.earlyClear.byMethod.PULL_AWAY.sourcePlannedConnection,report.earlyClear.byMethod.MAINTAINED_LEAD.sourcePlannedConnection);
console.log(JSON.stringify({status:'PASS',report},null,2));
