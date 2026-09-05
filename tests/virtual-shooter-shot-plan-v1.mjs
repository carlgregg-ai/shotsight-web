import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildPerceptionLimitedShotPlan,scorePlanStructure,L2_SOURCE_PRIORS} from '../learning/shot-plan-v1.mjs';

const source=await readFile(new URL('../learning/shot-plan-v1.mjs',import.meta.url),'utf8');
for(const forbiddenImport of ['../physics/','oracle-evaluation','multifamily-evaluation','ballistic','intercept-v1'])assert.equal(source.includes(forbiddenImport),false,`L2 learner planner must not import/reference privileged implementation ${forbiddenImport}`);

const belief=Object.freeze({
  schema:'MULTIFAMILY_BELIEF_V1',status:'TARGET_FAMILY_AND_PATH_BELIEF',confidence:0.58,
  familyProb:Object.freeze({CROSSER:0.76,QUARTERER:0.20,LOOPER:0.04}),
  motionPhaseProb:Object.freeze({STABLE:0.82,CHANGING:0.18}),
  apparentMotion:Object.freeze({azRateMean_radps:0.55,azAccelMean_radps2:0.03,elRateMean_radps:0.04,elAccelMean_radps2:-0.06,observationSpan_s:0.27,samples:12}),
  prediction:Object.freeze({fromObservationTime_s:0.62,horizon_s:0.12,azMean_rad:0.105,elMean_rad:0.031,azSd_rad:0.006,elSd_rad:0.004}),
  uncertainty:Object.freeze({class:'PERCEPTUAL_MULTIFAMILY_BELIEF_NOT_ORACLE',reliability:0.61})
});

assert.equal(L2_SOURCE_PRIORS.evidenceBoundary,'COACHING_PRIORS_NOT_ORACLE_TRUTH');
for(const method of ['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']){
  const plan=buildPerceptionLimitedShotPlan(belief,{method,priorMode:'SOURCE_PRIOR'});
  assert.equal(plan.schema,'PERCEPTION_LIMITED_SHOT_PLAN_V1');
  assert.deepEqual(plan.runtimeInputs,['MULTIFAMILY_BELIEF_V1']);
  const p=plan.planningCoordinates;
  assert.ok(p.holdProgress<p.connectionProgress&&p.connectionProgress<p.breakProgress,'plan topology must preserve pickup/hold -> connection -> break order');
  for(const region of [plan.visualPickupRegion,plan.gunHoldRegion,plan.connectionRegion,plan.intendedBreakRegion]){
    assert.ok(Number.isFinite(region.azMean_rad)&&Number.isFinite(region.elMean_rad));
    assert.ok(region.azSd_rad>0&&region.elSd_rad>0,'planning regions must retain uncertainty');
    for(const forbidden of ['x_m','y_m','z_m','range_m','lead_m','pelletTof_s','intercept'])assert.equal(Object.hasOwn(region,forbidden),false);
  }
  const score=scorePlanStructure(plan);
  assert.equal(score.topology,1);
  assert.ok(score.meanControlProxy>=0&&score.meanControlProxy<=1);
  assert.match(score.boundary,/NO ORACLE HIT OR LEAD SCORE/);
}

const sourcePull=buildPerceptionLimitedShotPlan(belief,{method:'PULL_AWAY',priorMode:'SOURCE_PRIOR'});
const blankPull=buildPerceptionLimitedShotPlan(belief,{method:'PULL_AWAY',priorMode:'BLANK_SLATE'});
assert.notDeepEqual(sourcePull.planningCoordinates,blankPull.planningCoordinates,'source prior and blank-slate control must remain experimentally distinguishable');

const lowConfidence={...belief,confidence:0.08,motionPhaseProb:{STABLE:0.25,CHANGING:0.75}};
const lowPlan=buildPerceptionLimitedShotPlan(lowConfidence,{method:'PULL_AWAY',priorMode:'SOURCE_PRIOR'});
assert.ok(lowPlan.planningCoordinates.connectionProgress>sourcePull.planningCoordinates.connectionProgress,'low-confidence/changing belief should delay connection rather than pretending certainty');
assert.ok(lowPlan.planningCoordinates.breakProgress>=sourcePull.planningCoordinates.breakProgress,'low-confidence/changing belief should not silently pull break commitment earlier');

console.log(JSON.stringify({status:'PASS',sourcePrior:L2_SOURCE_PRIORS,sourcePull:sourcePull.planningCoordinates,blankPull:blankPull.planningCoordinates,lowConfidencePull:lowPlan.planningCoordinates,sourceScore:scorePlanStructure(sourcePull),blankScore:scorePlanStructure(blankPull)},null,2));
