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

function directionForDemonstratedStand(record){
  // Referee-side adapter: a real shooter would normally know broad target direction after seeing
  // a demonstration. Only LEFT/RIGHT is exposed, never the current target vector or magnitude.
  const vx=record.scenario.targetVelocity_W?.[0]??record.scenario.targetInitialVelocity_W?.[0]??0;
  return vx>=0?'RIGHT':'LEFT';
}
function makeStandPrior(record){return createShooterStandPrior({expectedDirection:directionForDemonstratedStand(record),demonstratedFamilyProb:{CROSSER:0.78,QUARTERER:0.17,LOOPER:0.03,OTHER:0.02},expectedPresentationDuration_s:0.95,demonstratedAngularSpan_rad:0.62,pickupProgressPrior:0.08,breakWindow:{start:0.70,end:0.90}});}
function beliefFor(record,model,{evalTime_s=0.62,window_s,noise=0.003,rateNoise=0.05,quality=0.45,seed}){
  const history=createL1ObservationHistory(record,{evalTime_s,window_s,angleNoiseSd_rad:noise,rateNoiseSd_radps:rateNoise,acquisitionQuality:quality,seed});
  const belief=buildMultiFamilyBelief(history,{model,predictionHorizon_s:0.12,maxHistory_s:window_s});
  auditShooterBoundary({observations:history,beliefs:[belief]});return {history,belief};
}

function makeCalibrationRows(bank,model,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const initial=beliefFor(record,model,{window_s:0.22,seed:seedBase+i*101});if(!initial.belief.prediction)continue;
    for(const wait_s of [0.05,0.10,0.15]){
      const later=beliefFor(record,model,{window_s:0.22+wait_s,seed:seedBase+i*101});if(!later.belief.prediction)continue;
      rows.push({initialConfidence:initial.belief.confidence,laterConfidence:later.belief.confidence,wait_s});
    }
  }
  return rows;
}

function evaluateHeldout(bank,model,waitModel,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const initial=beliefFor(record,model,{window_s:0.22,seed:seedBase+i*113});if(!initial.belief.prediction)continue;
    const standPrior=makeStandPrior(record),context=buildShooterVisiblePresentationContext(initial.history,initial.belief,standPrior);
    const decision=chooseRunwayAwareObservationWait(context,initial.belief,waitModel);
    const selected=decision.wait_s>0?beliefFor(record,model,{window_s:0.22+decision.wait_s,seed:seedBase+i*113}):initial;
    const always100=beliefFor(record,model,{window_s:0.32,seed:seedBase+i*113});
    const predInitial=argmax(initial.belief.familyProb),predSelected=argmax(selected.belief.familyProb),pred100=argmax(always100.belief.familyProb);
    rows.push({decision,context,initialCorrect:predInitial===record.family,selectedCorrect:predSelected===record.family,always100Correct:pred100===record.family,selectedConfidence:selected.belief.confidence,initialConfidence:initial.belief.confidence});
  }
  return {
    n:rows.length,
    immediateAccuracy:mean(rows.map(r=>r.initialCorrect?1:0)),
    runwayAwareAccuracy:mean(rows.map(r=>r.selectedCorrect?1:0)),
    alwaysWait100Accuracy:mean(rows.map(r=>r.always100Correct?1:0)),
    waitRate:mean(rows.map(r=>r.decision.wait_s>0?1:0)),
    meanWait_s:mean(rows.map(r=>r.decision.wait_s)),
    meanInitialConfidence:mean(rows.map(r=>r.initialConfidence)),
    meanSelectedConfidence:mean(rows.map(r=>r.selectedConfidence)),
    meanRemainingToBreakEnd:mean(rows.map(r=>r.context.remainingToBreakEnd))
  };
}

function lateRunwayProbe(bank,model,waitModel,seedBase){
  const rows=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i];if(record.family!=='CROSSER')continue;
    const x=beliefFor(record,model,{evalTime_s:0.84,window_s:0.22,seed:seedBase+i*127});if(!x.belief.prediction)continue;
    const context=buildShooterVisiblePresentationContext(x.history,x.belief,makeStandPrior(record));
    const decision=chooseRunwayAwareObservationWait(context,x.belief,waitModel);
    rows.push({remaining:context.remainingToBreakEnd,wait:decision.wait_s,confidence:x.belief.confidence});
  }
  return {n:rows.length,waitRate:mean(rows.map(r=>r.wait>0?1:0)),meanWait_s:mean(rows.map(r=>r.wait)),meanRemainingToBreakEnd:mean(rows.map(r=>r.remaining)),meanConfidence:mean(rows.map(r=>r.confidence))};
}

export function runL2PresentationContextBenchmark({trainNPerFamily=90,calibrationNPerFamily=100,heldoutNPerFamily=160,trainSeedBase=41000,calibrationSeedBase=331000,heldoutSeedBase=531000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const calibration=createL1MultiFamilyBank({nPerFamily:calibrationNPerFamily,seedBase:calibrationSeedBase});
  const heldout=createL1MultiFamilyBank({nPerFamily:heldoutNPerFamily,seedBase:heldoutSeedBase});
  const calibrationRows=makeCalibrationRows(calibration,model,calibrationSeedBase*3),waitModel=fitWaitInformationModel(calibrationRows);
  const early=evaluateHeldout(heldout,model,waitModel,heldoutSeedBase*5),late=lateRunwayProbe(heldout,model,waitModel,heldoutSeedBase*7);
  return freezePlain({
    status:'L2_PRESENTATION_CONTEXT_RUNWAY_BENCHMARK_V1',
    partitions:{familyTraining:trainNPerFamily*3,waitCalibrationCrossers:calibrationNPerFamily,heldoutCrossers:heldoutNPerFamily},
    waitModel,early,late,
    boundary:'STAND PRIOR EXPOSES ONLY COARSE DEMONSTRATED DIRECTION/FAMILY/ANGULAR-SPAN/TIME ENVELOPE; CURRENT TARGET XYZ, VELOCITY MAGNITUDE, RANGE, FUTURE PATH, LEAD AND INTERCEPT REMAIN HIDDEN',
    interpretation:'L2 architecture test only. Accuracy is target-family reading, not shooting success. The wait utility prices expected calibration-set information gain against observation-derived remaining presentation opportunity.'
  });
}
