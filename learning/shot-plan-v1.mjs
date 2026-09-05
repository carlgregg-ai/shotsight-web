// ShotSight Virtual Shooter L2 — perception-limited pickup / hold / connection / break planning.
// Learner-side runtime consumes only belief + shooter-visible context. No physics/oracle imports.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

const METHODS=Object.freeze(['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']);
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const L2_SOURCE_PRIORS=freezePlain({
  schema:'L2_SOURCE_PRIORS_V1',
  evidenceBoundary:'COACHING_PRIORS_NOT_ORACLE_TRUTH',
  sources:{
    CPSA:{evidence:'DIRECT',claim:'Visual pickup, gun hold and break area are distinct planning elements; sporting hold lies between pickup and break and should preserve target visibility/reaction time.'},
    HUSTHWAITE:{evidence:'DIRECT',claim:'Hold point, kill point, method and gun speed are linked variables; deliberately vary methods/hold points and learn what gives control.'},
    CURRIE:{evidence:'DIRECT',claim:'Pickup, hold and break are explicit pre-shot planning elements; a long-crosser hold about half-to-two-thirds back from break toward trap is a presentation-specific starting heuristic.'}
  },
  methodProgressPriors:{
    SWING_THROUGH:{hold:0.22,connection:0.50,break:0.86,evidence:'SYNTHESIS'},
    PULL_AWAY:{hold:0.32,connection:0.60,break:0.88,evidence:'SYNTHESIS'},
    MAINTAINED_LEAD:{hold:0.44,connection:0.66,break:0.88,evidence:'SYNTHESIS'}
  },
  note:'Progress values are SHOTSIGHT_HYPOTHESIS normalised planning coordinates, not human timing or metric lead prescriptions.'
});

function validateBelief(belief){
  if(!belief||belief.schema!=='MULTIFAMILY_BELIEF_V1')throw new Error('MULTIFAMILY_BELIEF_V1 required');
  assertNoPrivilegedShooterData(belief,{path:'shotPlan.belief'});
  if(!belief.prediction)throw new Error('belief requires a future angular prediction');
  const m=belief.apparentMotion;if(!m)throw new Error('belief requires apparent motion');
}

function angularPointAtProgress(belief,p){
  const m=belief.apparentMotion,pr=belief.prediction;
  // L2 planning deliberately stays in apparent-angle space. The planning interval spans from
  // the latest observed estimate to the short-horizon belief prediction, never hidden XYZ.
  const horizon=pr.horizon_s;
  const startAz=pr.azMean_rad-m.azRateMean_radps*horizon-0.5*m.azAccelMean_radps2*horizon*horizon;
  const startEl=pr.elMean_rad-m.elRateMean_radps*horizon-0.5*m.elAccelMean_radps2*horizon*horizon;
  const az=startAz+(pr.azMean_rad-startAz)*p;
  const el=startEl+(pr.elMean_rad-startEl)*p;
  const uncertaintyScale=0.65+0.70*p;
  return freezePlain({azMean_rad:az,elMean_rad:el,azSd_rad:pr.azSd_rad*uncertaintyScale,elSd_rad:pr.elSd_rad*uncertaintyScale,progress:p});
}

function confidenceAdjustedProgress(base,belief,role){
  const c=clamp(belief.confidence??0,0,1),changing=clamp(belief.motionPhaseProb?.CHANGING??0,0,1);
  // Low confidence biases the plan toward later commitment while preserving more visual reading.
  // Changing-path evidence similarly shifts connection/break later. These are hypotheses to test.
  const uncertaintyShift=(1-c)*(role==='HOLD'?0.03:role==='CONNECTION'?0.06:0.08);
  const phaseShift=changing*(role==='HOLD'?0.01:role==='CONNECTION'?0.04:0.06);
  return clamp(base+uncertaintyShift+phaseShift,0.05,0.97);
}

