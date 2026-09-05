// ShotSight L2 held-out population evaluation for whole-presentation planning.
// Referee generates hidden targets; learner plan receives only observations, belief and shooter-visible context.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {buildMultiFamilyBelief} from './multifamily-belief-v1.mjs';
import {auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {createShooterStandPrior,buildShooterVisiblePresentationContext} from './presentation-context-v1.mjs';
import {buildPresentationLevelShotPlan} from './presentation-shot-plan-v1.mjs';

const METHODS=['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD'];
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:NaN;
const frac=(xs,p)=>mean(xs.map(x=>p(x)?1:0));
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function standPrior(record){const vx=record.scenario.targetVelocity_W?.[0]??0;return createShooterStandPrior({expectedDirection:vx>=0?'RIGHT':'LEFT',demonstratedFamilyProb:{CROSSER:0.78,QUARTERER:0.17,LOOPER:0.03,OTHER:0.02},expectedPresentationDuration_s:0.95,demonstratedAngularSpan_rad:0.62,pickupProgressPrior:0.08,breakWindow:{start:0.70,end:0.90}});}
function observation(record,{evalTime_s,window_s,quality,noise,rateNoise,seed}){return createL1ObservationHistory(record,{evalTime_s,window_s,acquisitionQuality:quality,angleNoiseSd_rad:noise,rateNoiseSd_radps:rateNoise,seed});}
function beliefFrom(history,model,window_s){const b=buildMultiFamilyBelief(history,{model,predictionHorizon_s:0.12,maxHistory_s:window_s});auditShooterBoundary({observations:history,beliefs:[b]});return b;}
function contextHistory(record,evalTime_s,seed){return observation(record,{evalTime_s,window_s:Math.max(0.22,evalTime_s-0.20),quality:0.45,noise:0.003,rateNoise:0.05,seed});}

function evaluateCondition(bank,model,{evalTime_s,beliefWindow_s,quality,noise,rateNoise,seedBase}){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const r=bank[i];if(r.family!=='CROSSER')continue;
    const h=observation(r,{evalTime_s,window_s:beliefWindow_s,quality,noise,rateNoise,seed:seedBase+i*191});
    const b=beliefFrom(h,model,beliefWindow_s);if(!b.prediction)continue;
    const ch=contextHistory(r,evalTime_s,seedBase+i*191+90000);auditShooterBoundary({observations:ch,beliefs:[]});
    const c=buildShooterVisiblePresentationContext(ch,b,standPrior(r));
    for(const method of METHODS){
      const source=buildPresentationLevelShotPlan(b,c,{method,priorMode:'SOURCE_PRIOR'}),blank=buildPresentationLevelShotPlan(b,c,{method,priorMode:'BLANK_SLATE'});
      rows.push({method,confidence:b.confidence,current:c.elapsedPresentationProgress,source,blank});
    }
  }
  const byMethod={};
  for(const method of METHODS){const x=rows.filter(r=>r.method===method);byMethod[method]={n:x.length,meanConfidence:mean(x.map(r=>r.confidence)),meanCurrentProgress:mean(x.map(r=>r.current)),sourceIntendedBreak:mean(x.map(r=>r.source.presentationProgress.intendedBreak)),sourcePlannedConnection:mean(x.map(r=>r.source.presentationProgress.plannedConnection)),sourceEffectiveConnection:mean(x.map(r=>r.source.executionAdaptation.effectiveConnection)),sourceConnectionPassedRate:frac(x,r=>r.source.executionAdaptation.connectionAlreadyPassed),sourceInformationNeedRate:frac(x,r=>r.source.executionAdaptation.informationNeed==='CONSIDER_MORE_OBSERVATION'),sourceCompressedOrCriticalRate:frac(x,r=>['COMPRESSED','CRITICAL','MISSED_BREAK_WINDOW'].includes(r.source.executionAdaptation.runwayState)),blankIntendedBreak:mean(x.map(r=>r.blank.presentationProgress.intendedBreak))};}
  return {nPlans:rows.length,byMethod};
}

export function runL2PresentationShotPlanHeldout({trainNPerFamily=90,heldoutNPerFamily=180,trainSeedBase=41000,heldoutSeedBase=781000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const heldout=createL1MultiFamilyBank({nPerFamily:heldoutNPerFamily,seedBase:heldoutSeedBase});
  const earlyClear=evaluateCondition(heldout,model,{evalTime_s:0.62,beliefWindow_s:0.30,quality:0.92,noise:0.0014,rateNoise:0.018,seedBase:heldoutSeedBase*3});
  const earlyPoor=evaluateCondition(heldout,model,{evalTime_s:0.62,beliefWindow_s:0.22,quality:0.45,noise:0.003,rateNoise:0.05,seedBase:heldoutSeedBase*5});
  const latePoor=evaluateCondition(heldout,model,{evalTime_s:0.84,beliefWindow_s:0.22,quality:0.45,noise:0.003,rateNoise:0.05,seedBase:heldoutSeedBase*7});
  return freezePlain({status:'L2_PRESENTATION_SHOT_PLAN_HELDOUT_V1',partitions:{familyTraining:trainNPerFamily*3,heldoutCrossers:heldoutNPerFamily},earlyClear,earlyPoor,latePoor,boundary:'WHOLE-PRESENTATION PLAN INPUTS ARE SHOOTER OBSERVATIONS + MULTIFAMILY BELIEF + SHOOTER-VISIBLE STAND/PRESENTATION CONTEXT ONLY; ORACLE USED ONLY TO GENERATE HIDDEN TEST TARGETS',interpretation:'Architecture gate only. Intended break remains anchored to the whole-presentation plan; uncertainty changes information need, while consumed observed progress may compress/force connection. No gun motion or target-break success is claimed.'});
}
