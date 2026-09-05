// ShotSight Virtual Shooter L2 — whole-presentation shooter-visible context.
// This module must remain learner-side: it consumes only stand/demonstration priors,
// ShooterObservation history and beliefs. It has no physics/oracle imports.

import {assertNoPrivilegedShooterData,validateShooterObservation} from './virtual-shooter-boundary-v1.mjs';

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function finite(v,name){if(!Number.isFinite(v))throw new Error(`${name} must be finite`);return v;}

export function createShooterStandPrior({expectedDirection='UNKNOWN',demonstratedFamilyProb={CROSSER:0.7,QUARTERER:0.2,LOOPER:0.05,OTHER:0.05},expectedPresentationDuration_s=0.95,demonstratedAngularSpan_rad=0.60,pickupProgressPrior=0.08,breakWindow={start:0.70,end:0.90},source='PRIOR_DEMONSTRATION_OR_STAND_KNOWLEDGE'}={}){
  finite(expectedPresentationDuration_s,'expectedPresentationDuration_s');finite(demonstratedAngularSpan_rad,'demonstratedAngularSpan_rad');
  if(expectedPresentationDuration_s<=0||demonstratedAngularSpan_rad<=0)throw new Error('stand prior scales must be positive');
  if(!['LEFT','RIGHT','UNKNOWN'].includes(expectedDirection))throw new Error('unsupported expectedDirection');
  const total=Object.values(demonstratedFamilyProb).reduce((a,b)=>a+b,0);if(!(total>0))throw new Error('family prior must have mass');
  const familyProb={};for(const [k,v] of Object.entries(demonstratedFamilyProb))familyProb[k]=v/total;
  const prior=freezePlain({schema:'SHOOTER_STAND_PRIOR_V1',source,expectedDirection,demonstratedFamilyProb:familyProb,expectedPresentationDuration_s,demonstratedAngularSpan_rad,pickupProgressPrior:clamp(pickupProgressPrior,0,0.4),breakWindow:{start:clamp(breakWindow.start,0.45,0.95),end:clamp(breakWindow.end,0.5,0.99)},forbiddenInterpretation:'COARSE DEMONSTRATION/STAND KNOWLEDGE ONLY; NOT CURRENT TARGET FUTURE, RANGE, LEAD OR INTERCEPT'});
  assertNoPrivilegedShooterData(prior,{path:'standPrior'});return prior;
}

export function buildShooterVisiblePresentationContext(observationHistory,belief,standPrior){
  if(!Array.isArray(observationHistory)||!observationHistory.length)throw new Error('observationHistory required');observationHistory.forEach(validateShooterObservation);
  if(!belief||belief.schema!=='MULTIFAMILY_BELIEF_V1')throw new Error('MULTIFAMILY_BELIEF_V1 required');if(!standPrior||standPrior.schema!=='SHOOTER_STAND_PRIOR_V1')throw new Error('SHOOTER_STAND_PRIOR_V1 required');
  assertNoPrivilegedShooterData(belief,{path:'presentationContext.belief'});assertNoPrivilegedShooterData(standPrior,{path:'presentationContext.standPrior'});
  const visible=observationHistory.filter(o=>o.visible&&Number.isFinite(o.az_rad));if(!visible.length)throw new Error('visible observations required');
  const first=visible[0],last=visible.at(-1),observedAngularTravel_rad=Math.abs(last.az_rad-first.az_rad);
  const elapsedPresentationProgress=clamp(standPrior.pickupProgressPrior+observedAngularTravel_rad/standPrior.demonstratedAngularSpan_rad,standPrior.pickupProgressPrior,0.98);
  const remainingToBreakStart=clamp(standPrior.breakWindow.start-elapsedPresentationProgress,0,1),remainingToBreakEnd=clamp(standPrior.breakWindow.end-elapsedPresentationProgress,0,1);
  const context=freezePlain({schema:'SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1',source:'STAND_PRIOR_PLUS_OBSERVED_ANGULAR_TRAVEL',expectedDirection:standPrior.expectedDirection,demonstratedFamilyProb:standPrior.demonstratedFamilyProb,expectedPresentationDuration_s:standPrior.expectedPresentationDuration_s,demonstratedAngularSpan_rad:standPrior.demonstratedAngularSpan_rad,pickupProgressPrior:standPrior.pickupProgressPrior,breakWindow:standPrior.breakWindow,currentTime_s:last.observationTime_s,elapsedPresentationProgress,remainingToBreakStart,remainingToBreakEnd,estimatedRemainingOpportunity_s:remainingToBreakEnd*standPrior.expectedPresentationDuration_s,beliefConfidence:clamp(belief.confidence??0,0,1),familyProb:belief.familyProb,runtimeInputs:['SHOOTER_OBSERVATION_V1_HISTORY','MULTIFAMILY_BELIEF_V1','SHOOTER_STAND_PRIOR_V1'],forbiddenInterpretation:'REMAINING OPPORTUNITY IS AN OBSERVATION/DEMONSTRATION ESTIMATE, NOT ORACLE TIME-TO-INTERCEPT'});
  assertNoPrivilegedShooterData(context,{path:'presentationContext'});return context;
}