export function buildPerceptionLimitedShotPlan(belief,{method='PULL_AWAY',priorMode='SOURCE_PRIOR'}={}){
  validateBelief(belief);
  if(!METHODS.includes(method))throw new Error(`unsupported method ${method}`);
  const source=L2_SOURCE_PRIORS.methodProgressPriors[method];
  let hold,connection,breakPoint;
  if(priorMode==='SOURCE_PRIOR'){
    hold=confidenceAdjustedProgress(source.hold,belief,'HOLD');
    connection=confidenceAdjustedProgress(source.connection,belief,'CONNECTION');
    breakPoint=confidenceAdjustedProgress(source.break,belief,'BREAK');
  }else if(priorMode==='BLANK_SLATE'){
    // Neutral learner initialisation: evenly spaced, method-agnostic regions. This is a control,
    // not a claim about good shooting and contains no hidden target truth.
    hold=0.25;connection=0.50;breakPoint=0.75;
  }else throw new Error(`unsupported priorMode ${priorMode}`);

  // Enforce planning topology only; do not encode a lead/intercept answer.
  connection=Math.max(connection,hold+0.12);
  breakPoint=Math.max(breakPoint,connection+0.12);
  if(breakPoint>0.97){const excess=breakPoint-0.97;breakPoint=0.97;connection=Math.min(connection,breakPoint-0.12);hold=Math.min(hold,connection-0.12-excess*0.2);}

  const pickup=angularPointAtProgress(belief,0.04),holdRegion=angularPointAtProgress(belief,hold),connectionRegion=angularPointAtProgress(belief,connection),breakRegion=angularPointAtProgress(belief,breakPoint);
  const absRate=Math.hypot(belief.apparentMotion.azRateMean_radps,belief.apparentMotion.elRateMean_radps);
  const tempoBand=absRate<0.32?'SLOW_APPARENT':absRate<0.72?'MEDIUM_APPARENT':'FAST_APPARENT';
  const family=Object.entries(belief.familyProb).sort((a,b)=>b[1]-a[1])[0][0];
  const plan=freezePlain({
    schema:'PERCEPTION_LIMITED_SHOT_PLAN_V1',
    priorMode,method,
    evidenceClass:priorMode==='SOURCE_PRIOR'?'COACHING_PRIOR_PLUS_SHOTSIGHT_HYPOTHESIS':'BLANK_SLATE_CONTROL',
    targetBeliefSummary:{mostLikelyFamily:family,confidence:belief.confidence,familyProb:belief.familyProb,motionPhaseProb:belief.motionPhaseProb},
    visualPickupRegion:pickup,
    gunHoldRegion:holdRegion,
    connectionRegion,
    intendedBreakRegion:breakRegion,
    expectedMoveTempo:tempoBand,
    planningCoordinates:{holdProgress:hold,connectionProgress:connection,breakProgress:breakPoint},
    runtimeInputs:['MULTIFAMILY_BELIEF_V1'],
    forbiddenInterpretation:'REGIONS_ARE APPARENT-ANGLE PLANNING PRIORS; NOT EXACT RANGE, METRIC LEAD, PELLET TOF OR ORACLE INTERCEPT'
  });
  assertNoPrivilegedShooterData(plan,{path:'shotPlan'});return plan;
}

export function scorePlanStructure(plan){
  if(!plan||plan.schema!=='PERCEPTION_LIMITED_SHOT_PLAN_V1')throw new Error('shot plan required');
  assertNoPrivilegedShooterData(plan,{path:'planScore.input'});
  const p=plan.planningCoordinates;
  const runway=p.connectionProgress-p.holdProgress;
  const executionWindow=p.breakProgress-p.connectionProgress;
  const topology=(p.holdProgress<p.connectionProgress&&p.connectionProgress<p.breakProgress)?1:0;
  const usefulRunway=clamp((runway-0.10)/0.30,0,1);
  const usefulExecution=clamp((executionWindow-0.10)/0.28,0,1);
  const visibilityMargin=clamp((p.holdProgress-0.08)/0.34,0,1);
  const lateRisk=clamp((0.97-p.breakProgress)/0.25,0,1);
  return freezePlain({schema:'L2_PLAN_STRUCTURE_SCORE_V1',topology,usefulRunway,usefulExecution,visibilityMargin,remainingWindow:lateRisk,meanControlProxy:(topology+usefulRunway+usefulExecution+visibilityMargin+lateRisk)/5,boundary:'OBSERVATION/BELIEF-DERIVED STRUCTURE ONLY; NO ORACLE HIT OR LEAD SCORE'});
}
