// ShotSight Virtual Shooter L2 — referee-side whole-presentation / information-runway benchmark.
// Oracle world may generate the target, but learner-side context receives only coarse stand prior,
// ShooterObservation history and MULTIFAMILY_BELIEF_V1. Held-out truth is used only for scoring.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {buildMultiFamilyBelief} from './multifamily-belief-v1.mjs';
import {auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {createShooterStandPrior,buildShooterVisiblePresentationContext,fitWaitInformationModel,chooseRunwayAwareObservationWait} from './presentation-context-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:NaN;
const argmax=o=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0][0];
function familyBrier(prob,trueFamily){let s=0;for(const f of ['CROSSER','QUARTERER','LOOPER'])s+=((prob?.[f]??0)-(f===trueFamily?1:0))**2;return s;}

function directionForDemonstratedStand(record){
  const vx=record.scenario.targetVelocity_W?.[0]??record.scenario.targetInitialVelocity_W?.[0]??0;
  return vx>=0?'RIGHT':'LEFT';
}
function makeStandPrior(record){return createShooterStandPrior({expectedDirection:directionForDemonstratedStand(record),demonstratedFamilyProb:{CROSSER:0.78,QUARTERER:0.17,LOOPER:0.03,OTHER:0.02},expectedPresentationDuration_s:0.95,demonstratedAngularSpan_rad:0.62,pickupProgressPrior:0.08,breakWindow:{start:0.70,end:0.90}});}
function beliefFor(record,model,{evalTime_s=0.62,window_s,noise=0.003,rateNoise=0.05,quality=0.45,seed}){
  const history=createL1ObservationHistory(record,{evalTime_s,window_s,angleNoiseSd_rad:noise,rateNoiseSd_radps:rateNoise,acquisitionQuality:quality,seed});
  const belief=buildMultiFamilyBelief(history,{model,predictionHorizon_s:0.12,maxHistory_s:window_s});
  auditShooterBoundary({observations:history,beliefs:[belief]});return {history,belief};
}
function contextHistoryFor(record,{evalTime_s,seed}){
  const window_s=Math.max(0.22,evalTime_s-0.20);
  return createL1ObservationHistory(record,{evalTime_s,window_s,angleNoiseSd_rad:0.003,rateNoiseSd_radps:0.05,acquisitionQuality:0.45,seed});
}

function makeCalibrationRows(bank,model,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const initial=beliefFor(record,model,{window_s:0.22,seed:seedBase+i*101});if(!initial.belief.prediction)continue;
    const initialDecisionLoss=familyBrier(initial.belief.familyProb,record.family);
    for(const wait_s of [0.05,0.10,0.15]){
      const later=beliefFor(record,model,{evalTime_s:0.62+wait_s,window_s:0.22+wait_s,seed:seedBase+i*101});if(!later.belief.prediction)continue;
      rows.push({initialConfidence:initial.belief.confidence,laterConfidence:later.belief.confidence,wait_s,initialDecisionLoss,laterDecisionLoss:familyBrier(later.belief.familyProb,record.family)});
    }
  }
  return rows;
}