export function fitWaitInformationModel(calibrationRows){
  if(!Array.isArray(calibrationRows)||!calibrationRows.length)throw new Error('calibrationRows required');
  const waits=[0.05,0.10,0.15],bins=[[0,0.2],[0.2,0.4],[0.4,0.6],[0.6,0.8],[0.8,1.000001]],confidenceTable={},decisionTable={};
  for(const wait of waits){confidenceTable[wait]={};decisionTable[wait]={};for(let bi=0;bi<bins.length;bi++){
    const [lo,hi]=bins[bi],xs=calibrationRows.filter(r=>r.initialConfidence>=lo&&r.initialConfidence<hi&&Math.abs(r.wait_s-wait)<1e-9);
    confidenceTable[wait][bi]=xs.length?xs.reduce((a,r)=>a+Math.max(0,r.laterConfidence-r.initialConfidence),0)/xs.length:0;
    decisionTable[wait][bi]=xs.length?xs.reduce((a,r)=>a+Math.max(0,(r.initialDecisionLoss??0)-(r.laterDecisionLoss??0)),0)/xs.length:0;
  }}
  return freezePlain({schema:'WAIT_INFORMATION_MODEL_V1',confidenceBins:bins,expectedConfidenceGain:confidenceTable,expectedDecisionQualityGain:decisionTable,fitBoundary:'CALIBRATION LABELS MAY FIT EXPECTED VALUE OF MORE OBSERVATION; RUNTIME RECEIVES ONLY BELIEF CONFIDENCE AND SHOOTER-VISIBLE RUNWAY; NO HELDOUT OUTCOME OR ORACLE ACTION'});
}
function confidenceBin(model,c){for(let i=0;i<model.confidenceBins.length;i++){const [lo,hi]=model.confidenceBins[i];if(c>=lo&&c<hi)return i;}return model.confidenceBins.length-1;}

export function chooseRunwayAwareObservationWait(context,belief,waitModel,{informationWeight=1,runwayPenalty=0.22,maxWait_s=0.15}={}){
  if(!context||context.schema!=='SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1')throw new Error('presentation context required');if(!belief||belief.schema!=='MULTIFAMILY_BELIEF_V1')throw new Error('belief required');if(!waitModel||waitModel.schema!=='WAIT_INFORMATION_MODEL_V1')throw new Error('wait information model required');
  assertNoPrivilegedShooterData({context,belief,waitModel},{path:'waitPolicy'});
  const c=clamp(belief.confidence??0,0,1),bi=confidenceBin(waitModel,c),candidates=[0,0.05,0.10,0.15].filter(w=>w<=maxWait_s+1e-12);
  const scored=candidates.map(wait_s=>{
    if(wait_s===0)return {wait_s,expectedDecisionQualityGain:0,expectedConfidenceGain:0,opportunityCost:0,utility:0};
    const expectedDecisionQualityGain=waitModel.expectedDecisionQualityGain[wait_s]?.[bi]??0,expectedConfidenceGain=waitModel.expectedConfidenceGain[wait_s]?.[bi]??0;
    const progressCost=wait_s/context.expectedPresentationDuration_s;
    // Cost waiting against the START of the intended break window: consuming that runway is more
    // consequential than merely approaching its far edge. This remains a SHOTSIGHT_HYPOTHESIS cost.
    const runway=Math.max(0.025,context.remainingToBreakStart);
    const opportunityCost=runwayPenalty*progressCost/runway;
    return {wait_s,expectedDecisionQualityGain,expectedConfidenceGain,opportunityCost,utility:informationWeight*expectedDecisionQualityGain-opportunityCost};
  });
  scored.sort((a,b)=>b.utility-a.utility||a.wait_s-b.wait_s);const best=scored[0];
  const out=freezePlain({schema:'RUNWAY_AWARE_WAIT_DECISION_V1',action:best.wait_s>0?'WAIT':'COMMIT',wait_s:best.wait_s,expectedDecisionQualityGain:best.expectedDecisionQualityGain,expectedConfidenceGain:best.expectedConfidenceGain,opportunityCost:best.opportunityCost,utility:best.utility,remainingToBreakStart:context.remainingToBreakStart,remainingToBreakEnd:context.remainingToBreakEnd,beliefConfidence:c,candidates:scored,runtimeInputs:['SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1','MULTIFAMILY_BELIEF_V1','WAIT_INFORMATION_MODEL_V1'],evidenceClass:'SHOTSIGHT_HYPOTHESIS_VALUE_OF_INFORMATION_POLICY'});
  assertNoPrivilegedShooterData(out,{path:'waitDecision'});return out;
}
