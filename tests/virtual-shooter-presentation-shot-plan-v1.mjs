import assert from 'node:assert/strict';
import {buildPresentationLevelShotPlan} from '../learning/presentation-shot-plan-v1.mjs';

function belief(confidence){return Object.freeze({schema:'MULTIFAMILY_BELIEF_V1',confidence,familyProb:Object.freeze({CROSSER:0.72,QUARTERER:0.22,LOOPER:0.06}),motionPhaseProb:Object.freeze({STABLE:0.8,CHANGING:0.2})});}
function context(progress){return Object.freeze({schema:'SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1',elapsedPresentationProgress:progress,pickupProgressPrior:0.08,breakWindow:Object.freeze({start:0.70,end:0.90}),remainingToBreakStart:Math.max(0,0.70-progress),remainingToBreakEnd:Math.max(0,0.90-progress),expectedPresentationDuration_s:0.95});}

for(const method of ['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']){
  const clear=buildPresentationLevelShotPlan(belief(0.75),context(0.34),{method,priorMode:'SOURCE_PRIOR'});
  const poor=buildPresentationLevelShotPlan(belief(0.12),context(0.34),{method,priorMode:'SOURCE_PRIOR'});
  assert.equal(clear.schema,'PRESENTATION_LEVEL_SHOT_PLAN_V1');
  assert.equal(clear.presentationProgress.intendedBreak,poor.presentationProgress.intendedBreak,'uncertainty must not drag break point later');
  assert.equal(clear.presentationProgress.gunHold,poor.presentationProgress.gunHold,'uncertainty must not chase the live target with the pre-call hold');
  assert.equal(poor.executionAdaptation.informationNeed,'CONSIDER_MORE_OBSERVATION');
  assert.match(clear.evidenceBoundary,/WHOLE-PRESENTATION PRIORS/);
  assert.ok(!('range_m' in clear)&&!('physicalLead_m' in clear)&&!('pelletTOF_s' in clear));
}

const early=buildPresentationLevelShotPlan(belief(0.12),context(0.34),{method:'PULL_AWAY'});
const consumed=buildPresentationLevelShotPlan(belief(0.12),context(0.67),{method:'PULL_AWAY'});
assert.equal(early.presentationProgress.intendedBreak,consumed.presentationProgress.intendedBreak,'consumed runway must not fabricate a later ideal break point');
assert.equal(early.executionAdaptation.connectionAlreadyPassed,false);
assert.equal(consumed.executionAdaptation.connectionAlreadyPassed,true);
assert.ok(consumed.executionAdaptation.effectiveConnection>consumed.presentationProgress.plannedConnection,'live connection may be forced later when planned connection is already passed');
assert.ok(consumed.executionAdaptation.remainingPreBreakRunway<early.executionAdaptation.remainingPreBreakRunway);
assert.notEqual(consumed.executionAdaptation.informationNeed,'CONSIDER_MORE_OBSERVATION','compressed runway should force commit/replan rather than endless observation');

const blank=buildPresentationLevelShotPlan(belief(0.5),context(0.34),{method:'PULL_AWAY',priorMode:'BLANK_SLATE'});
assert.equal(blank.presentationProgress.gunHold,0.25);
assert.equal(blank.presentationProgress.plannedConnection,0.5);
assert.equal(blank.presentationProgress.intendedBreak,0.75);

console.log(JSON.stringify({status:'PASS',early,consumed,blank},null,2));