function evaluateHeldout(bank,model,waitModel,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const evalTime_s=0.62,seed=seedBase+i*113;
    const initial=beliefFor(record,model,{evalTime_s,window_s:0.22,seed});if(!initial.belief.prediction)continue;
    const contextHistory=contextHistoryFor(record,{evalTime_s,seed:seed+50000});auditShooterBoundary({observations:contextHistory,beliefs:[]});
    const context=buildShooterVisiblePresentationContext(contextHistory,initial.belief,makeStandPrior(record));
    const decision=chooseRunwayAwareObservationWait(context,initial.belief,waitModel);
    const selected=decision.wait_s>0?beliefFor(record,model,{evalTime_s:evalTime_s+decision.wait_s,window_s:0.22+decision.wait_s,seed}):initial;
    const always100=beliefFor(record,model,{evalTime_s:evalTime_s+0.10,window_s:0.32,seed});
    const predInitial=argmax(initial.belief.familyProb),predSelected=argmax(selected.belief.familyProb),pred100=argmax(always100.belief.familyProb);
    rows.push({decision,context,initialCorrect:predInitial===record.family,selectedCorrect:predSelected===record.family,always100Correct:pred100===record.family,selectedConfidence:selected.belief.confidence,initialConfidence:initial.belief.confidence});
  }
  return {n:rows.length,immediateAccuracy:mean(rows.map(r=>r.initialCorrect?1:0)),runwayAwareAccuracy:mean(rows.map(r=>r.selectedCorrect?1:0)),alwaysWait100Accuracy:mean(rows.map(r=>r.always100Correct?1:0)),waitRate:mean(rows.map(r=>r.decision.wait_s>0?1:0)),meanWait_s:mean(rows.map(r=>r.decision.wait_s)),meanInitialConfidence:mean(rows.map(r=>r.initialConfidence)),meanSelectedConfidence:mean(rows.map(r=>r.selectedConfidence)),meanRemainingToBreakStart:mean(rows.map(r=>r.context.remainingToBreakStart)),meanRemainingToBreakEnd:mean(rows.map(r=>r.context.remainingToBreakEnd))};
}

function lateRunwayProbe(bank,model,waitModel,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const evalTime_s=0.84,seed=seedBase+i*127;
    const x=beliefFor(record,model,{evalTime_s,window_s:0.22,seed});if(!x.belief.prediction)continue;
    const contextHistory=contextHistoryFor(record,{evalTime_s,seed:seed+70000});auditShooterBoundary({observations:contextHistory,beliefs:[]});
    const context=buildShooterVisiblePresentationContext(contextHistory,x.belief,makeStandPrior(record));
    const decision=chooseRunwayAwareObservationWait(context,x.belief,waitModel);
    rows.push({remainingStart:context.remainingToBreakStart,remainingEnd:context.remainingToBreakEnd,wait:decision.wait_s,confidence:x.belief.confidence});
  }
  return {n:rows.length,waitRate:mean(rows.map(r=>r.wait>0?1:0)),meanWait_s:mean(rows.map(r=>r.wait)),meanRemainingToBreakStart:mean(rows.map(r=>r.remainingStart)),meanRemainingToBreakEnd:mean(rows.map(r=>r.remainingEnd)),meanConfidence:mean(rows.map(r=>r.confidence))};
}

export function runL2PresentationContextBenchmark({trainNPerFamily=90,calibrationNPerFamily=100,heldoutNPerFamily=160,trainSeedBase=41000,calibrationSeedBase=331000,heldoutSeedBase=531000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const calibration=createL1MultiFamilyBank({nPerFamily:calibrationNPerFamily,seedBase:calibrationSeedBase});
  const heldout=createL1MultiFamilyBank({nPerFamily:heldoutNPerFamily,seedBase:heldoutSeedBase});
  const calibrationRows=makeCalibrationRows(calibration,model,calibrationSeedBase*3),waitModel=fitWaitInformationModel(calibrationRows);
  const early=evaluateHeldout(heldout,model,waitModel,heldoutSeedBase*5),late=lateRunwayProbe(heldout,model,waitModel,heldoutSeedBase*7);
  return freezePlain({status:'L2_PRESENTATION_CONTEXT_RUNWAY_BENCHMARK_V1',partitions:{familyTraining:trainNPerFamily*3,waitCalibrationCrossers:calibrationNPerFamily,heldoutCrossers:heldoutNPerFamily},waitModel,early,late,boundary:'STAND PRIOR EXPOSES ONLY COARSE DEMONSTRATED DIRECTION/FAMILY/ANGULAR-SPAN/TIME ENVELOPE; CURRENT TARGET XYZ, VELOCITY MAGNITUDE, RANGE, FUTURE PATH, LEAD AND INTERCEPT REMAIN HIDDEN',interpretation:'L2 architecture test only. Calibration labels estimate expected decision-quality benefit of seeing more; runtime sees only current belief confidence plus remaining opportunity inferred from cumulative visible angular travel.'});
}
