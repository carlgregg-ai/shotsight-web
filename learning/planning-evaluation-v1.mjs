// ShotSight Virtual Shooter L2 — referee-side planning adaptation benchmark.
// Oracle worlds generate observations only; plans are frozen before any truth-side scoring.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {buildMultiFamilyBelief} from './multifamily-belief-v1.mjs';
import {auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {buildPerceptionLimitedShotPlan,scorePlanStructure} from './shot-plan-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:NaN;

function evaluateCondition(bank,model,condition,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const history=createL1ObservationHistory(record,{...condition,seed:seedBase+i*101});
    const belief=buildMultiFamilyBelief(history,{model,predictionHorizon_s:0.12,maxHistory_s:condition.window_s});
    if(!belief.prediction)continue;auditShooterBoundary({observations:history,beliefs:[belief]});
    for(const method of ['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']){
      const source=buildPerceptionLimitedShotPlan(belief,{method,priorMode:'SOURCE_PRIOR'});
      const blank=buildPerceptionLimitedShotPlan(belief,{method,priorMode:'BLANK_SLATE'});
      rows.push({method,confidence:belief.confidence,changing:belief.motionPhaseProb.CHANGING,source,blank,sourceScore:scorePlanStructure(source),blankScore:scorePlanStructure(blank)});
    }
  }
  const byMethod={};
  for(const method of ['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']){
    const xs=rows.filter(r=>r.method===method);
    const aggregate=mode=>({
      holdProgress:mean(xs.map(r=>r[mode].planningCoordinates.holdProgress)),
      connectionProgress:mean(xs.map(r=>r[mode].planningCoordinates.connectionProgress)),
      breakProgress:mean(xs.map(r=>r[mode].planningCoordinates.breakProgress)),
      controlProxy:mean(xs.map(r=>r[`${mode}Score`].meanControlProxy))
    });
    byMethod[method]={source:aggregate('source'),blank:aggregate('blank')};
  }
  return freezePlain({nPlans:rows.length,meanBeliefConfidence:mean(rows.map(r=>r.confidence)),meanChangingEvidence:mean(rows.map(r=>r.changing)),byMethod});
}

export function runL2PlanningAdaptationBenchmark({trainNPerFamily=90,heldoutNPerFamily=120,trainSeedBase=41000,heldoutSeedBase=261000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const bank=createL1MultiFamilyBank({nPerFamily:heldoutNPerFamily,seedBase:heldoutSeedBase});
  const clear=evaluateCondition(bank,model,{window_s:0.30,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9},heldoutSeedBase*3);
  const poor=evaluateCondition(bank,model,{window_s:0.22,angleNoiseSd_rad:0.0030,rateNoiseSd_radps:0.05,acquisitionQuality:0.45},heldoutSeedBase*7);
  return freezePlain({
    status:'L2_PLANNING_ADAPTATION_HELDOUT_V1',
    partitions:{training:trainNPerFamily*3,heldoutCrossers:heldoutNPerFamily},
    conditions:{clear,poor},
    boundary:'REFEREE GENERATES SHOOTER OBSERVATIONS; PLAN INPUT IS MULTIFAMILY_BELIEF_V1 ONLY; NO ORACLE INTERCEPT/LEAD SCORE',
    interpretation:'This benchmark checks whether the L2 representation is perception-sensitive and method-distinct. It does not establish that any plan breaks real or simulated targets.'
  });
}
